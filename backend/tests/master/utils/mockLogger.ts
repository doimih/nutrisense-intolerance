/**
 * mockLogger.ts
 * In-memory mock for the AI logging layer.
 * Captures all log entries emitted during a test so assertions can verify them.
 *
 * Usage:
 *   import { resetMockLogs, getMockLogs } from './mockLogger';
 *   resetMockLogs();
 *   // ... run test
 *   const logs = getMockLogs();
 *   assert(logs.some(l => l.event === 'worker_validation'));
 */

export type MockLogEntry = {
  timestamp: string;
  event: string;
  worker?: string | null;
  level: 'info' | 'warning' | 'error';
  source: string;
  errors?: string[];
  corrected?: boolean;
  model?: string | null;
  sessionId?: string;
  metadata?: Record<string, unknown>;
};

const LOG_STORE: MockLogEntry[] = [];

export function resetMockLogs(): void {
  LOG_STORE.length = 0;
}

export function getMockLogs(): MockLogEntry[] {
  return [...LOG_STORE];
}

export function pushMockLog(entry: MockLogEntry): void {
  LOG_STORE.push(entry);
}

// ─── Drop-in replacements for aiLogger functions ──────────────────────────────

export function logWorkerValidation(
  workerName: string,
  schemaValid: boolean,
  semanticValid: boolean,
  safetyValid: boolean,
  meta?: { sessionId?: string; errors?: string[] },
): void {
  pushMockLog({
    timestamp: new Date().toISOString(),
    event: 'worker_validation',
    worker: workerName,
    level: schemaValid && semanticValid && safetyValid ? 'info' : 'warning',
    source: 'worker',
    errors: meta?.errors ?? [],
    sessionId: meta?.sessionId,
    metadata: { schemaValid, semanticValid, safetyValid },
  });
}

export function logWorkerCorrection(
  workerName: string,
  errors: string[],
  _originalOutput: unknown,
  _correctedOutput: unknown,
  meta?: { sessionId?: string; model?: string; correctionMs?: number },
): void {
  pushMockLog({
    timestamp: new Date().toISOString(),
    event: 'worker_auto_correction',
    worker: workerName,
    level: 'warning',
    source: 'worker',
    corrected: true,
    errors,
    model: meta?.model ?? 'rule-based',
    sessionId: meta?.sessionId,
    metadata: { correctionMs: meta?.correctionMs ?? null },
  });
}

export function logWorkerFailure(
  workerName: string,
  errors: string[],
  meta?: { sessionId?: string; model?: string },
): void {
  pushMockLog({
    timestamp: new Date().toISOString(),
    event: 'worker_failure',
    worker: workerName,
    level: 'error',
    source: 'worker',
    errors,
    model: meta?.model ?? null,
    sessionId: meta?.sessionId,
  });
}

export function logModelFallback(
  workerName: string,
  primaryModel: string,
  fallbackModel: string,
  reason: string,
  meta?: { sessionId?: string },
): void {
  pushMockLog({
    timestamp: new Date().toISOString(),
    event: 'model_fallback',
    worker: workerName,
    level: 'warning',
    source: 'ai',
    model: fallbackModel,
    sessionId: meta?.sessionId,
    metadata: { primaryModel, fallbackModel, reason },
  });
}

export function logOrchestratorEvent(payload: {
  sessionId: string;
  intent?: string | null;
  workerSequence: string[];
  executionMs?: number;
  error?: Record<string, unknown> | null;
}): void {
  pushMockLog({
    timestamp: new Date().toISOString(),
    event: 'orchestrator_routing',
    level: payload.error ? 'error' : 'info',
    source: 'orchestrator',
    sessionId: payload.sessionId,
    metadata: {
      intent: payload.intent ?? null,
      workerSequence: payload.workerSequence,
      executionMs: payload.executionMs ?? null,
    },
  });
}
