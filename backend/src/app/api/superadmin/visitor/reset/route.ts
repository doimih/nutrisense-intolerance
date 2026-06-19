import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { appendAuditEvent, mutateDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

type FrontendSession = { id: string; ip: string; [key: string]: unknown };

function readFrontendSessions(): FrontendSession[] {
  const p = join(process.cwd(), '..', 'data', 'visitor-sessions.json');
  if (!existsSync(p)) return [];
  try { return JSON.parse(readFileSync(p, 'utf8')) as FrontendSession[]; } catch { return []; }
}

function writeFrontendSessions(sessions: FrontendSession[]): void {
  const p = join(process.cwd(), '..', 'data', 'visitor-sessions.json');
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(sessions, null, 2), 'utf8');
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as {
    sessionId?: string;
    ip?: string;
    system?: 'backend' | 'frontend' | 'all';
  };

  const { sessionId, ip, system = 'all' } = body;

  if (!sessionId && !ip) {
    return NextResponse.json({ ok: false, message: 'Furnizeaza sessionId sau ip.' }, { status: 400 });
  }

  let resetCount = 0;

  // Reset backend sessions
  if (system === 'backend' || system === 'all') {
    mutateDb((d) => {
      const before = d.visitorSessions.length;
      d.visitorSessions = (d.visitorSessions ?? []).filter((s) => {
        if (sessionId && s.id === sessionId) return false;
        if (ip && s.ip === ip) return false;
        return true;
      });
      resetCount += before - d.visitorSessions.length;
    });
  }

  // Reset frontend sessions
  if (system === 'frontend' || system === 'all') {
    const frontendSessions = readFrontendSessions();
    const filtered = frontendSessions.filter((s) => {
      if (sessionId && s.id === sessionId) return false;
      if (ip && s.ip === ip) return false;
      return true;
    });
    const frontendRemoved = frontendSessions.length - filtered.length;
    if (frontendRemoved > 0) {
      writeFrontendSessions(filtered);
      resetCount += frontendRemoved;
    }
  }

  if (resetCount === 0) {
    return NextResponse.json({ ok: false, message: 'Sesiunea nu a fost gasita.' }, { status: 404 });
  }

  appendAuditEvent({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    action: 'visitor.reset-ip',
    resource: 'visitor-session',
    resourceId: sessionId ?? ip ?? null,
    ip: getClientIp(request),
    metadata: { targetIp: ip, system, resetCount },
  });

  return NextResponse.json({
    ok: true,
    message: `Visitor access reset (${resetCount} session(s) deleted). The IP can now access again.`,
    resetCount,
  });
}
