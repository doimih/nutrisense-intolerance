import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { getSubscriptionSnapshot } from "@/lib/server/subscriptionStore";
import { appendGuidanceRecord, listGuidanceByUser } from "@/lib/server/guidance/store";
import { getProfileForUser } from "@/lib/server/profileStore";
import { listMonitoringEntriesByUser } from "@/lib/server/monitoringStore";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";
import {
  buildGuidancePrompt,
  guidanceFingerprint,
  runDeterministicGuidance,
  sanitizeGuidanceResult,
} from "@/lib/server/guidance/engine";
import { getEffectivePlanTier, tierAllows, cappedDetailLevel } from "@/lib/billing/features";
import { mineSimilarPatterns, deriveUserProblemFromMonitoring } from "@/lib/server/userProblemsStore";
import type { GuidanceGenerateInput, PlanTier, SubscriptionTier } from "@/lib/server/guidance/types";
import type { DetailLevel, GuidanceResult, MealExample, MonitoringContextItem } from "@/types/guidance";
import type { DietaryPreference, Intolerance } from "@/types/profile";

export const runtime = "nodejs";

type GuidanceBody = {
  intolerances?: unknown;
  dietaryPreference?: unknown;
  detailLevel?: unknown;
  monitoringEntries?: unknown;
};

const dedupeCache = new Map<string, { expiresAt: number; resultId: string }>();

type OrchestratorProxyResponse = {
  ok?: boolean;
  orchestrator?: unknown;
  sessionId?: string;
  provider?: string;
  latencyMs?: number;
  error?: string;
};

function isDetailLevel(value: unknown): value is DetailLevel {
  return value === "basic" || value === "detailed" || value === "comprehensive";
}

function isDietaryPreference(value: unknown): value is DietaryPreference {
  return (
    value === "normal" ||
    value === "vegetarian" ||
    value === "vegan" ||
    value === "low-carb" ||
    value === "gluten-free" ||
    value === "dairy-free"
  );
}

function isIntoleranceArray(value: unknown): value is Intolerance[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item === "gluten" ||
        item === "lactoza" ||
        item === "nuci" ||
        item === "histamina" ||
        item === "fructoza" ||
        item === "sulfiti" ||
        item === "fodmap" ||
        item === "sorbitol" ||
        item === "ou" ||
        item === "soia" ||
        item === "peste" ||
        item === "crustacee"
    )
  );
}

function isMonitoringContextItem(value: unknown): value is MonitoringContextItem {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.date === "string" &&
    typeof candidate.hour === "string" &&
    Array.isArray(candidate.consumedFoods) &&
    candidate.consumedFoods.every((item) => typeof item === "string") &&
    Array.isArray(candidate.symptoms) &&
    candidate.symptoms.every((item) => typeof item === "string") &&
    typeof candidate.symptomsIntensity === "number" &&
    (typeof candidate.reactionLatencyMinutes === "number" || candidate.reactionLatencyMinutes === null) &&
    typeof candidate.notes === "string"
  );
}

function normalizeMonitoringEntries(value: unknown): MonitoringContextItem[] {
  if (!Array.isArray(value)) return [];
  const valid = value.filter(isMonitoringContextItem);
  return valid.slice(0, 80);
}

async function toMonitoringContextFromStore(email: string): Promise<MonitoringContextItem[]> {
  const entries = await listMonitoringEntriesByUser(email);
  return entries.slice(0, 80).map((entry) => ({
    date: entry.date,
    hour: entry.mealTime || "unknown",
    consumedFoods: entry.consumedFoods,
    symptoms: entry.symptoms,
    symptomsIntensity: entry.symptomsIntensity,
    reactionLatencyMinutes:
      typeof entry.reactionLatencyMinutes === "number" ? entry.reactionLatencyMinutes : null,
    notes: entry.notes,
  }));
}

function badRequest(error: string): NextResponse {
  return NextResponse.json({ error }, { status: 400 });
}

function getLanguage(request: NextRequest): "ro" | "en" {
  void request;
  return "ro";
}

function resolveSubscriptionTier(status: string): SubscriptionTier {
  if (status === "active" || status === "trialing") return "active";
  if (status === "canceled" || status === "expired") return "expired";
  return "new";
}

function dedupeKey(email: string, fingerprint: string): string {
  return `${email}::${fingerprint}`;
}

function pruneDedupeCache(): void {
  const now = Date.now();
  for (const [key, value] of Array.from(dedupeCache.entries())) {
    if (value.expiresAt <= now) dedupeCache.delete(key);
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function readPath(source: unknown, path: string[]): unknown {
  let node: unknown = source;
  for (const segment of path) {
    if (!node || typeof node !== "object" || Array.isArray(node)) return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  return node;
}

function firstStringArray(source: unknown, candidates: string[][]): string[] {
  for (const path of candidates) {
    const parsed = asStringArray(readPath(source, path));
    if (parsed.length > 0) return parsed;
  }
  return [];
}

function firstString(source: unknown, candidates: string[][], fallback: string): string {
  for (const path of candidates) {
    const value = readPath(source, path);
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return fallback;
}

function toMealExamples(source: unknown, lang: "ro" | "en"): MealExample[] {
  const objectPaths = [
    ["result", "mealExamples"],
    ["orchestrator", "result", "mealExamples"],
    ["orchestrator", "finalResponse", "data", "mealExamples"],
    ["orchestrator", "finalResponse", "data", "meals"],
    ["finalResponse", "data", "mealExamples"],
    ["finalResponse", "data", "meals"],
  ];

  for (const path of objectPaths) {
    const value = readPath(source, path);
    if (!Array.isArray(value)) continue;

    const asObjectMeals = value
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object" && !Array.isArray(item))
      .map((item, idx) => {
        const ingredients = asStringArray(item.ingredients);
        const name = typeof item.name === "string" && item.name.trim().length > 0
          ? item.name
          : lang === "ro"
            ? `Masa ${idx + 1}`
            : `Meal ${idx + 1}`;
        const notes = typeof item.notes === "string" ? item.notes : undefined;
        return { name, ingredients, notes };
      })
      .filter((meal) => meal.ingredients.length > 0);

    if (asObjectMeals.length > 0) return asObjectMeals;

    const asStringMeals = asStringArray(value);
    if (asStringMeals.length > 0) {
      return asStringMeals.slice(0, 3).map((name, idx) => ({
        name: lang === "ro" ? `Masa ${idx + 1}` : `Meal ${idx + 1}`,
        ingredients: [name],
      }));
    }
  }

  return [];
}

function extractGuidanceFromOrchestrator(
  payload: unknown,
  input: GuidanceGenerateInput
): GuidanceResult | null {
  const recommendedFoods = firstStringArray(payload, [
    ["result", "recommendedFoods"],
    ["orchestrator", "result", "recommendedFoods"],
    ["orchestrator", "finalResponse", "data", "recommendedFoods"],
    ["orchestrator", "finalResponse", "data", "safeFoods"],
    ["orchestrator", "finalResponse", "data", "meals"],
    ["finalResponse", "data", "recommendedFoods"],
    ["finalResponse", "data", "safeFoods"],
    ["recommendedFoods"],
  ]);

  const avoidFoods = firstStringArray(payload, [
    ["result", "avoidFoods"],
    ["orchestrator", "result", "avoidFoods"],
    ["orchestrator", "finalResponse", "data", "avoidFoods"],
    ["orchestrator", "finalResponse", "data", "flaggedIngredients"],
    ["orchestrator", "finalResponse", "data", "allergenHits"],
    ["finalResponse", "data", "avoidFoods"],
    ["finalResponse", "data", "flaggedIngredients"],
    ["avoidFoods"],
  ]);

  if (recommendedFoods.length === 0 && avoidFoods.length === 0) {
    return null;
  }

  const generalTips = firstStringArray(payload, [
    ["result", "generalTips"],
    ["orchestrator", "result", "generalTips"],
    ["orchestrator", "finalResponse", "data", "tips"],
    ["orchestrator", "finalResponse", "notes"],
    ["finalResponse", "data", "tips"],
    ["generalTips"],
  ]);

  const disclaimer = firstString(
    payload,
    [
      ["result", "disclaimer"],
      ["orchestrator", "result", "disclaimer"],
      ["orchestrator", "finalResponse", "data", "disclaimer"],
      ["finalResponse", "data", "disclaimer"],
      ["disclaimer"],
    ],
    input.lang === "ro"
      ? "Aceste recomandari sunt orientative si nu reprezinta sfat medical."
      : "These recommendations are indicative and are not medical advice."
  );

  const warnings = firstStringArray(payload, [
    ["result", "warnings"],
    ["orchestrator", "result", "warnings"],
    ["orchestrator", "finalResponse", "data", "warnings"],
    ["warnings"],
  ]);

  const mealExamples = toMealExamples(payload, input.lang);

  return sanitizeGuidanceResult(
    {
      id: `guidance_orchestrator_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      generatedAt: new Date().toISOString(),
      intolerances: input.intolerances,
      dietaryPreference: input.dietaryPreference,
      detailLevel: input.detailLevel,
      recommendedFoods,
      avoidFoods,
      mealExamples,
      generalTips,
      disclaimer,
      warnings: warnings.length > 0 ? warnings : undefined,
      source: "ai",
    },
    input.lang
  );
}

async function runRealOrchestrator(
  input: GuidanceGenerateInput,
  userId: string,
  dbPatterns?: Awaited<ReturnType<typeof mineSimilarPatterns>>
): Promise<GuidanceResult | null> {
  const settings = await getRuntimeSettings();
  const backendUrl = settings.backendUrl?.replace(/\/$/, "");
  if (!backendUrl) return null;

  const userMessage = input.lang === "ro"
    ? "Genereaza recomandari alimentare personalizate, alimente de evitat si exemple de mese pe baza profilului si jurnalului utilizatorului."
    : "Generate personalized food guidance, avoid-food signals, and meal examples using the user profile and monitoring journal.";

  const response = await fetch(`${backendUrl}/api/public/guidance/orchestrate`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-nutriaid-source": "frontend-guidance",
    },
    body: JSON.stringify({
      sessionId: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      userEmail: input.userEmail,
      userMessage,
      lang: input.lang,
      detailLevel: input.detailLevel,
      dietaryPreference: input.dietaryPreference,
      intolerances: input.intolerances,
      monitoringEntries: input.monitoringEntries,
      subscriptionTier: input.subscriptionTier,
      nutritionalGoals: {
        objective: input.detailLevel,
      },
      userProfile: {
        dietType: input.dietaryPreference,
        intolerances: input.intolerances,
        subscriptionTier: input.subscriptionTier,
      },
      databasePatterns: dbPatterns ?? {
        similarCases: [],
        commonTriggers: [],
        commonIngredients: [],
        successfulAdjustments: [],
        improvementPatterns: [],
      },
    }),
    signal: AbortSignal.timeout(45_000),
  });

  const payload = (await response.json().catch(() => ({}))) as OrchestratorProxyResponse;
  if (!response.ok) return null;

  return extractGuidanceFromOrchestrator(payload, input);
}

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = authCookie ? await readSessionToken(authCookie) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: GuidanceBody;
  try {
    body = (await request.json()) as GuidanceBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  if (typeof body.intolerances !== "undefined" && !isIntoleranceArray(body.intolerances)) {
    return badRequest("Invalid intolerances field.");
  }
  if (typeof body.dietaryPreference !== "undefined" && !isDietaryPreference(body.dietaryPreference)) {
    return badRequest("Invalid dietaryPreference field.");
  }
  if (typeof body.detailLevel === "undefined" || !isDetailLevel(body.detailLevel)) {
    return badRequest("Invalid detailLevel field.");
  }

  const lang = getLanguage(request);
  const email = session.user.email.trim().toLowerCase();

  const effectiveTier = await getEffectivePlanTier(email);
  if (!tierAllows(effectiveTier, "basic")) {
    return NextResponse.json({ error: "Plan activ necesar pentru a accesa recomandarile.", code: "plan_required" }, { status: 403 });
  }

  const safeDetailLevel = cappedDetailLevel(effectiveTier, body.detailLevel);

  const [profile, snapshot] = await Promise.all([
    getProfileForUser(session.user),
    getSubscriptionSnapshot(email),
  ]);

  const monitoringFromBody = normalizeMonitoringEntries(body.monitoringEntries);
  const monitoringEntries =
    monitoringFromBody.length > 0
      ? monitoringFromBody
      : await toMonitoringContextFromStore(email);

  const planTier: PlanTier = effectiveTier;
  const subscriptionTier: SubscriptionTier = planTier !== "none" ? "active" : resolveSubscriptionTier(snapshot?.status ?? "none");

  const input: GuidanceGenerateInput = {
    intolerances: isIntoleranceArray(body.intolerances) ? body.intolerances : profile.intolerances,
    dietaryPreference: isDietaryPreference(body.dietaryPreference)
      ? body.dietaryPreference
      : profile.dietaryPreference,
    detailLevel: safeDetailLevel,
    monitoringEntries,
    userEmail: email,
    lang,
    subscriptionTier,
    planTier,
  };

  const prompt = buildGuidancePrompt(input);
  const fingerprint = guidanceFingerprint({
    intolerances: input.intolerances,
    dietaryPreference: input.dietaryPreference,
    detailLevel: input.detailLevel,
    monitoringEntries: input.monitoringEntries,
    tier: input.subscriptionTier,
  });

  pruneDedupeCache();
  const key = dedupeKey(email, fingerprint);
  const cached = dedupeCache.get(key);
  if (cached) {
    const history = await listGuidanceByUser(email);
    const existing = history.find((item) => item.result.id === cached.resultId);
    if (existing) {
      return NextResponse.json({ result: existing.result, deduped: true });
    }
  }

  const startedAt = Date.now();
  let result: GuidanceResult | null = null;

  // Derive/update user's problem profile and mine cross-user patterns in parallel
  const userFoods = monitoringEntries.flatMap((e) => e.consumedFoods);
  const userSymptoms = monitoringEntries.flatMap((e) => e.symptoms);
  const [dbPatterns] = await Promise.all([
    mineSimilarPatterns(email, userSymptoms, userFoods),
    deriveUserProblemFromMonitoring(
      email,
      monitoringEntries.map((e) => ({
        symptoms: e.symptoms,
        consumedFoods: e.consumedFoods,
        symptomsIntensity: e.symptomsIntensity,
        mealTime: e.hour,
      }))
    ).catch(() => undefined),
  ]);

  try {
    result = await runRealOrchestrator(input, session.user.id, dbPatterns);
  } catch {
    result = null;
  }

  if (!result) {
    result = runDeterministicGuidance(input);
    result = {
      ...result,
      source: "fallback",
    };
  }

  await appendGuidanceRecord({
    id: `gh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userEmail: email,
    generatedAt: new Date().toISOString(),
    source: result.source || "ai",
    requestFingerprint: fingerprint,
    prompt,
    monitoringEntries,
    result,
  });

  dedupeCache.set(key, {
    expiresAt: Date.now() + 10_000,
    resultId: result.id,
  });

  return NextResponse.json({
    result,
    meta: {
      latencyMs: Date.now() - startedAt,
      subscriptionTier,
      planTier,
    },
  });
}
