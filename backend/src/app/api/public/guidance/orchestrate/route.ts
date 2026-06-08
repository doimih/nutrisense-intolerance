import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { appendAiLog } from '@/lib/server/superadmin/store';
import { logAIEvent } from '@/lib/server/superadmin/aiLogging';

export const runtime = 'nodejs';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrchestratorRequest = {
  sessionId?: unknown;
  userId?: unknown;
  userEmail?: unknown;
  userMessage?: unknown;
  userProfile?: unknown;
  intolerances?: unknown;
  allergies?: unknown;
  nutritionalGoals?: unknown;
  monitoringEntries?: unknown;
  dietaryPreference?: unknown;
  detailLevel?: unknown;
  lang?: unknown;
  subscriptionTier?: unknown;
  context?: unknown;
};

type MonitoringEntry = {
  date?: string;
  hour?: string;
  foods?: string[];
  symptoms?: string[];
  intensity?: number;
  latency?: number | null;
};

type GuidanceResult = {
  recommendedFoods: string[];
  avoidFoods: string[];
  mealExamples: Array<{ name: string; ingredients: string[]; notes?: string }>;
  generalTips: string[];
  disclaimer: string;
  warnings?: string[];
};

type OpenAIMessage = { role: 'system' | 'user'; content: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function normalizeSessionId(request: NextRequest, bodySessionId: unknown): string {
  if (typeof bodySessionId === 'string' && bodySessionId.trim().length > 0) return bodySessionId;
  return request.headers.get('x-nutriaid-session-id') || request.cookies.get('na_sid')?.value || randomUUID();
}

function normalizeMessage(value: unknown, lang: 'ro' | 'en'): string {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return lang === 'ro'
    ? 'Genereaza recomandari alimentare personalizate pe baza profilului si jurnalului.'
    : 'Generate personalized nutrition guidance from profile and journal data.';
}

function normalizeEntries(value: unknown): MonitoringEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object' && !Array.isArray(e))
    .slice(0, 40)
    .map((e) => ({
      date: typeof e.date === 'string' ? e.date : undefined,
      hour: typeof e.hour === 'string' ? e.hour : undefined,
      foods: asStringArray(e.foods ?? (e as Record<string, unknown>).consumedFoods),
      symptoms: asStringArray(e.symptoms),
      intensity: typeof e.intensity === 'number' ? e.intensity : typeof e.symptomsIntensity === 'number' ? e.symptomsIntensity as number : undefined,
      latency: typeof e.latency === 'number' ? e.latency : null,
    }));
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildSystemPrompt(lang: 'ro' | 'en'): string {
  if (lang === 'ro') {
    return `Esti un asistent de nutritie non-medical specializat in sensibilitati alimentare.
REGULI STRICTE:
- Nu da diagnostice, nu prescrie tratamente, medicamente sau suplimente.
- Nu folosi cuvinte absolute: "intotdeauna", "niciodata", "garantat", "cert", "100%".
- Raspunde EXCLUSIV in format JSON valid, fara text in afara JSON-ului.
- Recomandarile descriu probabilitati si corelatii din jurnal, nu sfat medical.

FORMAT JSON OBLIGATORIU:
{
  "recommendedFoods": ["aliment1", "aliment2", ...],
  "avoidFoods": ["aliment1", "aliment2", ...],
  "mealExamples": [
    {"name": "Masa 1 - varianta echilibrata", "ingredients": ["ingredient1", "ingredient2"], "notes": "observatie"},
    {"name": "Masa 2 - varianta usoara", "ingredients": ["ingredient1"], "notes": "observatie"}
  ],
  "generalTips": ["sfat1", "sfat2", "sfat3"],
  "disclaimer": "Aceste recomandari sunt orientative si nu reprezinta sfat medical.",
  "warnings": ["avertisment1"]
}`;
  }

  return `You are a non-medical nutrition assistant specializing in food sensitivities.
STRICT RULES:
- No diagnoses, treatments, medications, or supplement recommendations.
- Do not use absolute language: "always", "never", "guaranteed", "certain", "100%".
- Respond EXCLUSIVELY in valid JSON with no text outside the JSON.
- Recommendations describe journal-based probabilities and correlations, not medical advice.

REQUIRED JSON FORMAT:
{
  "recommendedFoods": ["food1", "food2", ...],
  "avoidFoods": ["food1", "food2", ...],
  "mealExamples": [
    {"name": "Meal 1 - balanced option", "ingredients": ["ingredient1", "ingredient2"], "notes": "note"},
    {"name": "Meal 2 - light option", "ingredients": ["ingredient1"], "notes": "note"}
  ],
  "generalTips": ["tip1", "tip2", "tip3"],
  "disclaimer": "These recommendations are indicative and are not medical advice.",
  "warnings": ["warning1"]
}`;
}

function buildUserPrompt(params: {
  lang: 'ro' | 'en';
  userMessage: string;
  intolerances: string[];
  dietaryPreference: unknown;
  detailLevel: unknown;
  subscriptionTier: unknown;
  entries: MonitoringEntry[];
}): string {
  const { lang, userMessage, intolerances, dietaryPreference, detailLevel, subscriptionTier, entries } = params;

  const lines: string[] = [];
  lines.push(`REQUEST: ${userMessage}`);
  lines.push(`LANG: ${lang}`);
  lines.push(`DIETARY_PREFERENCE: ${dietaryPreference ?? 'normal'}`);
  lines.push(`DETAIL_LEVEL: ${detailLevel ?? 'basic'}`);
  lines.push(`SUBSCRIPTION_TIER: ${subscriptionTier ?? 'new'}`);
  lines.push(`INTOLERANCES: ${intolerances.length > 0 ? intolerances.join(', ') : 'none'}`);

  if (entries.length > 0) {
    lines.push('MONITORING_JOURNAL:');
    for (const entry of entries) {
      lines.push(JSON.stringify({
        date: entry.date,
        hour: entry.hour,
        foods: entry.foods,
        symptoms: entry.symptoms,
        intensity: entry.intensity,
        latency: entry.latency,
      }));
    }
  } else {
    lines.push('MONITORING_JOURNAL: empty');
  }

  if (subscriptionTier === 'active') {
    lines.push(lang === 'ro'
      ? 'NIVEL_DETALIU: raspuns complet cu 3 sfaturi generale si 2 exemple de mese.'
      : 'DETAIL: full response with 3 general tips and 2 meal examples.');
  } else {
    lines.push(lang === 'ro'
      ? 'NIVEL_DETALIU: raspuns concis cu 2 sfaturi generale si 2 exemple de mese.'
      : 'DETAIL: concise response with 2 general tips and 2 meal examples.');
  }

  return lines.join('\n');
}

// ─── OpenAI-compatible API client ─────────────────────────────────────────────

function stripFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim();
}

async function callOpenAI(params: {
  apiKey: string;
  model: string;
  messages: OpenAIMessage[];
  temperature: number;
  maxTokens: number;
}): Promise<string> {
  const { apiKey, model, messages, temperature, maxTokens } = params;

  let baseUrl: string;
  if (model.startsWith('gemini')) {
    baseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai';
  } else if (model.startsWith('claude')) {
    baseUrl = 'https://api.anthropic.com/v1';
  } else {
    baseUrl = 'https://api.openai.com/v1';
  }

  const endpoint = `${baseUrl}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(40_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`AI API error ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI API returned empty content.');

  return content;
}

function parseGuidanceJson(raw: string): GuidanceResult {
  const clean = stripFences(raw);
  const parsed = JSON.parse(clean) as Record<string, unknown>;

  function toStringArray(v: unknown): string[] {
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  }

  function toMealExamples(v: unknown): GuidanceResult['mealExamples'] {
    if (!Array.isArray(v)) return [];
    return v
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
      .map((item, idx) => ({
        name: typeof item.name === 'string' && item.name.trim() ? item.name : `Meal ${idx + 1}`,
        ingredients: toStringArray(item.ingredients),
        notes: typeof item.notes === 'string' ? item.notes : undefined,
      }))
      .filter((meal) => meal.ingredients.length > 0);
  }

  const recommendedFoods = toStringArray(parsed.recommendedFoods);
  const avoidFoods = toStringArray(parsed.avoidFoods);

  if (recommendedFoods.length === 0 && avoidFoods.length === 0) {
    throw new Error('AI returned empty guidance: no recommendedFoods or avoidFoods.');
  }

  return {
    recommendedFoods,
    avoidFoods,
    mealExamples: toMealExamples(parsed.mealExamples),
    generalTips: toStringArray(parsed.generalTips),
    disclaimer: typeof parsed.disclaimer === 'string' && parsed.disclaimer.trim()
      ? parsed.disclaimer
      : 'These recommendations are indicative and are not medical advice.',
    warnings: toStringArray(parsed.warnings).length > 0 ? toStringArray(parsed.warnings) : undefined,
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: OrchestratorRequest;
  try {
    body = (await request.json()) as OrchestratorRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const lang = body.lang === 'en' ? 'en' : 'ro';
  const sessionId = normalizeSessionId(request, body.sessionId);
  const userMessage = normalizeMessage(body.userMessage, lang);

  const apiKey = (process.env.OPENAI_API_KEY ?? process.env.AI_API_KEY ?? '').trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI_API_KEY not configured. Set OPENAI_API_KEY or AI_API_KEY in the environment.' },
      { status: 503 },
    );
  }

  const model = (process.env.AI_PRIMARY_MODEL ?? 'gpt-4o').trim();
  const fallbackModel = (process.env.AI_FALLBACK_MODEL ?? 'gpt-4o-mini').trim();
  const temperature = Math.max(0, Math.min(1, Number(process.env.AI_TEMPERATURE ?? '0.4')));
  const maxTokens = Math.max(512, Math.min(4096, Number(process.env.AI_MAX_TOKENS ?? '1024')));

  const contextObj = asObject(body.context);
  const intolerances = asStringArray(body.intolerances ?? contextObj.intolerances);
  const dietaryPreference = body.dietaryPreference ?? contextObj.dietaryPreference;
  const detailLevel = body.detailLevel ?? contextObj.detailLevel;
  const subscriptionTier = body.subscriptionTier ?? contextObj.subscriptionTier;
  const rawEntries = Array.isArray(body.monitoringEntries)
    ? body.monitoringEntries
    : Array.isArray(contextObj.monitoringEntries)
      ? contextObj.monitoringEntries
      : [];
  const entries = normalizeEntries(rawEntries);

  const userId = typeof body.userId === 'string' ? body.userId : 'anonymous';
  const userEmail = typeof body.userEmail === 'string' ? body.userEmail : 'unknown';

  const systemPrompt = buildSystemPrompt(lang);
  const userPrompt = buildUserPrompt({ lang, userMessage, intolerances, dietaryPreference, detailLevel, subscriptionTier, entries });

  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const startedAt = Date.now();
  let result: GuidanceResult | null = null;
  let usedFallback = false;
  let usedModel = model;
  let aiError: string | null = null;

  // Primary model
  try {
    const raw = await callOpenAI({ apiKey, model, messages, temperature, maxTokens });
    result = parseGuidanceJson(raw);
  } catch (err) {
    aiError = err instanceof Error ? err.message : String(err);

    // Fallback model
    if (fallbackModel && fallbackModel !== model) {
      try {
        const raw = await callOpenAI({ apiKey, model: fallbackModel, messages, temperature, maxTokens });
        result = parseGuidanceJson(raw);
        usedFallback = true;
        usedModel = fallbackModel;
        aiError = null;
      } catch (fallbackErr) {
        aiError = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      }
    }
  }

  const latencyMs = Date.now() - startedAt;

  // Log AI execution
  try {
    appendAiLog({
      userId,
      userEmail,
      status: result ? 'success' : 'error',
      latencyMs,
      summary: result
        ? `Guidance generated via ${usedModel}${usedFallback ? ' (fallback)' : ''}`
        : `Guidance failed: ${aiError?.slice(0, 120) ?? 'unknown error'}`,
    });

    logAIEvent({
      sessionId,
      userId,
      intent: 'guidance',
      worker: 'guidance-orchestrator',
      model: usedModel,
      fallbackModel: usedFallback ? fallbackModel : null,
      usedFallback,
      latencyMs,
      error: aiError ? { message: aiError } : null,
      metadata: {
        lang,
        detailLevel,
        subscriptionTier,
        intolerancesCount: intolerances.length,
        entriesCount: entries.length,
      },
    });
  } catch {
    // logging must never break the response
  }

  if (!result) {
    return NextResponse.json(
      { error: aiError ?? 'AI guidance generation failed.' },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    provider: usedModel,
    sessionId,
    latencyMs,
    result,
  });
}
