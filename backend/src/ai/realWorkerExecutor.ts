import 'server-only';

import type { WorkerExecutor, OrchestratorContext } from '@/ai/orchestrator';
import type { ModelConfig } from '@/ai/autoCorrector';
import type { JsonObject } from '@/lib/server/superadmin/workerDiagnosticTypes';
import { getWorkerSchema } from '@/ai/schemas/workerSchemas';
import { readDb } from '@/lib/server/superadmin/store';

// ─── Worker role definitions (fallback when no admin prompt is set) ───────────

const WORKER_ROLES: Record<string, { ro: string; en: string }> = {
  'profile-analyzer': {
    ro: 'Esti analizorul de tipare comportamentale alimentare. Extrage din profilul utilizatorului: preferintele alimentare declarate, obisnuintele de consum, alimentele preferate si pe cele evitate, tipicul rutinei zilnice si familiaritatea culturala cu anumite alimente. Identifica date lipsa. Nu face interpretari medicale sau nutritionale. Focuseaza-te exclusiv pe comportament si preferinte.',
    en: 'You are the behavioral food pattern analyzer. Extract from the user profile: declared food preferences, eating habits, favorite and avoided foods, daily routine patterns, and cultural food familiarity. Identify missing data. Make no medical or nutritional interpretations. Focus exclusively on behavior and preferences.',
  },
  'intolerance-checker': {
    ro: 'Esti analizorul de tipare de disconfort alimentar. Pe baza jurnalului si profilului, identifica alimentele pe care utilizatorul le-a raportat ca ii cauzeaza disconfort sau reactii neplacute. Foloseste limbaj bland si non-medical: "poate cauza disconfort", "utilizatorul a raportat reactii dupa consum", "unii pot fi sensibili". Nu diagnostica. Lista alimentele ca possibleTriggers. Evidentiaza si alimentele consumate fara probleme.',
    en: 'You are the food discomfort pattern analyzer. Based on the journal and profile, identify foods the user has reported as causing discomfort or unpleasant reactions. Use gentle, non-medical language: "may cause discomfort", "user reported reactions after consumption", "some may be sensitive to this". Do not diagnose. List foods as possibleTriggers. Also highlight foods consumed without issues.',
  },
  'allergy-checker': {
    ro: 'Esti analizorul de tipare de reactii alimentare. Identifica din jurnal si profil alimentele asociate cu reactii neplacute raportate de utilizator. Foloseste limbaj comportamental, nu medical: "asociat cu reactii raportate", "utilizatorul a raportat disconfort dupa". Nu certifica, nu diagnostica. Focuseaza-te pe pattern-uri observate in comportamentul utilizatorului.',
    en: 'You are the food reaction pattern analyzer. Identify from journal and profile foods associated with unpleasant reactions reported by the user. Use behavioral, non-medical language: "associated with reported reactions", "user reported discomfort after". Do not certify or diagnose. Focus on patterns observed in user behavior.',
  },
  'meal-plan-generator': {
    ro: 'Esti generatorul de idei de mese adaptate cultural. Creeaza 7 idei simple de mese (nu retete detaliate, nu liste de ingrediente) adaptate la preferintele utilizatorului si contextul sau cultural. Genereaza idei separate pentru mic dejun, pranz si cina. Fiecare idee de masa trebuie sa fie o sugestie scurta si familiara, nu o reteta elaborata. Variaza tipul de bucatarie si contextul cultural. Evita orice aliment raportat ca problematic. Returneaza breakfast[], lunch[], dinner[] sau meals[].',
    en: 'You are the culturally-adapted meal idea generator. Create 7 simple meal ideas (not detailed recipes, not ingredient lists) adapted to the user\'s preferences and cultural context. Generate separate ideas for breakfast, lunch, and dinner. Each meal idea should be a short, familiar suggestion, not an elaborate recipe. Vary the cuisine type and cultural context. Avoid any food reported as problematic. Return breakfast[], lunch[], dinner[] or meals[].',
  },
  'recipe-builder': {
    ro: 'Esti generatorul de idei de retete simple. Sugereaza idei de retete la nivel conceptual — denumire, descriere scurta si context cultural. Nu lista pasi de preparare detaliati, nu include valori nutritionale, nu face afirmatii medicale. Focuseaza-te pe familiaritate, simplicitate si potrivire cu preferintele utilizatorului.',
    en: 'You are the simple recipe idea generator. Suggest recipes at a conceptual level — name, brief description, and cultural context. Do not list detailed preparation steps, do not include nutritional values, do not make medical claims. Focus on familiarity, simplicity, and fit with user preferences.',
  },
  'nutrition-calculator': {
    ro: 'Esti generatorul de alimente recomandate adaptate GEO-cultural. Pe baza profilului si preferintelor utilizatorului, genereaza o lista bogata de alimente recomandate disponibile local, familiare cultural si potrivite pentru tiparele de confort ale utilizatorului. Nu calcula calorii, macronutrienti sau valori nutritionale. Focuseaza-te pe diversitate, familiaritate culturala si accesibilitate locala. Returneaza recommendedFoods[] cu minimum 20 alimente unice.',
    en: 'You are the GEO-culturally adapted recommended foods generator. Based on the user profile and preferences, generate a rich list of recommended foods that are locally available, culturally familiar, and suited to the user\'s comfort patterns. Do not calculate calories, macronutrients, or nutritional values. Focus on diversity, cultural familiarity, and local availability. Return recommendedFoods[] with minimum 20 unique foods.',
  },
  'medical-safety': {
    ro: 'Esti generatorul de note de constientizare. Revizuieste continutul generat si asigura-te ca nu contine: diagnostice, tratamente, medicamente, suplimente, valori nutritionale sau limbaj absolut. Adauga un disclaimer clar ca recomandarile sunt bazate pe preferinte si tipare de confort, nu pe sfat medical. Returneaza safetyApproved: true si un disclaimer bland si uman.',
    en: 'You are the awareness notes generator. Review the generated content and ensure it contains no: diagnoses, treatments, medications, supplements, nutritional values, or absolute language. Add a clear disclaimer that recommendations are based on preferences and comfort patterns, not medical advice. Return safetyApproved: true and a gentle, human disclaimer.',
  },
  'supplement-advisor': {
    ro: 'Esti generatorul de sfaturi de stil de viata si rutine de confort. Nu sugera suplimente, medicamente sau produse nutritionale. In schimb, genereaza sfaturi practice de rutina zilnica, obiceiuri alimentare de confort, sugestii comportamentale si tipare de wellness non-medical. Focuseaza-te pe simplitate, consecventa si bunastare generala. Returneaza lifestyleTips[] si routineSuggestions[].',
    en: 'You are the lifestyle tips and comfort routine generator. Do not suggest supplements, medications, or nutritional products. Instead, generate practical daily routine tips, comfort eating habits, behavioral suggestions, and non-medical wellness patterns. Focus on simplicity, consistency, and general wellbeing. Return lifestyleTips[] and routineSuggestions[].',
  },
  'progress-tracking': {
    ro: 'Esti analizorul de consecventa si varietate alimentara. Analizeaza jurnalul de monitorizare si rezuma: consecventa rutinei alimentare, varietatea alimentelor consumate, tipare de confort observate si tendinte comportamentale. Nu evalua starea de sanatate, nu comenta valori nutritionale. Focuseaza-te pe comportament, obiceiuri si varietate.',
    en: 'You are the food consistency and variety analyzer. Analyze the monitoring journal and summarize: food routine consistency, variety of consumed foods, observed comfort patterns, and behavioral tendencies. Do not evaluate health status or comment on nutritional values. Focus on behavior, habits, and variety.',
  },
  'shopping-list': {
    ro: 'Esti generatorul de lista de alimente. Pe baza ideilor de mese si preferintelor utilizatorului, creeaza o lista simpla de alimente de cumparat. Grupeaza pe categorii (fructe, legume, cereale, proteina, lactate, altele). Exclude orice aliment raportat ca problematic. Nu adauga context nutritional sau medical. Lista cat mai variata si adaptata cultural.',
    en: 'You are the grocery list generator. Based on meal ideas and user preferences, create a simple list of foods to buy. Group by category (fruits, vegetables, grains, protein, dairy, other). Exclude any food reported as problematic. Do not add nutritional or medical context. Make the list as varied and culturally adapted as possible.',
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

  // GEO context
  if (context.country || context.region || context.culturalCuisine) {
    const geoParts: string[] = [];
    if (context.country) geoParts.push(`tara/country=${context.country}`);
    if (context.region) geoParts.push(`regiune/region=${context.region}`);
    if (context.culturalCuisine) geoParts.push(`bucatarie/cuisine=${context.culturalCuisine}`);
    lines.push(lang === 'ro'
      ? `GEO_CONTEXT: ${geoParts.join(', ')}. Adapteaza recomandarile la alimente locale familiare cultural.`
      : `GEO_CONTEXT: ${geoParts.join(', ')}. Adapt all recommendations to locally available, culturally familiar foods.`);
  }

  if (context.userProfile && Object.keys(context.userProfile).length > 0) {
    lines.push(`PROFILE: ${JSON.stringify(context.userProfile)}`);
  }

  // Diversity blacklist — items already mentioned by previous workers
  const diversityBlacklist = Array.isArray(input._diversityBlacklist)
    ? (input._diversityBlacklist as string[]).slice(0, 80)
    : [];
  if (diversityBlacklist.length > 0) {
    lines.push(lang === 'ro'
      ? `REGULA_DIVERSITATE: Nu repeta NICIUNUL din urmatoarele elemente deja mentionate de workeri anteriori. Genereaza EXCLUSIV elemente noi, unice: ${diversityBlacklist.join(', ')}`
      : `DIVERSITY_RULE: Do NOT repeat ANY of the following items already mentioned by previous workers. Generate EXCLUSIVELY new, unique items: ${diversityBlacklist.join(', ')}`);
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
      ? `Genereaza outputul complet pentru worker-ul "${workerId}". Minimum 15 elemente unice per lista. Fara valori nutritionale, fara diagnostice, fara sfat medical.`
      : `Generate the complete output for the "${workerId}" worker. Minimum 15 unique items per list. No nutritional values, no diagnoses, no medical advice.`,
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
