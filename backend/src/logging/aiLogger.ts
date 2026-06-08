import 'server-only';
/**
 * AI Logger
 * Extends the existing aiLogging.ts with worker-correction-specific log entries.
 * All entries land in the AI_Logs store (via appendAISystemLog).
 */

import { randomUUID } from 'node:crypto';
import { appendAISystemLog } from '@/lib/server/superadmin/store';
import type { AILogRecord } from '@/lib/server/superadmin/types';

type JsonObject = Record<string, unknown>;

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie', 'apikey'];

function sanitise(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitise);
  if (typeof value !== 'object') return value;
  const obj = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s)) ? '[REDACTED]' : sanitise(v);
  }
  return result;
}

function makeEntry(
  overrides: Partial<AILogRecord> & Pick<AILogRecord, 'level' | 'source'>,
): AILogRecord {
  return {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    sessionId: overrides.sessionId ?? 'system',
    userId: overrides.userId ?? null,
    source: overrides.source,
    level: overrides.level,
    intent: overrides.intent ?? null,
    worker: overrides.worker ?? null,
    model: overrides.model ?? null,
    input: (sanitise(overrides.input ?? {}) as JsonObject),
    output: (sanitise(overrides.output ?? {}) as JsonObject),
    error: overrides.error ? (sanitise(overrides.error) as JsonObject) : null,
    metadata: (sanitise(overrides.metadata ?? {}) as JsonObject),
  };
}

// ─── Public functions ─────────────────────────────────────────────────────────

/**
 * Logs that a worker output passed or failed schema / semantic / safety checks.
 */
export function logWorkerValidation(
  workerName: string,
  schemaValid: boolean,
  semanticValid: boolean,
  safetyValid: boolean,
  meta?: { sessionId?: string; userId?: string; errors?: string[] },
): void {
  const allValid = schemaValid && semanticValid && safetyValid;
  const entry = makeEntry({
    level: allValid ? 'info' : 'warning',
    source: 'worker',
    worker: workerName,
    sessionId: meta?.sessionId,
    userId: meta?.userId,
    metadata: {
      event: 'worker_validation',
      schemaValid,
      semanticValid,
      safetyValid,
      errors: meta?.errors ?? [],
    },
  });
  appendAISystemLog(entry);
}

/**
 * Logs that auto-correction was applied to a worker output.
 * Includes the original output, the corrected output, and all errors found.
 */
export function logWorkerCorrection(
  workerName: string,
  errors: string[],
  originalOutput: unknown,
  correctedOutput: unknown,
  meta?: { sessionId?: string; userId?: string; model?: string; correctionMs?: number },
): void {
  const entry = makeEntry({
    level: 'warning',
    source: 'worker',
    worker: workerName,
    model: meta?.model ?? null,
    sessionId: meta?.sessionId,
    userId: meta?.userId,
    input: sanitise(originalOutput) as JsonObject,
    output: sanitise(correctedOutput) as JsonObject,
    metadata: {
      event: 'worker_auto_correction',
      errors,
      correctionMs: meta?.correctionMs ?? null,
      correctedBy: meta?.model ?? 'rule-based',
    },
  });
  appendAISystemLog(entry);
}

/**
 * Logs that a worker failed validation even after correction attempts.
 */
export function logWorkerFailure(
  workerName: string,
  errors: string[],
  meta?: { sessionId?: string; userId?: string; model?: string; finalOutput?: unknown },
): void {
  const entry = makeEntry({
    level: 'error',
    source: 'worker',
    worker: workerName,
    model: meta?.model ?? null,
    sessionId: meta?.sessionId,
    userId: meta?.userId,
    output: meta?.finalOutput ? (sanitise(meta.finalOutput) as JsonObject) : {},
    error: {
      message: `Worker ${workerName} failed validation after correction attempts`,
      errors,
    },
    metadata: {
      event: 'worker_failure',
      errors,
    },
  });
  appendAISystemLog(entry);
}

/**
 * Logs model fallback events (primary → fallback model).
 */
export function logModelFallback(
  workerName: string,
  primaryModel: string,
  fallbackModel: string,
  reason: string,
  meta?: { sessionId?: string; userId?: string },
): void {
  const entry = makeEntry({
    level: 'warning',
    source: 'ai',
    worker: workerName,
    model: fallbackModel,
    sessionId: meta?.sessionId,
    userId: meta?.userId,
    metadata: {
      event: 'model_fallback',
      primaryModel,
      fallbackModel,
      reason,
    },
  });
  appendAISystemLog(entry);
}
