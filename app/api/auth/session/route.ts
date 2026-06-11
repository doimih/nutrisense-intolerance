import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { getUserPlan, getUserTrialEndsAt } from "@/lib/server/authStore";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const session = await readSessionToken(token);
  if (!session) {
    const response = NextResponse.json({ error: "Invalid session." }, { status: 401 });
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  const plan = await getUserPlan(session.user.email);
  const trialEndsAt = await getUserTrialEndsAt(session.user.email);
  return NextResponse.json({ user: { ...session.user, plan, trialEndsAt, sessionExpiresAt: session.exp } });
}
