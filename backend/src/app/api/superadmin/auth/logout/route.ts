import { NextRequest, NextResponse } from 'next/server';
import { SUPERADMIN_COOKIE_NAME } from '@/lib/server/superadmin/auth';
import { appendAuditEvent } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  const ip = getClientIp(request);

  if (auth.session) {
    appendAuditEvent({
      actorUserId: auth.session.userId,
      actorEmail: auth.session.email,
      action: 'logout',
      resource: 'auth',
      resourceId: null,
      ip,
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SUPERADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
