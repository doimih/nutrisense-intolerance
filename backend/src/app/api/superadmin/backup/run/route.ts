import { NextRequest, NextResponse } from 'next/server';
import { appendAuditEvent, appendLog, readDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const settings = readDb().settings;
  const destination = settings.backup?.destination ?? 'local';
  const schedule = settings.backup?.schedule ?? 'manual';

  appendAuditEvent({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    action: 'backup.run',
    resource: 'backup',
    resourceId: null,
    ip: getClientIp(request),
    metadata: { destination, schedule, triggeredBy: 'manual' },
  });

  appendLog({
    source: 'server',
    level: 'info',
    message: `Manual backup requested by ${auth.session.email} — destination: ${destination}`,
    metadata: { destination, schedule },
  });

  if (destination === 'local') {
    return NextResponse.json({
      ok: true,
      message:
        'Backup request logged. Local backup infrastructure not yet configured — set up a backup cron job on the server.',
    });
  }

  return NextResponse.json({
    ok: true,
    message: `Backup request logged for destination "${destination}". Configure server-side backup scripts to execute it.`,
  });
}
