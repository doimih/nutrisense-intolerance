import { cookies, headers } from "next/headers";
import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  isAppLanguage,
  LANGUAGE_COOKIE,
  ROMANIA_LANGUAGE,
} from "@/lib/i18n/config";

export function detectLanguageFromCountry(countryCode: string | null): AppLanguage {
  if (countryCode && countryCode.toUpperCase() === "RO") return ROMANIA_LANGUAGE;
  return DEFAULT_LANGUAGE;
}

export function getServerLanguage(): AppLanguage {
  const cookieStore = cookies();
  const cookieLang = cookieStore.get(LANGUAGE_COOKIE)?.value;
  if (isAppLanguage(cookieLang)) return cookieLang;

  const headerStore = headers();
  const countryCode =
    headerStore.get("x-vercel-ip-country") ||
    headerStore.get("cf-ipcountry") ||
    headerStore.get("x-country-code");

  return detectLanguageFromCountry(countryCode);
}
