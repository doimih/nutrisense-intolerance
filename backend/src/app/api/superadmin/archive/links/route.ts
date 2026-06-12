import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/superadmin/store';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const db = readDb();
  const links = (db.archiveLinks ?? []).map((l) => ({
    id: l.id,
    sentToEmail: l.sentToEmail,
    generatedBy: l.generatedBy,
    expiresAt: l.expiresAt,
    downloadedAt: l.downloadedAt,
    createdAt: l.createdAt,
    expired: new Date(l.expiresAt) < new Date(),
  }));

  return NextResponse.json({ links });
}
