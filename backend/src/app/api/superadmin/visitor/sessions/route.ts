import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readDb } from '@/lib/server/superadmin/store';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

type FrontendSession = {
  id: string;
  ip: string;
  sessionStartsAt: string;
  sessionExpiresAt: string;
  blockUntil: string;
  resetBy: string | null;
  resetAt: string | null;
};

function readFrontendSessions(): FrontendSession[] {
  // Frontend stores visitor sessions relative to its project root (one level up)
  const frontendDataPath = join(process.cwd(), '..', 'data', 'visitor-sessions.json');
  if (!existsSync(frontendDataPath)) return [];
  try {
    return JSON.parse(readFileSync(frontendDataPath, 'utf8')) as FrontendSession[];
  } catch {
    return [];
  }
}

function classifySession(sessionExpiresAt: string, blockUntil: string, now: number) {
  const exp = new Date(sessionExpiresAt).getTime();
  const block = new Date(blockUntil).getTime();
  let status: 'active' | 'blocked' | 'expired';
  if (now < exp) status = 'active';
  else if (now < block) status = 'blocked';
  else status = 'expired';
  return { status, blockRemainingMinutes: status === 'blocked' ? Math.ceil((block - now) / 60000) : 0 };
}

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const db = readDb();
  const now = Date.now();

  const backendSessions = (db.visitorSessions ?? []).map((s) => {
    const { status, blockRemainingMinutes } = classifySession(s.sessionExpiresAt, s.blockUntil, now);
    return { id: s.id, system: s.system, ip: s.ip, sessionStartsAt: s.sessionStartsAt, sessionExpiresAt: s.sessionExpiresAt, blockUntil: s.blockUntil, resetBy: s.resetBy, resetAt: s.resetAt, status, blockRemainingMinutes };
  });

  const frontendRaw = readFrontendSessions();
  const frontendSessions = frontendRaw.map((s) => {
    const { status, blockRemainingMinutes } = classifySession(s.sessionExpiresAt, s.blockUntil, now);
    return { id: s.id, system: 'frontend' as const, ip: s.ip, sessionStartsAt: s.sessionStartsAt, sessionExpiresAt: s.sessionExpiresAt, blockUntil: s.blockUntil, resetBy: s.resetBy, resetAt: s.resetAt, status, blockRemainingMinutes };
  });

  return NextResponse.json({ sessions: [...backendSessions, ...frontendSessions] });
}
