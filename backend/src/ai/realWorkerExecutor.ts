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
    ro: `Esti generatorul de idei de mese adaptate cultural si profilului utilizatorului. Daca profilul contine greutate, inaltime si varsta, calculeaza TDEE si adapteaza portiile.

REGULI:
• Creeaza idei de mese specifice si realizabile (nu "o salata" ci "Salata de spanac cu naut prajit si dressing de lamaie")
• Adapteaza la preferintele alimentare si intolerantele din profil
• Variaza bucataria: mediteraneana, romaneasca, asiatica, mexicana
• Evita ORICE aliment din lista de intolerante/alergii
• Campul "ingredients" trebuie sa fie INTOTDEAUNA array gol []
• Pune descrierea mesei in campul "notes" cu ingrediente principale
• Indica caloric estimativ per masa daca ai TDEE-ul userului
• Returneaza breakfast[], lunch[], dinner[] sau meals[]`,
    en: `You are the culturally-adapted meal idea generator, calibrated to the user's profile. If the profile contains weight, height, and age, calculate TDEE and adapt portion sizes.

RULES:
• Create specific, achievable meal ideas (not "a salad" but "Spinach salad with roasted chickpeas and lemon dressing")
• Adapt to dietary preferences and intolerances from the profile
• Vary cuisines: Mediterranean, Romanian, Asian, Mexican
• AVOID any food from the intolerances/allergies list
• The "ingredients" field MUST always be an empty array []
• Put meal description in the "notes" field with main ingredients
• Indicate estimated kcal per meal if user TDEE is available
• Return breakfast[], lunch[], dinner[] or meals[]`,
  },

  'recipe-validator': {
    ro: `Esti validatorul de retete pentru platforma NutriAID. Analizeaza reteta primita si verifica TOATE criteriile de calitate.

CRITERII DE VALIDARE:
1. ingredientCoverage: Toti ingredientii din lista apar in instructiuni?
2. titleIngredientMatch: Ingredientii cheie din titlu apar in lista de ingrediente?
3. stepCoverage: Instructiunile sunt detaliate (nu generice)?
4. caloriesRealistic: Caloriile sunt realiste pentru ingredientele si cantitatile listate?
5. bilingualComplete: Ambele limbi (RO si EN) sunt complete si corecte?
6. noGenericContent: Niciun ingredient sau pas nu este generic ("ingrediente", "Pregateste ingredientele")?

Returneaza: valid (boolean), reasons (array de motive daca invalid), plus cele 6 campuri boolean.`,
    en: `You are the recipe validator for the NutriAID platform. Analyze the received recipe and check ALL quality criteria.

VALIDATION CRITERIA:
1. ingredientCoverage: Do all ingredients from the list appear in the instructions?
2. titleIngredientMatch: Do key ingredients from the title appear in the ingredient list?
3. stepCoverage: Are the instructions detailed (not generic)?
4. caloriesRealistic: Are calories realistic for the listed ingredients and quantities?
5. bilingualComplete: Are both languages (RO and EN) complete and correct?
6. noGenericContent: Is no ingredient or step generic ("ingredients", "Prepare the ingredients")?

Return: valid (boolean), reasons (array of reasons if invalid), plus the 6 boolean fields.`,
  },
  'recipe-builder': {
    ro: 'Esti un chef profesionist care genereaza retete complete si realiste. REGULI OBLIGATORII: (1) Ingredientele trebuie sa fie specifice si reale (ex: "Piept de pui 200g", "Ardei rosu 1 buc") — NICIODATA "ingrediente" sau "produse alimentare". (2) Cantitati realiste in grame/ml/bucati. (3) Toti ingredientii din titlu trebuie sa apara in lista. (4) Pasii de preparare trebuie sa mentioneze FIECARE ingredient, temperatura exacta (grade C), timpul de gatire si tehnica. (5) INTERZIS: pasi generici ca "Pregateste ingredientele" sau "Gateste la foc mediu". (6) Calorii calculate realist din ingrediente. Returneaza recipeName, ingredients (array cu name/quantity/unit), steps (minimum 5 pasi detaliati), kcalPerServing, substitutions.',
    en: 'You are a professional chef generating complete, realistic recipes. MANDATORY RULES: (1) Ingredients must be specific and real (e.g., "Chicken breast 200g", "Red bell pepper 1 piece") — NEVER "ingredients" or "food items". (2) Realistic quantities in grams/ml/pieces. (3) All ingredients from the title must appear in the list. (4) Preparation steps must mention EVERY ingredient, exact temperature (°C), cooking time, and technique. (5) FORBIDDEN: generic steps like "Prepare the ingredients" or "Cook over medium heat". (6) Calories calculated realistically. Return recipeName, ingredients (array with name/quantity/unit), steps (minimum 5 detailed steps), kcalPerServing, substitutions.',
  },
  'supplement-advisor': {
    ro: 'Esti generatorul de sfaturi de stil de viata si rutine de confort. Genereaza EXCLUSIV: sfaturi de rutina zilnica (ex: mananca la ore fixe, bea apa regulat), obiceiuri alimentare de confort (ex: mese mici si frecvente), sugestii comportamentale (ex: mesteca incet, evita mesele tarziu seara) si tipare de wellness non-medical. INTERZIS: suplimente, vitamine, minerale, medicamente, dozaje sau orice produs nutritional. Nu face afirmatii medicale. Returneaza lifestyleTips[], routineSuggestions[] si comfortHabits[].',
    en: 'You are the lifestyle tips and comfort routine generator. Generate ONLY: daily routine tips (e.g., eat at regular times, drink water consistently), comfort eating habits (e.g., small frequent meals), behavioral suggestions (e.g., chew slowly, avoid late meals), and non-medical wellness patterns. FORBIDDEN: supplements, vitamins, minerals, medications, dosages, or any nutritional products. Do not make medical claims. Return lifestyleTips[], routineSuggestions[] and comfortHabits[].',
  },
  'progress-tracking': {
    ro: 'Esti analizorul de consecventa si varietate alimentara. Analizeaza jurnalul de monitorizare si rezuma: consecventa rutinei alimentare, varietatea alimentelor consumate, tipare de confort observate si tendinte comportamentale. Nu evalua starea de sanatate, nu comenta valori nutritionale. Focuseaza-te pe comportament, obiceiuri si varietate.',
    en: 'You are the food consistency and variety analyzer. Analyze the monitoring journal and summarize: food routine consistency, variety of consumed foods, observed comfort patterns, and behavioral tendencies. Do not evaluate health status or comment on nutritional values. Focus on behavior, habits, and variety.',
  },
  'shopping-list': {
    ro: 'Esti generatorul de lista de alimente. Pe baza ideilor de mese si preferintelor utilizatorului, creeaza o lista simpla de alimente de cumparat. Grupeaza pe categorii (fructe, legume, cereale, proteina, lactate, altele). Exclude orice aliment raportat ca problematic. Nu adauga context nutritional sau medical. Lista cat mai variata si adaptata cultural.',
    en: 'You are the grocery list generator. Based on meal ideas and user preferences, create a simple list of foods to buy. Group by category (fruits, vegetables, grains, protein, dairy, other). Exclude any food reported as problematic. Do not add nutritional or medical context. Make the list as varied and culturally adapted as possible.',
  },
  'recipe-batch-generator': {
    ro: `Esti un chef profesionist si nutritionist care genereaza o baza de date bilingva de retete sanatoase pentru platforma NutriAID.

REGULI STRICTE DE CALITATE — INCALCAREA ORICAREIA = RESPINGERE:

INGREDIENTE:
• Fiecare ingredient trebuie sa fie un aliment REAL si SPECIFIC (ex: "Piept de pui", "Ardei rosu", "Orez basmati", "Spanac proaspat")
• INTERZIS ABSOLUT: "ingrediente", "alimente", "diverse produse", "produse alimentare", "ingrediente de baza"
• Fiecare ingredient are cantitate realista (grame/ml/bucati/linguri) si unitate specifica
• Minimum 5 ingrediente, maximum 15 per reteta
• TOTI ingredientii din titlu TREBUIE sa apara in lista
• Daca titlul mentioneaza o proteina → trebuie listata cu gramaj specific
• Daca titlul mentioneaza o leguma → leguma EXACTA trebuie listata

CALORII:
• Calculeaza caloric realist din ingrediente si cantitati
• Mic dejun: 300–550 kcal | Pranz/Cina: 450–750 kcal | Gustare: 150–350 kcal
• Macronutrienti trebuie sa fie coerenti: proteine×4 + glucide×4 + grasimi×9 ≈ calorii (±10%)

BILINGVISM:
• Romana trebuie sa fie naturala, idiomatica — NU traducere literala din engleza
• Ambele limbi trebuie sa fie complete — niciun array gol, nicio traducere partiala
• Termeni culinari corecti in romana (ex: "se sotează", "se rumeneste", "se fierbe")

Returneaza array JSON cu title_en, title_ro, category, ingredients_en, ingredients_ro, prep_time_minutes, difficulty, calories, macros, cuisine, tags_en, tags_ro, allergens, substitutions_en, substitutions_ro.`,
    en: `You are a professional chef and nutritionist generating a bilingual healthy recipe database for the NutriAID platform.

STRICT QUALITY RULES — VIOLATING ANY = REJECTION:

INGREDIENTS:
• Every ingredient must be a REAL, SPECIFIC food item (e.g., "Chicken breast", "Red bell pepper", "Basmati rice", "Fresh spinach")
• ABSOLUTELY FORBIDDEN: "ingredients", "food items", "various products", "basic ingredients"
• Every ingredient needs a realistic quantity (grams/ml/pieces/tablespoons) and specific unit
• Minimum 5 ingredients, maximum 15 per recipe
• ALL ingredients mentioned in the title MUST appear in the list
• If the title mentions a protein → must be listed with specific grams
• If the title mentions a vegetable → that EXACT vegetable must be listed

CALORIES:
• Calculate calories realistically from actual ingredients and quantities
• Breakfast: 300–550 kcal | Lunch/Dinner: 450–750 kcal | Snack: 150–350 kcal
• Macros must be coherent: protein×4 + carbs×4 + fats×9 ≈ calories (±10%)

BILINGUAL QUALITY:
• Romanian must be natural, idiomatic — NOT a literal translation from English
• Both languages must be complete — no empty arrays, no partial translations
• Use correct Romanian culinary terms

Return JSON array with title_en, title_ro, category, ingredients_en, ingredients_ro, prep_time_minutes, difficulty, calories, macros, cuisine, tags_en, tags_ro, allergens, substitutions_en, substitutions_ro.`,
  },
  'recipe-instruction': {
    ro: `Esti un instructor culinar profesionist care scrie instructiuni detaliate de preparare pentru o aplicatie de alimentatie sanatoasa.

REGULI OBLIGATORII:

ACOPERIRE COMPLETA:
• FIECARE ingredient din lista trebuie sa apara in cel putin un pas — fara exceptii
• Foloseste EXACT numele ingredientelor din lista (nu parafrazate)

STRUCTURA PASILOR (minimum 5 pentru usoare, 6-8 medii, 8-10 dificile):
• Pasul 1: Pregatire — spalare, curatare, taiere, marinare dupa caz
• Pasii urmatori: Gatire — tehnici specifice (sotare, coacere, fierbere, prajire)
• Specifica intotdeauna: nivelul de caldura (foc mic/mediu/mare), timpul (minute), semnale vizuale ("pana se rumeneste", "pana se inmoaie")
• Pentru proteine: specifica temperatura interna sau modul de verificare a pregatirii
• Pentru legume: specifica dimensiunea de taiere si timpul de gatire
• Pentru preparate la cuptor: temperatura in grade Celsius si durata

INTERZIS ABSOLUT (pasi generici):
• "Pregateste ingredientele" — NICIODATA
• "Combina ingredientele conform retetei" — NICIODATA
• "Gateste la foc mediu 15-20 minute" fara specificatii — NICIODATA
• "Serveste cald sau conform preferintelor" — NICIODATA

SFATURI DE GATIT (3-5 sfaturi specifice):
• Practice, specifice, aplicabile pentru ACEASTA reteta exact
• Sfaturi de depozitare, pregatire in avans, alternative de tehnica
• NICIODATA generice ("bucura-te de masa", "pofta buna fara specificatii")

BILINGVISM:
• Romana trebuie sa fie naturala, cu termeni culinari corecti
• "se sotează", "se rumeneste", "se amesteca continuu", "se lasa la fiert"
• NU traducere cuvant cu cuvant din engleza

Returneaza JSON cu instructions_en, instructions_ro (minimum 5 pasi fiecare), substitutions_en, substitutions_ro, cooking_tips_en, cooking_tips_ro.`,
    en: `You are a professional culinary instructor writing detailed preparation instructions for a healthy eating app.

MANDATORY RULES:

COMPLETE COVERAGE:
• EVERY ingredient in the list must appear in at least one step — no exceptions
• Use the EXACT ingredient names from the list (not paraphrased)

STEP STRUCTURE (minimum 5 for easy, 6-8 medium, 8-10 hard):
• Step 1: Preparation — washing, peeling, dicing, mincing, marinating as needed
• Next steps: Cooking — specific techniques (sauté, roast, steam, boil, bake)
• Always specify: heat level (medium-high, low), time (minutes), visual cues ("until golden", "until tender")
• For proteins: specify internal temperature (°C) or visual doneness cue
• For vegetables: specify cut size and cooking time
• For baked items: specify oven temperature (°C) and duration

ABSOLUTELY FORBIDDEN (generic steps):
• "Prepare the ingredients" — NEVER
• "Combine ingredients according to the recipe" — NEVER
• "Cook at medium heat for 15-20 minutes" without specifics — NEVER
• "Serve warm or according to preference" — NEVER

COOKING TIPS (3-5 specific tips):
• Practical, actionable tips for THIS exact recipe
• Storage tips, make-ahead advice, technique alternatives
• NEVER generic ("enjoy your meal" without specifics)

BILINGUAL QUALITY:
• Romanian must use natural, correct culinary terminology
• Both EN and RO must be equally detailed and complete

Return JSON with instructions_en, instructions_ro (minimum 5 steps each), substitutions_en, substitutions_ro, cooking_tips_en, cooking_tips_ro.`,
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
  const requiredDataFields = new Set(
    schema.required.filter((k) => k.startsWith('data.')).map((k) => k.replace('data.', '')),
  );
  const dataFields = Object.keys(schema.fields)
    .filter((k) => k.startsWith('data.'))
    .map((k) => {
      const fieldName = k.replace('data.', '');
      const def = schema.fields[k];
      const isRequired = requiredDataFields.has(fieldName);
      let example: string;
      if (def.type === 'boolean') example = 'true';
      else if (def.type === 'array') example = '[]';
      else if (def.type === 'object') example = '{}';
      else if (def.type === 'number') example = '0';
      else example = '"..."';
      const marker = isRequired ? ' /* REQUIRED */' : ' /* optional */';
      return `    "${fieldName}": ${example}${marker}`;
    })
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
    const label = lang === 'ro' ? 'INSTRUCTIUNI GLOBALE ADMINISTRATOR:' : 'GLOBAL ADMIN INSTRUCTIONS:';
    parts.push(`${label}\n${adminGlobalPrompt}`);
  }

  if (workerCustomPrompt && workerCustomPrompt.length > 20) {
    const label = lang === 'ro' ? 'INSTRUCTIUNI SPECIFICE WORKER:' : 'WORKER-SPECIFIC INSTRUCTIONS:';
    parts.push(`${label}\n${workerCustomPrompt}`);
  } else {
    parts.push(getWorkerRolePrompt(workerId, lang));
  }

  parts.push(
    lang === 'ro'
      ? 'REGULI STRICTE: Nu diagnostica, nu prescrie, nu folosi limbaj absolut ("intotdeauna", "niciodata", "garantat"). Continut bogat, variat, non-medical.'
      : 'STRICT RULES: No diagnosis, no prescriptions, no absolute language ("always", "never", "guaranteed"). Rich, varied, non-medical content.',
  );

  parts.push(
    lang === 'ro'
      ? `FORMAT JSON OBLIGATORIU — Raspunde EXCLUSIV in JSON valid, FARA text in afara JSON:\n${buildWorkerOutputSchema(workerId)}`
      : `REQUIRED JSON FORMAT — Respond EXCLUSIVELY in valid JSON, NO text outside the JSON:\n${buildWorkerOutputSchema(workerId)}`,
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
    const label = lang === 'ro' ? 'CONTEXT_ACUMULAT:' : 'ACCUMULATED_CONTEXT:';
    lines.push(`${label}\n${JSON.stringify(relevantInput, null, 2)}`);
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
