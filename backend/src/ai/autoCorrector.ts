import 'server-only';
/**
 * Auto Corrector
 * Calls an AI model (GPT-4o primary, Gemini fallback) to regenerate a
 * corrected worker output from a correction prompt.
 * Falls back to the existing rule-based corrector when AI calls fail.
 */

import type { JsonObject, JsonValue } from '@/lib/server/superadmin/workerDiagnosticTypes';
import { autoCorrect as ruleBasedCorrect, validateSchema, validateLogic, validateSafety } from '@/lib/server/superadmin/workerDiagnostic';
import { buildCorrectionPrompt, CORRECTION_SYSTEM_MESSAGE } from '@/ai/prompts/correctionPrompt';
import { logModelFallback } from '@/logging/aiLogger';
import type { ValidationResult } from '@/lib/server/superadmin/workerDiagnosticTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModelConfig = {
  primaryModel: string;
  fallbackModel: string;
  apiKey: string | null;
  temperature: number;
  maxTokens: number;
  orchestratorUrl?: string | null;
};

export type CorrectionInput = {
  workerId: string;
  workerName: string;
  input: JsonObject;
  output: JsonObject;
  expectedSchema: JsonObject;
  errors: string[];
  intolerances: string[];
  allergies: string[];
  userContext?: Record<string, unknown>;
  sessionId?: string;
  userId?: string;
};

export type CorrectionResult = {
  correctedOutput: JsonObject;
  usedFallback: boolean;
  usedRuleBased: boolean;
  model: string;
  correctionMs: number;
};

// ─── Default model config (reads from env) ────────────────────────────────────

export function getDefaultModelConfig(): ModelConfig {
  return {
    primaryModel: process.env.AI_PRIMARY_MODEL ?? 'gpt-4o',
    fallbackModel: process.env.AI_FALLBACK_MODEL ?? 'gemini-1.5-pro',
    apiKey: process.env.OPENAI_API_KEY ?? process.env.AI_API_KEY ?? null,
    temperature: Number(process.env.AI_TEMPERATURE ?? '0.3'),
    maxTokens: Number(process.env.AI_MAX_TOKENS ?? '2048'),
    orchestratorUrl: process.env.AI_ORCHESTRATOR_URL ?? null,
  };
}

// ─── AI client ────────────────────────────────────────────────────────────────

type OpenAIMessage = { role: 'system' | 'user'; content: string };

/** Calls OpenAI-compatible chat completions endpoint and returns the raw text. */
async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: OpenAIMessage[],
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const endpoint = baseUrl.endsWith('/')
    ? `${baseUrl}chat/completions`
    : `${baseUrl}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`AI API error ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI API returned empty content.');
  return content;
}

/** Resolves the correct base URL for a model. */
function resolveBaseUrl(model: string, orchestratorUrl: string | null | undefined): string {
  if (orchestratorUrl) return orchestratorUrl;
  if (model.startsWith('gemini')) return 'https://generativelanguage.googleapis.com/v1beta/openai';
  if (model.startsWith('claude')) return 'https://api.anthropic.com/v1';
  return 'https://api.openai.com/v1';
}

/** Strips markdown code fences that some models add around JSON. */
function stripFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim();
}

/** Calls the AI model and parses the JSON response. */
async function callAI(
  model: string,
  apiKey: string,
  prompt: string,
  orchestratorUrl: string | null | undefined,
  temperature: number,
  maxTokens: number,
): Promise<JsonObject> {
  const baseUrl = resolveBaseUrl(model, orchestratorUrl);
  const messages: OpenAIMessage[] = [
    { role: 'system', content: CORRECTION_SYSTEM_MESSAGE },
    { role: 'user', content: prompt },
  ];

  const raw = await callOpenAICompatible(baseUrl, apiKey, model, messages, temperature, maxTokens);
  const clean = stripFences(raw);

  try {
    return JSON.parse(clean) as JsonObject;
  } catch {
    throw new Error(`AI returned non-JSON: ${clean.slice(0, 300)}`);
  }
}

// ─── Rule-based fallback helper ────────────────────────────────────────────────

function applyRuleBasedCorrection(input: CorrectionInput): JsonObject {
  const schemaResult: ValidationResult = { valid: input.errors.length === 0, errors: input.errors };
  const logicResult: ValidationResult = validateLogic(input.output, undefined, input.workerId);
  const safetyResult: ValidationResult = validateSafety(input.output, input.intolerances, input.allergies);

  return ruleBasedCorrect(
    input.output,
    schemaResult,
    logicResult,
    safetyResult,
    input.workerName,
    input.expectedSchema,
    input.intolerances,
    input.allergies,
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Attempts AI-powered correction (primary → fallback model).
 * Falls back to rule-based correction if both AI calls fail or no API key exists.
 */
export async function autoCorrect(
  correctionInput: CorrectionInput,
  modelConfig?: ModelConfig,
): Promise<CorrectionResult> {
  const config = modelConfig ?? getDefaultModelConfig();
  const startedAt = Date.now();

  const prompt = buildCorrectionPrompt({
    workerName: correctionInput.workerName,
    errors: correctionInput.errors,
    input: correctionInput.input,
    originalOutput: correctionInput.output,
    userContext: {
      intolerances: correctionInput.intolerances,
      allergies: correctionInput.allergies,
      ...correctionInput.userContext,
    },
  });

  // No API key → go straight to rule-based
  if (!config.apiKey) {
    return {
      correctedOutput: applyRuleBasedCorrection(correctionInput),
      usedFallback: false,
      usedRuleBased: true,
      model: 'rule-based',
      correctionMs: Date.now() - startedAt,
    };
  }

  // Primary model attempt
  try {
    const result = await callAI(
      config.primaryModel,
      config.apiKey,
      prompt,
      config.orchestratorUrl,
      config.temperature,
      config.maxTokens,
    );
    return {
      correctedOutput: result,
      usedFallback: false,
      usedRuleBased: false,
      model: config.primaryModel,
      correctionMs: Date.now() - startedAt,
    };
  } catch (primaryError) {
    // Log fallback event
    logModelFallback(
      correctionInput.workerName,
      config.primaryModel,
      config.fallbackModel,
      primaryError instanceof Error ? primaryError.message : String(primaryError),
      { sessionId: correctionInput.sessionId, userId: correctionInput.userId },
    );

    // Fallback model attempt
    try {
      const result = await callAI(
        config.fallbackModel,
        config.apiKey,
        prompt,
        config.orchestratorUrl,
        config.temperature,
        config.maxTokens,
      );
      return {
        correctedOutput: result,
        usedFallback: true,
        usedRuleBased: false,
        model: config.fallbackModel,
        correctionMs: Date.now() - startedAt,
      };
    } catch {
      // Both AI models failed → rule-based
      return {
        correctedOutput: applyRuleBasedCorrection(correctionInput),
        usedFallback: true,
        usedRuleBased: true,
        model: 'rule-based',
        correctionMs: Date.now() - startedAt,
      };
    }
  }
}

// Named re-export to keep imports consistent with the rest of the codebase
export { validateSchema, validateLogic, validateSafety };
