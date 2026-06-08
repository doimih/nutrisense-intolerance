import { NextRequest, NextResponse } from 'next/server';
import { appendAuditEvent, readDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const kind = request.nextUrl.searchParams.get('kind') || 'users';
  const db = readDb();

  let payload: unknown;
  if (kind === 'users') payload = db.users;
  else if (kind === 'subscriptions') payload = db.subscriptions;
  else if (kind === 'food-data') payload = db.aiLogs;
  else payload = { error: 'Unsupported export kind.' };

  appendAuditEvent({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    action: 'export',
    resource: kind,
    resourceId: null,
    ip: getClientIp(request),
  });

  return NextResponse.json({ kind, exportedAt: new Date().toISOString(), data: payload });
}
