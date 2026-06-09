import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import { LanguageProvider } from "@/components/LanguageProvider";
import CookieSystem from "@/components/CookieSystem";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { getServerLanguage } from "@/lib/i18n/server";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";

const siteTitle = "NutriAID Intolerances";
const THEME_STORAGE_KEY = "ns_theme";
const siteDescription =
  "Un loc sigur pentru a intelege mai bine intolerantele alimentare si reactiile tale. Jurnal de monitorizare si recomandari generale.";

export async function generateMetadata(): Promise<Metadata> {
  const { siteUrl } = await getRuntimeSettings();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteTitle,
      template: "%s | NutriAID Intolerances",
    },
    description: siteDescription,
    keywords: [
      "intolerante alimentare",
      "lactoza",
      "gluten",
      "jurnal alimentar",
      "nutritie",
      "sanatate",
    ],
    authors: [{ name: "NutriAID Team" }],
    openGraph: {
      type: "website",
      locale: "ro_RO",
      url: siteUrl,
      title: siteTitle,
      description: siteDescription,
      siteName: siteTitle,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "NutriAID Intolerances",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: ["/og-image.png"],
    },
    robots: "index, follow",
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
  const { siteUrl } = await getRuntimeSettings();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteTitle,
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteTitle,
    url: siteUrl,
    inLanguage: "ro-RO",
  };

  return (
    <html lang={lang} suppressHydrationWarning>
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
            <StructuredData data={organizationSchema} />
            <StructuredData data={websiteSchema} />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <PWAInstallPrompt />
          </CookieSystem>
        </LanguageProvider>
      </body>
    </html>
  );
}
