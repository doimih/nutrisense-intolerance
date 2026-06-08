import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/superadmin/store';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const db = readDb();
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const failed = db.securityEvents.filter(
    (e) => e.type === 'login_failed' && new Date(e.createdAt).getTime() >= oneHourAgo
  );

  const suspiciousIps = Object.entries(
    failed.reduce<Record<string, number>>((acc, event) => {
      acc[event.ip] = (acc[event.ip] || 0) + 1;
      return acc;
    }, {})
  )
    .filter(([, count]) => count >= 5)
    .map(([ip, count]) => ({ ip, count }));

  return NextResponse.json({
    activeSessions: [
      {
        userId: auth.session.userId,
        email: auth.session.email,
        ip: auth.session.ip,
        issuedAt: auth.session.issuedAt,
      },
    ],
    suspiciousIps,
    auditTrail: db.auditEvents.slice(0, 200),
    securityEvents: db.securityEvents.slice(0, 200),
  });
}
