import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/server/authStore";
import { sendVerificationEmail } from "@/lib/server/email";
import { checkRateLimit, getClientIp } from "@/lib/server/rateLimit";
import { isAppLanguage } from "@/lib/i18n/config";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
};

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = checkRateLimit({
    key: `auth:register:${ip}`,
    maxRequests: 5,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many registration attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  if (!body.acceptTerms) {
    return NextResponse.json({ error: "You must accept the terms to continue." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }

  let created;
  try {
    created = await createUser({ name, email, password });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create account." },
      { status: 409 }
    );
  }

  const rawLang = request.cookies.get("ns_lang")?.value;
  const lang = isAppLanguage(rawLang) ? rawLang : "ro";

  // Send verification email — errors are logged server-side, never exposed to client
  try {
    await sendVerificationEmail({
      email: created.user.email,
      name: created.user.name,
      token: created.verificationToken,
      lang,
    });
  } catch {
    // sendVerificationEmail never throws, safety net only
  }

  return NextResponse.json(
    {
      ok: true,
      email: created.user.email,
      message: "Account created. Please check your email to activate your account.",
    },
    { status: 201 }
  );
}
