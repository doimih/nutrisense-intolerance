import { NextRequest, NextResponse } from 'next/server';
import { readAcquisitionLog, getAcquisitionStats } from '@/lib/server/acquisitionStore';

export const runtime = 'nodejs';

function verifyRequest(request: NextRequest): boolean {
  const secret = process.env.INTERNAL_SYNC_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return token === secret;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!verifyRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const log = readAcquisitionLog();
  const stats = getAcquisitionStats();

  return NextResponse.json({
    downloads: log.downloads,
    stats,
    total: log.downloads.length,
  });
}
