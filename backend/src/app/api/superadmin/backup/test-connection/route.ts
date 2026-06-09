import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

type TestBody = {
  endpoint?: unknown;
  bucket?: unknown;
  accessKey?: unknown;
  secretKey?: unknown;
  region?: unknown;
};

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as TestBody;
  const saved = readDb().settings?.backup?.hetzner;

  const endpoint = typeof body.endpoint === 'string' && body.endpoint.trim() ? body.endpoint.trim() : (saved?.endpoint ?? '');
  const bucket = typeof body.bucket === 'string' && body.bucket.trim() ? body.bucket.trim() : (saved?.bucket ?? '');
  const accessKey = typeof body.accessKey === 'string' && body.accessKey.trim() ? body.accessKey.trim() : (saved?.accessKey ?? '');
  const secretKey = typeof body.secretKey === 'string' && body.secretKey.trim() ? body.secretKey.trim() : (saved?.secretKey ?? '');
  const region = typeof body.region === 'string' && body.region.trim() ? body.region.trim() : (saved?.region ?? 'eu-central');

  if (!endpoint || !bucket || !accessKey) {
    return NextResponse.json(
      { ok: false, message: 'Endpoint, bucket și access key sunt obligatorii.' },
      { status: 400 },
    );
  }

  if (!secretKey) {
    return NextResponse.json(
      { ok: false, message: 'Secret Key este obligatoriu. Salveaza-l mai intai in setarile storage.' },
      { status: 400 },
    );
  }

  const normalizedEndpoint =
    endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `https://${endpoint}`;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedEndpoint);
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Endpoint URL invalid. Exemplu: https://fsn1.your-objectstorage.com' },
      { status: 400 },
    );
  }

  try {
    const client = new S3Client({
      region,
      endpoint: parsedUrl.origin,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true,
    });

    await client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 }));

    return NextResponse.json({
      ok: true,
      message: `✓ Conexiune reusita — bucket "${bucket}" pe ${parsedUrl.hostname} este accesibil.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const hint = message.includes('NoSuchBucket')
      ? `Bucket-ul "${bucket}" nu exista. Creeaza-l in Hetzner Console.`
      : message.includes('InvalidAccessKeyId') || message.includes('SignatureDoesNotMatch')
        ? 'Access Key sau Secret Key incorecte.'
        : message.includes('ECONNREFUSED') || message.includes('ENOTFOUND')
          ? `Nu se poate conecta la ${parsedUrl.hostname}. Verifica endpoint-ul.`
          : message.slice(0, 150);
    return NextResponse.json({ ok: false, message: `✗ ${hint}` });
  }
}
