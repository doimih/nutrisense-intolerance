import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { setNewsletterOptOut } from "@/lib/server/authStore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const session = await readSessionToken(token);
  if (!session) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  await setNewsletterOptOut(session.user.email);
  return NextResponse.json({ ok: true, newsletterOptIn: false });
}
