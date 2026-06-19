/**
 * validateWorkerChain.ts
 * Assertion helpers for verifying worker execution sequences and report content.
 */

import assert from 'node:assert/strict';
import type { OrchestratorResult } from '../../../src/ai/orchestrator';
import type { SupervisionReport } from '../../../src/ai/supervisor/WorkerSupervisor';

export type WorkerChainAssertion = {
  /** All worker IDs must appear in this exact order */
  expectedChain: string[];
  /** Workers that MUST have been corrected */
  mustBeCorrect?: string[];
  /** Workers that must NOT have been corrected */
  mustNotBeCorrect?: string[];
  /** Overall result must have zero incomplete corrections */
  expectNoIncompleteCorrections?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getReport(result: OrchestratorResult, workerId: string): SupervisionReport | undefined {
  return result.workerResults.find((r) => r.workerId === workerId)?.supervisionReport;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Asserts that the orchestrator ran exactly the expected worker chain in order.
 */
export function assertWorkerChain(result: OrchestratorResult, expected: string[]): void {
  const actual = result.workerResults.map((r) => r.workerId);
  assert.deepEqual(
    actual,
    expected,
    `Worker chain mismatch.\n  Expected: ${expected.join(' → ')}\n  Got:      ${actual.join(' → ')}`,
  );
}

/**
 * Asserts intent detection outcome.
 */
export function assertIntent(result: OrchestratorResult, expectedIntent: string): void {
  assert.equal(
    result.intent,
    expectedIntent,
    `Intent mismatch: expected "${expectedIntent}", got "${result.intent}"`,
  );
}

/**
 * Asserts that specific workers were corrected (or not).
 */
export function assertCorrections(
  result: OrchestratorResult,
  assertion: WorkerChainAssertion,
): void {
  assertWorkerChain(result, assertion.expectedChain);

  for (const workerId of assertion.mustBeCorrect ?? []) {
    const report = getReport(result, workerId);
    assert.ok(report, `No report found for worker "${workerId}"`);
    assert.equal(
      report.corrected,
      true,
      `Expected worker "${workerId}" to have been corrected, but it was not`,
    );
  }

  for (const workerId of assertion.mustNotBeCorrect ?? []) {
    const report = getReport(result, workerId);
    assert.ok(report, `No report found for worker "${workerId}"`);
    assert.equal(
      report.corrected,
      false,
      `Expected worker "${workerId}" NOT to have been corrected, but it was`,
    );
  }

  if (assertion.expectNoIncompleteCorrections) {
    for (const { workerId, supervisionReport: report } of result.workerResults) {
      assert.equal(
        report.correctionIncomplete,
        false,
        `Worker "${workerId}" has an incomplete correction`,
      );
    }
  }
}

/**
 * Asserts that the final response contains specific top-level keys.
 */
export function assertFinalOutputKeys(result: OrchestratorResult, keys: string[]): void {
  for (const key of keys) {
    assert.ok(
      key in result.finalResponse,
      `Final response is missing key "${key}". Present keys: ${Object.keys(result.finalResponse).join(', ')}`,
    );
  }
}

/**
 * Asserts total execution time is within an acceptable upper bound (ms).
 */
export function assertPerformance(result: OrchestratorResult, maxMs: number): void {
  assert.ok(
    result.totalMs <= maxMs,
    `Orchestrator took ${result.totalMs} ms, expected ≤ ${maxMs} ms`,
  );
}
