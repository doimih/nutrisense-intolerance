import { NextRequest, NextResponse } from "next/server";
import { verifyEmailByToken } from "@/lib/server/authStore";
import { sendWelcomeEmail } from "@/lib/server/email";
import { isAppLanguage } from "@/lib/i18n/config";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() || "";
  if (!token) {
    return NextResponse.json(
      { error: "Verification token is required.", code: "TOKEN_MISSING" },
      { status: 400 }
    );
  }

  const rawLang = request.cookies.get("ns_lang")?.value;
  const lang = isAppLanguage(rawLang) ? rawLang : "ro";
  const isRo = lang === "ro";

  const result = await verifyEmailByToken(token);
  if (result.status === "verified") {
    sendWelcomeEmail({ email: result.user.email, name: result.user.name, lang }).catch(() => undefined);
    return NextResponse.json({
      ok: true,
      message: isRo
        ? "Contul tau a fost verificat. Te poti autentifica."
        : "Your account has been verified. You can sign in.",
      email: result.user.email,
    });
  }

  if (result.status === "expired") {
    return NextResponse.json(
      {
        error: isRo
          ? "Link invalid sau expirat. Trimite un nou email de verificare."
          : "Invalid or expired link. Please request a new verification email.",
        code: "TOKEN_EXPIRED",
        email: result.email,
      },
      { status: 400 }
    );
  }

  if (result.status === "used") {
    return NextResponse.json(
      {
        error: isRo
          ? "Acest link a fost deja folosit. Poti solicita retrimiterea emailului."
          : "This link has already been used. You can request a new verification email.",
        code: "TOKEN_USED",
        email: result.email,
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: isRo
        ? "Link invalid sau expirat. Trimite un nou email de verificare."
        : "Invalid or expired link. Please request a new verification email.",
      code: "TOKEN_INVALID",
    },
    { status: 400 }
  );
}
