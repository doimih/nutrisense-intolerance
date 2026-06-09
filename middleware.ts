import { NextRequest, NextResponse } from "next/server";
import {
  LANGUAGE_COOKIE,
  ROMANIA_LANGUAGE,
} from "@/lib/i18n/config";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";

export function inferLanguageFromCountry(countryCode: string | null): "ro" | "en" {
  void countryCode;
  return ROMANIA_LANGUAGE;
}

function isProtectedPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isSuperadminPath(pathname: string): boolean {
  return (
    pathname === "/superadmin" ||
    pathname.startsWith("/superadmin/")
  );
}

function applyLanguageCookie(request: NextRequest, response: NextResponse): NextResponse {
  void request;
  response.cookies.set(LANGUAGE_COOKIE, ROMANIA_LANGUAGE, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

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
