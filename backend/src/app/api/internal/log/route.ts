import { NextRequest, NextResponse } from 'next/server';
import { readDb, appendLog } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

type LogBody = {
  level?: 'info' | 'warn' | 'error';
  message?: string;
  metadata?: Record<string, unknown>;
};

function verifyToken(request: NextRequest): boolean {
  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return false;
  const stored = readDb().settings?.internalEmailToken;
  return !!(stored && token === stored);
}

export async function POST(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as LogBody | null;
  if (!body?.message) {
    return NextResponse.json({ error: 'Missing message' }, { status: 400 });
  }

  appendLog({
    source: 'frontend',
    level: body.level ?? 'info',
    message: body.message,
    metadata: body.metadata,
  });

  return NextResponse.json({ ok: true });
}
