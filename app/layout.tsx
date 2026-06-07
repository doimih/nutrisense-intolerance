import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AppLanguage } from "@/lib/i18n/config";
import { getServerLanguage } from "@/lib/i18n/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nutrisense-i.eu";
const siteTitle = "NutriSense Intolerances";
const descriptions: Record<AppLanguage, string> = {
  ro: "Un loc sigur pentru a intelege mai bine intolerantele alimentare si reactiile tale. Jurnal de monitorizare si recomandari generale.",
  en: "A safe place to better understand food intolerances and your reactions. Monitoring journal and general guidance.",
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = getServerLanguage();
  const siteDescription = descriptions[lang];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteTitle,
      template: "%s | NutriSense Intolerances",
    },
    description: siteDescription,
    keywords:
      lang === "ro"
        ? [
            "intolerante alimentare",
            "lactoza",
            "gluten",
            "jurnal alimentar",
            "nutritie",
            "sanatate",
          ]
        : ["food intolerances", "lactose", "gluten", "food journal", "nutrition", "health"],
    authors: [{ name: "NutriSense Team" }],
    openGraph: {
      type: "website",
      locale: lang === "ro" ? "ro_RO" : "en_US",
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
    inLanguage: lang === "ro" ? "ro-RO" : "en-US",
  };

  return (
    <html lang={lang}>
      <body className="min-h-screen flex flex-col">
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
