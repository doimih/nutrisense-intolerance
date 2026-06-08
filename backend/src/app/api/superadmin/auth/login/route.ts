import { NextRequest, NextResponse } from 'next/server';
import {
  SUPERADMIN_COOKIE_MAX_AGE_SECONDS,
  SUPERADMIN_COOKIE_NAME,
  createSessionToken,
  verifyPassword,
} from '@/lib/server/superadmin/auth';
import {
  appendAuditEvent,
  appendSecurityEvent,
  mutateDb,
  readDb,
} from '@/lib/server/superadmin/store';
import { getClientIp } from '@/lib/server/superadmin/rbac';
import { verifyTotpCode } from '@/lib/server/superadmin/totp';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    otpCode?: string;
  };
  const email = body.email?.trim().toLowerCase() || '';
  const password = body.password || '';
  const otpCode = body.otpCode || '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const db = readDb();
  const user = db.users.find((u) => u.email === email);
  if (
    !user ||
    !verifyPassword(password, user.passwordHash, user.passwordSalt) ||
    user.role !== 'superadmin' ||
    user.status !== 'active'
  ) {
    appendSecurityEvent({
      type: 'login_failed',
      ip,
      email,
      userId: user?.id || null,
      message: 'Failed superadmin login attempt',
    });
    return NextResponse.json(
      { error: 'Invalid credentials or insufficient role.' },
      { status: 401 }
    );
  }

  const twoFactorSettings = db.settings.twoFactor;
  const requiresTwoFactor =
    twoFactorSettings.globalEnabled &&
    ((twoFactorSettings.enforceAdmin && (user.role === 'superadmin' || user.role === 'admin')) ||
      twoFactorSettings.enforceAll);

  if (requiresTwoFactor) {
    if (!twoFactorSettings.methods.totp) {
      return NextResponse.json(
        { error: '2FA is required, but no supported method is enabled.' },
        { status: 503 }
      );
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA setup is required for this account before login.' },
        { status: 403 }
      );
    }

    if (!otpCode) {
      return NextResponse.json(
        { error: '2FA code is required.', requiresTwoFactor: true },
        { status: 401 }
      );
    }

    const isOtpValid = verifyTotpCode(user.twoFactorSecret, otpCode);
    if (!isOtpValid) {
      appendSecurityEvent({
        type: 'login_failed',
        ip,
        email,
        userId: user.id,
        message: 'Failed superadmin login attempt: invalid 2FA code',
      });
      return NextResponse.json(
        { error: 'Invalid 2FA code.', requiresTwoFactor: true },
        { status: 401 }
      );
    }
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    sessionVersion: user.sessionVersion || 1,
    ip,
    issuedAt: nowSec,
    exp: nowSec + SUPERADMIN_COOKIE_MAX_AGE_SECONDS,
  });

  mutateDb((next) => {
    const idx = next.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      next.users[idx].lastLoginAt = new Date().toISOString();
      next.users[idx].updatedAt = new Date().toISOString();
    }
  });

  appendSecurityEvent({
    type: 'login_success',
    ip,
    email: user.email,
    userId: user.id,
    message: 'Superadmin login successful',
  });
  appendAuditEvent({
    actorUserId: user.id,
    actorEmail: user.email,
    action: 'login',
    resource: 'auth',
    resourceId: null,
    ip,
  });

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
  response.cookies.set(SUPERADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SUPERADMIN_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
