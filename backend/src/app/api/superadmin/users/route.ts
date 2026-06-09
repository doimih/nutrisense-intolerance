import { NextRequest, NextResponse } from 'next/server';
import {
  appendAuditEvent,
  appendSecurityEvent,
  mutateDb,
  readDb,
} from '@/lib/server/superadmin/store';
import {
  SUPERADMIN_COOKIE_MAX_AGE_SECONDS,
  SUPERADMIN_COOKIE_NAME,
  createPasswordHash,
  createSessionToken,
} from '@/lib/server/superadmin/auth';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: string | null;
  source: 'platform';
};

function getFrontendUrl(): string {
  return (process.env.FRONTEND_INTERNAL_URL || 'http://frontend:3000').replace(/\/$/, '');
}

async function fetchPlatformUsers(internalToken: string): Promise<PlatformUser[]> {
  try {
    const res = await fetch(`${getFrontendUrl()}/api/internal/platform-users`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${internalToken}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const payload = (await res.json()) as { users?: PlatformUser[] };
    return Array.isArray(payload.users) ? payload.users : [];
  } catch {
    return [];
  }
}

async function mutatePlatformUser(
  internalToken: string,
  userId: string,
  action: string,
  extras?: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${getFrontendUrl()}/api/internal/platform-users`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${internalToken}` },
      body: JSON.stringify({ userId, action, ...extras }),
      signal: AbortSignal.timeout(5000),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return res.ok ? { ok: true } : { ok: false, error: body.error || 'Operation failed.' };
  } catch {
    return { ok: false, error: 'Could not reach frontend service.' };
  }
}

async function deletePlatformUser(
  internalToken: string,
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${getFrontendUrl()}/api/internal/platform-users`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${internalToken}` },
      body: JSON.stringify({ userId }),
      signal: AbortSignal.timeout(5000),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return res.ok ? { ok: true } : { ok: false, error: body.error || 'Delete failed.' };
  } catch {
    return { ok: false, error: 'Could not reach frontend service.' };
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const search = request.nextUrl.searchParams.get('search')?.toLowerCase() || '';
  const plan = request.nextUrl.searchParams.get('plan')?.toLowerCase() || '';
  const source = request.nextUrl.searchParams.get('source') || 'all';

  const db = readDb();
  const internalToken = db.settings?.internalEmailToken ?? '';

  // Admin users (superadmin-db)
  const adminUsers = db.users
    .filter((u) => {
      const searchOk = !search || u.email.includes(search) || u.name.toLowerCase().includes(search);
      const planOk = !plan || u.plan === plan;
      return searchOk && planOk;
    })
    .map((u) => ({ ...u, source: 'admin' as const }));

  // Platform users (frontend auth-db via internal API)
  let platformUsers: (PlatformUser & { source: 'platform'; plan: string })[] = [];
  if (source !== 'admin' && internalToken) {
    const raw = await fetchPlatformUsers(internalToken);
    platformUsers = raw
      .filter((u) => {
        const searchOk = !search || u.email.includes(search) || u.name.toLowerCase().includes(search);
        // Exclude users that already appear in adminUsers to avoid duplicates
        const notDuplicate = !adminUsers.some((a) => a.email === u.email);
        return searchOk && notDuplicate;
      })
      .map((u) => {
        // Platform plan (from Stripe/auth-db) is the source of truth
        // Backend stub is only used if platform returns no plan (null/undefined)
        const stub = db.users.find((s) => s.id === u.id);
        const resolvedPlan = u.plan || stub?.plan || 'free';
        return { ...u, source: 'platform' as const, plan: resolvedPlan };
      });
  }

  // Apply plan filter to platform users too
  const filteredPlatformUsers = plan
    ? platformUsers.filter((u) => u.plan === plan)
    : platformUsers;

  return NextResponse.json({ users: [...adminUsers, ...filteredPlatformUsers] });
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const ip = getClientIp(request);
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    plan?: 'free' | 'basic' | 'pro' | 'pro_plus';
  };

  const name = body.name?.trim() || '';
  const email = body.email?.trim().toLowerCase() || '';
  const plan = body.plan || 'free';

  if (!name || !email) {
    return NextResponse.json({ error: 'name and email are required.' }, { status: 400 });
  }

  const created = mutateDb((db) => {
    if (db.users.some((u) => u.email === email)) return null;

    const now = new Date().toISOString();
    const user = {
      id: `adm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      role: 'user' as const,
      passwordHash: 'disabled',
      passwordSalt: 'disabled',
      mustChangePassword: false,
      twoFactorSecret: null,
      status: 'active' as const,
      plan,
      sessionVersion: 1,
      sessionInvalidBefore: 0,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    };

    db.users.push(user);
    db.subscriptions.push({
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: user.id,
      userEmail: user.email,
      plan,
      status: 'active',
      stripeSubscriptionId: null,
      currentPeriodEnd: now,
      updatedAt: now,
    });

    return user;
  });

  if (!created) {
    return NextResponse.json({ error: 'User already exists.' }, { status: 409 });
  }

  appendAuditEvent({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    action: 'users.create',
    resource: 'user',
    resourceId: created.id,
    ip,
    metadata: { plan: created.plan },
  });

  return NextResponse.json({ user: created }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const ip = getClientIp(request);
  const body = (await request.json()) as {
    userId?: string;
    source?: string;
    action?:
      | 'deactivate'
      | 'activate'
      | 'reset-subscription'
      | 'upgrade'
      | 'downgrade'
      | 'edit'
      | 'set-password';
    plan?: 'free' | 'basic' | 'pro' | 'pro_plus';
    name?: string;
    email?: string;
    newPassword?: string;
  };

  if (!body.userId || !body.action) {
    return NextResponse.json({ error: 'userId and action are required.' }, { status: 400 });
  }

  // Platform users: proxy to frontend internal API
  if (body.source === 'platform') {
    const internalToken = readDb().settings?.internalEmailToken ?? '';
    if (!internalToken) {
      return NextResponse.json({ error: 'Internal token not configured.' }, { status: 503 });
    }

    // Map backend actions to frontend actions
    const frontendAction =
      body.action === 'activate' ? 'activate' :
      body.action === 'deactivate' ? 'deactivate' :
      body.action === 'edit' ? 'edit' :
      body.action === 'set-password' ? 'set-password' :
      null;

    if (!frontendAction) {
      // Map admin plan codes to billing plan codes (used in frontend auth-db)
      const adminToBillingPlan: Record<string, string> = {
        free: 'free', basic: 'basic', pro: 'pro', pro_plus: 'pro_plus',
      };

      const planResult = mutateDb((db) => {
        let platformEntry = db.users.find((u) => u.id === body.userId);
        if (!platformEntry) {
          const now = new Date().toISOString();
          platformEntry = {
            id: body.userId!,
            name: body.name || body.userId!,
            email: body.email || '',
            role: 'user' as const,
            passwordHash: 'platform',
            passwordSalt: 'platform',
            mustChangePassword: false,
            twoFactorSecret: null,
            status: 'active' as const,
            plan: 'free' as const,
            sessionVersion: 1,
            sessionInvalidBefore: 0,
            createdAt: now,
            updatedAt: now,
            lastLoginAt: null,
          };
          db.users.push(platformEntry);
        }
        if (body.action === 'upgrade') platformEntry.plan = body.plan ?? 'basic';
        if (body.action === 'downgrade') platformEntry.plan = body.plan ?? 'free';
        if (body.action === 'reset-subscription') platformEntry.plan = 'free';
        platformEntry.updatedAt = new Date().toISOString();
        return platformEntry;
      });

      // Sync billing plan to frontend auth-db
      const adminPlan = planResult?.plan ?? 'free';
      const billingPlan = adminToBillingPlan[adminPlan] ?? 'free';
      void mutatePlatformUser(internalToken, body.userId, 'set-plan', { plan: billingPlan });

      return NextResponse.json({ user: { ...planResult, source: 'platform' } });
    }

    const extras: Record<string, string> = {};
    if (body.name) extras.name = body.name;
    if (body.email) extras.email = body.email;
    if (body.newPassword) extras.newPassword = body.newPassword;

    const result = await mutatePlatformUser(internalToken, body.userId, frontendAction, extras);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    appendAuditEvent({
      actorUserId: auth.session.userId,
      actorEmail: auth.session.email,
      action: `platform-users.${body.action}`,
      resource: 'platform-user',
      resourceId: body.userId,
      ip,
      metadata: {},
    });

    return NextResponse.json({ ok: true });
  }

  const updated = mutateDb((db) => {
    const user = db.users.find((u) => u.id === body.userId);
    if (!user) return null;

    if (body.action === 'edit') {
      const nextName = body.name?.trim() || '';
      const nextEmail = body.email?.trim().toLowerCase() || '';

      if (!nextName || !nextEmail) return null;

      const alreadyUsed = db.users.some(
        (candidate) => candidate.id !== user.id && candidate.email === nextEmail
      );
      if (alreadyUsed) return null;

      const oldEmail = user.email;
      user.name = nextName;
      user.email = nextEmail;

      db.subscriptions.forEach((sub) => {
        if (sub.userId === user.id || sub.userEmail === oldEmail) {
          sub.userEmail = nextEmail;
          sub.updatedAt = new Date().toISOString();
        }
      });

      db.payments.forEach((payment) => {
        if (payment.userId === user.id || payment.userEmail === oldEmail) {
          payment.userEmail = nextEmail;
        }
      });

      db.aiLogs.forEach((log) => {
        if (log.userId === user.id || log.userEmail === oldEmail) {
          log.userEmail = nextEmail;
        }
      });
    }

    if (body.action === 'set-password') {
      const newPassword = body.newPassword || '';
      if (newPassword.length < 10) return null;

      const password = createPasswordHash(newPassword);
      const nowSec = Math.floor(Date.now() / 1000);
      user.passwordHash = password.hash;
      user.passwordSalt = password.salt;
      user.mustChangePassword = false;
      user.sessionVersion += 1;
      user.sessionInvalidBefore = nowSec;

      appendSecurityEvent({
        type: 'session_invalid',
        ip,
        email: user.email,
        userId: user.id,
        message: 'All active sessions invalidated after admin password reset',
      });
    }

    if (body.action === 'deactivate') user.status = 'suspended';
    if (body.action === 'activate') user.status = 'active';

    if (body.action === 'upgrade') user.plan = body.plan ?? 'basic';
    if (body.action === 'downgrade') user.plan = body.plan ?? 'free';

    if (body.action === 'reset-subscription') {
      const sub = db.subscriptions.find((s) => s.userId === user.id);
      if (sub) {
        sub.status = 'expired';
        sub.plan = 'free';
        sub.updatedAt = new Date().toISOString();
      }
      user.plan = 'free';
    }

    user.updatedAt = new Date().toISOString();
    return user;
  });

  if (!updated) {
    return NextResponse.json({ error: 'User not found or invalid payload.' }, { status: 404 });
  }

  appendAuditEvent({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    action: `users.${body.action}`,
    resource: 'user',
    resourceId: updated.id,
    ip,
    metadata: { plan: updated.plan, status: updated.status },
  });

  if (body.action === 'set-password' && updated.id === auth.session.userId) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const token = createSessionToken({
      userId: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      sessionVersion: updated.sessionVersion,
      ip,
      issuedAt,
      exp: issuedAt + SUPERADMIN_COOKIE_MAX_AGE_SECONDS,
    });

    const response = NextResponse.json({ user: updated });
    response.cookies.set(SUPERADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SUPERADMIN_COOKIE_MAX_AGE_SECONDS,
    });
    return response;
  }

  return NextResponse.json({ user: updated });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const ip = getClientIp(request);
  const body = (await request.json().catch(() => ({}))) as { userId?: string; source?: string };
  const userId = body.userId || '';

  if (!userId) {
    return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
  }

  if (userId === auth.session.userId) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
  }

  // Platform users: proxy to frontend internal API
  if (body.source === 'platform') {
    const internalToken = readDb().settings?.internalEmailToken ?? '';
    if (!internalToken) {
      return NextResponse.json({ error: 'Internal token not configured.' }, { status: 503 });
    }

    const result = await deletePlatformUser(internalToken, userId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    appendAuditEvent({
      actorUserId: auth.session.userId,
      actorEmail: auth.session.email,
      action: 'platform-users.delete',
      resource: 'platform-user',
      resourceId: userId,
      ip,
      metadata: {},
    });

    return NextResponse.json({ ok: true });
  }

  const deleted = mutateDb((db) => {
    const target = db.users.find((candidate) => candidate.id === userId);
    if (!target) return null;
    if (target.role === 'superadmin') return null;

    db.users = db.users.filter((candidate) => candidate.id !== userId);
    db.subscriptions = db.subscriptions.filter(
      (record) => record.userId !== userId && record.userEmail !== target.email
    );
    db.payments = db.payments.filter(
      (record) => record.userId !== userId && record.userEmail !== target.email
    );
    db.aiLogs = db.aiLogs.filter(
      (record) => record.userId !== userId && record.userEmail !== target.email
    );

    return target;
  });

  if (!deleted) {
    return NextResponse.json(
      { error: 'User not found or cannot be deleted.' },
      { status: 404 }
    );
  }

  appendAuditEvent({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    action: 'users.delete',
    resource: 'user',
    resourceId: deleted.id,
    ip,
    metadata: { email: deleted.email },
  });

  return NextResponse.json({ ok: true });
}
