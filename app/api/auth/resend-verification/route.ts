import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/server/rateLimit";
import { createVerificationForEmail } from "@/lib/server/authStore";
import { sendVerificationEmail } from "@/lib/server/email";

type ResendBody = {
  email?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = checkRateLimit({
    key: `auth:resend-verification:${ip}`,
    maxRequests: 6,
    windowMs: 60_000,
  });

  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: ResendBody;
  try {
    body = (await request.json()) as ResendBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() || "";
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const verification = await createVerificationForEmail(email);

  // Always respond generically to avoid email enumeration
  if (verification.status === "not_found") {
    return NextResponse.json({
      ok: true,
      message: "If an account exists and is not verified, a verification email was sent.",
    });
  }

  if (verification.status === "already_verified") {
    return NextResponse.json({ ok: true, message: "This account is already verified. You can sign in." });
  }

  // Send email — errors are logged server-side, never exposed to client
  try {
    await sendVerificationEmail({
      email: verification.user.email,
      name: verification.user.name,
      token: verification.verificationToken,
    });
  } catch {
    // safety net
  }

  return NextResponse.json({
    ok: true,
    message: "Verification email sent. Please check your inbox and spam folder.",
  });
}
