import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

type TestBody = {
  endpoint?: unknown;
  bucket?: unknown;
  accessKey?: unknown;
  region?: unknown;
};

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as TestBody;
  const endpoint = typeof body.endpoint === 'string' ? body.endpoint.trim() : '';
  const bucket = typeof body.bucket === 'string' ? body.bucket.trim() : '';
  const accessKey = typeof body.accessKey === 'string' ? body.accessKey.trim() : '';

  if (!endpoint || !bucket || !accessKey) {
    return NextResponse.json(
      { ok: false, message: 'Endpoint, bucket și access key sunt obligatorii pentru testarea conexiunii.' },
      { status: 400 },
    );
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(endpoint);
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Endpoint URL invalid. Exemplu: https://fsn1.your-objectstorage.com' },
      { status: 400 },
    );
  }

  // Attempt a HEAD request to the endpoint to verify basic connectivity
  try {
    const testUrl = `${parsedUrl.origin}/${encodeURIComponent(bucket)}`;
    const response = await fetch(testUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8_000),
    });

    // A 403 or 401 means the server is reachable (auth failed, but connection OK)
    // A 200/204 means it's publicly accessible
    if (response.status < 500) {
      return NextResponse.json({
        ok: true,
        message: `Conexiune reusita — serverul ${parsedUrl.hostname} este accesibil (HTTP ${response.status}).`,
      });
    }

    return NextResponse.json({
      ok: false,
      message: `Serverul a răspuns cu HTTP ${response.status}. Verifică endpoint-ul și bucket-ul.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: false,
      message: `Conexiune esuata: ${message.slice(0, 120)}. Verifică endpoint-ul.`,
    });
  }
}
