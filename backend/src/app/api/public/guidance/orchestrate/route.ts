import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { appendAiLog, readDb } from '@/lib/server/superadmin/store';
import { logAIEvent } from '@/lib/server/superadmin/aiLogging';

export const runtime = 'nodejs';

// ─── Types ────────────────────────────────────────────────────────────────────

type PreviousMealExampleEntry = {
  name: string;
  ingredients?: string[];
};

type GeoContext = {
  country: string;
  region: string;
  cuisine: string;
};

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
  previousMealExamples?: unknown;
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

type MealDayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type MealTypeKey = 'breakfast' | 'lunch' | 'dinner';

const MEAL_DAY_KEYS: readonly MealDayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEAL_TYPE_KEYS: readonly MealTypeKey[] = ['breakfast', 'lunch', 'dinner'];

type GuidanceResult = {
  recommendedFoods: string[];
  avoidFoods: string[];
  mealExamples: Array<{ name: string; ingredients?: string[]; notes?: string; day?: MealDayKey; mealType?: MealTypeKey }>;
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
  "recommendedFoods": ["aliment1", "aliment2", "aliment3", ...minimum 15 alimente unice...],
  "avoidFoods": ["aliment1", "aliment2", ...minimum 8 alimente unice...],
  "mealExamples": [
    {"day": "monday", "mealType": "breakfast", "name": "Denumire idee masa", "ingredients": [], "notes": "Descriere scurta a ideii de masa, mod de preparare simplu si context cultural"},
    {"day": "monday", "mealType": "lunch", "name": "Denumire idee masa", "ingredients": [], "notes": "Descriere scurta"},
    {"day": "monday", "mealType": "dinner", "name": "Denumire idee masa", "ingredients": [], "notes": "Descriere scurta"},
    {"day": "tuesday", "mealType": "breakfast", "name": "Denumire idee masa", "ingredients": [], "notes": "Descriere scurta"}
  ],
  "generalTips": ["sfat_confort1", "sfat_confort2", "sfat_confort3", ...minimum 5 sfaturi...],
  "disclaimer": "Aceste sugestii sunt bazate pe tipare de confort si preferinte personale si nu reprezinta sfat medical sau nutritional.",
  "warnings": []
}
ATENTIE — exemplul de mai sus arata doar 4 din cele 21 de intrari necesare. "mealExamples" trebuie sa contina EXACT 21 de intrari: cate 3 (breakfast, lunch, dinner, in aceasta ordine) pentru fiecare din cele 7 zile: monday, tuesday, wednesday, thursday, friday, saturday, sunday. Campul "day" trebuie sa fie EXACT una din aceste valori (in engleza, lowercase). Campul "mealType" trebuie sa fie EXACT una din: breakfast, lunch, dinner. Campul "ingredients" trebuie sa fie INTOTDEAUNA un array gol []. Nu lista ingrediente. Pune descrierea mesei in campul "notes". Campul "name" contine DOAR denumirea preparatului, FARA ziua sau tipul de masa in text (acelea sunt deja in "day"/"mealType").`;
  }
  return `REQUIRED JSON FORMAT — Respond EXCLUSIVELY in valid JSON, NO text outside the JSON:
{
  "recommendedFoods": ["food1", "food2", "food3", ...minimum 15 unique foods...],
  "avoidFoods": ["food1", "food2", ...minimum 8 unique foods...],
  "mealExamples": [
    {"day": "monday", "mealType": "breakfast", "name": "Meal idea name", "ingredients": [], "notes": "Brief description of the meal idea, simple preparation context and cultural familiarity"},
    {"day": "monday", "mealType": "lunch", "name": "Meal idea name", "ingredients": [], "notes": "Brief description"},
    {"day": "monday", "mealType": "dinner", "name": "Meal idea name", "ingredients": [], "notes": "Brief description"},
    {"day": "tuesday", "mealType": "breakfast", "name": "Meal idea name", "ingredients": [], "notes": "Brief description"}
  ],
  "generalTips": ["comfort_tip1", "comfort_tip2", "comfort_tip3", ...minimum 5 tips...],
  "disclaimer": "These suggestions are based on comfort patterns and personal preferences and do not constitute medical or nutritional advice.",
  "warnings": []
}
NOTE — the example above shows only 4 of the 21 required entries. "mealExamples" must contain EXACTLY 21 entries: 3 per day (breakfast, lunch, dinner, in this order) for each of the 7 days: monday, tuesday, wednesday, thursday, friday, saturday, sunday. The "day" field must be EXACTLY one of these values (in English, lowercase). The "mealType" field must be EXACTLY one of: breakfast, lunch, dinner. The "ingredients" field must ALWAYS be an empty array []. Do not list ingredients. Put the meal description in the "notes" field. The "name" field contains ONLY the dish name, WITHOUT the day or meal type in the text (those already live in "day"/"mealType").`;
}

function detectGeoContext(lang: 'ro' | 'en', acceptLanguage: string): GeoContext {
  const al = acceptLanguage.toLowerCase();
  if (lang === 'ro' || al.includes('ro')) {
    return { country: 'Romania', region: 'Eastern Europe', cuisine: 'Romanian/Mediterranean/Balkanic' };
  }
  if (al.includes('hu')) return { country: 'Hungary', region: 'Central Europe', cuisine: 'Hungarian/Central European' };
  if (al.includes('fr')) return { country: 'France', region: 'Western Europe', cuisine: 'French/Mediterranean' };
  if (al.includes('de')) return { country: 'DACH region', region: 'Central Europe', cuisine: 'German/Swiss/Austrian' };
  if (al.includes('es')) return { country: 'Spain/Latin America', region: 'Iberian/LatAm', cuisine: 'Spanish/Mediterranean' };
  if (al.includes('it')) return { country: 'Italy', region: 'Southern Europe', cuisine: 'Italian/Mediterranean' };
  if (al.includes('pl')) return { country: 'Poland', region: 'Eastern Europe', cuisine: 'Polish/Slavic' };
  if (al.includes('cs') || al.includes('sk')) return { country: 'Czech/Slovak', region: 'Central Europe', cuisine: 'Central European/Slavic' };
  return { country: 'International', region: 'Western Europe/International', cuisine: 'International/Mediterranean' };
}

function buildNutritionCore(lang: 'ro' | 'en'): string {
  if (lang === 'ro') {
    return `Esti un asistent de wellness alimentar non-medical, specializat in tipare de confort si preferinte alimentare personalizate.

REGULI STRICTE:
- Nu da diagnostice, nu prescrie tratamente sau medicamente.
- Nu folosi cuvinte absolute: "intotdeauna", "niciodata", "garantat", "cert".
- Focuseaza-te exclusiv pe tipare de confort, preferinte culturale si familiaritate cu alimentele.
- Toate recomandarile reflecta tendinte observate in jurnal, nu sfat medical.
- Evita orice referire la valori nutritionale, calorii, macronutrienti sau beneficii medicale.

ANALIZA COMPORTAMENTALA CERUTA:
1. TIPARE DE CONFORT: Identifica alimentele care apar frecvent in zilele cu wellbeing ridicat si fara disconfort raportat. Acestea sunt alimente de confort potrivite pentru acest utilizator — includeaza-le in recommendedFoods.
2. POSIBILI DECLANSATORI DE DISCONFORT: Alimentele asociate cu zile in care utilizatorul a raportat disconfort pot sa nu i se potriveasca. Listeaza-le in avoidFoods cu limbaj bland: "poate cauza disconfort unora", "unii utilizatori pot fi sensibili la acest aliment".
3. REACTII RAPORTATE: Daca o intrare are disconfort raportat si latenta intre 30-2880 minute, alimentele consumate pot fi asociate cu senzatia de disconfort. Noteaza tendinta in generalTips fara a face afirmatii medicale.
4. FAMILIARITATE CULTURALA: Recomandarile trebuie sa fie adaptate culturii locale a utilizatorului, cu alimente familiare si disponibile regional.`;
  }

  return `You are a non-medical food wellness assistant specializing in personal comfort patterns and food preferences.

STRICT RULES:
- No diagnoses, treatments, or medication recommendations.
- Do not use absolute language: "always", "never", "guaranteed", "certain".
- Focus exclusively on comfort patterns, cultural preferences, and food familiarity.
- All recommendations reflect journal-based behavioral tendencies, not medical advice.
- Avoid any reference to nutritional values, calories, macronutrients, or medical benefits.

REQUIRED BEHAVIORAL ANALYSIS:
1. COMFORT PATTERNS: Identify foods that appear frequently on days with high wellbeing and no reported discomfort. These are comfort foods that suit this user — include them in recommendedFoods.
2. POSSIBLE DISCOMFORT TRIGGERS: Foods associated with days when the user reported discomfort may not suit them well. List in avoidFoods with gentle language: "may cause discomfort in some people", "some users may be sensitive to this food".
3. REPORTED REACTIONS: If an entry has reported discomfort with latency between 30-2880 minutes, the consumed foods may be associated with the sensation of discomfort. Note the tendency in generalTips without making medical claims.
4. CULTURAL FAMILIARITY: Recommendations must be adapted to the user's local culture, with familiar and regionally available foods.`;
}

function buildSystemPrompt(lang: 'ro' | 'en'): string {
  return `${buildNutritionCore(lang)}\n\n${buildJsonFormatBlock(lang)}`;
}

function normalizePreviousMealExamples(value: unknown): PreviousMealExampleEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object' && !Array.isArray(e))
    .slice(0, 30)
    .map((e) => ({
      name: typeof e.name === 'string' ? e.name : '',
      ingredients: asStringArray(e.ingredients),
    }))
    .filter((e) => e.name || e.ingredients.length > 0);
}

function buildUserPrompt(params: {
  lang: 'ro' | 'en';
  userMessage: string;
  intolerances: string[];
  dietaryPreference: unknown;
  dietaryPreferences?: string[];
  detailLevel: unknown;
  subscriptionTier: unknown;
  entries: MonitoringEntry[];
  physicalProfile?: PhysicalProfile | null;
  previousGuidance?: PreviousGuidanceSummary[];
  previousMealExamples?: PreviousMealExampleEntry[];
  geoContext?: GeoContext;
}): string {
  const { lang, userMessage, intolerances, dietaryPreference, dietaryPreferences, detailLevel, subscriptionTier, entries, physicalProfile, previousGuidance, previousMealExamples, geoContext } = params;

  const effectiveDietaryLabel = dietaryPreferences && dietaryPreferences.length > 1
    ? dietaryPreferences.join(', ')
    : String(dietaryPreference ?? 'normal');

  const lines: string[] = [];
  lines.push(`REQUEST: ${userMessage}`);
  lines.push(`LANG: ${lang}`);
  if (geoContext) {
    lines.push(lang === 'ro'
      ? `GEO_CONTEXT: tara=${geoContext.country}, regiune=${geoContext.region}, bucatarie_culturala=${geoContext.cuisine}. Adapteaza TOATE recomandarile si ideile de mese la alimente locale, familiar culturale si disponibile in aceasta regiune. Prioritizeaza ingrediente si preparate tipice regiunii.`
      : `GEO_CONTEXT: country=${geoContext.country}, region=${geoContext.region}, cultural_cuisine=${geoContext.cuisine}. Adapt ALL recommendations and meal ideas to locally available, culturally familiar foods from this region. Prioritize ingredients and dishes typical to this area.`);
  }
  lines.push(`DIETARY_PREFERENCES: ${effectiveDietaryLabel}`);
  lines.push(`DETAIL_LEVEL: ${detailLevel ?? 'basic'}`);
  lines.push(`SUBSCRIPTION_TIER: ${subscriptionTier ?? 'new'}`);
  lines.push(`INTOLERANCES: ${intolerances.length > 0 ? intolerances.join(', ') : 'none'}`);

  if (physicalProfile) {
    const parts: string[] = [];
    if (lang === 'ro') {
      if (physicalProfile.age) parts.push(`varsta:${physicalProfile.age}`);
      if (physicalProfile.heightCm) parts.push(`inaltime:${physicalProfile.heightCm}cm`);
      if (physicalProfile.weightKg) parts.push(`greutate:${physicalProfile.weightKg}kg`);
      if (physicalProfile.activityLevel) parts.push(`activitate:${physicalProfile.activityLevel}`);
    } else {
      if (physicalProfile.age) parts.push(`age:${physicalProfile.age}`);
      if (physicalProfile.heightCm) parts.push(`height:${physicalProfile.heightCm}cm`);
      if (physicalProfile.weightKg) parts.push(`weight:${physicalProfile.weightKg}kg`);
      if (physicalProfile.activityLevel) parts.push(`activity:${physicalProfile.activityLevel}`);
    }
    if (parts.length > 0) {
      const label = lang === 'ro' ? 'PROFIL_FIZIC' : 'PHYSICAL_PROFILE';
      lines.push(`${label}: ${parts.join(', ')}`);
    }
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
    lines.push(lang === 'ro'
      ? 'RECOMANDARI_ANTERIOARE (nu repeta exact, evolueaza recomandarile):'
      : 'PREVIOUS_RECOMMENDATIONS (do not repeat exactly, evolve the recommendations):');
    for (const prev of previousGuidance) {
      lines.push(JSON.stringify({
        date: prev.generatedAt,
        recommended: prev.recommendedFoods.slice(0, 5),
        avoid: prev.avoidFoods.slice(0, 5),
      }));
    }
  }

  if (previousMealExamples && previousMealExamples.length > 0) {
    lines.push(lang === 'ro'
      ? 'RETETE_ANTERIOARE (EVITA sa repeti aceste retete - genereaza altele complet diferite):'
      : 'PREVIOUS_RECIPES (AVOID repeating these recipes - generate completely different ones):');
    for (const meal of previousMealExamples.slice(0, 20)) {
      lines.push(JSON.stringify({ name: meal.name, ingredients: meal.ingredients }));
    }
  }

  lines.push(lang === 'ro'
    ? 'DIVERSITATE_OBLIGATORIE: Genereaza 21 idei de mese (3 pe zi — mic dejun, pranz, cina — pentru fiecare din cele 7 zile, Luni-Duminica) complet diferite de cele anterioare. Variaza: tipul de bucatarie (mediteraneana, romaneasca, asiatica, orientala, mexicana, balcanica, greceasca), si categoria de baza a mesei (supa/ciorba, salata, mancare la cuptor, mancare la tigaie, la gratar). Mic dejunul trebuie sa fie potrivit dimineata, pranzul o masa de mijlocul zilei, cina o masa de seara. Nu repeta nicio idee de masa. Nu lista ingrediente - descrie ideea in "notes". Obiectiv pe termen lung: 100+ idei de mese unice generate cumulativ.'
    : 'MANDATORY DIVERSITY: Generate 21 meal ideas (3 per day — breakfast, lunch, dinner — for each of the 7 days, Monday-Sunday) completely different from previous ones. Vary: cuisine type (Mediterranean, Romanian, Asian, Middle Eastern, Mexican, Balkan, Greek) and base category (soup/stew, salad, oven dish, pan dish, grilled). Breakfast must suit the morning, lunch a midday meal, dinner an evening meal. Do not repeat any meal idea. Do not list ingredients — describe the idea in "notes". Long-term goal: 100+ unique meal ideas generated cumulatively.');

  if (intolerances.length > 0) {
    lines.push(lang === 'ro'
      ? `REGULA_CRITICA_MESE: In campul "mealExamples", ingredientele NU trebuie sa contina NICIUN aliment din lista INTOLERANCES (${intolerances.join(', ')}). Aceasta regula este OBLIGATORIE si are prioritate maxima. Verifica fiecare ingredient din fiecare reteta inainte de a raspunde. Daca o reteta ar necesita un ingredient interzis, inlocuieste-l cu un aliment sigur.`
      : `CRITICAL_MEAL_RULE: In the "mealExamples" field, ingredients must NOT contain ANY food from the INTOLERANCES list (${intolerances.join(', ')}). This rule is MANDATORY and has maximum priority. Check every ingredient in every recipe before responding. If a recipe would require a forbidden ingredient, replace it with a safe food.`);
  }

  if (dietaryPreferences && dietaryPreferences.length > 0 && !(dietaryPreferences.length === 1 && dietaryPreferences[0] === 'normal')) {
    lines.push(lang === 'ro'
      ? `REGULA_DIETA_MESE: Preferintele alimentare ale utilizatorului sunt: ${dietaryPreferences.join(', ')}. Toate cele 21 de retete generate in "mealExamples" trebuie sa respecte aceste preferinte. Nu include ingrediente incompatibile cu dieta selectata.`
      : `DIET_MEAL_RULE: User dietary preferences are: ${dietaryPreferences.join(', ')}. All 21 recipes generated in "mealExamples" must comply with these preferences. Do not include ingredients incompatible with the selected diet.`);
  }

  // Volume requirements — concrete minimums so the AI knows how much to produce.
  if (detailLevel === 'comprehensive') {
    lines.push(lang === 'ro'
      ? 'VOLUM_COMPLET: minimum 20 alimente recomandate unice variate GEO-adaptate, minimum 12 alimente de evitat unice, EXACT 21 idei de mese (7 zile x 3 mese: mic dejun, pranz, cina) cu descriere culturala in "notes", minimum 7 sfaturi de confort si rutina detaliate. Nu repeta niciun element. Raspunsuri bogate si detaliate in fiecare sectiune.'
      : 'VOLUME_COMPREHENSIVE: minimum 20 unique GEO-adapted recommended foods, minimum 12 unique foods to avoid, EXACTLY 21 meal ideas (7 days x 3 meals: breakfast, lunch, dinner) with cultural description in "notes", minimum 7 detailed comfort and routine tips. No element repetition. Rich, detailed responses in every section.');
  } else if (detailLevel === 'detailed') {
    lines.push(lang === 'ro'
      ? 'VOLUM_DETALIAT: minimum 15 alimente recomandate unice, minimum 8 alimente de evitat unice, EXACT 21 idei de mese (7 zile x 3 mese: mic dejun, pranz, cina) cu "notes" descriptiv, minimum 5 sfaturi de confort. Nu repeta elemente.'
      : 'VOLUME_DETAILED: minimum 15 unique recommended foods, minimum 8 unique foods to avoid, EXACTLY 21 meal ideas (7 days x 3 meals: breakfast, lunch, dinner) with descriptive "notes", minimum 5 comfort tips. No repeated elements.');
  } else {
    lines.push(lang === 'ro'
      ? 'VOLUM_BAZA: minimum 8 alimente recomandate unice, minimum 5 alimente de evitat, EXACT 21 idei simple de mese (7 zile x 3 mese: mic dejun, pranz, cina) cu "notes" scurt, minimum 3 sfaturi de confort.'
      : 'VOLUME_BASIC: minimum 8 unique recommended foods, minimum 5 foods to avoid, EXACTLY 21 simple meal ideas (7 days x 3 meals: breakfast, lunch, dinner) with short "notes", minimum 3 comfort tips.');
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
        ingredients: Array.isArray(item.ingredients) ? toStringArray(item.ingredients) : [],
        notes: typeof item.notes === 'string' ? item.notes : undefined,
        day: MEAL_DAY_KEYS.includes(item.day as MealDayKey) ? (item.day as MealDayKey) : undefined,
        mealType: MEAL_TYPE_KEYS.includes(item.mealType as MealTypeKey) ? (item.mealType as MealTypeKey) : undefined,
      }))
      .filter((meal) => meal.name.length > 0);
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
  const userProfileObj = asObject(body.userProfile);
  const rawDietTypes = userProfileObj.dietTypes;
  const dietaryPreferences: string[] = Array.isArray(rawDietTypes)
    ? asStringArray(rawDietTypes)
    : typeof dietaryPreference === 'string' && dietaryPreference
    ? [dietaryPreference]
    : [];
  const detailLevel = body.detailLevel ?? contextObj.detailLevel;
  const subscriptionTier = body.subscriptionTier ?? contextObj.subscriptionTier;
  const rawEntries = Array.isArray(body.monitoringEntries)
    ? body.monitoringEntries
    : Array.isArray(contextObj.monitoringEntries)
      ? contextObj.monitoringEntries
      : [];
  const entries = normalizeEntries(rawEntries);
  const previousGuidance = normalizePreviousGuidance(body.previousGuidance);
  const previousMealExamples = normalizePreviousMealExamples(body.previousMealExamples);
  const physicalProfile = normalizePhysicalProfile(userProfileObj);

  const userId = typeof body.userId === 'string' ? body.userId : 'anonymous';
  const userEmail = typeof body.userEmail === 'string' ? body.userEmail : 'unknown';

  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const geoContext = detectGeoContext(lang, acceptLanguage);

  const dbSystemPrompt = aiBrain?.systemPrompt?.trim();
  // Admin custom prompt is SUPPLEMENTARY — nutrition core + JSON format are always
  // included so the AI knows how to analyze and what schema to return.
  const adminInstructionsLabel = lang === 'ro' ? 'INSTRUCTIUNI SUPLIMENTARE ADMINISTRATOR:' : 'ADDITIONAL ADMIN INSTRUCTIONS:';
  const systemPrompt = dbSystemPrompt && dbSystemPrompt.length > 20
    ? `${buildNutritionCore(lang)}\n\n${adminInstructionsLabel}\n${dbSystemPrompt}\n\n${buildJsonFormatBlock(lang)}`
    : buildSystemPrompt(lang);
  const userPrompt = buildUserPrompt({ lang, userMessage, intolerances, dietaryPreference, dietaryPreferences, detailLevel, subscriptionTier, entries, physicalProfile, previousGuidance, previousMealExamples, geoContext });

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
