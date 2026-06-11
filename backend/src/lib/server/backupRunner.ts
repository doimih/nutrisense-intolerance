import 'server-only';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { appendAuditEvent, appendLog, readDb } from '@/lib/server/superadmin/store';

export type BackupTrigger = 'manual' | 'scheduled';

export type BackupResult =
  | { ok: true; filesUploaded: number; prefix: string; destination: string }
  | { ok: false; message: string };

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

async function uploadToHetzner(
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
  if (!existsSync(dataDir)) throw new Error('Data directory not found');

  const files = readdirSync(dataDir).filter((f) => f.endsWith('.json'));
  if (files.length === 0) throw new Error('No data files found to backup');

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

export async function runBackup(
  triggeredBy: BackupTrigger,
  actorUserId = 'system',
  actorEmail = 'system@scheduler',
): Promise<BackupResult> {
  const settings = readDb().settings;
  const destination = settings.backup?.destination ?? 'local';
  const schedule = settings.backup?.schedule ?? 'manual';

  if (destination === 'hetzner') {
    const h = settings.backup?.hetzner;
    if (!h?.endpoint || !h.bucket || !h.accessKey || !h.secretKey) {
      return { ok: false, message: 'Hetzner storage not fully configured.' };
    }

    try {
      const normalizedEndpoint =
        h.endpoint.startsWith('http://') || h.endpoint.startsWith('https://')
          ? h.endpoint
          : `https://${h.endpoint}`;

      const { filesUploaded, prefix } = await uploadToHetzner(
        normalizedEndpoint,
        h.bucket,
        h.accessKey,
        h.secretKey,
        h.region || 'eu-central',
      );

      appendAuditEvent({
        actorUserId,
        actorEmail,
        action: 'backup.run',
        resource: 'backup',
        resourceId: null,
        ip: triggeredBy === 'scheduled' ? 'scheduler' : 'manual',
        metadata: { destination, schedule, triggeredBy, prefix, filesUploaded },
      });
      appendLog({
        source: 'server',
        level: 'info',
        message: `Backup ${triggeredBy} → Hetzner S3 — ${filesUploaded} file(s) → ${h.bucket}/${prefix}`,
        metadata: { destination, prefix, filesUploaded, triggeredBy },
      });

      return { ok: true, filesUploaded, prefix, destination };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      appendLog({
        source: 'server',
        level: 'error',
        message: `Backup failed (${triggeredBy}): ${message}`,
        metadata: { destination, triggeredBy },
      });
      return { ok: false, message: `Backup failed: ${message.slice(0, 200)}` };
    }
  }

  // Local — just log the intent
  appendAuditEvent({
    actorUserId,
    actorEmail,
    action: 'backup.run',
    resource: 'backup',
    resourceId: null,
    ip: triggeredBy === 'scheduled' ? 'scheduler' : 'manual',
    metadata: { destination, schedule, triggeredBy },
  });
  appendLog({
    source: 'server',
    level: 'info',
    message: `Backup ${triggeredBy} — destination: ${destination} (local)`,
    metadata: { destination, schedule, triggeredBy },
  });

  return {
    ok: true,
    filesUploaded: 0,
    prefix: '',
    destination,
  };
}
