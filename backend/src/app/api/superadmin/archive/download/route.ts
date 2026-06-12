import { NextRequest, NextResponse } from 'next/server';
import { mutateDb, readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? '';

  if (!token) {
    return NextResponse.json({ error: 'Token lipsa.' }, { status: 400 });
  }

  const db = readDb();
  const link = (db.archiveLinks ?? []).find((l) => l.token === token);

  if (!link) {
    return NextResponse.json({ error: 'Link invalid.' }, { status: 404 });
  }

  if (new Date(link.expiresAt) < new Date()) {
    return NextResponse.json(
      { error: 'Link-ul a expirat. Solicita un nou link din panoul de administrare.' },
      { status: 410 },
    );
  }

  mutateDb((d) => {
    const l = (d.archiveLinks ?? []).find((x) => x.token === token);
    if (l) l.downloadedAt = new Date().toISOString();
  });

  const freshDb = readDb();

  const archive = {
    exportedAt: new Date().toISOString(),
    generatedBy: link.generatedBy,
    sentToEmail: link.sentToEmail,
    users: freshDb.users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      plan: u.plan,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      lastLoginAt: u.lastLoginAt,
    })),
    subscriptions: freshDb.subscriptions,
    payments: freshDb.payments,
    auditEvents: freshDb.auditEvents.slice(0, 500),
    settings: {
      app: freshDb.settings.app,
      twoFactor: freshDb.settings.twoFactor,
      pwa: freshDb.settings.pwa,
      backup: freshDb.settings.backup
        ? {
            schedule: freshDb.settings.backup.schedule,
            retention: freshDb.settings.backup.retention,
            destination: freshDb.settings.backup.destination,
          }
        : undefined,
    },
  };

  const json = JSON.stringify(archive, null, 2);
  const filename = `nutriaid-archive-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(Buffer.byteLength(json, 'utf8')),
    },
  });
}
