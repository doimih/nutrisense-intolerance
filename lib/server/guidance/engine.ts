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
    case "pro_plus":
      return { maxRecommendedFoods: 15, maxAvoidFoods: 12, maxMealExamples: 4, maxTips: 5, comboAnalysis: true, advancedPredictions: true, delayedReactionDetection: true };
    case "pro":
      return { maxRecommendedFoods: 12, maxAvoidFoods: 10, maxMealExamples: 3, maxTips: 3, comboAnalysis: true, advancedPredictions: false, delayedReactionDetection: false };
    case "basic":
      return { maxRecommendedFoods: 8, maxAvoidFoods: 6, maxMealExamples: 2, maxTips: 2, comboAnalysis: false, advancedPredictions: false, delayedReactionDetection: false };
    default:
      return { maxRecommendedFoods: 4, maxAvoidFoods: 3, maxMealExamples: 1, maxTips: 1, comboAnalysis: false, advancedPredictions: false, delayedReactionDetection: false };
  }
}

function buildMealExamples(lang: "ro" | "en", recommendedFoods: string[], count: number): MealExample[] {
  const allMeals: MealExample[] = lang === "ro"
    ? [
        {
          name: "Masa 1 - varianta echilibrata",
          ingredients: recommendedFoods.slice(0, 3).length > 0 ? recommendedFoods.slice(0, 3) : ["orez", "legume", "proteina slaba"],
          notes: "Portie moderata, ritm lent, observatie simptome in primele 120 minute.",
        },
        {
          name: "Masa 2 - varianta usoara",
          ingredients: recommendedFoods.slice(3, 6).length > 0 ? recommendedFoods.slice(3, 6) : ["cartof dulce", "salata verde", "peste"],
          notes: "Evita combinatiile multiple noi in aceeasi zi.",
        },
        {
          name: "Masa 3 - varianta personalizata",
          ingredients: recommendedFoods.slice(6, 9).length > 0 ? recommendedFoods.slice(6, 9) : ["quinoa", "broccoli", "pui la gratar"],
          notes: "Plan adaptat profilului tau alimentar. Ajusteaza portiile treptat.",
        },
        {
          name: "Masa 4 - ghidare premium",
          ingredients: recommendedFoods.slice(9, 12).length > 0 ? recommendedFoods.slice(9, 12) : ["ovaz", "fructe de padure", "seminte de in"],
          notes: "Analiza extinsa: monitorizare reactii la 2h, 6h si 24h pentru fiecare ingredient nou.",
        },
      ]
    : [
        {
          name: "Meal 1 - balanced option",
          ingredients: recommendedFoods.slice(0, 3).length > 0 ? recommendedFoods.slice(0, 3) : ["rice", "vegetables", "lean protein"],
          notes: "Moderate portion, slow pace, observe symptoms in the first 120 minutes.",
        },
        {
          name: "Meal 2 - light option",
          ingredients: recommendedFoods.slice(3, 6).length > 0 ? recommendedFoods.slice(3, 6) : ["sweet potato", "green salad", "fish"],
          notes: "Avoid introducing multiple new combinations on the same day.",
        },
        {
          name: "Meal 3 - personalized option",
          ingredients: recommendedFoods.slice(6, 9).length > 0 ? recommendedFoods.slice(6, 9) : ["quinoa", "broccoli", "grilled chicken"],
          notes: "Adapted to your food profile. Adjust portions gradually.",
        },
        {
          name: "Meal 4 - premium guidance",
          ingredients: recommendedFoods.slice(9, 12).length > 0 ? recommendedFoods.slice(9, 12) : ["oats", "berries", "flaxseeds"],
          notes: "Extended analysis: monitor reactions at 2h, 6h and 24h for each new ingredient.",
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
  return items;
}

function dietaryAvoidByPreference(
  preference: GuidanceGenerateInput["dietaryPreference"],
  lang: "ro" | "en"
): string[] {
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

function defaultsByPreference(
  preference: GuidanceGenerateInput["dietaryPreference"],
  lang: "ro" | "en"
): string[] {
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
  lines.push(`DIETARY_PREFERENCE: ${input.dietaryPreference}`);
  lines.push(`INTOLERANCES: ${input.intolerances.join(",") || "none"}`);
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
      })
    );
  }
  lines.push("OUTPUT_SCHEMA: recommendedFoods[], avoidFoods[], mealExamples[], generalTips[], disclaimer");
  return lines.join("\n");
}

export function runDeterministicGuidance(input: GuidanceGenerateInput): GuidanceResult {
  const entries = input.monitoringEntries;
  const limits = getPlanLimits(input.planTier);

  const frequentFoods = topItems(foodCounts(entries), limits.maxRecommendedFoods);
  const highRiskFoods = topItems(symptomWeightedFoods(entries), limits.maxAvoidFoods);

  const avoidSeed = new Set<string>([
    ...baseAvoidByIntolerance(input.intolerances, input.lang),
    ...dietaryAvoidByPreference(input.dietaryPreference, input.lang),
    ...highRiskFoods,
  ]);

  const recommendedSeed = new Set<string>(
    frequentFoods.filter((food) => !avoidSeed.has(food)).slice(0, limits.maxRecommendedFoods)
  );

  if (recommendedSeed.size === 0) {
    const defaults = defaultsByPreference(input.dietaryPreference, input.lang);
    for (const item of defaults) recommendedSeed.add(item);
  }

  const warnings = input.lang === "ro"
    ? [
        "Corelatiile sunt orientative si depind de consecventa jurnalului.",
        "Testeaza ajustarile in pasi mici, pe intervale de 2-3 zile.",
      ]
    : [
        "Correlations are indicative and depend on journal consistency.",
        "Test adjustments in small steps over 2-3 day windows.",
      ];

  const allTips = input.lang === "ro"
    ? [
        "Prioritizeaza mesele simple cu putine ingrediente noi.",
        "Observa reactiile intarziate la 2h, 6h si 24h.",
        "Daca intensitatea depaseste frecvent 7/10, solicita evaluare medicala.",
        ...(limits.comboAnalysis ? ["Analiza combinatiilor: evita introducerea simultana a mai mult de 2 alimente noi."] : []),
        ...(limits.delayedReactionDetection ? ["Detectarea reactiilor complexe: inregistreaza simptomele si dupa 24h de la masa."] : []),
      ]
    : [
        "Prioritize simple meals with few new ingredients.",
        "Observe delayed reactions at 2h, 6h, and 24h.",
        "If intensity often exceeds 7/10, seek medical evaluation.",
        ...(limits.comboAnalysis ? ["Combination analysis: avoid introducing more than 2 new foods simultaneously."] : []),
        ...(limits.delayedReactionDetection ? ["Complex delayed reaction detection: log symptoms even 24h after a meal."] : []),
      ];

  const result: GuidanceResult = {
    id: `guidance_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    generatedAt: new Date().toISOString(),
    intolerances: input.intolerances,
    dietaryPreference: input.dietaryPreference,
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
