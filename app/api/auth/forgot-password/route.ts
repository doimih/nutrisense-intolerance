import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/server/rateLimit";
import { createPasswordResetToken } from "@/lib/server/authStore";
import { sendPasswordResetEmail } from "@/lib/server/email";

export const runtime = "nodejs";

type ForgotPasswordBody = {
  email?: string;
};

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = checkRateLimit({
    key: `auth:forgot-password:${ip}`,
    maxRequests: 5,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many reset requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: ForgotPasswordBody;
  try {
    body = (await request.json()) as ForgotPasswordBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  // Always return success to prevent email enumeration
  const result = await createPasswordResetToken(email);
  if (result) {
    await sendPasswordResetEmail({ email, name: result.name, token: result.token });
  }

  await new Promise((resolve) => setTimeout(resolve, 400));

  return NextResponse.json({
    ok: true,
    message: "If an account exists for this email, reset instructions were sent.",
  });
}
