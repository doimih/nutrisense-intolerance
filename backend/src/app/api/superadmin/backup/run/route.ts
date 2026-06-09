import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { appendAuditEvent, appendLog, readDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

async function runHetznerBackup(
  endpoint: string,
  bucket: string,
  accessKey: string,
  secretKey: string,
  region: string,
): Promise<{ filesUploaded: number; prefix: string }> {
  const client = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    forcePathStyle: true,
  });

  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    throw new Error('Data directory not found');
  }

  const files = readdirSync(dataDir).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    throw new Error('No data files found to backup');
  }

  const prefix = `backups/${timestamp()}`;

  for (const file of files) {
    const content = readFileSync(join(dataDir, file), 'utf8');
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `${prefix}/${file}`,
        Body: content,
        ContentType: 'application/json',
      }),
    );
  }

  return { filesUploaded: files.length, prefix };
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const settings = readDb().settings;
  const destination = settings.backup?.destination ?? 'local';
  const schedule = settings.backup?.schedule ?? 'manual';

  if (destination === 'hetzner') {
    const h = settings.backup?.hetzner;

    if (!h?.endpoint || !h.bucket || !h.accessKey || !h.secretKey) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Hetzner storage not fully configured. Set endpoint, bucket, access key and secret key in Settings → Backup.',
        },
        { status: 400 },
      );
    }

    try {
      const normalizedEndpoint =
        h.endpoint.startsWith('http://') || h.endpoint.startsWith('https://')
          ? h.endpoint
          : `https://${h.endpoint}`;
      const { filesUploaded, prefix } = await runHetznerBackup(
        normalizedEndpoint,
        h.bucket,
        h.accessKey,
        h.secretKey,
        h.region || 'eu-central',
      );

      appendAuditEvent({
        actorUserId: auth.session.userId,
        actorEmail: auth.session.email,
        action: 'backup.run',
        resource: 'backup',
        resourceId: null,
        ip: getClientIp(request),
        metadata: { destination, schedule, triggeredBy: 'manual', prefix, filesUploaded },
      });

      appendLog({
        source: 'server',
        level: 'info',
        message: `Backup uploaded to Hetzner S3 — ${filesUploaded} file(s) → ${h.bucket}/${prefix}`,
        metadata: { destination, prefix, filesUploaded },
      });

      return NextResponse.json({
        ok: true,
        message: `Backup completed — ${filesUploaded} file(s) uploaded to ${h.bucket}/${prefix}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      appendLog({
        source: 'server',
        level: 'error',
        message: `Backup failed: ${message}`,
        metadata: { destination },
      });

      return NextResponse.json({ ok: false, message: `Backup failed: ${message.slice(0, 200)}` }, { status: 500 });
    }
  }

  // Local destination — just log
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
    message: `Manual backup requested — destination: ${destination}`,
    metadata: { destination, schedule },
  });

  return NextResponse.json({
    ok: true,
    message: 'Local backup logged. Set destination to "Hetzner Object Storage" and configure credentials for cloud backup.',
  });
}
