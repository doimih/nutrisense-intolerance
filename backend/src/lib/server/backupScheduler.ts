import { readDb } from '@/lib/server/superadmin/store';
import { runBackup } from '@/lib/server/backupRunner';

// Minimum gap between two consecutive scheduled DB backups (prevents double-fire)
const MIN_GAP_MS: Record<string, number> = {
  hourly: 55 * 60 * 1000,
  daily: 23 * 60 * 60 * 1000,
  weekly: 6 * 24 * 60 * 60 * 1000,
};

// System archive runs every 30 days
const SYSTEM_ARCHIVE_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

function inAllowedWindow(schedule: string): boolean {
  const now = new Date();
  const h = now.getUTCHours();
  const m = now.getUTCMinutes();

  if (schedule === 'hourly') return true;
  if (schedule === 'daily') return h === 3 && m < 10;
  if (schedule === 'weekly') return now.getUTCDay() === 0 && h === 3 && m < 10;
  return false;
}

function getLastBackupTime(type: 'db' | 'system'): number {
  try {
    const db = readDb();
    const last = db.auditEvents
      .filter(
        (e) =>
          e.action === 'backup.run' &&
          e.metadata?.triggeredBy === 'scheduled' &&
          (e.metadata?.type === type || (type === 'db' && !e.metadata?.type)),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return last ? new Date(last.createdAt).getTime() : 0;
  } catch {
    return 0;
  }
}

let schedulerStarted = false;

export function startBackupScheduler(): void {
  if (schedulerStarted) return;
  schedulerStarted = true;

  setInterval(() => {
    try {
      const settings = readDb().settings;
      const schedule = settings?.backup?.schedule ?? 'manual';
      const destination = settings?.backup?.destination ?? 'local';

      // ── DB incremental backup ─────────────────────────────────────────────
      if (schedule !== 'manual' && inAllowedWindow(schedule)) {
        const minGap = MIN_GAP_MS[schedule] ?? 23 * 60 * 60 * 1000;
        const lastDbRun = getLastBackupTime('db');
        if (Date.now() - lastDbRun >= minGap) {
          void runBackup('scheduled', 'system', 'system@scheduler', 'db').then((result) => {
            if (!result.ok) {
              console.error('[BackupScheduler] DB backup failed:', result.message);
            } else {
              console.info(`[BackupScheduler] DB backup done — ${result.filesUploaded} file(s), destination: ${destination}`);
            }
          });
        }
      }

      // ── System full archive every 30 days ─────────────────────────────────
      // Runs at 04:00 UTC to avoid conflicting with DB backup (03:00 UTC)
      const now = new Date();
      const h = now.getUTCHours();
      const m = now.getUTCMinutes();
      const isSystemWindow = h === 4 && m < 10;

      if (isSystemWindow && destination !== 'local') {
        const lastSystemRun = getLastBackupTime('system');
        if (Date.now() - lastSystemRun >= SYSTEM_ARCHIVE_INTERVAL_MS) {
          void runBackup('scheduled', 'system', 'system@scheduler', 'system').then((result) => {
            if (!result.ok) {
              console.error('[BackupScheduler] System archive failed:', result.message);
            } else {
              console.info(`[BackupScheduler] System archive done — ${result.filesUploaded} file(s), destination: ${destination}`);
            }
          });
        }
      }
    } catch (err) {
      console.error('[BackupScheduler] Scheduler error:', err);
    }
  }, 60_000);

  console.info('[BackupScheduler] Started — DB backup + 30-day system archive scheduler active');
}
