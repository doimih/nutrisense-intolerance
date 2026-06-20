import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const db = readDb();
  const backupEvents = (db.auditEvents ?? [])
    .filter((e) => e.action === 'backup.run')
    .slice(0, 50)
    .map((e) => ({
      id: e.id,
      createdAt: e.createdAt,
      actorEmail: e.actorEmail,
      destination: (e.metadata?.destination as string) ?? 'local',
      triggeredBy: (e.metadata?.triggeredBy as string) ?? 'manual',
      filesUploaded: (e.metadata?.filesUploaded as number) ?? null,
      prefix: (e.metadata?.prefix as string) ?? null,
      schedule: (e.metadata?.schedule as string) ?? null,
      type: (e.metadata?.type as string) ?? 'db',
      deletedCount: (e.metadata?.deletedCount as number) ?? 0,
    }));

  return NextResponse.json({ history: backupEvents });
}
