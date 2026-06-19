import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";

export const runtime = "nodejs";

// Always returns 200 — used by client components to check auth state
// without triggering a 401 console error for unauthenticated visitors.
export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;
  return NextResponse.json({ authenticated: !!session });
}
