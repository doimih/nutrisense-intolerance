import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Întrebări frecvente (FAQ)",
  description:
    "Răspunsuri la întrebările frecvente despre NutriSense Intolerances, date personale, jurnal și recomandări.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
