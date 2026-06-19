"use client";

import Script from "next/script";
import { useCookies } from "./CookieContext";

type GoogleAnalyticsProps = {
  enabled: boolean;
  measurementId: string;
};

/**
 * Loads the GA4 gtag.js tracking script — but only when:
 * 1. Google Analytics is enabled in the admin Settings → Analytics tab, AND
 * 2. The visitor has accepted the "Analytics" cookie category.
 * Respects consent automatically; no extra wiring needed elsewhere.
 */
export default function GoogleAnalytics({ enabled, measurementId }: GoogleAnalyticsProps) {
  const { preferences } = useCookies();

  if (!enabled || !measurementId || !preferences?.analytics) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
