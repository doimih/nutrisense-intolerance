"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCookies } from "./CookieContext";

declare global {
  interface Window {
    ttq?: {
      load: (pixelId: string, options?: Record<string, unknown>) => void;
      page: () => void;
      track: (event: string, params?: Record<string, unknown>) => void;
      identify: (params: Record<string, unknown>) => void;
      instance: (pixelId: string) => unknown;
      holdConsent: () => void;
      grantConsent: () => void;
      revokeConsent: () => void;
    };
    TiktokAnalyticsObject?: string;
  }
}

type Props = {
  enabled: boolean;
  pixelId: string;
  testEventCode?: string;
};

// SHA-256 hash via Web Crypto (browser-native, no library needed)
async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value.toLowerCase().trim())
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Base pixel script is injected server-side in app/layout.tsx <head>
// This component manages GDPR consent state + PageView events only.
export default function TikTokPixel({ enabled, pixelId }: Props) {
  const { preferences } = useCookies();
  const pathname = usePathname();

  const analyticsOk = enabled && !!pixelId && !!preferences?.analytics;

  // Grant / revoke TikTok cookie consent when preference changes
  useEffect(() => {
    if (!enabled || !pixelId || !window.ttq) return;
    if (analyticsOk) {
      window.ttq.grantConsent();
    } else {
      window.ttq.revokeConsent();
    }
  }, [analyticsOk, enabled, pixelId]);

  // Fire PageView on every route change — only when consent granted
  useEffect(() => {
    if (!analyticsOk || !window.ttq) return;
    window.ttq.page();
  }, [pathname, analyticsOk]);

  return null;
}

// ── Identity ───────────────────────────────────────────────────────────────────

// Call on every dashboard load when user is known. Hashes email client-side.
export async function identifyTikTokUser(email: string, userId?: string): Promise<void> {
  if (typeof window === "undefined" || !window.ttq) return;
  const [hashedEmail, hashedId] = await Promise.all([
    sha256(email),
    userId ? sha256(userId) : Promise.resolve(""),
  ]);
  window.ttq.identify({
    email: hashedEmail,
    ...(hashedId ? { external_id: hashedId } : {}),
  });
}

// ── Plan content helpers ───────────────────────────────────────────────────────

export type TikTokPlanContent = {
  planCode: string;
  planName: string;
  value: number;
  currency?: string;
};

function buildPlanPayload(plan: TikTokPlanContent) {
  return {
    contents: [
      {
        content_id: `plan_${plan.planCode}`,
        content_type: "product",
        content_name: plan.planName,
      },
    ],
    value: plan.value,
    currency: plan.currency ?? "EUR",
  };
}

// ── Event helpers ──────────────────────────────────────────────────────────────

export function trackTikTokEvent(event: string, params?: Record<string, unknown>): void {
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track(event, params);
  }
}

// CompleteRegistration — fired after user submits the registration form successfully
export function trackTikTokCompleteRegistration(): void {
  if (typeof window === "undefined" || !window.ttq) return;
  window.ttq.track("CompleteRegistration", {
    contents: [{ content_id: "registration", content_type: "product", content_name: "NutriAID Account" }],
    value: 0,
    currency: "EUR",
  });
}

// ViewContent — fired on key pages (pricing, guidance, history)
export function trackTikTokViewContent(
  contentName: string,
  contentId = "page",
  value = 0
): void {
  if (typeof window === "undefined" || !window.ttq) return;
  window.ttq.track("ViewContent", {
    contents: [{ content_id: contentId, content_type: "product", content_name: contentName }],
    value,
    currency: "EUR",
  });
}

// InitiateCheckout — fired when user clicks Subscribe / upgrade button
export function trackTikTokInitiateCheckout(plan: TikTokPlanContent): void {
  if (typeof window === "undefined" || !window.ttq) return;
  window.ttq.track("InitiateCheckout", buildPlanPayload(plan));
}

// AddPaymentInfo — fired just before redirect to Stripe (payment form about to appear)
export function trackTikTokAddPaymentInfo(plan: TikTokPlanContent): void {
  if (typeof window === "undefined" || !window.ttq) return;
  window.ttq.track("AddPaymentInfo", buildPlanPayload(plan));
}

// Purchase — fired when Stripe redirects back with billing=success
export function trackTikTokPurchase(plan: TikTokPlanContent): void {
  if (typeof window === "undefined" || !window.ttq) return;
  window.ttq.track("Purchase", buildPlanPayload(plan));
}

// Subscribe (alias for Subscribe event — TikTok standard)
export function trackTikTokSubscribe(plan: TikTokPlanContent): void {
  if (typeof window === "undefined" || !window.ttq) return;
  window.ttq.track("Subscribe", buildPlanPayload(plan));
}
