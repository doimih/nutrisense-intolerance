import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { mutateDb, readDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';
import {
  logAIEvent,
  logError,
  logInfo,
  logOrchestratorEvent,
  logWarning,
  logWorkerEvent,
} from '@/lib/server/superadmin/aiLogging';
import type { AILogLevel, AILogRecord, AILogSource } from '@/lib/server/superadmin/types';

export const runtime = 'nodejs';

const SESSION_COOKIE = 'na_sid';

function parseDate(value: string | null): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function toPageNumber(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

function toNullableString(value: string | null): string | null {
  return value && value.trim() ? value.trim() : null;
}

function getSessionId(request: NextRequest): string {
  const fromHeader = request.headers.get('x-nutriaid-session-id');
  if (fromHeader && fromHeader.trim()) return fromHeader.trim();
  const fromCookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (fromCookie && fromCookie.trim()) return fromCookie.trim();
  return randomUUID();
}

function shortMessage(log: AILogRecord): string {
  if (typeof log.metadata?.message === 'string' && log.metadata.message.trim()) {
    return log.metadata.message;
  }
  if (log.error?.message && typeof log.error.message === 'string') {
    return log.error.message;
  }
  if (typeof log.output?.summary === 'string') {
    return log.output.summary;
  }
  return `${log.source} ${log.level}`;
}

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const params = request.nextUrl.searchParams;
  const level = toNullableString(params.get('level')) as AILogLevel | null;
  const worker = toNullableString(params.get('worker'));
  const intent = toNullableString(params.get('intent'));
  const model = toNullableString(params.get('model'));
  const source = toNullableString(params.get('source')) as AILogSource | null;
  const search = toNullableString(params.get('q'))?.toLowerCase() || null;
  const from = parseDate(params.get('from'));
  const to = parseDate(params.get('to'));
  const page = toPageNumber(params.get('page'), 1);
  const pageSize = Math.min(toPageNumber(params.get('pageSize'), 25), 100);

  const rows = readDb().AI_Logs;

  const filtered = rows.filter((row) => {
    if (level && row.level !== level) return false;
    if (worker && row.worker !== worker) return false;
    if (intent && row.intent !== intent) return false;
    if (model && row.model !== model) return false;
    if (source && row.source !== source) return false;

    const timestamp = new Date(row.timestamp).getTime();
    if (from && timestamp < from) return false;
    if (to && timestamp > to) return false;

    if (search) {
      const blob = JSON.stringify({
        source: row.source,
        level: row.level,
        intent: row.intent,
        worker: row.worker,
        model: row.model,
        metadata: row.metadata,
        error: row.error,
      }).toLowerCase();
      if (!blob.includes(search)) return false;
    }

    return true;
  });

  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize).map((log) => ({
    ...log,
    shortMessage: shortMessage(log),
  }));

  return NextResponse.json({
    logs: paged,
    pagination: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const sessionId = getSessionId(request);
  const ip = getClientIp(request);

  const body = (await request.json().catch(() => ({}))) as Partial<AILogRecord> & {
    message?: string;
    workerExecutionOrder?: string[];
    executionMs?: number;
    validationErrors?: string[];
    safetyFlags?: string[];
    tokensIn?: number;
    tokensOut?: number;
    temperature?: number;
    latencyMs?: number;
    fallbackModel?: string;
    usedFallback?: boolean;
  };

  const source = (body.source || 'system') as AILogSource;
  const level = (body.level || 'info') as AILogLevel;

  if (source === 'worker') {
    const workerName = body.worker || 'UnknownWorker';
    const status = level === 'error' ? 'error' : level === 'warning' ? 'warning' : 'success';
    const entry = logWorkerEvent({
      sessionId,
      userId: auth.session.userId,
      intent: body.intent || null,
      worker: workerName,
      status,
      executionMs: Number(body.executionMs || 0),
      inputSchema: (body.input || {}) as Record<string, unknown>,
      outputSchema: (body.output || {}) as Record<string, unknown>,
      validationErrors: body.validationErrors || [],
      safetyFlags: body.safetyFlags || [],
      metadata: {
        message: body.message || 'Worker event',
        ip,
        ...(body.metadata || {}),
      },
    });

    return NextResponse.json({ log: entry }, { status: 201 });
  }

  if (source === 'orchestrator') {
    const workerSequence = body.workerExecutionOrder || [];
    const entry = logOrchestratorEvent({
      sessionId,
      userId: auth.session.userId,
      intent: body.intent || null,
      workerSequence,
      finalResponse: (body.output || {}) as Record<string, unknown>,
      executionMs: Number(body.executionMs || 0),
      error: body.error || null,
      metadata: {
        message: body.message || 'Orchestrator event',
        ip,
        ...(body.metadata || {}),
      },
    });

    return NextResponse.json({ log: entry }, { status: 201 });
  }

  if (source === 'ai') {
    const entry = logAIEvent({
      sessionId,
      userId: auth.session.userId,
      intent: body.intent || null,
      worker: body.worker || null,
      model: body.model || 'unknown-model',
      fallbackModel: body.fallbackModel || null,
      usedFallback: body.usedFallback || false,
      tokensIn: Number(body.tokensIn || 0),
      tokensOut: Number(body.tokensOut || 0),
      temperature: Number(body.temperature || 0),
      latencyMs: Number(body.latencyMs || 0),
      error: body.error || null,
      metadata: {
        message: body.message || 'AI model event',
        ip,
        ...(body.metadata || {}),
      },
    });

    return NextResponse.json({ log: entry }, { status: 201 });
  }

  if (level === 'error') {
    const entry = logError({
      sessionId,
      userId: auth.session.userId,
      source,
      intent: body.intent || null,
      worker: body.worker || null,
      model: body.model || null,
      input: (body.input || {}) as Record<string, unknown>,
      output: (body.output || {}) as Record<string, unknown>,
      error: body.error || { message: body.message || 'Unknown error' },
      metadata: {
        message: body.message || 'System error event',
        ip,
        ...(body.metadata || {}),
      },
    });

    return NextResponse.json({ log: entry }, { status: 201 });
  }

  if (level === 'warning') {
    const entry = logWarning({
      sessionId,
      userId: auth.session.userId,
      source,
      intent: body.intent || null,
      worker: body.worker || null,
      model: body.model || null,
      input: (body.input || {}) as Record<string, unknown>,
      output: (body.output || {}) as Record<string, unknown>,
      metadata: {
        message: body.message || 'Warning event',
        ip,
        ...(body.metadata || {}),
      },
    });

    return NextResponse.json({ log: entry }, { status: 201 });
  }

  const entry = logInfo({
    sessionId,
    userId: auth.session.userId,
    source,
    intent: body.intent || null,
    worker: body.worker || null,
    model: body.model || null,
    input: (body.input || {}) as Record<string, unknown>,
    output: (body.output || {}) as Record<string, unknown>,
    metadata: {
      message: body.message || 'Info event',
      ip,
      ...(body.metadata || {}),
    },
  });

  return NextResponse.json({ log: entry }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const params = request.nextUrl.searchParams;
  const before = params.get('before');
  const beforeTs = parseDate(before);

  const result = mutateDb((db) => {
    const initial = db.AI_Logs.length;

    if (!beforeTs) {
      db.AI_Logs = [];
    } else {
      db.AI_Logs = db.AI_Logs.filter((row) => new Date(row.timestamp).getTime() >= beforeTs);
    }

    return {
      deleted: initial - db.AI_Logs.length,
      remaining: db.AI_Logs.length,
    };
  });

  return NextResponse.json(result);
}
