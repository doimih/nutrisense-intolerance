import { cookies } from "next/headers";
import { AppLanguage, DEFAULT_LANGUAGE, LANGUAGE_COOKIE, ROMANIA_LANGUAGE, isAppLanguage } from "@/lib/i18n/config";

export function detectLanguageFromCountry(countryCode: string | null): AppLanguage {
  if (!countryCode) return DEFAULT_LANGUAGE;
  return countryCode.toUpperCase() === "RO" ? ROMANIA_LANGUAGE : "en";
}

export function getServerLanguage(): AppLanguage {
  try {
    const cookieStore = cookies();
    const value = cookieStore.get(LANGUAGE_COOKIE)?.value;
    return isAppLanguage(value) ? value : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}
