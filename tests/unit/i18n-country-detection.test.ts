import { describe, expect, it } from "vitest";
import { detectLanguageFromCountry } from "../../lib/i18n/server";
import { inferLanguageFromCountry } from "../../middleware";

describe("country-based language detection", () => {
  it("returns Romanian for RO country code", () => {
    expect(detectLanguageFromCountry("RO")).toBe("ro");
    expect(detectLanguageFromCountry("ro")).toBe("ro");
    expect(inferLanguageFromCountry("RO")).toBe("ro");
  });

  it("returns Romanian for non-RO country codes in RO-only mode", () => {
    expect(detectLanguageFromCountry("DE")).toBe("ro");
    expect(detectLanguageFromCountry("US")).toBe("ro");
    expect(inferLanguageFromCountry("FR")).toBe("ro");
  });

  it("returns Romanian when country code is missing", () => {
    expect(detectLanguageFromCountry(null)).toBe("ro");
    expect(inferLanguageFromCountry(null)).toBe("ro");
  });
});
