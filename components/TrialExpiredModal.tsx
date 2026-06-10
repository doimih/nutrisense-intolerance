"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Zap, Star, Crown, AlertTriangle } from "lucide-react";

type Props = {
  userId: string;
  lang: "ro" | "en";
};

const PLANS = [
  {
    code: "basic" as const,
    label: "Basic",
    price: "9,99",
    icon: Zap,
    iconClass: "text-green-600",
    bgClass: "bg-green-50 dark:bg-green-950/20",
    borderClass: "border-green-200 dark:border-green-800",
    btnClass: "bg-green-600 hover:bg-green-700",
    features: { ro: ["Mese & simptome", "Corelații de bază", "Alimente suspecte"], en: ["Meals & symptoms", "Basic correlations", "Suspect foods"] },
  },
  {
    code: "pro" as const,
    label: "Pro",
    price: "14,99",
    icon: Star,
    iconClass: "text-blue-600",
    bgClass: "bg-blue-50 dark:bg-blue-950/20",
    borderClass: "border-blue-300 dark:border-blue-700",
    btnClass: "bg-blue-600 hover:bg-blue-700",
    highlight: true,
    features: { ro: ["Tot din Basic", "Analiză AI avansată", "Recomandări personalizate", "Rapoarte zilnice"], en: ["All from Basic", "Advanced AI analysis", "Personalized recommendations", "Daily reports"] },
  },
  {
    code: "pro_plus" as const,
    label: "Pro+",
    price: "35,99",
    icon: Crown,
    iconClass: "text-purple-600",
    bgClass: "bg-purple-50 dark:bg-purple-950/20",
    borderClass: "border-purple-200 dark:border-purple-800",
    btnClass: "bg-purple-600 hover:bg-purple-700",
    features: { ro: ["Tot din Pro", "Predicții avansate", "Suport prioritar", "Actualizări în timp real"], en: ["All from Pro", "Advanced predictions", "Priority support", "Real-time updates"] },
  },
];

const DISMISS_KEY_PREFIX = "trial_modal_dismissed_";

export default function TrialExpiredModal({ userId, lang }: Props) {
  const isRo = lang === "ro";
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const key = `${DISMISS_KEY_PREFIX}${userId}`;
    const dismissed = sessionStorage.getItem(key);
    if (!dismissed) setVisible(true);
  }, [userId]);

  const dismiss = () => {
    sessionStorage.setItem(`${DISMISS_KEY_PREFIX}${userId}`, "1");
    setVisible(false);
  };

  const startCheckout = async (planCode: string) => {
    setLoading(planCode);
    try {
      const r = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      if (r.status === 401) { router.push("/auth/login?redirect=/dashboard"); return; }
      const body = (await r.json()) as { url?: string; error?: string };
      if (!r.ok || !body.url) throw new Error(body.error ?? "Error");
      window.location.href = body.url;
    } catch {
      setLoading(null);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isRo ? "Perioada de probă a expirat" : "Your free trial has ended"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isRo
                  ? "Alege un plan pentru a continua accesul complet la NutriAID."
                  : "Choose a plan to continue full access to NutriAID."}
              </p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isRo ? "Închide" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const features = isRo ? plan.features.ro : plan.features.en;
            return (
              <div
                key={plan.code}
                className={`relative flex flex-col rounded-xl border p-4 ${plan.bgClass} ${plan.borderClass} ${plan.highlight ? "ring-2 ring-blue-400 dark:ring-blue-600" : ""}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      {isRo ? "Recomandat" : "Popular"}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-4 h-4 ${plan.iconClass}`} />
                  <span className="font-bold text-slate-900 dark:text-white">{plan.label}</span>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">EUR/lună</span>
                </div>
                <ul className="space-y-1 mb-4 flex-1">
                  {features.map((f) => (
                    <li key={f} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => void startCheckout(plan.code)}
                  disabled={loading !== null}
                  className={`w-full py-2 rounded-xl text-white text-sm font-semibold transition-colors ${plan.btnClass} disabled:opacity-60`}
                >
                  {loading === plan.code
                    ? (isRo ? "Se încarcă..." : "Loading...")
                    : (isRo ? `Alege ${plan.label}` : `Choose ${plan.label}`)}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 text-center">
          <button
            onClick={dismiss}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {isRo ? "Amintește-mi mai târziu" : "Remind me later"}
          </button>
        </div>
      </div>
    </div>
  );
}
