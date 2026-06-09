import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/server/rateLimit";
import { consumePasswordResetToken } from "@/lib/server/authStore";

export const runtime = "nodejs";

type ResetPasswordBody = {
  token?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = checkRateLimit({
    key: `auth:reset-password:${ip}`,
    maxRequests: 10,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: ResetPasswordBody;
  try {
    body = (await request.json()) as ResetPasswordBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const token = body.token?.trim();
  const password = body.password;

  if (!token) return NextResponse.json({ error: "Token is required." }, { status: 400 });
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const result = await consumePasswordResetToken(token, password);

  if (result.status === "invalid") {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }
  if (result.status === "expired") {
    return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
  }
  if (result.status === "used") {
    return NextResponse.json({ error: "This reset link has already been used." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
