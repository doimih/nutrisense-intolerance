import "server-only";
import { createHash } from "node:crypto";
import type { GuidanceResult, MealExample, MonitoringContextItem } from "@/types/guidance";
import type { Intolerance } from "@/types/profile";
import type { GuidanceGenerateInput, PlanTier } from "@/lib/server/guidance/types";

const DISALLOWED_PATTERNS = [
  /\bdiagnostic\b/gi,
  /\bdiagno(s|z)a\b/gi,
  /\btratament\b/gi,
  /\bmedicament\b/gi,
  /\bsupliment\b/gi,
  /\bprescri\w*\b/gi,
  /\bboala\b/gi,
  /\bcura\b/gi,
];

const ABSOLUTE_PATTERNS = [
  /\bintotdeauna\b/gi,
  /\bnever\b/gi,
  /\balways\b/gi,
  /\bgarantat\b/gi,
  /\bcert\b/gi,
  /\b100%\b/gi,
];

function sanitizeLine(line: string, lang: "ro" | "en"): string {
  let value = line;
  for (const pattern of DISALLOWED_PATTERNS) {
    value = value.replace(pattern, "");
  }
  for (const pattern of ABSOLUTE_PATTERNS) {
    value = value.replace(pattern, lang === "ro" ? "probabil" : "likely");
  }
  return value.replace(/\s{2,}/g, " ").trim();
}

function sanitizeStringArray(items: string[], lang: "ro" | "en"): string[] {
  return items.map((item) => sanitizeLine(item, lang)).filter(Boolean);
}

function foodCounts(entries: MonitoringContextItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const food of entry.consumedFoods) {
      const key = food.trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return counts;
}

function symptomWeightedFoods(entries: MonitoringContextItem[]): Map<string, number> {
  const weighted = new Map<string, number>();
  for (const entry of entries) {
    const weight = Math.max(1, entry.symptomsIntensity || 0);
    if (entry.symptoms.length === 0) continue;
    for (const food of entry.consumedFoods) {
      const key = food.trim().toLowerCase();
      if (!key) continue;
      weighted.set(key, (weighted.get(key) || 0) + weight);
    }
  }
  return weighted;
}

function topItems(map: Map<string, number>, limit: number): string[] {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([item]) => item);
}

// Foods appearing in entries where symptoms arrived 30 min–48 h after eating
function delayedReactionFoods(entries: MonitoringContextItem[]): Map<string, number> {
  const scores = new Map<string, number>();
  for (const entry of entries) {
    const latency = entry.reactionLatencyMinutes;
    if (latency === null || latency === undefined) continue;
    if (latency < 30 || latency > 2880) continue;
    if (entry.symptoms.length === 0) continue;
    const weight = Math.max(1, entry.symptomsIntensity || 1);
    for (const food of entry.consumedFoods) {
      const key = food.trim().toLowerCase();
      if (!key) continue;
      scores.set(key, (scores.get(key) || 0) + weight);
    }
  }
  return scores;
}

type FoodCombo = { foods: [string, string]; score: number };

// Food pairs that co-occur in entries with symptoms (min 2 co-occurrences)
function foodCombinationRisks(entries: MonitoringContextItem[]): FoodCombo[] {
  const pairScores = new Map<string, FoodCombo>();
  for (const entry of entries) {
    if (entry.symptoms.length === 0) continue;
    const weight = Math.max(1, entry.symptomsIntensity || 1);
    const foods = Array.from(new Set(entry.consumedFoods.map((f) => f.trim().toLowerCase()).filter(Boolean)));
    for (let i = 0; i < foods.length; i++) {
      for (let j = i + 1; j < foods.length; j++) {
        const key = [foods[i], foods[j]].sort().join("||");
        const existing = pairScores.get(key);
        if (existing) {
          existing.score += weight;
        } else {
          pairScores.set(key, { foods: [foods[i], foods[j]], score: weight });
        }
      }
    }
  }
  return Array.from(pairScores.values())
    .filter((p) => p.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function dataConfidenceLabel(count: number, lang: "ro" | "en"): string | null {
  if (count < 5) {
    return lang === "ro"
      ? `Date insuficiente: ${count} intrare${count === 1 ? "" : "i"} înregistrate. Adaugă cel puțin 5 mese pentru primele corelații.`
      : `Insufficient data: ${count} entr${count === 1 ? "y" : "ies"} logged. Add at least 5 meals for first correlations.`;
  }
  if (count < 15) {
    return lang === "ro"
      ? `Date în curs de acumulare (${count} intrări). Corelațiile devin mai precise după 15+ înregistrări.`
      : `Data accumulating (${count} entries). Correlations become more precise after 15+ entries.`;
  }
  return null;
}

type PlanLimits = {
  maxRecommendedFoods: number;
  maxAvoidFoods: number;
  maxMealExamples: number;
  maxTips: number;
  comboAnalysis: boolean;
  advancedPredictions: boolean;
  delayedReactionDetection: boolean;
};

function getPlanLimits(planTier: PlanTier): PlanLimits {
  switch (planTier) {
    case "enterprise":
    case "pro_plus":
      return { maxRecommendedFoods: 15, maxAvoidFoods: 12, maxMealExamples: 7, maxTips: 5, comboAnalysis: true, advancedPredictions: true, delayedReactionDetection: true };
    case "pro":
      return { maxRecommendedFoods: 12, maxAvoidFoods: 10, maxMealExamples: 7, maxTips: 3, comboAnalysis: true, advancedPredictions: false, delayedReactionDetection: false };
    case "basic":
      return { maxRecommendedFoods: 8, maxAvoidFoods: 6, maxMealExamples: 7, maxTips: 2, comboAnalysis: false, advancedPredictions: false, delayedReactionDetection: false };
    default:
      return { maxRecommendedFoods: 4, maxAvoidFoods: 3, maxMealExamples: 7, maxTips: 1, comboAnalysis: false, advancedPredictions: false, delayedReactionDetection: false };
  }
}

function buildMealExamples(lang: "ro" | "en", recommendedFoods: string[], count: number): MealExample[] {
  const allMeals: MealExample[] = lang === "ro"
    ? [
        {
          name: "Luni - masa echilibrata",
          ingredients: recommendedFoods.slice(0, 3).length > 0 ? recommendedFoods.slice(0, 3) : ["orez", "legume", "proteina slaba"],
          notes: "Portie moderata, ritm lent, observa simptomele in primele 120 minute.",
        },
        {
          name: "Marti - masa usoara",
          ingredients: recommendedFoods.slice(3, 6).length > 0 ? recommendedFoods.slice(3, 6) : ["cartof dulce", "salata verde", "peste"],
          notes: "Evita combinatiile multiple noi in aceeasi zi.",
        },
        {
          name: "Miercuri - masa personalizata",
          ingredients: recommendedFoods.slice(6, 9).length > 0 ? recommendedFoods.slice(6, 9) : ["quinoa", "broccoli", "pui la gratar"],
          notes: "Plan adaptat profilului tau alimentar. Ajusteaza portiile treptat.",
        },
        {
          name: "Joi - masa proteica",
          ingredients: recommendedFoods.slice(2, 5).length > 0 ? recommendedFoods.slice(2, 5) : ["linte", "spanac", "ou fiert"],
          notes: "Zi buna pentru a introduce un ingredient nou. Monitorizeaza reactiile la 2h si 6h.",
        },
        {
          name: "Vineri - masa de recuperare",
          ingredients: recommendedFoods.slice(0, 2).length > 0 ? [...recommendedFoods.slice(0, 2), "morcovi"] : ["morcovi", "orez", "pui fiert"],
          notes: "Mese simple la sfarsit de saptamana. Favorizeaza ingredientele deja testate.",
        },
        {
          name: "Sambata - masa diversificata",
          ingredients: recommendedFoods.slice(4, 7).length > 0 ? recommendedFoods.slice(4, 7) : ["ovaz", "fructe de padure", "seminte de in"],
          notes: "Zi potrivita pentru retete noi. Pastreaza portiile moderate.",
        },
        {
          name: "Duminica - masa de baza",
          ingredients: recommendedFoods.slice(1, 4).length > 0 ? recommendedFoods.slice(1, 4) : ["hrisca", "dovlecel", "somon la gratar"],
          notes: "Analiza saptamanala: compara cum te-ai simtit dupa fiecare masa si noteaza in jurnal.",
        },
      ]
    : [
        {
          name: "Monday - balanced meal",
          ingredients: recommendedFoods.slice(0, 3).length > 0 ? recommendedFoods.slice(0, 3) : ["rice", "vegetables", "lean protein"],
          notes: "Moderate portion, slow pace, observe symptoms in the first 120 minutes.",
        },
        {
          name: "Tuesday - light meal",
          ingredients: recommendedFoods.slice(3, 6).length > 0 ? recommendedFoods.slice(3, 6) : ["sweet potato", "green salad", "fish"],
          notes: "Avoid introducing multiple new combinations on the same day.",
        },
        {
          name: "Wednesday - personalized meal",
          ingredients: recommendedFoods.slice(6, 9).length > 0 ? recommendedFoods.slice(6, 9) : ["quinoa", "broccoli", "grilled chicken"],
          notes: "Adapted to your food profile. Adjust portions gradually.",
        },
        {
          name: "Thursday - protein meal",
          ingredients: recommendedFoods.slice(2, 5).length > 0 ? recommendedFoods.slice(2, 5) : ["lentils", "spinach", "boiled egg"],
          notes: "Good day to introduce a new ingredient. Monitor reactions at 2h and 6h.",
        },
        {
          name: "Friday - recovery meal",
          ingredients: recommendedFoods.slice(0, 2).length > 0 ? [...recommendedFoods.slice(0, 2), "carrots"] : ["carrots", "rice", "boiled chicken"],
          notes: "Simple meals at the end of the week. Favor already-tested ingredients.",
        },
        {
          name: "Saturday - diverse meal",
          ingredients: recommendedFoods.slice(4, 7).length > 0 ? recommendedFoods.slice(4, 7) : ["oats", "berries", "flaxseeds"],
          notes: "Good day for new recipes. Keep portions moderate.",
        },
        {
          name: "Sunday - base meal",
          ingredients: recommendedFoods.slice(1, 4).length > 0 ? recommendedFoods.slice(1, 4) : ["buckwheat", "zucchini", "grilled salmon"],
          notes: "Weekly review: compare how you felt after each meal and log it in your journal.",
        },
      ];
  return allMeals.slice(0, Math.max(1, count));
}

function baseAvoidByIntolerance(intolerances: Intolerance[], lang: "ro" | "en"): string[] {
  const items: string[] = [];
  if (intolerances.includes("gluten")) {
    items.push(lang === "ro" ? "paine alba" : "white bread");
  }
  if (intolerances.includes("lactoza")) {
    items.push(lang === "ro" ? "lapte integral" : "whole milk");
  }
  if (intolerances.includes("histamina")) {
    items.push(lang === "ro" ? "alimente fermentate" : "fermented foods");
  }
  if (intolerances.includes("nuci")) {
    items.push(lang === "ro" ? "mix de nuci" : "mixed nuts");
  }
  if (intolerances.includes("fodmap")) {
    items.push(lang === "ro" ? "ceapa cruda" : "raw onion");
  }
  if (intolerances.includes("fructoza")) {
    items.push(lang === "ro" ? "sirop de porumb" : "high-fructose syrup");
  }
  if (intolerances.includes("sorbitol")) {
    items.push(lang === "ro" ? "guma fara zahar" : "sugar-free gum");
  }
  if (intolerances.includes("ou")) {
    items.push(lang === "ro" ? "omleta" : "omelet");
  }
  if (intolerances.includes("soia")) {
    items.push(lang === "ro" ? "lapte de soia" : "soy milk");
  }
  if (intolerances.includes("peste")) {
    items.push(lang === "ro" ? "peste gras" : "fatty fish");
  }
  if (intolerances.includes("crustacee")) {
    items.push(lang === "ro" ? "creveti" : "shrimp");
  }
  if (intolerances.includes("proteina-lapte")) {
    items.push(lang === "ro" ? "lapte de vaca" : "cow's milk");
  }
  if (intolerances.includes("solanacee")) {
    items.push(
      ...(lang === "ro"
        ? ["rosii", "ardei", "vinete", "cartofi"]
        : ["tomatoes", "peppers", "eggplant", "potatoes"])
    );
  }
  return items;
}

function dietaryAvoidBySinglePreference(preference: string, lang: "ro" | "en"): string[] {
  if (preference === "vegan") {
    return lang === "ro"
      ? ["carne rosie", "oua", "branzeturi"]
      : ["red meat", "eggs", "cheese"];
  }
  if (preference === "vegetarian") {
    return lang === "ro"
      ? ["carne rosie", "pui", "peste"]
      : ["red meat", "chicken", "fish"];
  }
  if (preference === "low-carb") {
    return lang === "ro"
      ? ["paine", "paste", "bauturi indulcite"]
      : ["bread", "pasta", "sweetened drinks"];
  }
  if (preference === "gluten-free") {
    return lang === "ro" ? ["grau", "orz", "secara"] : ["wheat", "barley", "rye"];
  }
  if (preference === "dairy-free") {
    return lang === "ro"
      ? ["lapte integral", "iaurt clasic", "smantana"]
      : ["whole milk", "regular yogurt", "cream"];
  }
  return [];
}

function dietaryAvoidByPreference(
  preferences: GuidanceGenerateInput["dietaryPreferences"],
  lang: "ro" | "en"
): string[] {
  const all: string[] = [];
  for (const pref of preferences) {
    all.push(...dietaryAvoidBySinglePreference(pref, lang));
  }
  return Array.from(new Set(all));
}

function defaultsBySinglePreference(preference: string, lang: "ro" | "en"): string[] {
  if (preference === "vegan") {
    return lang === "ro"
      ? ["quinoa", "linte", "tofu", "broccoli"]
      : ["quinoa", "lentils", "tofu", "broccoli"];
  }
  if (preference === "vegetarian") {
    return lang === "ro"
      ? ["linte", "naut", "iaurt fara lactoza", "spanac"]
      : ["lentils", "chickpeas", "lactose-free yogurt", "spinach"];
  }
  if (preference === "low-carb") {
    return lang === "ro"
      ? ["somon", "avocado", "dovlecel", "oua"]
      : ["salmon", "avocado", "zucchini", "eggs"];
  }
  if (preference === "gluten-free") {
    return lang === "ro"
      ? ["orez", "hrisca", "cartof dulce", "pui la gratar"]
      : ["rice", "buckwheat", "sweet potato", "grilled chicken"];
  }
  if (preference === "dairy-free") {
    return lang === "ro"
      ? ["ovaz", "lapte de migdale", "curcan", "morcovi"]
      : ["oats", "almond milk", "turkey", "carrots"];
  }
  return [];
}

function defaultsByPreference(
  preferences: GuidanceGenerateInput["dietaryPreferences"],
  lang: "ro" | "en"
): string[] {
  const all: string[] = [];
  for (const pref of preferences) {
    all.push(...defaultsBySinglePreference(pref, lang));
  }
  const unique = Array.from(new Set(all));
  if (unique.length > 0) return unique;
  return lang === "ro"
    ? ["orez", "dovlecel", "morcovi", "peste slab"]
    : ["rice", "zucchini", "carrots", "lean fish"];
}

export function buildGuidancePrompt(input: GuidanceGenerateInput): string {
  const lines: string[] = [];
  lines.push("SYSTEM: You generate non-medical food sensitivity guidance.");
  lines.push("RULES: no diagnosis, no treatment, no drugs, no supplements, no restrictive diets, no absolutes.");
  lines.push(`LANG: ${input.lang}`);
  lines.push(`SUBSCRIPTION_TIER: ${input.subscriptionTier}`);
  lines.push(`DETAIL_LEVEL: ${input.detailLevel}`);
  lines.push(`DIETARY_PREFERENCES: ${input.dietaryPreferences.join(",") || input.dietaryPreference}`);
  lines.push(`INTOLERANCES: ${input.intolerances.join(",") || "none"}`);

  if (input.physicalProfile) {
    const p = input.physicalProfile;
    const parts: string[] = [];
    if (p.age) parts.push(`age:${p.age}`);
    if (p.heightCm) parts.push(`height:${p.heightCm}cm`);
    if (p.weightKg) parts.push(`weight:${p.weightKg}kg`);
    if (p.activityLevel) parts.push(`activity:${p.activityLevel}`);
    if (parts.length > 0) lines.push(`PHYSICAL_PROFILE: ${parts.join(", ")}`);
  }

  lines.push("MONITORING_ENTRIES:");
  for (const entry of input.monitoringEntries.slice(0, 40)) {
    lines.push(
      JSON.stringify({
        date: entry.date,
        hour: entry.hour,
        foods: entry.consumedFoods,
        symptoms: entry.symptoms,
        intensity: entry.symptomsIntensity,
        latency: entry.reactionLatencyMinutes,
        wellbeing: entry.wellbeing,
      })
    );
  }

  if (input.previousGuidance && input.previousGuidance.length > 0) {
    lines.push("PREVIOUS_RECOMMENDATIONS:");
    for (const prev of input.previousGuidance) {
      lines.push(JSON.stringify({
        date: prev.generatedAt,
        recommended: prev.recommendedFoods.slice(0, 5),
        avoid: prev.avoidFoods.slice(0, 5),
      }));
    }
  }

  if (input.previousMealExamples && input.previousMealExamples.length > 0) {
    lines.push("PREVIOUS_MEAL_EXAMPLES (diversifica - nu repeta exact aceste retete):");
    for (const meal of input.previousMealExamples.slice(0, 20)) {
      lines.push(JSON.stringify({ name: meal.name, ingredients: meal.ingredients }));
    }
  }

  lines.push("DIVERSITATE_RETETE: Genereaza retete complet diferite de cele anterioare. Variaza bucatariile (mediteraneana, asiatica, romaneasca, mexicana etc.), metodele de preparare (fiert, copt, la gratar, fiert abur) si ingredientele principale. Obiectiv: cel putin 100 retete unice in timp.");
  lines.push("OUTPUT_SCHEMA: recommendedFoods[], avoidFoods[], mealExamples[], generalTips[], disclaimer");
  return lines.join("\n");
}

function applyDetailLevelToLimits(limits: PlanLimits, detailLevel: string): PlanLimits {
  if (detailLevel === 'comprehensive') {
    return {
      ...limits,
      maxRecommendedFoods: Math.max(limits.maxRecommendedFoods, 12),
      maxAvoidFoods: Math.max(limits.maxAvoidFoods, 8),
      maxMealExamples: 7,
      maxTips: Math.max(limits.maxTips, 5),
    };
  }
  if (detailLevel === 'detailed') {
    return {
      ...limits,
      maxRecommendedFoods: Math.max(limits.maxRecommendedFoods, 8),
      maxAvoidFoods: Math.max(limits.maxAvoidFoods, 5),
      maxMealExamples: 7,
      maxTips: Math.max(limits.maxTips, 3),
    };
  }
  // basic — use plan limits as-is
  return limits;
}

export function runDeterministicGuidance(input: GuidanceGenerateInput): GuidanceResult {
  const entries = input.monitoringEntries;
  const limits = applyDetailLevelToLimits(getPlanLimits(input.planTier), input.detailLevel);

  const frequentFoods = topItems(foodCounts(entries), limits.maxRecommendedFoods);
  const highRiskFoods = topItems(symptomWeightedFoods(entries), limits.maxAvoidFoods);

  // Delayed reaction analysis (pro / pro_plus only)
  const delayedRisk = limits.delayedReactionDetection
    ? topItems(delayedReactionFoods(entries), Math.ceil(limits.maxAvoidFoods / 2))
    : [];

  // Combination risk analysis (pro / pro_plus only)
  const combos = limits.comboAnalysis ? foodCombinationRisks(entries) : [];

  const avoidSeed = new Set<string>([
    ...baseAvoidByIntolerance(input.intolerances, input.lang),
    ...dietaryAvoidByPreference(input.dietaryPreferences, input.lang),
    ...highRiskFoods,
    ...delayedRisk,
  ]);

  const recommendedSeed = new Set<string>(
    frequentFoods.filter((food) => !avoidSeed.has(food)).slice(0, limits.maxRecommendedFoods)
  );

  if (recommendedSeed.size === 0) {
    const defaults = defaultsByPreference(input.dietaryPreferences, input.lang);
    for (const item of defaults) recommendedSeed.add(item);
  }

  // Data confidence warning (threshold: < 5 entries)
  const confidenceNote = dataConfidenceLabel(entries.length, input.lang);

  const warnings: string[] = [];
  if (confidenceNote) warnings.push(confidenceNote);
  warnings.push(
    ...(input.lang === "ro"
      ? [
          "Corelatiile sunt orientative si depind de consecventa jurnalului.",
          "Testeaza ajustarile in pasi mici, pe intervale de 2-3 zile.",
        ]
      : [
          "Correlations are indicative and depend on journal consistency.",
          "Test adjustments in small steps over 2-3 day windows.",
        ])
  );

  // Combination tips from detected risky pairs
  const comboTips = combos.slice(0, 2).map((c) =>
    input.lang === "ro"
      ? `Combinație detectată: ${c.foods[0]} + ${c.foods[1]} — a apărut repetat cu simptome.`
      : `Detected combination: ${c.foods[0]} + ${c.foods[1]} — appeared repeatedly with symptoms.`
  );

  const allTips = input.lang === "ro"
    ? [
        "Prioritizeaza mesele simple cu putine ingrediente noi.",
        "Observa reactiile intarziate la 2h, 6h si 24h.",
        "Daca intensitatea depaseste frecvent 7/10, solicita evaluare medicala.",
        ...comboTips,
        ...(limits.delayedReactionDetection && delayedRisk.length > 0
          ? [`Reactii intarziate detectate (30–48h) pentru: ${delayedRisk.slice(0, 3).join(", ")}.`]
          : []),
      ]
    : [
        "Prioritize simple meals with few new ingredients.",
        "Observe delayed reactions at 2h, 6h, and 24h.",
        "If intensity often exceeds 7/10, seek medical evaluation.",
        ...comboTips,
        ...(limits.delayedReactionDetection && delayedRisk.length > 0
          ? [`Delayed reactions detected (30–48h) for: ${delayedRisk.slice(0, 3).join(", ")}.`]
          : []),
      ];

  const result: GuidanceResult = {
    id: `guidance_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    generatedAt: new Date().toISOString(),
    intolerances: input.intolerances,
    dietaryPreference: input.dietaryPreferences[0] ?? input.dietaryPreference,
    detailLevel: input.detailLevel,
    recommendedFoods: sanitizeStringArray(Array.from(recommendedSeed).slice(0, limits.maxRecommendedFoods), input.lang),
    avoidFoods: sanitizeStringArray(Array.from(avoidSeed).slice(0, limits.maxAvoidFoods), input.lang),
    mealExamples: buildMealExamples(input.lang, Array.from(recommendedSeed), limits.maxMealExamples),
    generalTips: sanitizeStringArray(allTips.slice(0, limits.maxTips), input.lang),
    disclaimer:
      input.lang === "ro"
        ? "Aceste recomandari descriu probabilitati si corelatii observate in jurnal si nu reprezinta sfat medical."
        : "These recommendations describe probabilities and journal correlations and are not medical advice.",
    warnings,
    source: "ai",
  };

  return sanitizeGuidanceResult(result, input.lang);
}

export function sanitizeGuidanceResult(result: GuidanceResult, lang: "ro" | "en"): GuidanceResult {
  return {
    ...result,
    recommendedFoods: sanitizeStringArray(result.recommendedFoods, lang),
    avoidFoods: sanitizeStringArray(result.avoidFoods, lang),
    generalTips: sanitizeStringArray(result.generalTips, lang),
    mealExamples: result.mealExamples.map((meal) => ({
      ...meal,
      name: sanitizeLine(meal.name, lang),
      ingredients: sanitizeStringArray(meal.ingredients, lang),
      notes: meal.notes ? sanitizeLine(meal.notes, lang) : undefined,
    })),
    disclaimer: sanitizeLine(result.disclaimer, lang),
    warnings: result.warnings ? sanitizeStringArray(result.warnings, lang) : undefined,
  };
}

export function guidanceFingerprint(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
