import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { appendAiLog, readDb } from '@/lib/server/superadmin/store';
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
  previousGuidance?: unknown;
};

type MonitoringEntry = {
  date?: string;
  hour?: string;
  foods?: string[];
  symptoms?: string[];
  intensity?: number;
  latency?: number | null;
  wellbeing?: number;
};

type PreviousGuidanceSummary = {
  generatedAt: string;
  recommendedFoods: string[];
  avoidFoods: string[];
};

type PhysicalProfile = {
  age?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  activityLevel?: string | null;
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
      wellbeing: typeof e.wellbeing === 'number' ? e.wellbeing as number : undefined,
    }));
}

function normalizePreviousGuidance(value: unknown): PreviousGuidanceSummary[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object' && !Array.isArray(e))
    .slice(0, 3)
    .map((e) => ({
      generatedAt: typeof e.generatedAt === 'string' ? e.generatedAt : '',
      recommendedFoods: asStringArray(e.recommendedFoods),
      avoidFoods: asStringArray(e.avoidFoods),
    }))
    .filter((e) => e.generatedAt);
}

function normalizePhysicalProfile(value: unknown): PhysicalProfile | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const obj = value as Record<string, unknown>;
  const p = asObject(obj.physicalProfile ?? obj);
  return {
    age: typeof p.age === 'number' ? p.age as number : null,
    heightCm: typeof p.heightCm === 'number' ? p.heightCm as number : null,
    weightKg: typeof p.weightKg === 'number' ? p.weightKg as number : null,
    activityLevel: typeof p.activityLevel === 'string' ? p.activityLevel : null,
  };
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

// The JSON format block is always injected — it must never be overridden by admin
// custom prompts, otherwise parseGuidanceJson throws and falls back to deterministic.
function buildJsonFormatBlock(lang: 'ro' | 'en'): string {
  if (lang === 'ro') {
    return `FORMAT JSON OBLIGATORIU — Raspunde EXCLUSIV in JSON valid, FARA text in afara JSON-ului:
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
  return `REQUIRED JSON FORMAT — Respond EXCLUSIVELY in valid JSON, NO text outside the JSON:
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

function buildNutritionCore(lang: 'ro' | 'en'): string {
  if (lang === 'ro') {
    return `Esti un asistent de nutritie non-medical specializat in sensibilitati alimentare.

REGULI STRICTE:
- Nu da diagnostice, nu prescrie tratamente, medicamente sau suplimente.
- Nu folosi cuvinte absolute: "intotdeauna", "niciodata", "garantat", "cert", "100%".
- Recomandarile descriu probabilitati si corelatii din jurnal, nu sfat medical.

ANALIZA CERUTA:
1. REACTII INTARZIATE: Daca o intrare din jurnal are campul "latency" intre 30 si 2880 minute SI are simptome, alimentele din acea masa sunt SUSPECTE. Noteaza aceste alimente in avoidFoods si mentioneaza latenta in generalTips.
2. COMBINATII PROBLEMATICE: Identifica perechi de alimente care apar impreuna in mai multe intrari cu simptome. Mentioneaza combinatiile detectate in generalTips.
3. ALIMENTE SIGURE: Alimentele care apar frecvent in intrari FARA simptome sunt probabil sigure. Pune-le in recommendedFoods.
4. INTENSITATE: Pondereaza importanta unui aliment cu intensitatea simptomelor (campul "intensity", scala 1-10). Intensitate >= 7 = risc ridicat.`;
  }

  return `You are a non-medical nutrition assistant specializing in food sensitivities.

STRICT RULES:
- No diagnoses, treatments, medications, or supplement recommendations.
- Do not use absolute language: "always", "never", "guaranteed", "certain", "100%".
- Recommendations describe journal-based probabilities and correlations, not medical advice.

REQUIRED ANALYSIS:
1. DELAYED REACTIONS: If a journal entry has a "latency" field between 30 and 2880 minutes AND has symptoms, the foods in that meal are SUSPECTED. Note these foods in avoidFoods and mention the latency in generalTips.
2. PROBLEMATIC COMBINATIONS: Identify food pairs that appear together in multiple entries with symptoms. Mention detected combinations in generalTips.
3. SAFE FOODS: Foods that appear frequently in entries WITHOUT symptoms are likely safe. Put them in recommendedFoods.
4. INTENSITY: Weight the importance of a food by symptom intensity (field "intensity", scale 1-10). Intensity >= 7 = high risk.`;
}

function buildSystemPrompt(lang: 'ro' | 'en'): string {
  return `${buildNutritionCore(lang)}\n\n${buildJsonFormatBlock(lang)}`;
}

function buildUserPrompt(params: {
  lang: 'ro' | 'en';
  userMessage: string;
  intolerances: string[];
  dietaryPreference: unknown;
  detailLevel: unknown;
  subscriptionTier: unknown;
  entries: MonitoringEntry[];
  physicalProfile?: PhysicalProfile | null;
  previousGuidance?: PreviousGuidanceSummary[];
}): string {
  const { lang, userMessage, intolerances, dietaryPreference, detailLevel, subscriptionTier, entries, physicalProfile, previousGuidance } = params;

  const lines: string[] = [];
  lines.push(`REQUEST: ${userMessage}`);
  lines.push(`LANG: ${lang}`);
  lines.push(`DIETARY_PREFERENCE: ${dietaryPreference ?? 'normal'}`);
  lines.push(`DETAIL_LEVEL: ${detailLevel ?? 'basic'}`);
  lines.push(`SUBSCRIPTION_TIER: ${subscriptionTier ?? 'new'}`);
  lines.push(`INTOLERANCES: ${intolerances.length > 0 ? intolerances.join(', ') : 'none'}`);

  if (physicalProfile) {
    const parts: string[] = [];
    if (physicalProfile.age) parts.push(`varsta:${physicalProfile.age}`);
    if (physicalProfile.heightCm) parts.push(`inaltime:${physicalProfile.heightCm}cm`);
    if (physicalProfile.weightKg) parts.push(`greutate:${physicalProfile.weightKg}kg`);
    if (physicalProfile.activityLevel) parts.push(`activitate:${physicalProfile.activityLevel}`);
    if (parts.length > 0) lines.push(`PROFIL_FIZIC: ${parts.join(', ')}`);
  }

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
        wellbeing: entry.wellbeing,
      }));
    }
  } else {
    lines.push('MONITORING_JOURNAL: empty');
  }

  if (previousGuidance && previousGuidance.length > 0) {
    lines.push('RECOMANDARI_ANTERIOARE (nu repeta exact, evolueaza recomandarile):');
    for (const prev of previousGuidance) {
      lines.push(JSON.stringify({
        data: prev.generatedAt,
        recomandate: prev.recommendedFoods.slice(0, 5),
        evitate: prev.avoidFoods.slice(0, 5),
      }));
    }
  }

  // Translate detailLevel into concrete numeric requirements so the AI knows
  // exactly how much content to produce — not just a label.
  if (detailLevel === 'comprehensive') {
    lines.push(lang === 'ro'
      ? 'NIVEL_DETALIU COMPLET: minim 12 alimente recomandate variate, minim 8 alimente de evitat, minim 3 exemple de mese complet diferite, minim 5 sfaturi generale detaliate. Nu repeta ingrediente intre mese. Nu folosi raspunsuri scurte.'
      : 'DETAIL LEVEL COMPREHENSIVE: min 12 varied recommended foods, min 8 foods to avoid, min 3 fully distinct meal examples, min 5 detailed general tips. Do not repeat ingredients across meals. Do not give short answers.');
  } else if (detailLevel === 'detailed') {
    lines.push(lang === 'ro'
      ? 'NIVEL_DETALIU DETALIAT: minim 8 alimente recomandate, minim 5 alimente de evitat, minim 2 exemple de mese diferite, minim 3 sfaturi generale.'
      : 'DETAIL LEVEL DETAILED: min 8 recommended foods, min 5 foods to avoid, min 2 distinct meal examples, min 3 general tips.');
  } else {
    lines.push(lang === 'ro'
      ? 'NIVEL_DETALIU DE BAZA: minim 4 alimente recomandate, minim 3 alimente de evitat, 1 exemplu de masa, 2 sfaturi generale.'
      : 'DETAIL LEVEL BASIC: min 4 recommended foods, min 3 foods to avoid, 1 meal example, 2 general tips.');
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
  // Validate internal secret if configured — prevents direct external calls
  const internalSecret = process.env.INTERNAL_SYNC_SECRET;
  if (internalSecret) {
    const incoming = request.headers.get('x-internal-secret');
    if (incoming !== internalSecret) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
  }

  let body: OrchestratorRequest;
  try {
    body = (await request.json()) as OrchestratorRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const lang = body.lang === 'en' ? 'en' : 'ro';
  const sessionId = normalizeSessionId(request, body.sessionId);
  const userMessage = normalizeMessage(body.userMessage, lang);

  const dbSettings = readDb().settings;
  const aiBrain = dbSettings?.aiBrain;

  const dbApiKey = dbSettings?.ai?.apiKeyMasked ?? '';
  const isPlaceholder = !dbApiKey || dbApiKey.includes('****');
  const apiKey = (!isPlaceholder ? dbApiKey : (process.env.OPENAI_API_KEY ?? process.env.AI_API_KEY ?? '')).trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI API key not configured. Set it in Settings → AI in the admin panel.' },
      { status: 503 },
    );
  }

  const model = (aiBrain?.defaultModel || process.env.AI_PRIMARY_MODEL || 'gpt-4o').trim();
  const fallbackModel = (aiBrain?.fallbackModel || process.env.AI_FALLBACK_MODEL || 'gpt-4o-mini').trim();
  const temperature = Math.max(0, Math.min(1, Number(aiBrain?.temperature ?? process.env.AI_TEMPERATURE ?? '0.4')));
  const maxTokens = Math.max(512, Math.min(4096, Number(aiBrain?.maxTokens ?? process.env.AI_MAX_TOKENS ?? '1024')));

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
  const previousGuidance = normalizePreviousGuidance(body.previousGuidance);
  const userProfileObj = asObject(body.userProfile);
  const physicalProfile = normalizePhysicalProfile(userProfileObj);

  const userId = typeof body.userId === 'string' ? body.userId : 'anonymous';
  const userEmail = typeof body.userEmail === 'string' ? body.userEmail : 'unknown';

  const dbSystemPrompt = aiBrain?.systemPrompt?.trim();
  // Admin custom prompt is SUPPLEMENTARY — nutrition core + JSON format are always
  // included so the AI knows how to analyze and what schema to return.
  const systemPrompt = dbSystemPrompt && dbSystemPrompt.length > 20
    ? `${buildNutritionCore(lang)}\n\nINSTRUCTIUNI SUPLIMENTARE ADMINISTRATOR:\n${dbSystemPrompt}\n\n${buildJsonFormatBlock(lang)}`
    : buildSystemPrompt(lang);
  const userPrompt = buildUserPrompt({ lang, userMessage, intolerances, dietaryPreference, detailLevel, subscriptionTier, entries, physicalProfile, previousGuidance });

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
    modelUsed: usedModel,
    usedFallbackModel: usedFallback,
    sessionId,
    latencyMs,
    result,
  });
}
