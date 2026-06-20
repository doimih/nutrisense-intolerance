"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Leaf, X, Sparkles, ArrowRight, Users } from "lucide-react";

type SlotData = { slotsLeft: number; totalSlots: number; active: boolean };

const DISMISSED_KEY = "ns_ea_modal_dismissed";

export default function EarlyAdopterBanner({ lang }: { lang: "ro" | "en" }) {
  const isRo = lang === "ro";
  const [data, setData] = useState<SlotData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(DISMISSED_KEY) === "true") {
      return;
    }
    // Don't show to already logged-in users (uses /status which always returns 200)
    fetch("/api/auth/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { authenticated?: boolean } | null) => {
        if (s?.authenticated) return; // logged in — skip modal
        return fetch("/api/early-adopter/slots")
          .then((r) => (r.ok ? r.json() : null))
          .then((d: SlotData | null) => {
            if (d?.active) {
              setData(d);
              setTimeout(() => setVisible(true), 800);
            }
          });
      })
      .catch(() => {});
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
  };

  if (!visible || !data?.active) return null;

  const filledSlots = data.totalSlots - data.slotsLeft;
  const fillPercent = Math.round((filledSlots / data.totalSlots) * 100);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Green header */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 pt-8 pb-6">
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label={isRo ? "Închide" : "Close"}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">NutriAID</span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-100" />
            <span className="text-xs font-semibold text-white uppercase tracking-wide">
              {isRo ? "Ofertă lansare" : "Launch offer"}
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-bold text-white leading-snug">
            {isRo
              ? "Primii 100 utilizatori primesc acces PRO Gratuit"
              : "First 100 users get FREE PRO access"}
          </h2>
          <p className="mt-2 text-sm text-emerald-100">
            {isRo
              ? "Înregistrează-te acum și beneficiezi de toate funcțiile PRO fără niciun cost."
              : "Sign up now and enjoy all PRO features at no cost."}
          </p>
        </div>

        {/* White body */}
        <div className="bg-white dark:bg-zinc-900 px-6 py-5 space-y-4">
          {/* Slots counter */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>
                {isRo
                  ? `${filledSlots} din ${data.totalSlots} locuri ocupate`
                  : `${filledSlots} of ${data.totalSlots} spots taken`}
              </span>
            </div>
            <span className="font-bold text-emerald-600">
              {isRo ? `${data.slotsLeft} rămase` : `${data.slotsLeft} left`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
              style={{ width: `${Math.max(fillPercent, 3)}%` }}
            />
          </div>

          {/* Features */}
          <ul className="space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            {(isRo
              ? ["Recomandări AI personalizate", "Plan alimentar generat automat", "Jurnal de monitorizare nelimitat"]
              : ["Personalized AI recommendations", "Automatically generated meal plan", "Unlimited monitoring journal"]
            ).map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 text-[10px] font-bold">✓</span>
                </span>
                {feature}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/auth/register"
            onClick={handleClose}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-3 transition-colors"
          >
            {isRo ? "Creează cont gratuit" : "Create free account"}
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={handleClose}
            className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors py-1"
          >
            {isRo ? "Poate mai târziu" : "Maybe later"}
          </button>
        </div>
      </div>
    </div>
  );
}
