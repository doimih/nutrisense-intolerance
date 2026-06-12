import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE,
  isAppLanguage,
  type AppLanguage,
} from "@/lib/i18n/config";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";

export function inferLanguageFromCountry(countryCode: string | null): AppLanguage {
  if (!countryCode) return DEFAULT_LANGUAGE;
  return countryCode.toUpperCase() === "RO" ? "ro" : "en";
}

function detectLanguageFromRequest(request: NextRequest): AppLanguage {
  // 1. Existing cookie wins — user already chose a language
  const existing = request.cookies.get(LANGUAGE_COOKIE)?.value;
  if (isAppLanguage(existing)) return existing;

  // 2. Browser Accept-Language header
  const acceptLang = (request.headers.get("accept-language") ?? "").toLowerCase();
  if (acceptLang) {
    // If primary language starts with "ro" → Romanian
    if (acceptLang.startsWith("ro")) return "ro";
    // If "en" appears with high priority → English
    if (acceptLang.startsWith("en")) return "en";
  }

  return DEFAULT_LANGUAGE;
}

function isProtectedPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isSuperadminPath(pathname: string): boolean {
  return pathname === "/superadmin" || pathname.startsWith("/superadmin/");
}

function applyLanguageCookie(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const lang = detectLanguageFromRequest(request);
  const existing = request.cookies.get(LANGUAGE_COOKIE)?.value;

  // Only write cookie when it's missing or invalid — avoid re-writing on every request
  if (!isAppLanguage(existing)) {
    response.cookies.set(LANGUAGE_COOKIE, lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;

  if (isProtectedPath(pathname)) {
    if (!session) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return applyLanguageCookie(request, NextResponse.redirect(loginUrl));
    }
  }

  if (isSuperadminPath(pathname)) {
    const isSuperadmin = session?.user.role === "superadmin";
    if (!isSuperadmin) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", "/backend");
      return applyLanguageCookie(request, NextResponse.redirect(loginUrl));
    }
  }

  return applyLanguageCookie(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
