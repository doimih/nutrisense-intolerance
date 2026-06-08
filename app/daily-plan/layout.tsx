import type { Metadata } from "next";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";

  return {
    title: isRo ? "Planul tau zilnic" : "Your Daily Plan",
    description: isRo
      ? "Planul zilnic NutriAID: rutina simpla de 5 minute pe zi pentru monitorizare si claritate."
      : "NutriAID daily plan: a simple 5-minute routine for monitoring and clarity.",
    alternates: {
      canonical: "/daily-plan",
    },
  };
}

export default function DailyPlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
