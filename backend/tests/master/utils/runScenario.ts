/**
 * runScenario.ts
 * Runs a full orchestrator pipeline for a test scenario and returns a rich
 * result object for assertion in tests.
 */

import type { OrchestratorContext, OrchestratorResult, WorkerExecutor } from '../../../src/ai/orchestrator';
import { runOrchestrator } from '../../../src/ai/orchestrator';
import type { MockLogEntry } from './mockLogger';
import { getMockLogs, resetMockLogs } from './mockLogger';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScenarioFixture = {
  scenarioId: string;
  description: string;
  userMessage: string;
  sessionId?: string;
  userId?: string;
  userProfile?: Record<string, unknown>;
  intolerances?: string[];
  allergies?: string[];
  nutritionalGoals?: { kcal?: number; proteinG?: number; carbsG?: number; fatG?: number };
  workerInput?: Record<string, unknown>;
  expected: {
    intent: string;
    workerChain: string[];
    hasErrors: boolean;
    correctedWorkers?: string[];
    finalOutputKeys?: string[];
    logEvents?: string[];
  };
};

export type ScenarioResult = {
  fixture: ScenarioFixture;
  orchestratorResult: OrchestratorResult;
  logs: MockLogEntry[];
  durationMs: number;
};

// ─── Main runner ──────────────────────────────────────────────────────────────

export async function runScenario(
  fixture: ScenarioFixture,
  executor?: WorkerExecutor,
): Promise<ScenarioResult> {
  resetMockLogs();
  const started = Date.now();

  const ctx: OrchestratorContext = {
    sessionId: fixture.sessionId ?? `test-session-${fixture.scenarioId}`,
    userId: fixture.userId,
    userMessage: fixture.userMessage,
    userProfile: fixture.userProfile as OrchestratorContext['userProfile'],
    intolerances: fixture.intolerances ?? [],
    allergies: fixture.allergies ?? [],
    nutritionalGoals: fixture.nutritionalGoals,
  };

  const result = await runOrchestrator(ctx, executor);
  const logs = getMockLogs();
  const durationMs = Date.now() - started;

  return { fixture, orchestratorResult: result, logs, durationMs };
}

/** Loads a fixture from the /tests/master/fixtures/ directory by scenarioId. */
export function loadFixture(scenarioId: string): ScenarioFixture {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(`../fixtures/scenario${scenarioId}.json`) as ScenarioFixture;
}
