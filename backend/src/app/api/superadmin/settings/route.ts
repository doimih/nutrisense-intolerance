import { NextRequest, NextResponse } from 'next/server';
import { appendAuditEvent, mutateDb, readDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;
  return NextResponse.json({ settings: readDb().settings });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const settings = mutateDb((db) => {
    db.settings = {
      ...db.settings,
      ...body,
    } as typeof db.settings;
    return db.settings;
  });

  appendAuditEvent({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    action: 'settings.update',
    resource: 'platform-settings',
    resourceId: null,
    ip: getClientIp(request),
  });

  return NextResponse.json({ settings });
}
