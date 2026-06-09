import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { addMonitoringEntryForUser, listMonitoringEntriesByUser } from "@/lib/server/monitoringStore";
import { getEffectivePlanTier, tierAllows } from "@/lib/billing/features";
import type { CreateMonitoringEntryRequest, Symptom, WellbeingLevel } from "@/types/monitoring";

export const runtime = "nodejs";

const VALID_SYMPTOMS: Symptom[] = [
  "balonare",
  "dureri_abdominale",
  "greata",
  "diaree",
  "constipatie",
  "reflux",
  "eruptii_cutanate",
  "oboseala",
  "dureri_de_cap",
  "dificultati_respiratorii",
  "umflaturi",
];

const VALID_WELLBEING: WellbeingLevel[] = [1, 2, 3, 4, 5];

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

async function getSession(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return token ? readSessionToken(token) : null;
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const entries = await listMonitoringEntriesByUser(session.user.email);
  return NextResponse.json({ entries });
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const effectiveTier = await getEffectivePlanTier(session.user.email.trim().toLowerCase());
  if (!tierAllows(effectiveTier, "basic")) {
    return NextResponse.json({ error: "Plan activ necesar pentru a adauga inregistrari.", code: "plan_required" }, { status: 403 });
  }

  let body: CreateMonitoringEntryRequest;
  try {
    body = (await request.json()) as CreateMonitoringEntryRequest;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  if (typeof body.date !== "string" || !body.date) {
    return badRequest("Invalid date field.");
  }

  if (
    typeof body.mealTime !== "undefined" &&
    typeof body.mealTime !== "string"
  ) {
    return badRequest("Invalid mealTime field.");
  }

  if (!Array.isArray(body.consumedFoods) || body.consumedFoods.length === 0) {
    return badRequest("Invalid consumedFoods field.");
  }

  if (!body.consumedFoods.every((item) => typeof item === "string" && item.trim().length > 0)) {
    return badRequest("Consumed foods must contain only non-empty strings.");
  }

  if (!Array.isArray(body.symptoms) || !body.symptoms.every((item) => VALID_SYMPTOMS.includes(item))) {
    return badRequest("Invalid symptoms field.");
  }

  if (
    typeof body.symptomsIntensity !== "number" ||
    !Number.isFinite(body.symptomsIntensity) ||
    body.symptomsIntensity < 0 ||
    body.symptomsIntensity > 10
  ) {
    return badRequest("Invalid symptomsIntensity field.");
  }

  if (
    typeof body.reactionLatencyMinutes !== "undefined" &&
    body.reactionLatencyMinutes !== null &&
    (typeof body.reactionLatencyMinutes !== "number" || body.reactionLatencyMinutes < 0)
  ) {
    return badRequest("Invalid reactionLatencyMinutes field.");
  }

  if (!VALID_WELLBEING.includes(body.wellbeing)) {
    return badRequest("Invalid wellbeing field.");
  }

  if (typeof body.notes !== "string") {
    return badRequest("Invalid notes field.");
  }

  const entry = await addMonitoringEntryForUser(session.user, {
    ...body,
    consumedFoods: body.consumedFoods.map((item) => item.trim()).filter(Boolean),
    notes: body.notes.trim(),
  });

  return NextResponse.json({ entry }, { status: 201 });
}
