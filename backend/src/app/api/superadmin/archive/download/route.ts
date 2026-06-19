import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import { mutateDb, readDb } from '@/lib/server/superadmin/store';
import { Readable } from 'stream';

export const runtime = 'nodejs';

const ARCHIVE_PATH = join(process.cwd(), 'data', 'platform-archive.zip');

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? '';

  if (!token) {
    return NextResponse.json({ error: 'Missing token.' }, { status: 400 });
  }

  const db = readDb();
  const link = (db.archiveLinks ?? []).find((l) => l.token === token);

  if (!link) {
    return NextResponse.json({ error: 'Invalid link.' }, { status: 404 });
  }

  if (new Date(link.expiresAt) < new Date()) {
    return NextResponse.json(
      { error: 'The link has expired. Request a new link from the admin panel.' },
      { status: 410 },
    );
  }

  // Verify archive exists
  let archiveStat: ReturnType<typeof statSync> | null = null;
  try {
    archiveStat = statSync(ARCHIVE_PATH);
  } catch {
    return NextResponse.json(
      { error: 'The platform archive has not been generated yet. Contact the administrator.' },
      { status: 503 },
    );
  }

  // Mark as downloaded
  mutateDb((d) => {
    const l = (d.archiveLinks ?? []).find((x) => x.token === token);
    if (l) l.downloadedAt = new Date().toISOString();
  });

  const filename = `nutriaid-platform-${new Date().toISOString().slice(0, 10)}.zip`;
  const fileSize = archiveStat.size;

  const nodeStream = createReadStream(ARCHIVE_PATH);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(fileSize),
      'Cache-Control': 'no-store',
    },
  });
}
