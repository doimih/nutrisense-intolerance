"use client";

import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";

export default function BillingCancelledNotice({ lang }: { lang: "ro" | "en" }) {
  const searchParams = useSearchParams();
  if (searchParams.get("billing") !== "cancelled") return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
        <XCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          {lang === "ro"
            ? "Plata a fost anulata. Poti selecta un plan oricand esti gata."
            : "Payment was cancelled. You can select a plan whenever you're ready."}
        </p>
      </div>
    </div>
  );
}
