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

export const CORRECTION_TEMPLATE = `You are the {{workerName}} worker — a non-medical behavioral wellness assistant.

Your previous output contained the following errors:
{{errors}}

You MUST fix ALL errors listed above and regenerate a corrected output.

STRICT RULES:
1. Follow the output schema exactly: { "worker": string, "status": "success"|"warning"|"error", "data": object, "notes": string[] }
2. Never include foods that the user has reported as causing discomfort (listed in user context intolerances/reactions).
3. Never use medical-risk language: no diagnoses, no prescriptions, no cures, no treatments, no medications.
4. Never include calorie counts, macro values, or nutritional claims — focus on comfort patterns and food preferences only.
5. Use only soft, behavioral language: "may cause discomfort", "user reported reactions", "associated with reported discomfort", "some users may be sensitive to".
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
