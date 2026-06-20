import 'server-only';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  type ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { appendAuditEvent, appendLog, readDb } from '@/lib/server/superadmin/store';

export type BackupTrigger = 'manual' | 'scheduled';
export type BackupType = 'db' | 'system';

export type BackupResult =
  | { ok: true; filesUploaded: number; prefix: string; destination: string; type: BackupType }
  | { ok: false; message: string };

// DB backups: keep newest 20, delete older ones
const DB_MAX_BACKUPS = 20;

// System archives: keep newest 3, delete archives older than 90 days
const SYSTEM_MAX_ARCHIVES = 3;
const SYSTEM_MAX_AGE_DAYS = 90;

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function makeS3Client(endpoint: string, accessKey: string, secretKey: string, region: string): S3Client {
  return new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    forcePathStyle: true,
  });
}

// Lists all backup prefixes under a given folder (e.g. "backups/db/" or "backups/system/")
async function listBackupPrefixes(
  client: S3Client,
  bucket: string,
  folder: string,
): Promise<{ prefix: string; date: Date }[]> {
  const prefixes: { prefix: string; date: Date }[] = [];
  let continuationToken: string | undefined;

  do {
    const res: ListObjectsV2CommandOutput = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: folder,
        Delimiter: '/',
        ContinuationToken: continuationToken,
      }),
    );

    for (const cp of res.CommonPrefixes ?? []) {
      if (!cp.Prefix) continue;
      // Extract timestamp from prefix like "backups/db/2024-01-15T03-00-00/"
      const name = cp.Prefix.replace(folder, '').replace(/\/$/, '');
      // Convert back: 2024-01-15T03-00-00 → 2024-01-15T03:00:00
      const isoStr = name.replace(/T(\d{2})-(\d{2})-(\d{2})$/, 'T$1:$2:$3');
      const date = new Date(isoStr);
      if (!isNaN(date.getTime())) {
        prefixes.push({ prefix: cp.Prefix, date });
      }
    }

    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);

  return prefixes.sort((a, b) => b.date.getTime() - a.date.getTime()); // newest first
}

// Deletes all objects under a given prefix
async function deletePrefix(client: S3Client, bucket: string, prefix: string): Promise<void> {
  let continuationToken: string | undefined;
  do {
    const res: ListObjectsV2CommandOutput = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: continuationToken }),
    );
    for (const obj of res.Contents ?? []) {
      if (obj.Key) {
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: obj.Key }));
      }
    }
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);
}

// Enforces DB backup retention: keep newest DB_MAX_BACKUPS, delete the rest
async function enforceDbRetention(client: S3Client, bucket: string): Promise<number> {
  const backups = await listBackupPrefixes(client, bucket, 'backups/db/');
  const toDelete = backups.slice(DB_MAX_BACKUPS); // everything beyond the 20 newest
  for (const b of toDelete) {
    await deletePrefix(client, bucket, b.prefix);
  }
  return toDelete.length;
}

// Enforces system archive retention:
// - Keep max SYSTEM_MAX_ARCHIVES (3)
// - Additionally, if oldest is > SYSTEM_MAX_AGE_DAYS old and count >= 3, delete oldest
async function enforceSystemRetention(client: S3Client, bucket: string): Promise<number> {
  const archives = await listBackupPrefixes(client, bucket, 'backups/system/');
  let deleted = 0;

  // Delete archives beyond the max count
  const overLimit = archives.slice(SYSTEM_MAX_ARCHIVES);
  for (const a of overLimit) {
    await deletePrefix(client, bucket, a.prefix);
    deleted++;
  }

  // After enforcing count limit, re-check: delete oldest if > 90 days old and count >= 3
  const remaining = archives.slice(0, SYSTEM_MAX_ARCHIVES);
  const ageLimitMs = SYSTEM_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  if (remaining.length >= SYSTEM_MAX_ARCHIVES) {
    const oldest = remaining[remaining.length - 1];
    if (oldest && Date.now() - oldest.date.getTime() > ageLimitMs) {
      await deletePrefix(client, bucket, oldest.prefix);
      deleted++;
    }
  }

  return deleted;
}

// Creates a tar.gz of the entire source code (mounted at /app/source)
// Excludes node_modules and build artifacts — everything else is included (code, .git, .env, configs)
function createSourceArchive(): Buffer | null {
  const sourceDir = '/app/source';
  if (!existsSync(sourceDir)) return null;

  try {
    // Stream tar output directly to memory — no temp file on disk
    // Excludes: node_modules (all levels), .next build artifacts, large log files
    const buf = execSync(
      [
        'tar', 'czf', '-',
        '--exclude=node_modules',
        '--exclude=.next',
        '--exclude=backend/.next',
        '--exclude=*.log',
        '--exclude=.DS_Store',
        '-C', '/app',
        'source',
      ].join(' '),
      { maxBuffer: 800 * 1024 * 1024 }, // 800 MB max
    );
    return buf;
  } catch (err) {
    console.error('[BackupRunner] Source archive failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function fetchPostgresExport(): Promise<string | null> {
  const settings = readDb().settings;
  const frontendUrl = process.env.FRONTEND_INTERNAL_URL || 'http://frontend:3000';
  const token = settings.internalEmailToken;
  if (!token) return null;
  try {
    const res = await fetch(`${frontendUrl}/api/internal/db-export`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function uploadFiles(
  client: S3Client,
  bucket: string,
  prefix: string,
  withSystemFiles: boolean,
): Promise<number> {
  let filesUploaded = 0;

  // Always include backend JSON data files
  const dataDir = join(process.cwd(), 'data');
  if (existsSync(dataDir)) {
    const files = readdirSync(dataDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const content = readFileSync(join(dataDir, file), 'utf8');
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: `${prefix}backend/${file}`,
          Body: content,
          ContentType: 'application/json',
        }),
      );
      filesUploaded++;
    }
  }

  // Always include PostgreSQL dump
  const pgDump = await fetchPostgresExport();
  if (pgDump) {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `${prefix}postgres/database-export.json`,
        Body: pgDump,
        ContentType: 'application/json',
      }),
    );
    filesUploaded++;
  }

  // System archive: source code tar.gz + manifest
  if (withSystemFiles) {
    // Full source archive (excludes node_modules, .next build artifacts)
    const sourceArchive = createSourceArchive();
    if (sourceArchive) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: `${prefix}source/application-source.tar.gz`,
          Body: sourceArchive,
          ContentType: 'application/gzip',
        }),
      );
      filesUploaded++;
    }

    const manifest = JSON.stringify({
      type: 'system-archive',
      createdAt: new Date().toISOString(),
      node: process.version,
      prefix,
      sourceIncluded: !!sourceArchive,
      sourceArchiveSizeBytes: sourceArchive?.length ?? 0,
    }, null, 2);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `${prefix}manifest.json`,
        Body: manifest,
        ContentType: 'application/json',
      }),
    );
    filesUploaded++;
  }

  return filesUploaded;
}

export async function runBackup(
  triggeredBy: BackupTrigger,
  actorUserId = 'system',
  actorEmail = 'system@scheduler',
  type: BackupType = 'db',
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

      const client = makeS3Client(normalizedEndpoint, h.accessKey, h.secretKey, h.region || 'eu-central');
      const folder = type === 'system' ? 'backups/system/' : 'backups/db/';
      const prefix = `${folder}${timestamp()}/`;

      const filesUploaded = await uploadFiles(client, h.bucket, prefix, type === 'system');

      // Enforce retention policies
      let deletedCount = 0;
      if (type === 'db') {
        deletedCount = await enforceDbRetention(client, h.bucket);
      } else {
        deletedCount = await enforceSystemRetention(client, h.bucket);
      }

      appendAuditEvent({
        actorUserId,
        actorEmail,
        action: 'backup.run',
        resource: 'backup',
        resourceId: null,
        ip: triggeredBy === 'scheduled' ? 'scheduler' : 'manual',
        metadata: { destination, schedule, triggeredBy, prefix, filesUploaded, type, deletedCount },
      });
      appendLog({
        source: 'server',
        level: 'info',
        message: `Backup [${type}] ${triggeredBy} → Hetzner S3 — ${filesUploaded} file(s) → ${prefix}${deletedCount > 0 ? ` | pruned ${deletedCount} old archive(s)` : ''}`,
        metadata: { destination, prefix, filesUploaded, triggeredBy, type, deletedCount },
      });

      return { ok: true, filesUploaded, prefix, destination, type };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      appendLog({
        source: 'server',
        level: 'error',
        message: `Backup [${type}] failed (${triggeredBy}): ${message}`,
        metadata: { destination, triggeredBy, type },
      });
      return { ok: false, message: `Backup failed: ${message.slice(0, 200)}` };
    }
  }

  // Local — just log
  appendAuditEvent({
    actorUserId,
    actorEmail,
    action: 'backup.run',
    resource: 'backup',
    resourceId: null,
    ip: triggeredBy === 'scheduled' ? 'scheduler' : 'manual',
    metadata: { destination, schedule, triggeredBy, type },
  });
  appendLog({
    source: 'server',
    level: 'info',
    message: `Backup [${type}] ${triggeredBy} — destination: ${destination} (local, no upload)`,
    metadata: { destination, schedule, triggeredBy, type },
  });

  return { ok: true, filesUploaded: 0, prefix: '', destination, type };
}
