export type AppLanguage = "ro" | "en";

export const DEFAULT_LANGUAGE: AppLanguage = "ro";
export const ROMANIA_LANGUAGE: AppLanguage = "ro";
export const LANGUAGE_COOKIE = "ns_lang";

export function isAppLanguage(value: string | undefined | null): value is AppLanguage {
  return value === "ro";
}
