import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { getNewsletterStatus, setNewsletterOptIn } from "@/lib/server/authStore";
import { addUserContact } from "@/lib/server/brevoClient";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const session = await readSessionToken(token);
  if (!session) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { language?: string };
  const lang = (body.language === "en" ? "en" : "ro") as "ro" | "en";

  const consentAt = new Date().toISOString();
  await setNewsletterOptIn(session.user.email, true, "signup_popup");

  // Sync to Brevo asynchronously — don't block the response
  const status = await getNewsletterStatus(session.user.email);
  void addUserContact({
    email: session.user.email,
    firstName: session.user.name,
    language: lang,
    consentSource: "signup_popup",
    consentAt,
  }).catch(() => {
    // Brevo sync failure is non-critical
  });

  return NextResponse.json({ ok: true, newsletterOptIn: true, language: status.language ?? lang });
}
