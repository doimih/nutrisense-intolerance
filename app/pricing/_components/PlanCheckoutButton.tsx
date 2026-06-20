"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BillingPlanCode } from "@/lib/billing/plans";
import { trackTikTokInitiateCheckout, trackTikTokAddPaymentInfo } from "@/components/TikTokPixel";

const PLAN_NAMES: Record<string, string> = {
  basic: "NutriAID Basic",
  pro: "NutriAID Pro",
  pro_plus: "NutriAID Pro+",
};
const PLAN_VALUES: Record<string, number> = { basic: 9, pro: 19, pro_plus: 29 };

type PlanCheckoutButtonProps = {
  planCode: BillingPlanCode;
  label: string;
  loginRequiredLabel: string;
  loadingLabel: string;
};

export default function PlanCheckoutButton({
  planCode,
  label,
  loginRequiredLabel,
  loadingLabel,
}: PlanCheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startCheckout = async () => {
    setLoading(true);
    setError("");

    const planContent = {
      planCode,
      planName: PLAN_NAMES[planCode] ?? planCode,
      value: PLAN_VALUES[planCode] ?? 0,
    };
    trackTikTokInitiateCheckout(planContent);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planCode,
        }),
      });

      if (response.status === 401) {
        router.push(`/auth/login?redirect=/pricing`);
        return;
      }

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Could not start Stripe checkout.");
      }

      const payload = (await response.json()) as { url?: string };
      if (!payload.url) {
        throw new Error("Stripe checkout URL is missing.");
      }

      trackTikTokAddPaymentInfo(planContent);
      window.location.href = payload.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : loginRequiredLabel);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-2">
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
      >
        {loading ? loadingLabel : label}
      </button>
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
