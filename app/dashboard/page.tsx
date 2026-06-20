"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  User,
  CheckCircle2,
} from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { PageLoader } from "@/components/LoadingOverlay";
import ErrorAlert from "@/components/ErrorAlert";
import OnboardingModal from "@/components/OnboardingModal";
import { me } from "@/lib/api/auth";
import { getProfile } from "@/lib/api/profile";
import { getHistory } from "@/lib/api/guidance";
import { listMonitoringEntries } from "@/lib/api/monitoring";
import type { User as UserType } from "@/types/user";
import type { UserProfile } from "@/types/profile";
import type { GuidanceHistoryEntry } from "@/types/guidance";
import type { MonitoringEntry } from "@/types/monitoring";
import { useLanguage } from "@/components/LanguageProvider";
import { getIntoleranceLabel, getSymptomLabel } from "@/lib/i18n/labels";
import { identifyTikTokUser, trackTikTokPurchase, trackTikTokSubscribe } from "@/components/TikTokPixel";

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export default function DashboardPage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const locale = isRo ? "ro-RO" : "en-US";
  const searchParams = useSearchParams();
  const billingStatus = searchParams.get("billing");
  const [user, setUser] = useState<UserType | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lastGuidance, setLastGuidance] = useState<GuidanceHistoryEntry | null>(null);
  const [lastEntry, setLastEntry] = useState<MonitoringEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([
      withTimeout(me()),
      withTimeout(getProfile()),
      withTimeout(getHistory()),
      withTimeout(listMonitoringEntries()),
    ])
      .then((results) => {
        const [uRes, pRes, hRes, mRes] = results;

        if (uRes.status === "fulfilled") {
          setUser(uRes.value);
          // Identify user for TikTok (hashes email client-side)
          void identifyTikTokUser(uRes.value.email, uRes.value.id);
        }
        if (pRes.status === "fulfilled") setProfile(pRes.value);
        if (hRes.status === "fulfilled") setLastGuidance(hRes.value[0] ?? null);
        if (mRes.status === "fulfilled") setLastEntry(mRes.value[0] ?? null);

        const hasFailure = results.some((result) => result.status === "rejected");
        if (hasFailure) {
          setError(
            isRo
              ? "Unele date din dashboard nu au putut fi incarcate."
              : "Some dashboard data could not be loaded."
          );
        }
      })
      .finally(() => setLoading(false));
  }, [isRo]);

  // Fire Purchase + Subscribe once when Stripe redirects back with billing=success
  useEffect(() => {
    if (billingStatus !== "success" || !user) return;
    const plan = user.plan ?? "pro";
    const planNames: Record<string, string> = { basic: "NutriAID Basic", pro: "NutriAID Pro", pro_plus: "NutriAID Pro+" };
    const planValues: Record<string, number> = { basic: 9, pro: 19, pro_plus: 29 };
    const content = { planCode: plan, planName: planNames[plan] ?? plan, value: planValues[plan] ?? 0 };
    trackTikTokPurchase(content);
    trackTikTokSubscribe(content);
  }, [billingStatus, user]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {billingStatus === "success" && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            {isRo
              ? "Plata a fost efectuata cu succes! Abonamentul tau este activ."
              : "Payment successful! Your subscription is now active."}
          </p>
        </div>
      )}

      {error && (
        <ErrorAlert
          message={error}
          onDismiss={() => setError("")}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isRo ? "Bun venit" : "Welcome"}, {user?.name?.split(" ")[0] ?? (isRo ? "utilizator" : "user")} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {isRo ? "Iata un rezumat al contului tau NutriAID." : "Here is a summary of your NutriAID account."}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Intolerances */}
        <Card bordered>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <Link href="/dashboard/profile" className="text-xs text-slate-400 hover:text-green-600 dark:hover:text-green-400 flex items-center gap-1 transition-colors">
              {isRo ? "Editeaza" : "Edit"} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {profile?.intolerances.length ?? 0}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isRo ? "Intolerante setate" : "Configured intolerances"}
          </p>
          {profile && profile.intolerances.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {profile.intolerances.slice(0, 3).map((i) => (
                <Badge key={i} variant="purple" size="sm">
                  {getIntoleranceLabel(i, lang)}
                </Badge>
              ))}
              {profile.intolerances.length > 3 && (
                <Badge variant="gray" size="sm">+{profile.intolerances.length - 3}</Badge>
              )}
            </div>
          )}
        </Card>

        {/* Last guidance */}
        <Card bordered>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <Link href="/dashboard/guidance" className="text-xs text-slate-400 hover:text-green-600 dark:hover:text-green-400 flex items-center gap-1 transition-colors">
              {isRo ? "Genereaza" : "Generate"} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {lastGuidance ? (isRo ? "Ultima recomandare" : "Latest guidance") : (isRo ? "Nicio recomandare" : "No guidance yet")}
          </p>
          {lastGuidance ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formatDate(lastGuidance.generatedAt, locale)}
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isRo ? "Genereaza prima ta recomandare" : "Generate your first guidance"}
            </p>
          )}
          <div className="mt-3">
            <Link href="/dashboard/guidance">
              <Badge variant="green" dot>
                {lastGuidance ? (isRo ? "Vezi detalii" : "View details") : (isRo ? "Genereaza acum" : "Generate now")}
              </Badge>
            </Link>
          </div>
        </Card>

        {/* Last journal */}
        <Card bordered>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <Link href="/dashboard/monitoring" className="text-xs text-slate-400 hover:text-green-600 dark:hover:text-green-400 flex items-center gap-1 transition-colors">
              {isRo ? "Adauga" : "Add"} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {lastEntry ? (isRo ? "Ultima inregistrare" : "Latest entry") : (isRo ? "Nicio inregistrare" : "No entries yet")}
          </p>
          {lastEntry ? (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {formatDate(lastEntry.date, locale)}
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                {lastEntry.symptoms.slice(0, 2).map((s) => (
                  <Badge key={s} variant="red" size="sm">{getSymptomLabel(s, lang)}</Badge>
                ))}
                {lastEntry.symptoms.length === 0 && (
                  <Badge variant="green" size="sm" dot>{isRo ? "Fara simptome" : "No symptoms"}</Badge>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isRo ? "Adauga prima inregistrare" : "Add your first entry"}
            </p>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          {isRo ? "Actiuni rapide" : "Quick actions"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              href: "/dashboard/guidance",
              icon: Sparkles,
              title: isRo ? "Genereaza recomandari" : "Generate guidance",
              description: isRo ? "Primesti liste cu alimente recomandate si de evitat" : "Get lists of recommended and avoid foods",
              color: "bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900",
              iconColor: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
            },
            {
              href: "/dashboard/monitoring",
              icon: BookOpen,
              title: isRo ? "Adauga in jurnal" : "Add journal entry",
              description: isRo ? "Noteaza ce ai mancat si cum te simti azi" : "Log what you ate and how you feel today",
              color: "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900",
              iconColor: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
            },
            {
              href: "/dashboard/profile",
              icon: User,
              title: isRo ? "Actualizeaza profilul" : "Update profile",
              description: isRo ? "Modifica intolerantele si preferintele alimentare" : "Edit intolerances and dietary preferences",
              color: "bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900",
              iconColor: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
            },
            {
              href: "/dashboard/history",
              icon: TrendingUp,
              title: isRo ? "Vezi istoricul" : "View history",
              description: isRo ? "Consulta toate recomandarile generate anterior" : "Review previously generated guidance",
              color: "bg-teal-50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900",
              iconColor: "bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400",
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 hover:shadow-sm ${action.color}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${action.iconColor}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {action.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 ml-auto flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      <OnboardingModal
        profile={profile}
        hasGuidance={lastGuidance !== null}
        lang={lang as "ro" | "en"}
      />
    </div>
  );
}
