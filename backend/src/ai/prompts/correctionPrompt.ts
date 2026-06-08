/**
 * Correction Prompt Template
 * Generates AI prompts that instruct a worker to fix its previous output.
 * Template variables use {{variableName}} syntax for clarity.
 */

export type CorrectionContext = {
  workerName: string;
  errors: string[];
  input: unknown;
  originalOutput: unknown;
  userContext?: {
    intolerances?: string[];
    allergies?: string[];
    goals?: Record<string, unknown>;
    profile?: Record<string, unknown>;
  };
};

// ─── Raw template string ──────────────────────────────────────────────────────

export const CORRECTION_TEMPLATE = `You are the {{workerName}} worker.

Your previous output contained the following errors:
{{errors}}

You MUST fix ALL errors listed above and regenerate a corrected output.

STRICT RULES:
1. Follow the output schema exactly: { "worker": string, "status": "success"|"warning"|"error", "data": object, "notes": string[] }
2. Never include allergens or intolerances listed in the user context.
3. Never use medical-risk language (diagnose, prescribe, cure, treatment).
4. Include a medical disclaimer in data.disclaimer when providing nutrition or safety output.
5. All numerical values (calories, macros) must be realistic and consistent.
6. Do NOT repeat any of the errors in the corrected output.

User context:
{{context}}

Original input:
{{input}}

Original (erroneous) output:
{{output}}

Return ONLY valid JSON matching the schema. No explanations outside the JSON.`;

// ─── Template renderer ────────────────────────────────────────────────────────

/**
 * Renders the correction prompt by substituting all {{variable}} placeholders.
 * Returns a ready-to-send string for the AI model.
 */
export function buildCorrectionPrompt(ctx: CorrectionContext): string {
  const errorsBlock =
    ctx.errors.length > 0
      ? ctx.errors.map((e, i) => `${i + 1}. ${e}`).join('\n')
      : 'No specific errors were detected but output does not meet schema requirements.';

  const contextBlock = JSON.stringify(ctx.userContext ?? {}, null, 2);
  const inputBlock = JSON.stringify(ctx.input, null, 2);
  const outputBlock = JSON.stringify(ctx.originalOutput, null, 2);

  return CORRECTION_TEMPLATE
    .replace('{{workerName}}', ctx.workerName)
    .replace('{{errors}}', errorsBlock)
    .replace('{{context}}', contextBlock)
    .replace('{{input}}', inputBlock)
    .replace('{{output}}', outputBlock);
}

/**
 * Minimal system message that accompanies the correction prompt.
 * Keeps the AI focused on JSON output only.
 */
export const CORRECTION_SYSTEM_MESSAGE =
  'You are a NutriAID worker correction engine. ' +
  'You receive an erroneous worker output and must return a corrected JSON object only. ' +
  'Never include text outside the JSON. Never add markdown code fences.';
