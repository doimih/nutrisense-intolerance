import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import type { AcquisitionDownloadRecord } from '@/lib/server/superadmin/types';

export const runtime = 'nodejs';

type DownloadStats = Record<string, number>;

type AcquisitionResponse = {
  downloads: AcquisitionDownloadRecord[];
  stats: DownloadStats;
  total: number;
};

async function fetchFromFrontend(): Promise<AcquisitionResponse> {
  const frontendUrl = process.env.FRONTEND_INTERNAL_URL || 'http://localhost:3000';
  const syncSecret = process.env.INTERNAL_SYNC_SECRET;

  if (!syncSecret) {
    throw new Error('INTERNAL_SYNC_SECRET not configured.');
  }

  const res = await fetch(`${frontendUrl}/api/internal/acquisition/downloads`, {
    headers: { Authorization: `Bearer ${syncSecret}` },
    signal: AbortSignal.timeout(8_000),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Frontend returned ${res.status}`);
  }

  return res.json() as Promise<AcquisitionResponse>;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  try {
    const data = await fetchFromFrontend();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Could not fetch acquisition downloads: ${msg}`, downloads: [], stats: {}, total: 0 },
      { status: 502 }
    );
  }
}
