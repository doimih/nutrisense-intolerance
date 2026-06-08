import { NextRequest, NextResponse } from 'next/server';
import { appendAuditEvent, appendLog, readDb } from '@/lib/server/superadmin/store';
import { getClientIp } from '@/lib/server/superadmin/rbac';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const source = request.nextUrl.searchParams.get('source');
  const logs = readDb()
    .logs.filter((l) => !source || l.source === source)
    .slice(0, 300);
  return NextResponse.json({ logs });
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as {
    source?: 'server' | 'api' | 'stripe-webhook' | 'ai' | 'error' | 'security' | 'audit';
    level?: 'info' | 'warn' | 'error';
    message?: string;
    metadata?: Record<string, unknown>;
  };

  if (!body.message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  appendLog({
    source: body.source || 'error',
    level: body.level || 'error',
    message: body.message,
    metadata: body.metadata,
  });

  appendAuditEvent({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    action: 'logs.ingest',
    resource: 'log',
    resourceId: null,
    ip: getClientIp(request),
    metadata: { source: body.source || 'error', level: body.level || 'error' },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
