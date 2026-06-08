import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { getSubscriptionSnapshot } from "@/lib/server/subscriptionStore";
import { appendGuidanceRecord, listGuidanceByUser } from "@/lib/server/guidance/store";
import {
  buildGuidancePrompt,
  guidanceFingerprint,
  runDeterministicGuidance,
} from "@/lib/server/guidance/engine";
import type { GuidanceGenerateInput, SubscriptionTier } from "@/lib/server/guidance/types";
import type { DetailLevel, MonitoringContextItem } from "@/types/guidance";
import type { DietaryPreference, Intolerance } from "@/types/profile";

export const runtime = "nodejs";

type GuidanceBody = {
  intolerances?: unknown;
  dietaryPreference?: unknown;
  detailLevel?: unknown;
  monitoringEntries?: unknown;
};

const dedupeCache = new Map<string, { expiresAt: number; resultId: string }>();

function isDetailLevel(value: unknown): value is DetailLevel {
  return value === "basic" || value === "detailed" || value === "comprehensive";
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
        item === "fodmap"
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

  if (!isIntoleranceArray(body.intolerances)) {
    return badRequest("Invalid intolerances field.");
  }
  if (!isDietaryPreference(body.dietaryPreference)) {
    return badRequest("Invalid dietaryPreference field.");
  }
  if (!isDetailLevel(body.detailLevel)) {
    return badRequest("Invalid detailLevel field.");
  }

  const monitoringEntries = normalizeMonitoringEntries(body.monitoringEntries);
  const lang = getLanguage(request);
  const email = session.user.email.trim().toLowerCase();

  const snapshot = getSubscriptionSnapshot(email);
  const subscriptionTier = resolveSubscriptionTier(snapshot?.status ?? "none");

  const input: GuidanceGenerateInput = {
    intolerances: body.intolerances,
    dietaryPreference: body.dietaryPreference,
    detailLevel: body.detailLevel,
    monitoringEntries,
    userEmail: email,
    lang,
    subscriptionTier,
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
    const existing = listGuidanceByUser(email).find((item) => item.result.id === cached.resultId);
    if (existing) {
      return NextResponse.json({ result: existing.result, deduped: true });
    }
  }

  const startedAt = Date.now();
  const result = runDeterministicGuidance(input);

  appendGuidanceRecord({
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
    },
  });
}
