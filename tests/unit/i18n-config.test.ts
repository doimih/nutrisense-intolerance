import { describe, expect, it } from "vitest";
import { DEFAULT_LANGUAGE, ROMANIA_LANGUAGE, isAppLanguage } from "../../lib/i18n/config";

describe("i18n config", () => {
  it("accepts supported app languages", () => {
    expect(isAppLanguage("ro")).toBe(true);
    expect(isAppLanguage("en")).toBe(true);
  });

  it("rejects unsupported app languages", () => {
    expect(isAppLanguage("fr")).toBe(false);
    expect(isAppLanguage(undefined)).toBe(false);
    expect(isAppLanguage(null)).toBe(false);
  });

  it("keeps default and Romania language constants stable", () => {
    expect(DEFAULT_LANGUAGE).toBe("en");
    expect(ROMANIA_LANGUAGE).toBe("ro");
  });
});
