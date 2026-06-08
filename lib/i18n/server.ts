import { AppLanguage, ROMANIA_LANGUAGE } from "@/lib/i18n/config";

export function detectLanguageFromCountry(countryCode: string | null): AppLanguage {
  void countryCode;
  return ROMANIA_LANGUAGE;
}

export function getServerLanguage(): AppLanguage {
  return ROMANIA_LANGUAGE;
}
