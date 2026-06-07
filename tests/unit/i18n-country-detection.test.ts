import { describe, expect, it } from "vitest";
import { detectLanguageFromCountry } from "../../lib/i18n/server";
import { inferLanguageFromCountry } from "../../middleware";

describe("country-based language detection", () => {
  it("returns Romanian for RO country code", () => {
    expect(detectLanguageFromCountry("RO")).toBe("ro");
    expect(detectLanguageFromCountry("ro")).toBe("ro");
    expect(inferLanguageFromCountry("RO")).toBe("ro");
  });

  it("falls back to English for non-RO country codes", () => {
    expect(detectLanguageFromCountry("DE")).toBe("en");
    expect(detectLanguageFromCountry("US")).toBe("en");
    expect(inferLanguageFromCountry("FR")).toBe("en");
  });

  it("falls back to English when country code is missing", () => {
    expect(detectLanguageFromCountry(null)).toBe("en");
    expect(inferLanguageFromCountry(null)).toBe("en");
  });
});
