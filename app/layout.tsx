import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import { LanguageProvider } from "@/components/LanguageProvider";
import CookieSystem from "@/components/CookieSystem";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import TikTokPixel from "@/components/TikTokPixel";
import { getServerLanguage } from "@/lib/i18n/server";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";
import EarlyAdopterBanner from "@/components/EarlyAdopterBanner";

const siteTitle = "NutriAID Intolerances";
const THEME_STORAGE_KEY = "ns_theme";
const siteDescription =
  "Un loc sigur pentru a intelege mai bine intolerantele alimentare si reactiile tale. Jurnal de monitorizare si recomandari generale.";

export async function generateMetadata(): Promise<Metadata> {
  const { siteUrl } = await getRuntimeSettings();
  const lang = getServerLanguage();
  const isRo = lang === "ro";

  const description = isRo
    ? "Un loc sigur pentru a intelege mai bine intolerantele alimentare si reactiile tale. Jurnal de monitorizare si recomandari generale."
    : "A safe place to better understand your food intolerances and reactions. Monitoring journal and general recommendations.";

  const keywords = isRo
    ? ["intolerante alimentare", "lactoza", "gluten", "jurnal alimentar", "nutritie", "sanatate"]
    : ["food intolerance", "lactose", "gluten", "food journal", "nutrition", "health"];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteTitle,
      template: "%s | NutriAID Intolerances",
    },
    description,
    keywords,
    authors: [{ name: "NutriAID Team" }],
    alternates: {
      canonical: siteUrl,
      languages: {
        ro: siteUrl,
        en: siteUrl,
        "x-default": siteUrl,
      },
    },
    openGraph: {
      type: "website",
      locale: isRo ? "ro_RO" : "en_US",
      url: siteUrl,
      title: siteTitle,
      description,
      siteName: siteTitle,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "NutriAID Intolerances",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description,
      images: ["/opengraph-image"],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "192x192" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "NutriAID",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { pwa } = await getRuntimeSettings();
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: pwa.themeColor || "#16a34a",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = getServerLanguage();
  const { siteUrl, analytics, tiktok } = await getRuntimeSettings();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteTitle,
    url: siteUrl,
    logo: `${siteUrl}/icon-512.png`,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteTitle,
    url: siteUrl,
    inLanguage: lang === "ro" ? "ro-RO" : "en-US",
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteTitle,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web, iOS, Android",
    url: siteUrl,
    description:
      "Aplicație AI pentru monitorizarea intoleranțelor alimentare. Analizează mesele și simptomele tale, identifică corelații și generează planuri alimentare personalizate.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    provider: {
      "@type": "Organization",
      name: siteTitle,
      url: siteUrl,
    },
  };

  const tiktokPixelScript = tiktok.enabled && tiktok.pixelId
    ? `!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.holdConsent();
  ttq.load('${tiktok.pixelId}'${tiktok.testEventCode ? `, {"test_event_code": "${tiktok.testEventCode}"}` : ""});
  ttq.page();
}(window, document, 'ttq');`
    : null;

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {tiktokPixelScript && (
          <script
            id="tiktok-pixel-base"
            dangerouslySetInnerHTML={{ __html: tiktokPixelScript }}
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const storedTheme = window.localStorage.getItem("${THEME_STORAGE_KEY}");
              document.documentElement.classList.toggle("dark", storedTheme === "dark");
            } catch {
              document.documentElement.classList.remove("dark");
            }
          `}
        </Script>
        <Script id="pwa-install-capture" strategy="beforeInteractive">
          {`
            window.__pwaInstallEvent = null;
            window.addEventListener('beforeinstallprompt', function(e) {
              e.preventDefault();
              window.__pwaInstallEvent = e;
            });
          `}
        </Script>
        <LanguageProvider initialLang={lang}>
          <CookieSystem>
            <GoogleAnalytics enabled={analytics.enabled} measurementId={analytics.measurementId} />
            <TikTokPixel enabled={tiktok.enabled} pixelId={tiktok.pixelId} testEventCode={tiktok.testEventCode} />
            <StructuredData data={organizationSchema} />
            <StructuredData data={websiteSchema} />
            <StructuredData data={softwareSchema} />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <PWAInstallPrompt />
            <EarlyAdopterBanner lang={lang as "ro" | "en"} />
          </CookieSystem>
        </LanguageProvider>
      </body>
    </html>
  );
}
