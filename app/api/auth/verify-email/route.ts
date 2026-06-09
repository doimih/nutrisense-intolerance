import { NextRequest, NextResponse } from "next/server";
import { verifyEmailByToken } from "@/lib/server/authStore";
import { sendWelcomeEmail } from "@/lib/server/email";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() || "";
  if (!token) {
    return NextResponse.json(
      { error: "Verification token is required.", code: "TOKEN_MISSING" },
      { status: 400 }
    );
  }

  const result = await verifyEmailByToken(token);
  if (result.status === "verified") {
    sendWelcomeEmail({ email: result.user.email, name: result.user.name }).catch(() => undefined);
    return NextResponse.json({
      ok: true,
      message: "Contul tau a fost verificat. Te poti autentifica.",
      email: result.user.email,
    });
  }

  if (result.status === "expired") {
    return NextResponse.json(
      {
        error: "Link invalid sau expirat. Trimite un nou email de verificare.",
        code: "TOKEN_EXPIRED",
        email: result.email,
      },
      { status: 400 }
    );
  }

  if (result.status === "used") {
    return NextResponse.json(
      {
        error: "Acest link a fost deja folosit. Poti solicita retrimiterea emailului.",
        code: "TOKEN_USED",
        email: result.email,
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: "Link invalid sau expirat. Trimite un nou email de verificare.",
      code: "TOKEN_INVALID",
    },
    { status: 400 }
  );
}
