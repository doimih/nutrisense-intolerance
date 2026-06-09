import { NextRequest, NextResponse } from 'next/server';
import { appendAuditEvent, mutateDb, readDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;
  return NextResponse.json({ settings: readDb().settings });
}

function deepMergeSettings(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...existing };
  for (const [key, val] of Object.entries(incoming)) {
    const cur = result[key];
    if (
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      cur !== null &&
      typeof cur === 'object' &&
      !Array.isArray(cur)
    ) {
      // Recursively merge nested objects (e.g. backup.hetzner)
      result[key] = deepMergeSettings(
        cur as Record<string, unknown>,
        val as Record<string, unknown>,
      );
    } else {
      result[key] = val;
    }
  }
  return result;
}

export async function PATCH(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const settings = mutateDb((db) => {
    db.settings = deepMergeSettings(
      db.settings as unknown as Record<string, unknown>,
      body,
    ) as typeof db.settings;
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
