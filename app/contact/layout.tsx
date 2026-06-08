import type { Metadata } from "next";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";

  return {
    title: isRo ? "Contact" : "Contact",
    description: isRo
      ? "Contact NutriSense Intolerances: email, program suport si formular de contact."
      : "Contact NutriSense Intolerances: support email, support hours, and contact form.",
    alternates: {
      canonical: "/contact",
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
