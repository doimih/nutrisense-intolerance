import 'server-only';
/**
 * Worker Supervisor
 * Orchestrates the full validation + auto-correction pipeline for a single worker execution:
 *   1. Schema validation
 *   2. Semantic validation
 *   3. Safety validation (embedded in semantic)
 *   4. If any layer fails → auto-correct
 *   5. Re-validate corrected output
 *   6. Merge and return final output
 */

import type { JsonObject, NutritionalGoals, UserProfile } from '@/lib/server/superadmin/workerDiagnosticTypes';
import { validateWorkerSchema } from '@/ai/validators/schemaValidator';
import { validateSemantics } from '@/ai/validators/semanticValidator';
import { autoCorrect, getDefaultModelConfig } from '@/ai/autoCorrector';
import type { ModelConfig } from '@/ai/autoCorrector';
import { getWorkerSchema } from '@/ai/schemas/workerSchemas';
import {
  logWorkerCorrection,
  logWorkerFailure,
  logWorkerValidation,
} from '@/logging/aiLogger';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SupervisionContext = {
  sessionId?: string;
  userId?: string;
  intent?: string | null;
  intolerances?: string[];
  allergies?: string[];
  userProfile?: UserProfile;
  nutritionalGoals?: NutritionalGoals;
  modelConfig?: ModelConfig;
};

export type SupervisionReport = {
  worker: string;
  /** Final output, corrected if necessary */
  finalOutput: JsonObject;
  schemaValid: boolean;
  semanticValid: boolean;
  /** true when auto-correction was applied at least once */
  corrected: boolean;
  /** true when the corrected output still has errors */
  correctionIncomplete: boolean;
  /** All errors found across both validation passes */
  errors: string[];
  /** Model that was used for correction (or "rule-based") */
  correctionModel: string | null;
  supervisorMs: number;
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function resolveExpectedSchema(workerId: string): JsonObject {
  const schema = getWorkerSchema(workerId);
  if (!schema) return {};
  const flat: JsonObject = {};
  for (const field of schema.required) {
    flat[field] = 'required';
  }
  return flat;
}

function mergeErrors(...lists: string[][]): string[] {
  return lists.flat();
}

// ─── Core supervision logic ───────────────────────────────────────────────────

/**
 * Runs the full supervision pipeline for one worker execution.
 * Handles schema, semantic, safety validation and auto-correction.
 */
export async function superviseWorkerExecution(
  workerId: string,
  input: JsonObject,
  rawOutput: JsonObject,
  context: SupervisionContext = {},
): Promise<SupervisionReport> {
  const startedAt = Date.now();
  const workerName = getWorkerSchema(workerId)?.workerName ?? workerId;
  const intolerances = context.intolerances ?? [];
  const allergies = context.allergies ?? [];
  const goals = context.nutritionalGoals;
  const expectedSchema = resolveExpectedSchema(workerId);

  // ── Pass 1: Validate raw output ───────────────────────────────────────────

  const schemaResult1 = validateWorkerSchema(workerId, rawOutput);
  const semanticResult1 = validateSemantics(workerId, rawOutput, intolerances, allergies, goals);

  logWorkerValidation(workerName, schemaResult1.valid, semanticResult1.valid, true, {
    sessionId: context.sessionId,
    userId: context.userId,
    errors: mergeErrors(schemaResult1.errors, semanticResult1.allErrors),
  });

  const allErrors1 = mergeErrors(schemaResult1.errors, semanticResult1.allErrors);
  const pass1Valid = schemaResult1.valid && semanticResult1.valid;

  if (pass1Valid) {
    return {
      worker: workerId,
      finalOutput: rawOutput,
      schemaValid: true,
      semanticValid: true,
      corrected: false,
      correctionIncomplete: false,
      errors: [],
      correctionModel: null,
      supervisorMs: Date.now() - startedAt,
    };
  }

  // ── Auto-correction ────────────────────────────────────────────────────────

  const correctionResult = await autoCorrect(
    {
      workerId,
      workerName,
      input,
      output: rawOutput,
      expectedSchema,
      errors: allErrors1,
      intolerances,
      allergies,
      userContext: {
        profile: context.userProfile as Record<string, unknown> | undefined,
        goals: context.nutritionalGoals as Record<string, unknown> | undefined,
        intent: context.intent ?? undefined,
      },
      sessionId: context.sessionId,
      userId: context.userId,
    },
    context.modelConfig ?? getDefaultModelConfig(),
  );

  logWorkerCorrection(
    workerName,
    allErrors1,
    rawOutput,
    correctionResult.correctedOutput,
    {
      sessionId: context.sessionId,
      userId: context.userId,
      model: correctionResult.model,
      correctionMs: correctionResult.correctionMs,
    },
  );

  // ── Pass 2: Validate corrected output ─────────────────────────────────────

  const corrected = correctionResult.correctedOutput;
  const schemaResult2 = validateWorkerSchema(workerId, corrected);
  const semanticResult2 = validateSemantics(workerId, corrected, intolerances, allergies, goals);

  const allErrors2 = mergeErrors(schemaResult2.errors, semanticResult2.allErrors);
  const pass2Valid = schemaResult2.valid && semanticResult2.valid;

  if (!pass2Valid) {
    logWorkerFailure(workerName, allErrors2, {
      sessionId: context.sessionId,
      userId: context.userId,
      model: correctionResult.model,
      finalOutput: corrected,
    });
  }

  return {
    worker: workerId,
    finalOutput: corrected,
    schemaValid: schemaResult2.valid,
    semanticValid: semanticResult2.valid,
    corrected: true,
    correctionIncomplete: !pass2Valid,
    errors: allErrors2,
    correctionModel: correctionResult.model,
    supervisorMs: Date.now() - startedAt,
  };
}
