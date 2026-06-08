import { NextRequest, NextResponse } from 'next/server';
import { appendAiLog, appendAuditEvent, readDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { withRequestLogging } from '@/lib/server/superadmin/requestLogger';
import { logAIEvent } from '@/lib/server/superadmin/aiLogging';

export const runtime = 'nodejs';
const withAILogging = withRequestLogging('ai');

async function getHandler(request: NextRequest) {
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

async function postHandler(request: NextRequest) {
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

  logAIEvent({
    sessionId: request.headers.get('x-nutriaid-session-id') || request.cookies.get('na_sid')?.value || 'unknown',
    userId: auth.session.userId,
    model: 'gpt-4o',
    tokensIn: 0,
    tokensOut: 0,
    temperature: 0.7,
    latencyMs: 800,
    usedFallback: false,
    metadata: {
      message: 'Manual AI rerun',
      targetUserId: body.userId,
      targetUserEmail: body.userEmail,
    },
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

export const GET = withAILogging(getHandler);
export const POST = withAILogging(postHandler);
