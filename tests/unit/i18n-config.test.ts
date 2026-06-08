import { describe, expect, it } from "vitest";
import { DEFAULT_LANGUAGE, ROMANIA_LANGUAGE, isAppLanguage } from "../../lib/i18n/config";

describe("i18n config", () => {
  it("accepts only Romanian app language", () => {
    expect(isAppLanguage("ro")).toBe(true);
    expect(isAppLanguage("en")).toBe(false);
  });

  it("rejects unsupported app languages", () => {
    expect(isAppLanguage("fr")).toBe(false);
    expect(isAppLanguage(undefined)).toBe(false);
    expect(isAppLanguage(null)).toBe(false);
  });

  it("keeps Romanian defaults stable", () => {
    expect(DEFAULT_LANGUAGE).toBe("ro");
    expect(ROMANIA_LANGUAGE).toBe("ro");
  });
});
