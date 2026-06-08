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

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const search = request.nextUrl.searchParams.get('search')?.toLowerCase() || '';
  const plan = request.nextUrl.searchParams.get('plan')?.toLowerCase() || '';

  const users = readDb().users.filter((u) => {
    const searchOk = !search || u.email.includes(search) || u.name.toLowerCase().includes(search);
    const planOk = !plan || u.plan === plan;
    return searchOk && planOk;
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const ip = getClientIp(request);
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    plan?: 'free' | 'pro' | 'enterprise';
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
    action?:
      | 'deactivate'
      | 'activate'
      | 'reset-subscription'
      | 'upgrade'
      | 'downgrade'
      | 'edit'
      | 'set-password';
    plan?: 'free' | 'pro' | 'enterprise';
    name?: string;
    email?: string;
    newPassword?: string;
  };

  if (!body.userId || !body.action) {
    return NextResponse.json({ error: 'userId and action are required.' }, { status: 400 });
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

    if (body.action === 'upgrade') user.plan = body.plan || 'pro';
    if (body.action === 'downgrade') user.plan = body.plan || 'free';

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
  const body = (await request.json().catch(() => ({}))) as { userId?: string };
  const userId = body.userId || '';

  if (!userId) {
    return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
  }

  if (userId === auth.session.userId) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
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
