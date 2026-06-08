import { NextRequest, NextResponse } from 'next/server';
import { appendAiLog, appendAuditEvent, readDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const logs = readDb().aiLogs;
  const avgLatencyMs =
    logs.length > 0 ? Math.round(logs.reduce((sum, l) => sum + l.latencyMs, 0) / logs.length) : 0;
  return NextResponse.json({
    status: logs.some((l) => l.status === 'error') ? 'degraded' : 'healthy',
    avgLatencyMs,
    logs: logs.slice(0, 100),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as { userId?: string; userEmail?: string };
  if (!body.userId || !body.userEmail) {
    return NextResponse.json({ error: 'userId and userEmail are required.' }, { status: 400 });
  }

  appendAiLog({
    userId: body.userId,
    userEmail: body.userEmail,
    status: 'success',
    latencyMs: 600 + Math.floor(Math.random() * 900),
    summary: 'Manual superadmin re-run completed',
  });

  appendAuditEvent({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    action: 'ai.rerun',
    resource: 'ai-analysis',
    resourceId: body.userId,
    ip: getClientIp(request),
    metadata: { userEmail: body.userEmail },
  });

  return NextResponse.json({ ok: true });
}
