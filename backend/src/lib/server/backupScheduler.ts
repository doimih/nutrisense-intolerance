import { readDb } from '@/lib/server/superadmin/store';
import { runBackup } from '@/lib/server/backupRunner';

// Minimum gap between two consecutive scheduled backups (prevents double-fire)
const MIN_GAP_MS: Record<string, number> = {
  hourly: 55 * 60 * 1000,        // 55 minutes
  daily: 23 * 60 * 60 * 1000,    // 23 hours
  weekly: 6 * 24 * 60 * 60 * 1000, // 6 days
};

// Time windows (UTC) when a scheduled backup is allowed to fire
// e.g. daily fires between 03:00–03:10 UTC
function inAllowedWindow(schedule: string): boolean {
  const now = new Date();
  const h = now.getUTCHours();
  const m = now.getUTCMinutes();

  if (schedule === 'hourly') return true; // any minute is fine for hourly
  if (schedule === 'daily') return h === 3 && m < 10;
  if (schedule === 'weekly') return now.getUTCDay() === 0 && h === 3 && m < 10; // Sunday 03:00
  return false;
}

function getLastBackupTime(): number {
  try {
    const db = readDb();
    const last = db.auditEvents
      .filter((e) => e.action === 'backup.run' && e.metadata?.triggeredBy === 'scheduled')
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

  // Check every 60 seconds
  setInterval(() => {
    try {
      const schedule = readDb().settings?.backup?.schedule ?? 'manual';
      if (schedule === 'manual') return;

      if (!inAllowedWindow(schedule)) return;

      const minGap = MIN_GAP_MS[schedule] ?? 23 * 60 * 60 * 1000;
      const lastRun = getLastBackupTime();
      if (Date.now() - lastRun < minGap) return;

      // Fire backup asynchronously — don't block the scheduler interval
      void runBackup('scheduled').then((result) => {
        if (!result.ok) {
          console.error('[BackupScheduler] Scheduled backup failed:', result.message);
        } else {
          console.info(
            `[BackupScheduler] Scheduled backup completed — ${result.filesUploaded} file(s), destination: ${result.destination}`,
          );
        }
      });
    } catch (err) {
      console.error('[BackupScheduler] Scheduler error:', err);
    }
  }, 60_000);

  console.info('[BackupScheduler] Started — checking every 60 seconds');
}
