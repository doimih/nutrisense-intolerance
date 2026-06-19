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
  VISITOR_USER_ID,
  VISITOR_USER_EMAIL,
} from '@/lib/server/superadmin/store';
import { getClientIp } from '@/lib/server/superadmin/rbac';
import { verifyTotpCode } from '@/lib/server/superadmin/totp';

export const runtime = 'nodejs';

const VISITOR_SESSION_SECONDS = 10 * 60;   // 10 minutes
const VISITOR_BLOCK_SECONDS   = 24 * 60 * 60; // 24 hours after expiry

function idGen(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

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
  if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt) || user.status !== 'active') {
    appendSecurityEvent({
      type: 'login_failed',
      ip,
      email,
      userId: user?.id || null,
      message: 'Failed login attempt',
    });
    return NextResponse.json(
      { error: 'Invalid credentials or insufficient role.' },
      { status: 401 }
    );
  }

  // Only superadmin and visitor are allowed to log in
  if (user.role !== 'superadmin' && user.id !== VISITOR_USER_ID) {
    appendSecurityEvent({
      type: 'login_failed',
      ip,
      email,
      userId: user.id,
      message: 'Login denied: insufficient role',
    });
    return NextResponse.json(
      { error: 'Invalid credentials or insufficient role.' },
      { status: 401 }
    );
  }

  // ── Visitor-specific IP session enforcement ──────────────────────────────────
  if (user.id === VISITOR_USER_ID) {
    const existingSession = db.visitorSessions.find(
      (s) => s.system === 'backend' && s.ip === ip,
    );

    if (existingSession) {
      const now = Date.now();
      const sessionExpiresAt = new Date(existingSession.sessionExpiresAt).getTime();
      const blockUntil = new Date(existingSession.blockUntil).getTime();

      // Already in active window → deny new login (session cookie is still valid)
      if (now < sessionExpiresAt) {
        return NextResponse.json(
          { error: 'A visitor session is already active for this IP.' },
          { status: 403 },
        );
      }

      // In the 24h block period (session expired but block not yet lifted)
      if (now < blockUntil) {
        const remainingMinutes = Math.ceil((blockUntil - now) / 60000);
        return NextResponse.json(
          { error: `Access from this IP is blocked. Try again in ${remainingMinutes} minutes or contact the administrator.` },
          { status: 403 },
        );
      }

      // Block expired BUT still locked — only superadmin reset unlocks permanently
      return NextResponse.json(
        { error: 'Access from this IP has expired. Contact the administrator to reset access.' },
        { status: 403 },
      );
    }

    // No prior session from this IP → create one and proceed
    const nowIso = new Date().toISOString();
    const sessionExpiresAt = new Date(Date.now() + VISITOR_SESSION_SECONDS * 1000).toISOString();
    const blockUntil = new Date(Date.now() + (VISITOR_SESSION_SECONDS + VISITOR_BLOCK_SECONDS) * 1000).toISOString();
    mutateDb((d) => {
      if (!Array.isArray(d.visitorSessions)) d.visitorSessions = [];
      d.visitorSessions.push({
        id: idGen('vis'),
        system: 'backend',
        ip,
        sessionStartsAt: nowIso,
        sessionExpiresAt,
        blockUntil,
        resetBy: null,
        resetAt: null,
      });
    });

    const nowSec = Math.floor(Date.now() / 1000);
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sessionVersion: user.sessionVersion || 1,
      ip,
      issuedAt: nowSec,
      exp: nowSec + VISITOR_SESSION_SECONDS,
      isVisitor: true,
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
      message: `Visitor login from ${ip} — session valid 10 min`,
    });
    appendAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'visitor.login',
      resource: 'auth',
      resourceId: null,
      ip,
      metadata: { sessionExpiresAt, blockUntil },
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      isVisitor: true,
      sessionExpiresAt,
    });
    response.cookies.set(SUPERADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: VISITOR_SESSION_SECONDS,
    });
    return response;
  }
  // ── End visitor logic ────────────────────────────────────────────────────────

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
