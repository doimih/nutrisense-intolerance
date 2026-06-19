import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { runBackup } from '@/lib/server/backupRunner';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const result = await runBackup('manual', auth.session.userId, auth.session.email);

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: result.message.includes('not fully configured') ? 400 : 500 });
  }

  const { filesUploaded, prefix, destination } = result;
  const msg =
    destination === 'hetzner'
      ? `Backup completed — ${filesUploaded} file(s) uploaded to ${prefix}`
      : 'Local backup recorded. Configure Hetzner Object Storage for cloud backups.';

  return NextResponse.json({ ok: true, message: msg });
}
