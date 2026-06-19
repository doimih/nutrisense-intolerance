import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { getProfileForUser, updateProfileForUser } from "@/lib/server/profileStore";
import type { ActivityLevel, DietaryPreference, Intolerance, UpdateProfileRequest } from "@/types/profile";
import { brevoEvents } from "@/lib/server/brevoEventService";

export const runtime = "nodejs";

const VALID_DIETARY: DietaryPreference[] = [
  "normal",
  "vegetarian",
  "vegan",
  "low-carb",
  "gluten-free",
  "dairy-free",
];

const VALID_INTOLERANCES: Intolerance[] = [
  "lactoza",
  "gluten",
  "nuci",
  "histamina",
  "fodmap",
  "fructoza",
  "sorbitol",
  "sulfiti",
  "ou",
  "soia",
  "peste",
  "crustacee",
  "proteina-lapte",
  "solanacee",
];

const VALID_ACTIVITY_LEVELS: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];

function getSession(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return token ? readSessionToken(token) : null;
}

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const profile = await getProfileForUser(session.user);
  return NextResponse.json({ profile });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: UpdateProfileRequest;
  try {
    body = (await request.json()) as UpdateProfileRequest;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  if (typeof body.name !== "undefined" && typeof body.name !== "string") {
    return badRequest("Invalid name field.");
  }

  if (
    typeof body.dietaryPreference !== "undefined" &&
    !VALID_DIETARY.includes(body.dietaryPreference)
  ) {
    return badRequest("Invalid dietaryPreference field.");
  }

  if (typeof body.dietaryPreferences !== "undefined") {
    if (!Array.isArray(body.dietaryPreferences) || body.dietaryPreferences.length === 0) {
      return badRequest("Invalid dietaryPreferences field.");
    }
    if (!body.dietaryPreferences.every((p) => VALID_DIETARY.includes(p))) {
      return badRequest("Invalid dietaryPreferences value provided.");
    }
  }

  if (typeof body.intolerances !== "undefined") {
    if (!Array.isArray(body.intolerances)) {
      return badRequest("Invalid intolerances field.");
    }
    if (!body.intolerances.every((item) => VALID_INTOLERANCES.includes(item))) {
      return badRequest("Invalid intolerance value provided.");
    }
  }

  if (typeof body.age !== "undefined" && body.age !== null) {
    const age = Number(body.age);
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      return badRequest("Invalid age field.");
    }
    body.age = age;
  }

  if (typeof body.heightCm !== "undefined" && body.heightCm !== null) {
    const h = Number(body.heightCm);
    if (!Number.isInteger(h) || h < 50 || h > 280) {
      return badRequest("Invalid heightCm field.");
    }
    body.heightCm = h;
  }

  if (typeof body.weightKg !== "undefined" && body.weightKg !== null) {
    const w = Number(body.weightKg);
    if (!Number.isInteger(w) || w < 20 || w > 500) {
      return badRequest("Invalid weightKg field.");
    }
    body.weightKg = w;
  }

  if (typeof body.activityLevel !== "undefined" && body.activityLevel !== null) {
    if (!VALID_ACTIVITY_LEVELS.includes(body.activityLevel)) {
      return badRequest("Invalid activityLevel field.");
    }
  }

  if (typeof body.onboardingCompleted !== "undefined" && typeof body.onboardingCompleted !== "boolean") {
    return badRequest("Invalid onboardingCompleted field.");
  }

  const email = session.user.email;
  const profile = await updateProfileForUser(session.user, body);

  // Fire weight_logged when weight is explicitly updated
  if (typeof body.weightKg === "number") {
    void brevoEvents.weightLogged(email, { weightKg: body.weightKg, unit: 'kg' }).catch(() => {});
  }

  // Fire onboarding_step_completed when onboarding is marked complete
  if (body.onboardingCompleted === true) {
    void brevoEvents.onboardingStepCompleted(email, { step: 'profile_complete' }).catch(() => {});
  }

  return NextResponse.json({ profile });
}
