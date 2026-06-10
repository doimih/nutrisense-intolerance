import type { Metadata } from "next";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";

  return {
    title: isRo ? "Contact — NutriAID Intolerances" : "Contact — NutriAID Intolerances",
    description: isRo
      ? "Contactează echipa NutriAID Intolerances: suport prin email, program Luni-Vineri, răspuns în 24 ore."
      : "Contact NutriAID Intolerances support team: email, Monday to Friday, response within 24 hours.",
    alternates: {
      canonical: "/contact",
    },
    openGraph: {
      title: isRo ? "Contact — NutriAID Intolerances" : "Contact — NutriAID Intolerances",
      description: isRo
        ? "Ai o întrebare sau o problemă? Scrie-ne și revenim în cel mult 24 de ore."
        : "Have a question or issue? Send us a message and we will reply within 24 hours.",
      url: "/contact",
      locale: isRo ? "ro_RO" : "en_US",
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
