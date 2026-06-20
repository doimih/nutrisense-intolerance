import { NextRequest, NextResponse } from 'next/server';
import { appendAuditEvent, mutateDb, readDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;
  const settings = readDb().settings;
  // Mask the tiktok accessToken — expose only hasAccessToken
  const { tiktok, ...restSettings } = settings as typeof settings & { tiktok?: { enabled: boolean; pixelId: string; accessToken: string; testEventCode: string } };
  return NextResponse.json({
    settings: {
      ...restSettings,
      tiktok: tiktok
        ? {
            enabled: tiktok.enabled ?? false,
            pixelId: tiktok.pixelId ?? '',
            hasAccessToken: !!(tiktok.accessToken),
            testEventCode: tiktok.testEventCode ?? '',
          }
        : undefined,
    },
  });
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

  // Extract tiktok separately to handle accessToken masking
  const { tiktok: tiktokBody, ...restBody } = body as Record<string, unknown> & {
    tiktok?: {
      enabled?: boolean;
      pixelId?: string;
      accessToken?: string;
      testEventCode?: string;
    };
  };

  const settings = mutateDb((db) => {
    // Merge all non-tiktok fields normally
    db.settings = deepMergeSettings(
      db.settings as unknown as Record<string, unknown>,
      restBody,
    ) as typeof db.settings;

    // Handle tiktok separately to preserve accessToken if not sent
    if (tiktokBody) {
      const tt = db.settings.tiktok ?? { enabled: false, pixelId: '', accessToken: '', testEventCode: '' };
      if (typeof tiktokBody.enabled === 'boolean') tt.enabled = tiktokBody.enabled;
      if (typeof tiktokBody.pixelId === 'string') tt.pixelId = tiktokBody.pixelId;
      if (typeof tiktokBody.accessToken === 'string' && tiktokBody.accessToken.trim()) {
        tt.accessToken = tiktokBody.accessToken;
      }
      if (typeof tiktokBody.testEventCode === 'string') tt.testEventCode = tiktokBody.testEventCode;
      db.settings.tiktok = tt;
    }

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
