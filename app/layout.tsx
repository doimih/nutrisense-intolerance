import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import { LanguageProvider } from "@/components/LanguageProvider";
import { getServerLanguage } from "@/lib/i18n/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nutrisense-i.eu";
const siteTitle = "NutriSense Intolerances";
const THEME_STORAGE_KEY = "ns_theme";
const siteDescription =
  "Un loc sigur pentru a intelege mai bine intolerantele alimentare si reactiile tale. Jurnal de monitorizare si recomandari generale.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteTitle,
      template: "%s | NutriSense Intolerances",
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
    authors: [{ name: "NutriSense Team" }],
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
          alt: "NutriSense Intolerances",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = getServerLanguage();

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
        <LanguageProvider initialLang={lang}>
          <StructuredData data={organizationSchema} />
          <StructuredData data={websiteSchema} />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
