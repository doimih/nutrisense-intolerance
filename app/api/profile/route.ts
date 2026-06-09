import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { getProfileForUser, updateProfileForUser } from "@/lib/server/profileStore";
import type { DietaryPreference, Intolerance, UpdateProfileRequest } from "@/types/profile";

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
];

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

  if (typeof body.intolerances !== "undefined") {
    if (!Array.isArray(body.intolerances)) {
      return badRequest("Invalid intolerances field.");
    }

    if (!body.intolerances.every((item) => VALID_INTOLERANCES.includes(item))) {
      return badRequest("Invalid intolerance value provided.");
    }
  }

  const profile = await updateProfileForUser(session.user, body);
  return NextResponse.json({ profile });
}
