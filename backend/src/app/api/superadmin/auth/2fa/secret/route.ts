import { NextRequest, NextResponse } from 'next/server';
import { appendAuditEvent, mutateDb, readDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { createOtpAuthUrl, generateTotpSecret } from '@/lib/server/superadmin/totp';

export const runtime = 'nodejs';

const DEFAULT_ISSUER = 'NutriSense Superadmin';

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const user = readDb().users.find((candidate) => candidate.id === auth.session.userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (!user.twoFactorSecret) {
    return NextResponse.json({ secret: null, otpAuthUrl: null });
  }

  const issuer = process.env.SUPERADMIN_TOTP_ISSUER || DEFAULT_ISSUER;
  return NextResponse.json({
    secret: user.twoFactorSecret,
    otpAuthUrl: createOtpAuthUrl({
      issuer,
      accountName: user.email,
      secret: user.twoFactorSecret,
    }),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const ip = getClientIp(request);
  const issuer = process.env.SUPERADMIN_TOTP_ISSUER || DEFAULT_ISSUER;

  const secret = generateTotpSecret();

  const updated = mutateDb((db) => {
    const user = db.users.find((candidate) => candidate.id === auth.session.userId);
    if (!user) return null;

    user.twoFactorSecret = secret;
    user.updatedAt = new Date().toISOString();
    return user;
  });

  if (!updated) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  appendAuditEvent({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    action: '2fa.secret.rotate',
    resource: 'auth',
    resourceId: auth.session.userId,
    ip,
  });

  return NextResponse.json({
    secret,
    otpAuthUrl: createOtpAuthUrl({
      issuer,
      accountName: updated.email,
      secret,
    }),
  });
}
