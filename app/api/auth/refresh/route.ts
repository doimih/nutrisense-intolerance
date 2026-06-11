import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { createSessionToken, readSessionToken } from "@/lib/auth/sessionToken";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const session = await readSessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Session expired." }, { status: 401 });
  }

  const newToken = await createSessionToken(session.user, AUTH_COOKIE_MAX_AGE_SECONDS);
  const newExp = Math.floor(Date.now() / 1000) + AUTH_COOKIE_MAX_AGE_SECONDS;

  const response = NextResponse.json({ ok: true, sessionExpiresAt: newExp });
  response.cookies.set(AUTH_COOKIE_NAME, newToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
