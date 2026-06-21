import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { insertRecipe, searchRecipes } from "@/lib/server/recipeStore";
import { parseInstructionWorkerResponse, validateRecipeItem, type UserProfileContext } from "@/lib/server/recipes/workers";
import { getProfileForUser } from "@/lib/server/profileStore";
import { deleteRecipeById } from "@/lib/server/recipeStore";
import type { RecipeLocalized } from "@/types/recipes";

export const runtime = "nodejs";
export const maxDuration = 60;

function estimateTDEE(profile: UserProfileContext): number | null {
  const { weightKg, heightCm, age, activityLevel } = profile;
  if (!weightKg || !heightCm || !age) return null;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const multiplier = multipliers[activityLevel ?? ""] ?? 1.375;
  return Math.round(bmr * multiplier);
}

type GeoContext = { country: string; region: string; cuisine: string };

const COUNTRY_GEO: Record<string, GeoContext> = {
  GR: { country: "Greece", region: "Southern Europe", cuisine: "Greek/Mediterranean" },
  RO: { country: "Romania", region: "Eastern Europe", cuisine: "Romanian/Mediterranean/Balkanic" },
  HU: { country: "Hungary", region: "Central Europe", cuisine: "Hungarian/Central European" },
  FR: { country: "France", region: "Western Europe", cuisine: "French/Mediterranean" },
  DE: { country: "Germany", region: "Central Europe", cuisine: "German/Central European" },
  AT: { country: "Austria", region: "Central Europe", cuisine: "Austrian/Central European" },
  CH: { country: "Switzerland", region: "Central Europe", cuisine: "Swiss/Central European" },
  ES: { country: "Spain", region: "Southern Europe", cuisine: "Spanish/Mediterranean" },
  IT: { country: "Italy", region: "Southern Europe", cuisine: "Italian/Mediterranean" },
  PL: { country: "Poland", region: "Eastern Europe", cuisine: "Polish/Slavic" },
  CZ: { country: "Czech Republic", region: "Central Europe", cuisine: "Czech/Central European" },
  SK: { country: "Slovakia", region: "Central Europe", cuisine: "Slovak/Central European" },
  TR: { country: "Turkey", region: "Middle East/Europe", cuisine: "Turkish/Middle Eastern" },
  PT: { country: "Portugal", region: "Western Europe", cuisine: "Portuguese/Mediterranean" },
  NL: { country: "Netherlands", region: "Western Europe", cuisine: "Dutch/Western European" },
  BE: { country: "Belgium", region: "Western Europe", cuisine: "Belgian/Western European" },
  BG: { country: "Bulgaria", region: "Eastern Europe", cuisine: "Bulgarian/Balkanic" },
  HR: { country: "Croatia", region: "Eastern Europe", cuisine: "Croatian/Mediterranean/Balkanic" },
  RS: { country: "Serbia", region: "Eastern Europe", cuisine: "Serbian/Balkanic" },
  UA: { country: "Ukraine", region: "Eastern Europe", cuisine: "Ukrainian/Slavic" },
  CY: { country: "Cyprus", region: "Southern Europe", cuisine: "Cypriot/Mediterranean" },
  MT: { country: "Malta", region: "Southern Europe", cuisine: "Maltese/Mediterranean" },
  GB: { country: "United Kingdom", region: "Western Europe", cuisine: "British/International" },
  IE: { country: "Ireland", region: "Western Europe", cuisine: "Irish/International" },
  SE: { country: "Sweden", region: "Northern Europe", cuisine: "Swedish/Nordic" },
  NO: { country: "Norway", region: "Northern Europe", cuisine: "Norwegian/Nordic" },
  DK: { country: "Denmark", region: "Northern Europe", cuisine: "Danish/Nordic" },
  FI: { country: "Finland", region: "Northern Europe", cuisine: "Finnish/Nordic" },
};

// In-memory IP→countryCode cache (process-lifetime, evicted after 1h)
const ipGeoCache = new Map<string, { code: string; ts: number }>();

async function resolveCountryFromIp(ip: string): Promise<string | null> {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) return null;

  const cached = ipGeoCache.get(ip);
  if (cached && Date.now() - cached.ts < 3_600_000) return cached.code;

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode&lang=en`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    const data = await res.json() as { countryCode?: string };
    const code = data.countryCode?.toUpperCase() ?? null;
    if (code) ipGeoCache.set(ip, { code, ts: Date.now() });
    return code;
  } catch {
    return null;
  }
}

function getClientIp(request: NextRequest): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? null;
}

async function detectGeoFromRequest(request: NextRequest): Promise<GeoContext> {
  const fallback: GeoContext = { country: "International", region: "Western Europe/International", cuisine: "International/Mediterranean" };

  // 1. CDN-injected headers (Cloudflare / Vercel) — instant, most reliable
  const cdnCountry = (
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    ""
  ).toUpperCase();
  if (cdnCountry && COUNTRY_GEO[cdnCountry]) return COUNTRY_GEO[cdnCountry];

  // 2. Real IP geolocation via ip-api.com (works with Traefik)
  const ip = getClientIp(request);
  if (ip) {
    const code = await resolveCountryFromIp(ip);
    if (code && COUNTRY_GEO[code]) return COUNTRY_GEO[code];
    // Unknown country code but we have a code — return International
    if (code) return fallback;
  }

  // 3. Last resort: Accept-Language (unreliable for travelers, but better than nothing)
  const al = (request.headers.get("accept-language") ?? "").toLowerCase();
  if (al.startsWith("el")) return COUNTRY_GEO.GR;
  if (al.startsWith("ro")) return COUNTRY_GEO.RO;
  if (al.startsWith("hu")) return COUNTRY_GEO.HU;
  if (al.startsWith("fr")) return COUNTRY_GEO.FR;
  if (al.startsWith("de")) return COUNTRY_GEO.DE;
  if (al.startsWith("es")) return COUNTRY_GEO.ES;
  if (al.startsWith("it")) return COUNTRY_GEO.IT;
  if (al.startsWith("pl")) return COUNTRY_GEO.PL;
  if (al.startsWith("cs") || al.startsWith("sk")) return COUNTRY_GEO.CZ;
  if (al.startsWith("tr")) return COUNTRY_GEO.TR;
  if (al.startsWith("pt")) return COUNTRY_GEO.PT;
  if (al.startsWith("bg")) return COUNTRY_GEO.BG;
  if (al.startsWith("hr")) return COUNTRY_GEO.HR;

  return fallback;
}

function buildFromMealPrompt(
  name: string,
  ingredientHints: string[],
  lang: "ro" | "en",
  profile?: UserProfileContext,
  geo?: GeoContext
): string {
  const hintStr = ingredientHints.length > 0
    ? ingredientHints.join(", ")
    : (lang === "ro" ? "ingrediente de bază" : "basic ingredients");

  const tdee = profile ? estimateTDEE(profile) : null;
  const mealCalorieTarget = tdee ? Math.round(tdee * 0.33) : null;

  const profileLines: string[] = [];
  if (profile?.weightKg) profileLines.push(`Weight: ${profile.weightKg} kg`);
  if (profile?.heightCm) profileLines.push(`Height: ${profile.heightCm} cm`);
  if (profile?.age) profileLines.push(`Age: ${profile.age} years`);
  if (profile?.activityLevel) profileLines.push(`Activity level: ${profile.activityLevel}`);
  if (profile?.dietaryPreferences?.length) profileLines.push(`Dietary preferences: ${profile.dietaryPreferences.join(", ")}`);
  if (profile?.intolerances?.length) profileLines.push(`Intolerances (AVOID these ingredients): ${profile.intolerances.join(", ")}`);
  if (tdee) profileLines.push(`Estimated daily caloric need (TDEE): ${tdee} kcal`);
  if (mealCalorieTarget) profileLines.push(`Target calories for this meal: ~${mealCalorieTarget} kcal`);

  const profileSection = profileLines.length > 0
    ? `\nUSER PROFILE:\n${profileLines.map((l) => `- ${l}`).join("\n")}\n`
    : "";

  const geoSection = geo && geo.country !== "International"
    ? `\nUSER LOCATION: ${geo.country} (${geo.region})\nCUISINE CONTEXT: Prefer ${geo.cuisine} cuisine style. Use ingredients and cooking techniques typical for this region. Recipe titles and ingredients should reflect local food culture.\n`
    : "";

  const calorieRule = mealCalorieTarget
    ? `10. Calories must be close to the user's meal target of ~${mealCalorieTarget} kcal (±15%). Adjust portion sizes accordingly.`
    : "10. Calories between 150 and 900. At least 4 ingredients.";

  const intoleranceRule = profile?.intolerances?.length
    ? `11. NEVER use ingredients from the user's intolerance list: ${profile.intolerances.join(", ")}.`
    : "";

  const stepCountNote = `Minimum steps: easy=5, medium=7, hard=9.`;
  const stepFormatNote = mealCalorieTarget
    ? `Each step in Romanian starts with "Pasul N:" and each step in English starts with "Step N:". Steps must be ultra-detailed: specify the exact action (washing, peeling, dicing size), exact heat level (foc mediu-mare / medium-high heat), exact time in minutes, and a visual/sensory cue ("până se rumenește / until golden brown", "până se înmoaie / until tender").`
    : `Each step in Romanian starts with "Pasul N:" and each step in English starts with "Step N:".`;

  return `Ești un bucătar profesionist și nutriționist pentru o platformă bilingvă (română + engleză).
${profileSection}${geoSection}
Utilizatorul a selectat masa: "${name}"${ingredientHints.length > 0 ? `. Ingrediente sugerate: ${hintStr}` : ""}.

${mealCalorieTarget ? `CALCUL PORȚIE: Gramajele ingredientelor trebuie calculate MATEMATIC astfel încât rețeta să atingă exact ~${mealCalorieTarget} kcal (±10%) — necesarul caloric al acestui utilizator pentru o masă principală, bazat pe profilul său fizic (TDEE ${tdee} kcal/zi).` : ""}

REGULI CRITICE — NERESPECTAREA = REȚETA ESTE INVALIDĂ:

INGREDIENTE:
1. Ingredientele_en și ingredients_ro TREBUIE să corespundă exact titlului "${name}" — toate ingredientele cheie din titlu trebuie să apară în listă.
2. Dacă titlul menționează legume → listează EXACT acele legume (minimum 2–3 distincte) cu gramaje realiste.
3. Dacă titlul menționează o proteină (pui, pește, carne, ouă, tofu, leguminoase) → TREBUIE să apară în lista de ingrediente cu gramaj specific.
4. Fiecare ingredient are cantitate realistă (ex: "200", "g") și unitate specifică ("g", "ml", "buc", "linguri") — NICIODATĂ câmp gol.
5. ${intoleranceRule || "Toate ingredientele trebuie să fie ingrediente reale, specifice — NICIODATĂ \"ingrediente\" sau \"alimente\"." }

MOD DE PREPARARE:
6. Fiecare pas TREBUIE să menționeze FIECARE ingredient din listă — niciunul nu poate fi omis.
7. ${stepFormatNote}
8. Pasul de pregătire (Pasul 1): curățare, spălare, tăiere cu dimensiunile exacte (cuburi de 2 cm, fâșii de 0.5 cm etc.).
9. Pașii de gătire: specifica nivelul exact de căldură (foc mic/mediu/mare), temperatura cuptorului în °C și timpul exact în minute.
10. Semnale vizuale și senzoriale obligatorii: "până se rumenește", "până devine translucid", "până se evaporă lichidul".
11. Pasul final: mod de servire, aranjare pe farfurie, garnitură opțională.
12. ${stepCountNote}
${mealCalorieTarget ? `13. Caloriile finale TREBUIE să fie ~${mealCalorieTarget} kcal (±10%). Ajustează gramajele dacă e necesar.` : "13. Calorii între 200 și 900 per porție."}

Generează rețeta COMPLETĂ și ULTRA-DETALIATĂ în AMBELE limbi (română și engleză).

Returnează EXCLUSIV JSON valid — fără markdown, fără text în afara JSON:
{
  "title_en": "Specific English title matching the meal",
  "title_ro": "${name}",
  "category": "breakfast" | "lunch" | "dinner" | "snack",
  "difficulty": "easy" | "medium" | "hard",
  "prep_time_minutes": number,
  "calories": ${mealCalorieTarget ?? "number between 200-900"},
  "macros": {"protein": number, "carbs": number, "fats": number},
  "cuisine": "${geo && geo.country !== "International" ? geo.cuisine.split("/")[0] : "Mediterranean"}" or any other cuisine matching the meal,
  "allergens": ["gluten", "dairy", "..."],
  "tags_en": ["high-protein", "gluten-free", "..."],
  "tags_ro": ["bogat în proteine", "fără gluten", "..."],
  "ingredients_en": [{"name": "Chicken breast", "quantity": "200", "unit": "g"}],
  "ingredients_ro": [{"name": "Piept de pui", "quantity": "200", "unit": "g"}],
  "instructions_en": [
    {"step_index": 1, "text": "Step 1: Ultra-detailed description — wash the spinach under cold running water, pat dry with paper towels, then roughly chop into 3–4 cm pieces."},
    {"step_index": 2, "text": "Step 2: Heat 1 tbsp olive oil in a non-stick pan over medium-high heat (180°C). Add the diced chicken breast and cook for 6–7 minutes, turning once, until golden brown on the outside and no longer pink inside."}
  ],
  "instructions_ro": [
    {"step_index": 1, "text": "Pasul 1: Descriere ultra-detaliată — spală spanacul sub jet de apă rece, tamponează cu prosoape de hârtie, apoi toacă grosier în bucăți de 3–4 cm."},
    {"step_index": 2, "text": "Pasul 2: Încălzește 1 lingură ulei de măsline într-o tigaie non-adezivă la foc mediu-mare (180°C). Adaugă pieptul de pui tăiat cuburi și gătește 6–7 minute, întorcând o dată, până se rumenește la exterior și nu mai este roz la interior."}
  ],
  "substitutions_en": [{"for": "ingredient", "substitute_with": "alternative", "note": "brief note"}],
  "substitutions_ro": [{"for": "ingredient", "substitute_with": "alternativă", "note": "notă scurtă"}],
  "cooking_tips_en": ["Practical tip 1 specific to this recipe", "Tip 2"],
  "cooking_tips_ro": ["Sfat practic 1 specific acestei rețete", "Sfat 2"]
}`;
}

function buildDeterministicRecipe(
  name: string,
  ingredientHints: string[],
  lang: "ro" | "en"
): RecipeLocalized {
  const ingredients = ingredientHints.slice(0, 6).map((hint, i) => ({
    name: hint,
    quantity: i === 0 ? "200" : "100",
    unit: "g",
  }));
  if (ingredients.length === 0) {
    ingredients.push({ name: lang === "ro" ? "ingrediente" : "ingredients", quantity: "200", unit: "g" });
  }

  const steps = lang === "ro"
    ? [
        { step_index: 1, text: "Pregateste si curata toate ingredientele." },
        { step_index: 2, text: "Combina ingredientele conform retetei." },
        { step_index: 3, text: "Gateste la temperatura medie timp de 15-20 minute." },
        { step_index: 4, text: "Serveste cald sau conform preferintelor." },
      ]
    : [
        { step_index: 1, text: "Prepare and clean all ingredients." },
        { step_index: 2, text: "Combine ingredients according to the recipe." },
        { step_index: 3, text: "Cook at medium heat for 15-20 minutes." },
        { step_index: 4, text: "Serve warm or according to preference." },
      ];

  return {
    id: `temp_${Date.now()}`,
    title: name,
    category: "lunch",
    ingredients,
    instructions: steps,
    prepTimeMinutes: 20,
    difficulty: "easy",
    calories: null,
    macros: null,
    cuisine: null,
    tags: null,
    allergens: null,
    substitutions: null,
    cookingTips: null,
    imageUrl: null,
  };
}

type RawFullRecipe = {
  title_en?: string;
  title_ro?: string;
  category?: string;
  difficulty?: string;
  prep_time_minutes?: number;
  calories?: number;
  macros?: { protein: number; carbs: number; fats: number };
  cuisine?: string;
  allergens?: string[];
  tags_en?: string[];
  tags_ro?: string[];
  ingredients_en?: { name: string; quantity: string; unit: string }[];
  ingredients_ro?: { name: string; quantity: string; unit: string }[];
  instructions_en?: { step_index: number; text: string }[];
  instructions_ro?: { step_index: number; text: string }[];
  substitutions_en?: { for: string; substitute_with: string; note: string }[];
  substitutions_ro?: { for: string; substitute_with: string; note: string }[];
  cooking_tips_en?: string[];
  cooking_tips_ro?: string[];
};

function parseFullRecipeResponse(raw: string): RawFullRecipe | null {
  try {
    const cleaned = raw.trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as RawFullRecipe;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = authCookie ? await readSessionToken(authCookie) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: { name?: string; ingredients?: string[]; lang?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }

  const lang = (body.lang === "en" ? "en" : "ro") as "ro" | "en";
  const ingredientHints = Array.isArray(body.ingredients)
    ? (body.ingredients as unknown[]).filter((i): i is string => typeof i === "string")
    : [];

  const userProfile = await getProfileForUser(session.user).catch(() => null);
  const profileContext: UserProfileContext | undefined = userProfile ? {
    weightKg: userProfile.weightKg,
    heightCm: userProfile.heightCm,
    age: userProfile.age,
    activityLevel: userProfile.activityLevel,
    dietaryPreferences: userProfile.dietaryPreferences,
    intolerances: userProfile.intolerances,
  } : undefined;

  const geoContext = await detectGeoFromRequest(request);

  // Normalize for cache lookup (remove diacritics, lowercase)
  function normalizeName(s: string) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  }
  const normalizedName = normalizeName(name);

  // Check if recipe with same name already exists in DB
  const existing = await searchRecipes({ lang, query: name.slice(0, 40), limit: 10 });
  const match = existing.find(
    (r) => normalizeName(r.titleRo) === normalizedName ||
            normalizeName(r.titleEn) === normalizedName
  );
  if (match) {
    // Validate cached recipe — if invalid, delete it and regenerate
    const cacheValidation = validateRecipeItem({
      title_en: match.titleEn,
      title_ro: match.titleRo,
      ingredients_en: match.ingredientsEn,
      ingredients_ro: match.ingredientsRo,
      instructions_en: match.instructionsEn,
      instructions_ro: match.instructionsRo,
      calories: match.calories ?? undefined,
      macros: match.macros ?? undefined,
      prep_time_minutes: match.prepTimeMinutes,
    });

    if (cacheValidation.valid) {
      const localized: RecipeLocalized = {
        id: match.id,
        title: lang === "ro" ? match.titleRo : match.titleEn,
        category: match.category,
        ingredients: lang === "ro" ? match.ingredientsRo : match.ingredientsEn,
        instructions: lang === "ro" ? match.instructionsRo : match.instructionsEn,
        prepTimeMinutes: match.prepTimeMinutes,
        difficulty: match.difficulty,
        calories: match.calories,
        macros: match.macros,
        cuisine: match.cuisine,
        tags: lang === "ro" ? match.tagsRo : match.tagsEn,
        allergens: match.allergens,
        substitutions: lang === "ro" ? match.substitutionsRo : match.substitutionsEn,
        cookingTips: lang === "ro" ? match.cookingTipsRo : match.cookingTipsEn,
        imageUrl: match.imageUrl,
      };
      return NextResponse.json({ recipe: localized, source: "cache" });
    }

    // Invalid cached recipe — delete it silently and fall through to regenerate
    await deleteRecipeById(match.id).catch(() => undefined);
  }

  // Call dedicated recipe AI endpoint (not guidance orchestrator)
  const backendUrl = (
    process.env.BACKEND_INTERNAL_URL || "http://backend:4028"
  ).replace(/\/$/, "");

  let localizedRecipe: RecipeLocalized | null = null;
  let savedId: string | null = null;

  try {
    const prompt = buildFromMealPrompt(name, ingredientHints, lang, profileContext, geoContext);
    const internalSecret = process.env.INTERNAL_SYNC_SECRET;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (internalSecret) headers["x-internal-secret"] = internalSecret;

    const res = await fetch(`${backendUrl}/api/public/recipe/generate`, {
      method: "POST",
      cache: "no-store",
      headers,
      body: JSON.stringify({ prompt, lang }),
      signal: AbortSignal.timeout(55_000),
    });

    if (res.ok) {
      const payload = await res.json().catch(() => null);
      const candidates = [
        payload?.rawText,
      ];

        for (const candidate of candidates) {
          if (typeof candidate !== "string" || candidate.length < 10) continue;
          const parsed = parseFullRecipeResponse(candidate);
          if (!parsed) {
            // Try instruction-only parsing as fallback
            const instrOnly = parseInstructionWorkerResponse(candidate);
            if (instrOnly) {
              const id = `recipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
              const now = new Date().toISOString();
              const basicIngEn = ingredientHints.map((h) => ({ name: h, quantity: "", unit: "" }));
              const basicIngRo = basicIngEn;
              await insertRecipe({
                id,
                titleEn: name,
                titleRo: name,
                category: "lunch",
                ingredientsEn: basicIngEn,
                ingredientsRo: basicIngRo,
                instructionsEn: instrOnly.instructions_en,
                instructionsRo: instrOnly.instructions_ro,
                prepTimeMinutes: 20,
                difficulty: "easy",
                calories: null,
                macros: null,
                cuisine: null,
                tagsEn: null,
                tagsRo: null,
                allergens: null,
                substitutionsEn: instrOnly.substitutions_en.length > 0 ? instrOnly.substitutions_en : null,
                substitutionsRo: instrOnly.substitutions_ro.length > 0 ? instrOnly.substitutions_ro : null,
                cookingTipsEn: instrOnly.cooking_tips_en.length > 0 ? instrOnly.cooking_tips_en : null,
                cookingTipsRo: instrOnly.cooking_tips_ro.length > 0 ? instrOnly.cooking_tips_ro : null,
                imageUrl: null,
              });
              savedId = id;
              localizedRecipe = {
                id,
                title: name,
                category: "lunch",
                ingredients: lang === "ro" ? basicIngRo : basicIngEn,
                instructions: lang === "ro" ? instrOnly.instructions_ro : instrOnly.instructions_en,
                prepTimeMinutes: 20,
                difficulty: "easy",
                calories: null,
                macros: null,
                cuisine: null,
                tags: null,
                allergens: null,
                substitutions: lang === "ro"
                  ? (instrOnly.substitutions_ro.length > 0 ? instrOnly.substitutions_ro : null)
                  : (instrOnly.substitutions_en.length > 0 ? instrOnly.substitutions_en : null),
                cookingTips: lang === "ro"
                  ? (instrOnly.cooking_tips_ro.length > 0 ? instrOnly.cooking_tips_ro : null)
                  : (instrOnly.cooking_tips_en.length > 0 ? instrOnly.cooking_tips_en : null),
                imageUrl: null,
              };
              break;
            }
            continue;
          }

          // Full recipe parsed
          const VALID_CATEGORIES = ["breakfast", "lunch", "dinner", "snack"] as const;
          const VALID_DIFF = ["easy", "medium", "hard"] as const;
          const category = VALID_CATEGORIES.includes(parsed.category as typeof VALID_CATEGORIES[number])
            ? (parsed.category as typeof VALID_CATEGORIES[number])
            : "lunch";
          const difficulty = VALID_DIFF.includes(parsed.difficulty as typeof VALID_DIFF[number])
            ? (parsed.difficulty as typeof VALID_DIFF[number])
            : "easy";

          const ingEn = Array.isArray(parsed.ingredients_en) ? parsed.ingredients_en : ingredientHints.map((h) => ({ name: h, quantity: "", unit: "" }));
          const ingRo = Array.isArray(parsed.ingredients_ro) ? parsed.ingredients_ro : ingEn;
          const instrEn = Array.isArray(parsed.instructions_en) ? parsed.instructions_en : [];
          const instrRo = Array.isArray(parsed.instructions_ro) ? parsed.instructions_ro : [];
          const subsEn = Array.isArray(parsed.substitutions_en) ? parsed.substitutions_en : [];
          const subsRo = Array.isArray(parsed.substitutions_ro) ? parsed.substitutions_ro : [];
          const tipsEn = Array.isArray(parsed.cooking_tips_en) ? parsed.cooking_tips_en : [];
          const tipsRo = Array.isArray(parsed.cooking_tips_ro) ? parsed.cooking_tips_ro : [];

          const id = `recipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          await insertRecipe({
            id,
            titleEn: parsed.title_en || name,
            titleRo: parsed.title_ro || name,
            category,
            ingredientsEn: ingEn,
            ingredientsRo: ingRo,
            instructionsEn: instrEn,
            instructionsRo: instrRo,
            prepTimeMinutes: parsed.prep_time_minutes ?? 20,
            difficulty,
            calories: parsed.calories ?? null,
            macros: parsed.macros ?? null,
            cuisine: parsed.cuisine ?? null,
            tagsEn: parsed.tags_en ?? null,
            tagsRo: parsed.tags_ro ?? null,
            allergens: parsed.allergens ?? null,
            substitutionsEn: subsEn.length > 0 ? subsEn : null,
            substitutionsRo: subsRo.length > 0 ? subsRo : null,
            cookingTipsEn: tipsEn.length > 0 ? tipsEn : null,
            cookingTipsRo: tipsRo.length > 0 ? tipsRo : null,
            imageUrl: null,
          });
          savedId = id;
          localizedRecipe = {
            id,
            title: lang === "ro" ? (parsed.title_ro || name) : (parsed.title_en || name),
            category,
            ingredients: lang === "ro" ? ingRo : ingEn,
            instructions: lang === "ro" ? instrRo : instrEn,
            prepTimeMinutes: parsed.prep_time_minutes ?? 20,
            difficulty,
            calories: parsed.calories ?? null,
            macros: parsed.macros ?? null,
            cuisine: parsed.cuisine ?? null,
            tags: lang === "ro" ? (parsed.tags_ro ?? null) : (parsed.tags_en ?? null),
            allergens: parsed.allergens ?? null,
            substitutions: lang === "ro" ? (subsRo.length > 0 ? subsRo : null) : (subsEn.length > 0 ? subsEn : null),
            cookingTips: lang === "ro" ? (tipsRo.length > 0 ? tipsRo : null) : (tipsEn.length > 0 ? tipsEn : null),
            imageUrl: null,
          };
          break;
        }
      }
  } catch {
    // AI endpoint unavailable
  }

  if (!localizedRecipe) {
    const msg = lang === "ro"
      ? "Nu am putut genera rețeta acum. Verifică că orchestratorul AI este configurat și încearcă din nou."
      : "Could not generate the recipe right now. Please check the AI orchestrator configuration and try again.";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  return NextResponse.json({ recipe: localizedRecipe, source: savedId ? "generated" : "cache" });
}
