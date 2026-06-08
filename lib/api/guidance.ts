import type {
  GuidanceRequest,
  GuidanceResult,
  GuidanceHistoryEntry,
  MonitoringContextItem,
  MealExample,
} from "@/types/guidance";
import { getIntoleranceLabel } from "@/lib/i18n/labels";
import { listMonitoringEntries } from "@/lib/api/monitoring";
import type { DietaryPreference, Intolerance } from "@/types/profile";

type GuidanceApiError = {
  error?: string;
};

type GuidanceApiResponse = {
  result?: GuidanceResult;
};

type HistoryApiResponse = {
  history?: GuidanceHistoryEntry[];
};

type ExportApiResponse = {
  exportedAt?: string;
  history?: GuidanceResult[];
};

const inFlight = new Map<string, Promise<GuidanceResult>>();

function getCurrentLang(): "ro" | "en" {
  return "ro";
}

function toHour(value?: string): string {
  if (!value) return "unknown";
  if (value.includes("T")) {
    const hour = value.split("T")[1]?.slice(0, 5);
    return hour || "unknown";
  }
  return value.slice(0, 5);
}

function buildMonitoringContextEntries(entries: Awaited<ReturnType<typeof listMonitoringEntries>>): MonitoringContextItem[] {
  return entries.slice(0, 60).map((entry) => ({
    date: entry.date,
    hour: toHour(entry.mealTime || entry.createdAt),
    consumedFoods: entry.consumedFoods,
    symptoms: entry.symptoms,
    symptomsIntensity: entry.symptomsIntensity,
    reactionLatencyMinutes:
      typeof entry.reactionLatencyMinutes === "number" ? entry.reactionLatencyMinutes : null,
    notes: entry.notes,
  }));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isMealExample(value: unknown): value is MealExample {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    isStringArray(candidate.ingredients) &&
    (typeof candidate.notes === "string" || typeof candidate.notes === "undefined")
  );
}

function isDietaryPreference(value: unknown): value is DietaryPreference {
  return (
    value === "normal" ||
    value === "vegetarian" ||
    value === "vegan" ||
    value === "keto" ||
    value === "low-fodmap" ||
    value === "mediterranean" ||
    value === "dairy-free"
  );
}

function isIntolerance(value: unknown): value is Intolerance {
  return (
    value === "gluten" ||
    value === "lactoza" ||
    value === "nuci" ||
    value === "histamina" ||
    value === "fructoza" ||
    value === "sulfiti" ||
    value === "fodmap"
  );
}

function validateGuidanceResult(value: unknown): GuidanceResult {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid AI response payload.");
  }

  const candidate = value as Record<string, unknown>;
  const requiredStringFields = ["id", "generatedAt", "disclaimer"];
  for (const field of requiredStringFields) {
    if (typeof candidate[field] !== "string") {
      throw new Error(`Invalid AI response: missing field ${field}.`);
    }
  }

  if (!isStringArray(candidate.recommendedFoods)) {
    throw new Error("Invalid AI response: recommendedFoods must be string[].");
  }
  if (!isStringArray(candidate.avoidFoods)) {
    throw new Error("Invalid AI response: avoidFoods must be string[].");
  }
  if (!Array.isArray(candidate.mealExamples) || !candidate.mealExamples.every(isMealExample)) {
    throw new Error("Invalid AI response: mealExamples must match expected schema.");
  }
  if (!isStringArray(candidate.generalTips)) {
    throw new Error("Invalid AI response: generalTips must be string[].");
  }
  if (!Array.isArray(candidate.intolerances) || !candidate.intolerances.every((x) => typeof x === "string")) {
    throw new Error("Invalid AI response: intolerances must be string[].");
  }
  if (!candidate.intolerances.every(isIntolerance)) {
    throw new Error("Invalid AI response: intolerances contain unsupported values.");
  }
  if (!isDietaryPreference(candidate.dietaryPreference)) {
    throw new Error("Invalid AI response: missing dietaryPreference.");
  }

  const detailLevel =
    candidate.detailLevel === "basic" ||
    candidate.detailLevel === "detailed" ||
    candidate.detailLevel === "comprehensive"
      ? candidate.detailLevel
      : "detailed";

  const source =
    candidate.source === "ai" || candidate.source === "fallback"
      ? candidate.source
      : undefined;

  const warnings = isStringArray(candidate.warnings) ? candidate.warnings : undefined;

  return {
    id: String(candidate.id),
    generatedAt: String(candidate.generatedAt),
    intolerances: candidate.intolerances,
    dietaryPreference: candidate.dietaryPreference,
    detailLevel,
    recommendedFoods: candidate.recommendedFoods,
    avoidFoods: candidate.avoidFoods,
    mealExamples: candidate.mealExamples,
    generalTips: candidate.generalTips,
    disclaimer: String(candidate.disclaimer),
    warnings,
    source,
  };
}

function requestKey(input: GuidanceRequest): string {
  const sortedIntolerances = [...input.intolerances].sort();
  return JSON.stringify({
    intolerances: sortedIntolerances,
    dietaryPreference: input.dietaryPreference,
    detailLevel: input.detailLevel,
  });
}

export async function generateGuidance(req: GuidanceRequest): Promise<GuidanceResult> {
  const key = requestKey(req);
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const monitoringEntries = await listMonitoringEntries();
    const body: GuidanceRequest = {
      ...req,
      monitoringEntries: buildMonitoringContextEntries(monitoringEntries),
    };

    const response = await fetch("/api/guidance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as GuidanceApiResponse & GuidanceApiError;
    if (!response.ok) {
      throw new Error(payload.error ?? "Could not process AI guidance.");
    }

    return validateGuidanceResult(payload.result);
  })();

  inFlight.set(key, promise);

  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}

export async function getHistory(): Promise<GuidanceHistoryEntry[]> {
  const response = await fetch("/api/guidance/history", {
    method: "GET",
  });

  const payload = (await response.json()) as HistoryApiResponse & GuidanceApiError;
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not load guidance history.");
  }

  if (!Array.isArray(payload.history)) return [];
  return payload.history;
}

export async function getGuidanceById(id: string): Promise<GuidanceResult | null> {
  const response = await fetch(`/api/guidance/history/${encodeURIComponent(id)}`, {
    method: "GET",
  });

  if (response.status === 404) return null;

  const payload = (await response.json()) as { result?: GuidanceResult } & GuidanceApiError;
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not load guidance result.");
  }

  return payload.result ? validateGuidanceResult(payload.result) : null;
}

export async function deleteGuidanceHistory(id?: string): Promise<void> {
  const target = id
    ? `/api/guidance/history?id=${encodeURIComponent(id)}`
    : "/api/guidance/history";

  const response = await fetch(target, { method: "DELETE" });
  const payload = (await response.json()) as GuidanceApiError;

  if (!response.ok) {
    throw new Error(payload.error ?? "Could not delete guidance history.");
  }
}

export async function exportGuidanceHistory(): Promise<{
  exportedAt: string;
  history: GuidanceResult[];
}> {
  const response = await fetch("/api/guidance/export", { method: "GET" });
  const payload = (await response.json()) as ExportApiResponse & GuidanceApiError;

  if (!response.ok) {
    throw new Error(payload.error ?? "Could not export guidance history.");
  }

  return {
    exportedAt: payload.exportedAt || new Date().toISOString(),
    history: Array.isArray(payload.history) ? payload.history : [],
  };
}

export function summarizeGuidance(entry: GuidanceHistoryEntry): string {
  const lang = getCurrentLang();
  const labels = entry.intolerances.map((intol) => getIntoleranceLabel(intol, lang));
  if (labels.length === 0) {
    return lang === "ro"
      ? "Recomandari fara restrictii specifice"
      : "Guidance with no specific restrictions";
  }

  return lang === "ro"
    ? `Recomandari pentru: ${labels.join(", ")}`
    : `Guidance for: ${labels.join(", ")}`;
}
