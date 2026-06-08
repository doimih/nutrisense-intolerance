import 'server-only';
import { randomUUID } from 'node:crypto';
import { appendAISystemLog } from '@/lib/server/superadmin/store';
import type { AILogLevel, AILogRecord, AILogSource } from '@/lib/server/superadmin/types';

type JsonObject = Record<string, unknown>;

type BaseLogPayload = {
  sessionId: string;
  userId?: string | null;
  source: AILogSource;
  level: AILogLevel;
  intent?: string | null;
  worker?: string | null;
  model?: string | null;
  input?: JsonObject;
  output?: JsonObject;
  error?: JsonObject | null;
  metadata?: JsonObject;
};

type WorkerLogPayload = {
  sessionId: string;
  userId?: string | null;
  intent?: string | null;
  worker: string;
  status: 'success' | 'warning' | 'error';
  executionMs: number;
  inputSchema: JsonObject;
  outputSchema: JsonObject;
  validationErrors?: string[];
  safetyFlags?: string[];
  metadata?: JsonObject;
};

type OrchestratorLogPayload = {
  sessionId: string;
  userId?: string | null;
  intent?: string | null;
  workerSequence: string[];
  finalResponse?: JsonObject;
  executionMs?: number;
  error?: JsonObject | null;
  metadata?: JsonObject;
};

type AIModelLogPayload = {
  sessionId: string;
  userId?: string | null;
  intent?: string | null;
  worker?: string | null;
  model: string;
  fallbackModel?: string | null;
  usedFallback?: boolean;
  tokensIn?: number;
  tokensOut?: number;
  temperature?: number;
  latencyMs?: number;
  error?: JsonObject | null;
  metadata?: JsonObject;
};

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie', 'apiKey'];

function sanitize(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((entry) => sanitize(entry));
  if (typeof value !== 'object') return value;

  const objectValue = value as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const [key, nested] of Object.entries(objectValue)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }
    sanitized[key] = sanitize(nested);
  }

  return sanitized;
}

function normalizeError(error: unknown): JsonObject | null {
  if (!error) return null;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack || null,
    };
  }
  if (typeof error === 'object') return sanitize(error) as JsonObject;
  return { message: String(error) };
}

function writeLog(payload: BaseLogPayload): AILogRecord {
  const entry: AILogRecord = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    sessionId: payload.sessionId,
    userId: payload.userId ?? null,
    source: payload.source,
    level: payload.level,
    intent: payload.intent ?? null,
    worker: payload.worker ?? null,
    model: payload.model ?? null,
    input: (sanitize(payload.input || {}) as JsonObject) || {},
    output: (sanitize(payload.output || {}) as JsonObject) || {},
    error: normalizeError(payload.error ?? null),
    metadata: (sanitize(payload.metadata || {}) as JsonObject) || {},
  };

  appendAISystemLog(entry);
  return entry;
}

export function logInfo(payload: Omit<BaseLogPayload, 'level'>): AILogRecord {
  return writeLog({ ...payload, level: 'info' });
}

export function logWarning(payload: Omit<BaseLogPayload, 'level'>): AILogRecord {
  return writeLog({ ...payload, level: 'warning' });
}

export function logError(payload: Omit<BaseLogPayload, 'level'>): AILogRecord {
  return writeLog({ ...payload, level: 'error' });
}

export function logWorkerEvent(payload: WorkerLogPayload): AILogRecord {
  const level: AILogLevel = payload.status === 'error' ? 'error' : payload.status === 'warning' ? 'warning' : 'info';

  return writeLog({
    sessionId: payload.sessionId,
    userId: payload.userId ?? null,
    source: 'worker',
    level,
    intent: payload.intent ?? null,
    worker: payload.worker,
    input: payload.inputSchema,
    output: payload.outputSchema,
    metadata: {
      executionMs: payload.executionMs,
      status: payload.status,
      validationErrors: payload.validationErrors || [],
      safetyFlags: payload.safetyFlags || [],
      ...payload.metadata,
    },
  });
}

export function logOrchestratorEvent(payload: OrchestratorLogPayload): AILogRecord {
  return writeLog({
    sessionId: payload.sessionId,
    userId: payload.userId ?? null,
    source: 'orchestrator',
    level: payload.error ? 'error' : 'info',
    intent: payload.intent ?? null,
    input: {
      workerSequence: payload.workerSequence,
    },
    output: payload.finalResponse || {},
    error: payload.error ?? null,
    metadata: {
      executionMs: payload.executionMs ?? null,
      workerExecutionOrder: payload.workerSequence,
      safetyValidationIncluded: true,
      ...payload.metadata,
    },
  });
}

export function logAIEvent(payload: AIModelLogPayload): AILogRecord {
  return writeLog({
    sessionId: payload.sessionId,
    userId: payload.userId ?? null,
    source: 'ai',
    level: payload.error ? 'error' : payload.usedFallback ? 'warning' : 'info',
    intent: payload.intent ?? null,
    worker: payload.worker ?? null,
    model: payload.model,
    input: {
      temperature: payload.temperature ?? null,
      tokensIn: payload.tokensIn ?? null,
    },
    output: {
      tokensOut: payload.tokensOut ?? null,
      latencyMs: payload.latencyMs ?? null,
    },
    error: payload.error ?? null,
    metadata: {
      fallbackModel: payload.fallbackModel ?? null,
      usedFallback: payload.usedFallback ?? false,
      modelFallbackEvent: payload.usedFallback === true,
      ...payload.metadata,
    },
  });
}
