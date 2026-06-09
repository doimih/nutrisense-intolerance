import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { createSessionToken } from "@/lib/auth/sessionToken";
import { authenticateUser } from "@/lib/server/authStore";
import { checkRateLimit, getClientIp } from "@/lib/server/rateLimit";

type LoginBody = {
  email?: string;
  password?: string;
};

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = checkRateLimit({
    key: `auth:login:${ip}`,
    maxRequests: 10,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
        },
      }
    );
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const auth = await authenticateUser(email, password);
  if (auth.status === "invalid_credentials") {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (auth.status === "email_not_verified") {
    return NextResponse.json(
      {
        error: "You must verify your email before accessing the platform.",
        code: "EMAIL_NOT_VERIFIED",
        email: auth.user.email,
      },
      { status: 403 }
    );
  }

  const user = auth.user;

  const token = await createSessionToken(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    AUTH_COOKIE_MAX_AGE_SECONDS
  );

  const response = NextResponse.json({ user });
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
