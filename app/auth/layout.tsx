import type { Metadata } from "next";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";

  return {
    title: isRo ? "Cont NutriSense" : "NutriSense Account",
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
