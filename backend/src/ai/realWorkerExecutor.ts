import 'server-only';

import type { WorkerExecutor, OrchestratorContext } from '@/ai/orchestrator';
import type { ModelConfig } from '@/ai/autoCorrector';
import type { JsonObject } from '@/lib/server/superadmin/workerDiagnosticTypes';
import { getWorkerSchema } from '@/ai/schemas/workerSchemas';
import { readDb } from '@/lib/server/superadmin/store';

// ─── Worker role definitions (fallback when no admin prompt is set) ───────────

const WORKER_ROLES: Record<string, { ro: string; en: string }> = {
  'profile-analyzer': {
    ro: 'Esti analizorul de profil. Extrage informatii nutritionale cheie din profilul utilizatorului: tip dieta, intolerante, alergii, obiective si nivel de activitate. Identifica datele lipsa.',
    en: 'You are the profile analyzer. Extract key nutritional info from the user profile: diet type, intolerances, allergies, goals, activity level. Identify missing data.',
  },
  'intolerance-checker': {
    ro: 'Esti verificatorul de intolerante. Analizeaza alimentele din context si identifica pe cele incompatibile cu intolerantele utilizatorului. Listeaza atat alimentele flagate cat si cele sigure. Explica conflictele.',
    en: 'You are the intolerance checker. Analyze foods in context and flag those incompatible with the user intolerances. List both flagged and safe ingredients. Explain conflicts.',
  },
  'allergy-checker': {
    ro: 'Esti verificatorul de alergii. Identifica alergenii potentiali in alimentele din context. Evalueaza daca planul propus este sigur si lista mesele respinse daca e cazul.',
    en: 'You are the allergy checker. Identify potential allergens in foods from context. Evaluate if the proposed plan is safe and list rejected meals if needed.',
  },
  'meal-plan-generator': {
    ro: 'Esti generatorul de plan alimentar. Creeaza un plan de mese personalizat, evitand complet ingredientele flagate de verificatoarele anterioare. Fiecare masa trebuie sa fie completa, variata si nutritiv echilibrata.',
    en: 'You are the meal plan generator. Create a personalized meal plan, completely avoiding ingredients flagged by previous checkers. Each meal must be complete, varied and nutritionally balanced.',
  },
  'recipe-builder': {
    ro: 'Esti constructorul de retete. Creeaza o reteta detaliata si sigura pentru utilizator, cu pasi clari, ingrediente compatibile cu profilul sau si note de substitutie.',
    en: 'You are the recipe builder. Create a detailed, safe recipe for the user with clear steps, ingredients compatible with their profile, and substitution notes.',
  },
  'nutrition-calculator': {
    ro: 'Esti calculatorul nutritional. Estimeaza valorile nutritionale realiste (calorii, proteine, carbohidrati, grasimi) pentru planul de mese generat.',
    en: 'You are the nutrition calculator. Estimate realistic nutritional values (calories, protein, carbs, fat) for the generated meal plan.',
  },
  'medical-safety': {
    ro: 'Esti verificatorul de siguranta medicala. Revizuieste continutul generat si asigura-te ca nu contine diagnostic, tratament, medicatie sau limbaj absolut. Adauga disclaimer medical obligatoriu.',
    en: 'You are the medical safety reviewer. Review generated content ensuring no diagnosis, treatment, medication or absolute language. Add mandatory medical disclaimer.',
  },
  'supplement-advisor': {
    ro: 'Esti consultantul de suplimente. Sugereaza suplimente generale si sigure bazate pe lacunele dietetice identificate. Nu prescrie, nu diagnostica. Adauga avertismente si disclaimer.',
    en: 'You are the supplement advisor. Suggest general, safe supplements based on identified dietary gaps. Do not prescribe or diagnose. Add warnings and disclaimer.',
  },
  'progress-tracking': {
    ro: 'Esti analizorul de progres. Analizeaza jurnalul de monitorizare si rezuma tendintele: alimente frecvente, simptome recurente, tendinte de imbunatatire sau agravare.',
    en: 'You are the progress tracker. Analyze the monitoring journal and summarize trends: frequent foods, recurring symptoms, improvement or worsening tendencies.',
  },
};

function getWorkerRolePrompt(workerId: string, lang: 'ro' | 'en'): string {
  return WORKER_ROLES[workerId]?.[lang] ?? `You are the ${workerId} worker. Process the input and return structured output.`;
}

function buildWorkerOutputSchema(workerId: string): string {
  const schema = getWorkerSchema(workerId);
  if (!schema) {
    return `{"worker": "${workerId}", "status": "success", "data": {}, "notes": []}`;
  }
  const dataFields = Object.keys(schema.fields)
    .filter((k) => k.startsWith('data.'))
    .map((k) => `    "${k.replace('data.', '')}": ...`)
    .join(',\n');
  return `{
  "worker": "${workerId}",
  "status": "success" | "warning" | "error",
  "data": {
${dataFields}
  },
  "notes": ["string"]
}`;
}

function buildWorkerSystemMessage(
  workerId: string,
  lang: 'ro' | 'en',
  adminGlobalPrompt?: string,
  workerCustomPrompt?: string,
): string {
  const parts: string[] = [];

  if (adminGlobalPrompt && adminGlobalPrompt.length > 20) {
    parts.push(`INSTRUCTIUNI GLOBALE ADMINISTRATOR:\n${adminGlobalPrompt}`);
  }

  if (workerCustomPrompt && workerCustomPrompt.length > 20) {
    parts.push(`INSTRUCTIUNI SPECIFICE WORKER:\n${workerCustomPrompt}`);
  } else {
    parts.push(getWorkerRolePrompt(workerId, lang));
  }

  parts.push(
    lang === 'ro'
      ? 'REGULI STRICTE: Nu diagnostica, nu prescrie, nu folosi limbaj absolut ("intotdeauna", "niciodata", "garantat"). Continut bogat, variat, non-medical.'
      : 'STRICT RULES: No diagnosis, no prescriptions, no absolute language ("always", "never", "guaranteed"). Rich, varied, non-medical content.',
  );

  parts.push(
    `FORMAT JSON OBLIGATORIU — Raspunde EXCLUSIV in JSON valid, FARA text in afara JSON:\n${buildWorkerOutputSchema(workerId)}`,
  );

  return parts.join('\n\n');
}

function buildWorkerUserMessage(
  workerId: string,
  input: JsonObject,
  context: OrchestratorContext,
  lang: 'ro' | 'en',
): string {
  const lines: string[] = [];
  lines.push(`WORKER: ${workerId}`);
  lines.push(`LANG: ${lang}`);
  lines.push(`USER_REQUEST: ${context.userMessage}`);
  lines.push(`INTOLERANCES: ${context.intolerances?.join(', ') || 'none'}`);
  lines.push(`ALLERGIES: ${context.allergies?.join(', ') || 'none'}`);

  if (context.nutritionalGoals && Object.keys(context.nutritionalGoals).length > 0) {
    lines.push(`GOALS: ${JSON.stringify(context.nutritionalGoals)}`);
  }
  if (context.userProfile && Object.keys(context.userProfile).length > 0) {
    lines.push(`PROFILE: ${JSON.stringify(context.userProfile)}`);
  }

  // Pass only non-meta accumulated context (previous worker outputs)
  const relevantInput: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!key.startsWith('_') && value !== null && value !== undefined) {
      relevantInput[key] = value;
    }
  }
  if (Object.keys(relevantInput).length > 0) {
    lines.push(`CONTEXT_ACUMULAT:\n${JSON.stringify(relevantInput, null, 2)}`);
  }

  lines.push(
    lang === 'ro'
      ? `Genereaza outputul complet pentru worker-ul "${workerId}".`
      : `Generate the complete output for the "${workerId}" worker.`,
  );

  return lines.join('\n');
}

// ─── OpenAI-compatible call ───────────────────────────────────────────────────

type OpenAIMessage = { role: 'system' | 'user'; content: string };

function resolveBaseUrl(model: string, orchestratorUrl?: string | null): string {
  if (orchestratorUrl) return orchestratorUrl;
  if (model.startsWith('gemini')) return 'https://generativelanguage.googleapis.com/v1beta/openai';
  if (model.startsWith('claude')) return 'https://api.anthropic.com/v1';
  return 'https://api.openai.com/v1';
}

function stripFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim();
}

async function callModel(
  apiKey: string,
  model: string,
  messages: OpenAIMessage[],
  temperature: number,
  maxTokens: number,
  orchestratorUrl?: string | null,
): Promise<string> {
  const baseUrl = resolveBaseUrl(model, orchestratorUrl);
  const endpoint = baseUrl.endsWith('/') ? `${baseUrl}chat/completions` : `${baseUrl}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`AI API ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI returned empty content.');
  return content;
}

function parseWorkerJson(raw: string, workerId: string): JsonObject {
  const clean = stripFences(raw);
  const parsed = JSON.parse(clean) as Record<string, unknown>;
  return {
    worker: workerId,
    status: typeof parsed.status === 'string' ? parsed.status : 'success',
    data:
      parsed.data && typeof parsed.data === 'object' && !Array.isArray(parsed.data)
        ? (parsed.data as JsonObject)
        : ({} as JsonObject),
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    ...parsed,
  } as JsonObject;
}

// ─── Public factory ───────────────────────────────────────────────────────────

/**
 * Creates a real AI-powered WorkerExecutor that:
 * - Reads per-worker prompts from aiBrain.workers in DB
 * - Reads global system prompt from aiBrain.systemPrompt
 * - Falls back to built-in role descriptions when no DB config
 * - Returns passthrough stub when API key is missing
 */
export function createRealWorkerExecutor(config: ModelConfig, lang: 'ro' | 'en' = 'ro'): WorkerExecutor {
  return async (workerId, input, context) => {
    if (!config.apiKey) {
      return {
        worker: workerId,
        status: 'warning',
        data: input as JsonObject,
        notes: [lang === 'ro' ? 'Cheia API AI nu este configurata.' : 'AI API key not configured.'],
      } as JsonObject;
    }

    // Read admin prompts from DB at call time (config can change without restart)
    let adminGlobalPrompt: string | undefined;
    let workerCustomPrompt: string | undefined;
    try {
      const db = readDb();
      adminGlobalPrompt = db.settings?.aiBrain?.systemPrompt?.trim();
      const workerCfg = db.settings?.aiBrain?.workers?.find(
        (w) => w.id === workerId && w.enabled !== false,
      );
      workerCustomPrompt = workerCfg?.prompt?.trim();
    } catch {
      // DB read failed — use built-in prompts
    }

    const systemMessage = buildWorkerSystemMessage(workerId, lang, adminGlobalPrompt, workerCustomPrompt);
    const userMessage = buildWorkerUserMessage(workerId, input, context, lang);
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ];

    // Primary model
    try {
      const raw = await callModel(
        config.apiKey,
        config.primaryModel,
        messages,
        config.temperature,
        config.maxTokens,
        config.orchestratorUrl,
      );
      return parseWorkerJson(raw, workerId);
    } catch (primaryErr) {
      // Fallback model
      if (config.fallbackModel && config.fallbackModel !== config.primaryModel) {
        try {
          const raw = await callModel(
            config.apiKey,
            config.fallbackModel,
            messages,
            config.temperature,
            config.maxTokens,
            config.orchestratorUrl,
          );
          return parseWorkerJson(raw, workerId);
        } catch {
          // Both failed — return error record so supervisor can correct
        }
      }
      const errMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
      return {
        worker: workerId,
        status: 'error',
        data: input as JsonObject,
        notes: [`AI call failed: ${errMsg.slice(0, 120)}`],
      } as JsonObject;
    }
  };
}
