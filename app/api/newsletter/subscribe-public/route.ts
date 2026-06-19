import { NextRequest, NextResponse } from "next/server";
import { addUserContact } from "@/lib/server/brevoClient";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; language?: string };

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const lang = body.language === "en" ? "en" : "ro";
  const consentAt = new Date().toISOString();

  const synced = await addUserContact({
    email,
    firstName: "",
    language: lang,
    consentSource: "footer_form",
    consentAt,
  });

  if (!synced) {
    // Brevo not configured or failed — still return success to avoid leaking config state
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
