import { NextRequest, NextResponse } from 'next/server';
import {
  SUPERADMIN_COOKIE_MAX_AGE_SECONDS,
  SUPERADMIN_COOKIE_NAME,
  createPasswordHash,
  createSessionToken,
  verifyPassword,
} from '@/lib/server/superadmin/auth';
import {
  appendAuditEvent,
  appendLog,
  appendSecurityEvent,
  mutateDb,
  readDb,
} from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

type ChangePasswordBody = {
  currentPassword?: string;
  newPassword?: string;
};

export async function PATCH(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const ip = getClientIp(request);
  const body = (await request.json().catch(() => ({}))) as ChangePasswordBody;
  const currentPassword = body.currentPassword || '';
  const newPassword = body.newPassword || '';

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'currentPassword and newPassword are required.' },
      { status: 400 }
    );
  }

  if (newPassword.length < 10) {
    return NextResponse.json(
      { error: 'newPassword must be at least 10 characters long.' },
      { status: 400 }
    );
  }

  const db = readDb();
  const user = db.users.find((candidate) => candidate.id === auth.session.userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (!verifyPassword(currentPassword, user.passwordHash, user.passwordSalt)) {
    appendSecurityEvent({
      type: 'login_failed',
      ip,
      email: auth.session.email,
      userId: auth.session.userId,
      message: 'Rejected superadmin password change due to invalid current password',
    });
    return NextResponse.json({ error: 'Current password is invalid.' }, { status: 401 });
  }

  if (verifyPassword(newPassword, user.passwordHash, user.passwordSalt)) {
    return NextResponse.json(
      { error: 'New password must be different from current password.' },
      { status: 400 }
    );
  }

  const password = createPasswordHash(newPassword);
  const nowIso = new Date().toISOString();
  const nowSec = Math.floor(Date.now() / 1000);
  const refreshedIssuedAt = nowSec + 1;

  const updatedUser = mutateDb((nextDb) => {
    const idx = nextDb.users.findIndex((candidate) => candidate.id === auth.session.userId);
    if (idx < 0) return null;

    nextDb.users[idx].passwordHash = password.hash;
    nextDb.users[idx].passwordSalt = password.salt;
    nextDb.users[idx].mustChangePassword = false;
    nextDb.users[idx].sessionVersion += 1;
    nextDb.users[idx].sessionInvalidBefore = nowSec;
    nextDb.users[idx].updatedAt = nowIso;
    return nextDb.users[idx];
  });

  if (!updatedUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  appendAuditEvent({
    actorUserId: updatedUser.id,
    actorEmail: updatedUser.email,
    action: 'password.change',
    resource: 'auth',
    resourceId: updatedUser.id,
    ip,
    metadata: { sessionVersion: updatedUser.sessionVersion },
  });

  appendSecurityEvent({
    type: 'session_invalid',
    ip,
    email: updatedUser.email,
    userId: updatedUser.id,
    message: 'All active sessions invalidated after password change',
  });

  // Sync new password to frontend user store so both systems stay in lockstep
  const frontendUrl = process.env.FRONTEND_INTERNAL_URL || 'http://frontend:3000';
  const syncSecret = process.env.INTERNAL_SYNC_SECRET;
  if (!syncSecret) {
    appendLog({ source: 'server', level: 'warn', message: 'sync-superadmin-password: INTERNAL_SYNC_SECRET not set, skipping frontend sync' });
  } else {
    try {
      const syncRes = await fetch(`${frontendUrl}/api/internal/sync-superadmin-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${syncSecret}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      if (!syncRes.ok) {
        const errBody = await syncRes.json().catch(() => ({})) as { error?: string };
        appendLog({
          source: 'server',
          level: 'warn',
          message: `sync-superadmin-password: frontend returned ${syncRes.status} — ${errBody.error ?? 'unknown error'}`,
        });
      } else {
        appendLog({ source: 'server', level: 'info', message: 'sync-superadmin-password: frontend updated successfully' });
      }
    } catch (err: unknown) {
      appendLog({
        source: 'server',
        level: 'warn',
        message: `sync-superadmin-password: fetch failed — ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  const token = createSessionToken({
    userId: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    sessionVersion: updatedUser.sessionVersion,
    ip,
    issuedAt: refreshedIssuedAt,
    exp: refreshedIssuedAt + SUPERADMIN_COOKIE_MAX_AGE_SECONDS,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SUPERADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SUPERADMIN_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
