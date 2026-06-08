import type { Metadata } from "next";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";

  return {
    title: isRo ? "Intrebari frecvente" : "Frequently Asked Questions",
    description: isRo
      ? "Claritate, siguranta si incredere. Tot ce trebuie sa stii despre NutriSense Intolerances, explicat simplu si uman."
      : "Clarity, safety, and trust. Everything you need to know about NutriSense Intolerances, explained simply and clearly.",
    alternates: {
      canonical: "/faq",
    },
  };
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
