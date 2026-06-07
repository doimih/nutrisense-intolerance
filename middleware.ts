import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LANGUAGE,
  isAppLanguage,
  LANGUAGE_COOKIE,
  ROMANIA_LANGUAGE,
} from "@/lib/i18n/config";

export function inferLanguageFromCountry(countryCode: string | null): "ro" | "en" {
  if (!countryCode) return DEFAULT_LANGUAGE;
  return countryCode.toUpperCase() === "RO" ? ROMANIA_LANGUAGE : DEFAULT_LANGUAGE;
}

function getCountryCode(request: NextRequest): string | null {
  return (
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code")
  );
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const langFromQuery = request.nextUrl.searchParams.get("lang");
  if (isAppLanguage(langFromQuery)) {
    response.cookies.set(LANGUAGE_COOKIE, langFromQuery, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  const currentCookie = request.cookies.get(LANGUAGE_COOKIE)?.value;
  if (isAppLanguage(currentCookie)) {
    return response;
  }

  const inferredLanguage = inferLanguageFromCountry(getCountryCode(request));

  response.cookies.set(LANGUAGE_COOKIE, inferredLanguage, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
