import 'server-only';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const LOG_PATH = join(process.cwd(), 'data', 'acquisition-downloads.json');

export type AcquisitionDownloadRecord = {
  id: string;
  timestamp: string;
  ip: string;
  country: string | null;
  userAgent: string;
  file: string;
  subfolder: string;
};

type AcquisitionLog = {
  downloads: AcquisitionDownloadRecord[];
};

function ensureLogFile(): void {
  if (existsSync(LOG_PATH)) return;
  mkdirSync(dirname(LOG_PATH), { recursive: true });
  writeFileSync(LOG_PATH, JSON.stringify({ downloads: [] }, null, 2), 'utf8');
}

export function readAcquisitionLog(): AcquisitionLog {
  ensureLogFile();
  try {
    const raw = readFileSync(LOG_PATH, 'utf8');
    return JSON.parse(raw) as AcquisitionLog;
  } catch {
    return { downloads: [] };
  }
}

export function appendAcquisitionDownload(record: Omit<AcquisitionDownloadRecord, 'id'>): void {
  ensureLogFile();
  const log = readAcquisitionLog();
  const id = `dl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  log.downloads.unshift({ id, ...record });
  log.downloads = log.downloads.slice(0, 5000);
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), 'utf8');
}

export function getAcquisitionStats(): Record<string, number> {
  const log = readAcquisitionLog();
  const counts: Record<string, number> = {};
  for (const dl of log.downloads) {
    counts[dl.file] = (counts[dl.file] ?? 0) + 1;
  }
  return counts;
}
