import { NextRequest, NextResponse } from 'next/server';
import { SUPERADMIN_COOKIE_NAME, readSessionToken } from '@/lib/server/superadmin/auth';
import { appendSecurityEvent, mutateDb, readDb, VISITOR_USER_ID } from '@/lib/server/superadmin/store';

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export function unauthorized(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function requireSuperadmin(request: NextRequest) {
  const token = request.cookies.get(SUPERADMIN_COOKIE_NAME)?.value;
  if (!token) return { error: unauthorized('Missing superadmin session.') };

  const session = readSessionToken(token);
  if (!session || session.role !== 'superadmin') {
    return { error: unauthorized('Superadmin role required.') };
  }

  const db = readDb();
  const user = db.users.find((candidate) => candidate.id === session.userId);
  if (!user || user.role !== 'superadmin') {
    return { error: unauthorized('Superadmin account not found.') };
  }

  if (session.sessionVersion !== user.sessionVersion) {
    return { error: unauthorized('Session was revoked. Please sign in again.') };
  }

  if (session.issuedAt < user.sessionInvalidBefore) {
    return { error: unauthorized('Session expired by policy. Please sign in again.') };
  }

  // Visitor: allow GET only, reject all write operations
  if (session.isVisitor || session.userId === VISITOR_USER_ID) {
    const method = request.method.toUpperCase();
    if (method !== 'GET') {
      return {
        error: NextResponse.json(
          { error: 'Acces vizualizare. Operatiile de modificare nu sunt permise pentru vizitator.' },
          { status: 403 },
        ),
      };
    }
  }

  const ip = getClientIp(request);
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentFailedFromIp = db.securityEvents.filter(
    (event) =>
      event.type === 'login_failed' &&
      event.ip === ip &&
      new Date(event.createdAt).getTime() >= oneHourAgo
  );

  const latestSuccessAt = db.securityEvents
    .filter(
      (event) =>
        event.type === 'login_success' &&
        event.ip === ip &&
        event.userId === session.userId &&
        new Date(event.createdAt).getTime() >= oneHourAgo
    )
    .reduce((latest, event) => {
      const timestamp = new Date(event.createdAt).getTime();
      return timestamp > latest ? timestamp : latest;
    }, 0);

  const failedAttemptsSinceLatestSuccess = recentFailedFromIp.filter(
    (event) => new Date(event.createdAt).getTime() > latestSuccessAt
  ).length;

  if (failedAttemptsSinceLatestSuccess >= 5) {
    const nowSec = Math.floor(Date.now() / 1000);
    mutateDb((nextDb) => {
      const idx = nextDb.users.findIndex((candidate) => candidate.id === session.userId);
      if (idx >= 0) {
        nextDb.users[idx].sessionVersion += 1;
        nextDb.users[idx].sessionInvalidBefore = nowSec;
        nextDb.users[idx].updatedAt = new Date().toISOString();
      }
    });

    appendSecurityEvent({
      type: 'suspicious_ip',
      ip,
      email: session.email,
      userId: session.userId,
      message: 'Active sessions invalidated due to suspicious IP activity',
    });

    return { error: unauthorized('Suspicious IP detected. Session invalidated.') };
  }

  return { session };
}
