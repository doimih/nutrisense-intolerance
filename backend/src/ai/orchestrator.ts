import 'server-only';
/**
 * AI Orchestrator
 * Routes user intent to the correct worker sequence.
 * Wraps every worker execution with the WorkerSupervisor pipeline:
 *   run → validate schema → validate semantics → auto-correct if needed → log
 *
 * Primary model: GPT-4o
 * Fallback model: Gemini 1.5 Pro
 */

import type { JsonObject, NutritionalGoals, UserProfile } from '@/lib/server/superadmin/workerDiagnosticTypes';
import { superviseWorkerExecution } from '@/ai/supervisor/WorkerSupervisor';
import type { SupervisionContext, SupervisionReport } from '@/ai/supervisor/WorkerSupervisor';
import { logOrchestratorEvent } from '@/lib/server/superadmin/aiLogging';
import { getDefaultModelConfig } from '@/ai/autoCorrector';
import { createRealWorkerExecutor } from '@/ai/realWorkerExecutor';

// ─── Intent detection ─────────────────────────────────────────────────────────

export type DetectedIntent =
  | 'meal-plan'
  | 'recipe'
  | 'shopping-list'
  | 'supplement-advice'
  | 'nutritional-analysis'
  | 'progress-tracking'
  | 'general-nutrition'
  | 'unknown';

const INTENT_KEYWORDS: Record<DetectedIntent, readonly string[]> = {
  'meal-plan': ['meal plan', 'weekly plan', 'daily plan', 'eating plan', 'diet plan'],
  recipe: ['recipe', 'how to cook', 'how to prepare', 'ingredients for'],
  'shopping-list': ['shopping list', 'grocery list', 'buy list', 'what to buy'],
  'supplement-advice': ['supplement', 'vitamin', 'mineral', 'probiotic', 'protein powder'],
  'nutritional-analysis': ['calories', 'macros', 'nutrition', 'nutritional value', 'analyse food'],
  'progress-tracking': ['progress', 'weight trend', 'weekly report', 'track', 'symptom history'],
  'general-nutrition': ['intolerance', 'allergy', 'what can i eat', 'food reaction', 'symptom'],
  unknown: [],
};

export function detectIntent(userMessage: string): DetectedIntent {
  const lower = userMessage.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (intent === 'unknown') continue;
    if ((keywords as readonly string[]).some((kw) => lower.includes(kw))) {
      return intent as DetectedIntent;
    }
  }
  return 'unknown';
}

// ─── Worker routing table ─────────────────────────────────────────────────────

/**
 * Maps each intent to an ordered list of worker IDs.
 * Medical Safety always runs last for safety-sensitive intents.
 */
const INTENT_WORKER_ROUTES: Record<DetectedIntent, readonly string[]> = {
  'meal-plan': [
    'profile-analyzer',
    'intolerance-checker',
    'allergy-checker',
    'meal-plan-generator',
    'nutrition-calculator',
    'medical-safety',
  ],
  recipe: [
    'profile-analyzer',
    'intolerance-checker',
    'allergy-checker',
    'recipe-builder',
    'nutrition-calculator',
  ],
  'shopping-list': [
    'profile-analyzer',
    'intolerance-checker',
    'meal-plan-generator',
    'shopping-list',
  ],
  'supplement-advice': [
    'profile-analyzer',
    'intolerance-checker',
    'allergy-checker',
    'supplement-advisor',
    'medical-safety',
  ],
  'nutritional-analysis': [
    'profile-analyzer',
    'nutrition-calculator',
    'medical-safety',
  ],
  'progress-tracking': [
    'profile-analyzer',
    'progress-tracking',
  ],
  'general-nutrition': [
    'profile-analyzer',
    'intolerance-checker',
    'allergy-checker',
    'medical-safety',
  ],
  unknown: [
    'profile-analyzer',
    'medical-safety',
  ],
};

// ─── Worker executor stub ─────────────────────────────────────────────────────

/**
 * Executes a single worker with the given input.
 * In production this would call the AI model or a dedicated worker endpoint.
 * Here it returns a stub output so the orchestrator pipeline can be tested end-to-end.
 */
export type WorkerExecutor = (
  workerId: string,
  input: JsonObject,
  context: OrchestratorContext,
) => Promise<JsonObject>;

export const defaultWorkerExecutor: WorkerExecutor = async (workerId, input) => {
  // Stub: returns a minimal valid worker output.
  return {
    worker: workerId,
    status: 'success',
    data: { ...input },
    notes: [],
  };
};

// ─── Orchestrator types ───────────────────────────────────────────────────────

export type OrchestratorContext = {
  sessionId: string;
  userId?: string | null;
  userMessage: string;
  userProfile?: UserProfile;
  intolerances?: string[];
  allergies?: string[];
  nutritionalGoals?: NutritionalGoals;
  lang?: 'ro' | 'en';
};

export type WorkerExecutionRecord = {
  workerId: string;
  supervisionReport: SupervisionReport;
  /** Milliseconds from worker run start to supervision complete */
  totalMs: number;
};

export type OrchestratorResult = {
  sessionId: string;
  intent: DetectedIntent;
  workerSequence: string[];
  workerResults: WorkerExecutionRecord[];
  finalResponse: JsonObject;
  totalMs: number;
  hasErrors: boolean;
};

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export async function runOrchestrator(
  ctx: OrchestratorContext,
  executor?: WorkerExecutor,
): Promise<OrchestratorResult> {
  const started = Date.now();
  const intent = detectIntent(ctx.userMessage);
  const workerSequence = [...INTENT_WORKER_ROUTES[intent]];
  const lang = ctx.lang ?? 'ro';

  const modelConfig = getDefaultModelConfig();

  // Use real AI executor when API key is configured; fall back to stub otherwise.
  const resolvedExecutor: WorkerExecutor =
    executor ?? (modelConfig.apiKey ? createRealWorkerExecutor(modelConfig, lang) : defaultWorkerExecutor);

  const supervisionCtx: SupervisionContext = {
    sessionId: ctx.sessionId,
    userId: ctx.userId ?? undefined,
    intent,
    intolerances: ctx.intolerances ?? [],
    allergies: ctx.allergies ?? [],
    userProfile: ctx.userProfile,
    nutritionalGoals: ctx.nutritionalGoals,
    modelConfig,
  };

  const workerResults: WorkerExecutionRecord[] = [];
  // Accumulated context passed forward to each worker
  let accumulatedContext: JsonObject = {
    sessionId: ctx.sessionId,
    intent,
    profile: (ctx.userProfile ?? {}) as JsonObject,
    intolerances: ctx.intolerances ?? [],
    allergies: ctx.allergies ?? [],
  };

  let hasErrors = false;

  for (const workerId of workerSequence) {
    const workerStart = Date.now();

    // 1. Run worker
    const rawOutput = await resolvedExecutor(workerId, accumulatedContext, ctx);

    // 2–6. Supervise (validate + auto-correct)
    const report = await superviseWorkerExecution(
      workerId,
      accumulatedContext,
      rawOutput,
      supervisionCtx,
    );

    const totalMs = Date.now() - workerStart;

    workerResults.push({ workerId, supervisionReport: report, totalMs });

    if (report.correctionIncomplete) hasErrors = true;

    // Feed corrected output into next worker's context
    accumulatedContext = {
      ...accumulatedContext,
      [`${workerId}_output`]: report.finalOutput,
    };
  }

  // Assemble final response from last worker's output
  const lastResult = workerResults[workerResults.length - 1];
  const finalResponse: JsonObject = lastResult
    ? {
        ...lastResult.supervisionReport.finalOutput,
        _orchestratorMeta: {
          intent,
          workerSequence,
          correctedWorkers: workerResults
            .filter((r) => r.supervisionReport.corrected)
            .map((r) => r.workerId),
          totalMs: Date.now() - started,
        },
      }
    : { worker: 'orchestrator', status: 'error', data: {}, notes: ['No workers ran.'] };

  // Log orchestrator event
  logOrchestratorEvent({
    sessionId: ctx.sessionId,
    userId: ctx.userId ?? null,
    intent,
    workerSequence,
    finalResponse,
    executionMs: Date.now() - started,
    error: hasErrors ? { message: 'One or more workers failed validation after correction.' } : null,
  });

  return {
    sessionId: ctx.sessionId,
    intent,
    workerSequence,
    workerResults,
    finalResponse,
    totalMs: Date.now() - started,
    hasErrors,
  };
}
