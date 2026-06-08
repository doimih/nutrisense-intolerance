import "server-only";
import { createHash } from "node:crypto";
import type { GuidanceResult, MealExample, MonitoringContextItem } from "@/types/guidance";
import type { Intolerance } from "@/types/profile";
import type { GuidanceGenerateInput } from "@/lib/server/guidance/types";

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

function buildMealExamples(lang: "ro" | "en", recommendedFoods: string[]): MealExample[] {
  const first = recommendedFoods.slice(0, 3);
  const second = recommendedFoods.slice(3, 6);
  if (lang === "ro") {
    return [
      {
        name: "Masa 1 - varianta echilibrata",
        ingredients: first.length > 0 ? first : ["orez", "legume", "proteina slaba"],
        notes: "Portie moderata, ritm lent, observatie simptome in primele 120 minute.",
      },
      {
        name: "Masa 2 - varianta usoara",
        ingredients: second.length > 0 ? second : ["cartof dulce", "salata verde", "peste"],
        notes: "Evita combinatiile multiple noi in aceeasi zi.",
      },
    ];
  }

  return [
    {
      name: "Meal 1 - balanced option",
      ingredients: first.length > 0 ? first : ["rice", "vegetables", "lean protein"],
      notes: "Moderate portion, slow pace, observe symptoms in the first 120 minutes.",
    },
    {
      name: "Meal 2 - light option",
      ingredients: second.length > 0 ? second : ["sweet potato", "green salad", "fish"],
      notes: "Avoid introducing multiple new combinations on the same day.",
    },
  ];
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
  return items;
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
  const frequentFoods = topItems(foodCounts(entries), 8);
  const highRiskFoods = topItems(symptomWeightedFoods(entries), 8);

  const avoidSeed = new Set<string>([
    ...baseAvoidByIntolerance(input.intolerances, input.lang),
    ...highRiskFoods,
  ]);

  const recommendedSeed = new Set<string>(
    frequentFoods.filter((food) => !avoidSeed.has(food)).slice(0, 8)
  );

  if (recommendedSeed.size === 0) {
    const defaults = input.lang === "ro"
      ? ["orez", "dovlecel", "morcovi", "peste slab"]
      : ["rice", "zucchini", "carrots", "lean fish"];
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

  const tips = input.lang === "ro"
    ? [
        "Prioritizeaza mesele simple cu putine ingrediente noi.",
        "Observa reactiile intarziate la 2h, 6h si 24h.",
        "Daca intensitatea depaseste frecvent 7/10, solicita evaluare medicala.",
      ]
    : [
        "Prioritize simple meals with few new ingredients.",
        "Observe delayed reactions at 2h, 6h, and 24h.",
        "If intensity often exceeds 7/10, seek medical evaluation.",
      ];

  const trimmedTips = input.subscriptionTier === "active" ? tips : tips.slice(0, 2);

  const result: GuidanceResult = {
    id: `guidance_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    generatedAt: new Date().toISOString(),
    intolerances: input.intolerances,
    dietaryPreference: input.dietaryPreference,
    detailLevel: input.detailLevel,
    recommendedFoods: sanitizeStringArray(Array.from(recommendedSeed).slice(0, 8), input.lang),
    avoidFoods: sanitizeStringArray(Array.from(avoidSeed).slice(0, 8), input.lang),
    mealExamples: buildMealExamples(input.lang, Array.from(recommendedSeed)),
    generalTips: sanitizeStringArray(trimmedTips, input.lang),
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
