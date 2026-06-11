"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Zap, Star, Crown, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import Card, { CardHeader, CardTitle, CardDescription } from "@/components/Card";

type PlanTier = "none" | "basic" | "pro" | "pro_plus" | "enterprise";
type SubscriptionStatus =
  | "active" | "trialing" | "past_due" | "canceled"
  | "incomplete" | "incomplete_expired" | "paused" | "unpaid" | "none";

type SubscriptionInfo = {
  planTier: PlanTier;
  subscription: {
    status: SubscriptionStatus;
    planCode: string | null;
    stripeSubscriptionId: string | null;
    updatedAt: string | null;
  };
};

type Props = {
  trialEndsAt?: string | null;
  lang: "ro" | "en";
};

const PLAN_META: Record<PlanTier, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; badgeClass: string }> = {
  none: { label: "Fără plan", icon: CreditCard, color: "text-slate-500", badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
  basic: { label: "Basic", icon: Zap, color: "text-green-600", badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  pro: { label: "Pro", icon: Star, color: "text-blue-600", badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  pro_plus: { label: "Pro+", icon: Crown, color: "text-purple-600", badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  enterprise: { label: "Enterprise", icon: Crown, color: "text-amber-600", badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
}

function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default function BillingSection({ trialEndsAt, lang }: Props) {
  const isRo = lang === "ro";
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    fetch("/api/billing/subscription")
      .then((r) => r.ok ? r.json() : null)
      .then((data: SubscriptionInfo | null) => { if (data) setInfo(data); })
      .finally(() => setLoading(false));
  }, []);

  const handlePortal = async () => {
    setOpeningPortal(true);
    try {
      const r = await fetch("/api/billing/portal", { method: "POST" });
      const body = (await r.json()) as { url?: string; error?: string };
      if (!r.ok) throw new Error(body.error ?? "Could not open portal.");
      window.location.href = body.url!;
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Eroare la deschidere portal.");
      setOpeningPortal(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm(isRo ? "Esti sigur ca vrei sa anulezi abonamentul?" : "Are you sure you want to cancel your subscription?")) return;
    setCancelling(true);
    setCancelError("");
    try {
      const r = await fetch("/api/billing/cancel", { method: "POST" });
      const body = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok) throw new Error(body.error ?? "Cancel failed.");
      setCancelDone(true);
      setInfo((prev) => prev ? { ...prev, planTier: "none", subscription: { ...prev.subscription, status: "canceled" } } : prev);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Eroare la anulare.");
    } finally {
      setCancelling(false);
    }
  };

  const trialActive = trialEndsAt && new Date(trialEndsAt).getTime() > Date.now();
  const trialExpired = trialEndsAt && new Date(trialEndsAt).getTime() <= Date.now();
  const hasActivePlan = info?.planTier && info.planTier !== "none";
  const isCanceled = info?.subscription.status === "canceled";
  const isPastDue = info?.subscription.status === "past_due";

  const meta = PLAN_META[info?.planTier ?? "none"];
  const PlanIcon = meta.icon;

  return (
    <Card bordered>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-400" />
          <CardTitle>{isRo ? "Abonament" : "Billing"}</CardTitle>
        </div>
        <CardDescription>
          {isRo ? "Planul tau activ si optiuni de abonament" : "Your active plan and subscription options"}
        </CardDescription>
      </CardHeader>

      {loading ? (
        <div className="h-16 flex items-center">
          <div className="w-32 h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current plan badge */}
          <div className="flex items-center justify-between gap-3">
            {/* Left: icon + description */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                info?.planTier === "enterprise" ? "bg-amber-100 dark:bg-amber-900/30" :
                info?.planTier === "pro_plus" ? "bg-purple-100 dark:bg-purple-900/30" :
                info?.planTier === "pro" ? "bg-blue-100 dark:bg-blue-900/30" :
                info?.planTier === "basic" ? "bg-green-100 dark:bg-green-900/30" :
                "bg-slate-100 dark:bg-slate-700"
              }`}>
                <PlanIcon className={`w-5 h-5 ${meta.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {hasActivePlan && !isCanceled
                    ? (isRo ? "Abonament activ" : "Active subscription")
                    : isCanceled
                    ? (isRo ? "Abonamentul a fost anulat" : "Subscription has been cancelled")
                    : (isRo ? "Niciun plan activ" : "No active plan")}
                </p>
                {hasActivePlan && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {meta.label}
                  </p>
                )}
              </div>
            </div>

            {/* Right: status indicators (only when something needs attention) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isCanceled && (
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  {isRo ? "Anulat" : "Cancelled"}
                </span>
              )}
              {isPastDue && (
                <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-3 h-3" /> {isRo ? "Plata restanta" : "Past due"}
                </span>
              )}
            </div>
          </div>

          {/* Trial status */}
          {!hasActivePlan && trialActive && trialEndsAt && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {isRo ? `Perioada de probă: ${daysLeft(trialEndsAt)} zile rămase` : `Free trial: ${daysLeft(trialEndsAt)} days left`}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  {isRo ? `Expiră pe ${formatDate(trialEndsAt)}` : `Expires on ${formatDate(trialEndsAt)}`}
                </p>
              </div>
            </div>
          )}

          {!hasActivePlan && trialExpired && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {isRo ? "Perioada de probă a expirat. Alege un plan pentru acces complet." : "Free trial expired. Choose a plan for full access."}
              </p>
            </div>
          )}

          {cancelDone && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="text-sm text-green-700 dark:text-green-300">
                {isRo ? "Abonamentul a fost anulat cu succes." : "Subscription cancelled successfully."}
              </p>
            </div>
          )}

          {cancelError && (
            <p className="text-sm text-red-600 dark:text-red-400">{cancelError}</p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {(!hasActivePlan || isCanceled) && (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
              >
                <Zap className="w-4 h-4" />
                {isRo ? "Alege un plan" : "Choose a plan"}
              </Link>
            )}

            {hasActivePlan && !isCanceled && (
              <>
                <button
                  type="button"
                  onClick={() => void handlePortal()}
                  disabled={openingPortal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  {openingPortal
                    ? (isRo ? "Se deschide..." : "Opening...")
                    : (isRo ? "Gestionează abonamentul" : "Manage subscription")}
                </button>
                <button
                  type="button"
                  onClick={() => void handleCancel()}
                  disabled={cancelling}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {cancelling
                    ? (isRo ? "Se anulează..." : "Cancelling...")
                    : (isRo ? "Anulează abonamentul" : "Cancel subscription")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
