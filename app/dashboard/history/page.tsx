"use client";

import React, { useEffect, useState, useMemo } from "react";
import { History, Sparkles, ChevronRight, ChevronDown, Inbox, TrendingUp, Lock, BarChart2, CheckCircle2, XCircle, UtensilsCrossed, Lightbulb, Loader2, AlertTriangle, FileDown } from "lucide-react";
import Link from "next/link";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { PageLoader } from "@/components/LoadingOverlay";
import { useLanguage } from "@/components/LanguageProvider";
import { getHistory, getGuidanceById } from "@/lib/api/guidance";
import { listMonitoringEntries } from "@/lib/api/monitoring";
import { getDietaryLabel, getIntoleranceLabel, getSymptomLabel } from "@/lib/i18n/labels";
import type { GuidanceHistoryEntry, GuidanceResult } from "@/types/guidance";
import type { MonitoringEntry, Symptom } from "@/types/monitoring";
import { groupMealExamplesByDay } from "@/lib/guidance/mealGrouping";

type PlanTier = "none" | "basic" | "pro" | "pro_plus" | "enterprise";

function planAllows(userPlan: PlanTier, required: PlanTier): boolean {
  const order: PlanTier[] = ["none", "basic", "pro", "pro_plus", "enterprise"];
  return order.indexOf(userPlan) >= order.indexOf(required);
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

function ProEvolutionSection({ entries, lang, isRo }: { entries: MonitoringEntry[]; lang: "ro" | "en"; isRo: boolean }) {
  const locale = isRo ? "ro-RO" : "en-US";

  const stats = useMemo(() => {
    if (entries.length === 0) return null;

    const symptomCount: Record<string, number> = {};
    const wellbeingByWeek: number[] = [];
    let entriesWithSymptoms = 0;

    for (const entry of entries) {
      for (const s of entry.symptoms) {
        symptomCount[s] = (symptomCount[s] || 0) + 1;
      }
      wellbeingByWeek.push(entry.wellbeing);
      if (entry.symptoms.length > 0) entriesWithSymptoms++;
    }

    const topSymptoms = Object.entries(symptomCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([s, count]) => ({ symptom: s as Symptom, count }));

    const avgWellbeing = wellbeingByWeek.length > 0
      ? (wellbeingByWeek.reduce((a, b) => a + b, 0) / wellbeingByWeek.length).toFixed(1)
      : null;

    const symptomRate = entries.length > 0
      ? Math.round((entriesWithSymptoms / entries.length) * 100)
      : 0;

    const last7 = entries.slice(0, 7);
    const last7Avg = last7.length > 0
      ? (last7.reduce((a, b) => a + b.wellbeing, 0) / last7.length).toFixed(1)
      : null;

    const trend = last7Avg && avgWellbeing
      ? parseFloat(last7Avg) > parseFloat(avgWellbeing) ? "up" : parseFloat(last7Avg) < parseFloat(avgWellbeing) ? "down" : "stable"
      : "stable";

    return { topSymptoms, avgWellbeing, symptomRate, last7Avg, trend, totalEntries: entries.length };
  }, [entries]);

  if (!stats || entries.length < 3) {
    return (
      <Card bordered>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {isRo ? "Evoluție detaliată" : "Detailed evolution"}
          </p>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Pro</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isRo ? "Înregistrează cel puțin 3 intrări în jurnal pentru a vedea tendințele." : "Log at least 3 journal entries to see trends."}
        </p>
      </Card>
    );
  }

  return (
    <Card bordered>
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-4 h-4 text-blue-500" />
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {isRo ? "Evoluție detaliată" : "Detailed evolution"}
        </p>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Pro</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalEntries}</p>
          <p className="text-xs text-slate-500 mt-0.5">{isRo ? "inregistrari" : "entries"}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.avgWellbeing ?? "—"}</p>
          <p className="text-xs text-slate-500 mt-0.5">{isRo ? "medie stare" : "avg wellbeing"}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
          <p className={`text-xl font-bold ${stats.trend === "up" ? "text-green-600 dark:text-green-400" : stats.trend === "down" ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>
            {stats.last7Avg ?? "—"} {stats.trend === "up" ? "↑" : stats.trend === "down" ? "↓" : "→"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{isRo ? "ultimele 7" : "last 7"}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
          <p className={`text-xl font-bold ${stats.symptomRate > 50 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}>
            {stats.symptomRate}%
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{isRo ? "cu simptome" : "with symptoms"}</p>
        </div>
      </div>

      {stats.topSymptoms.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            {isRo ? "Simptome frecvente" : "Frequent symptoms"}
          </p>
          <div className="space-y-2">
            {stats.topSymptoms.map(({ symptom, count }) => (
              <div key={symptom} className="flex items-center gap-3">
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">
                  {getSymptomLabel(symptom, lang)}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 dark:bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, (count / stats.totalEntries) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <p className="text-xs text-slate-400">
          {isRo ? `Bazat pe ${stats.totalEntries} înregistrări` : `Based on ${stats.totalEntries} entries`}
        </p>
      </div>
    </Card>
  );
}

function ProPlusDailyReports({ entries, isRo, locale }: { entries: MonitoringEntry[]; isRo: boolean; locale: string }) {
  const last14 = useMemo(() => {
    const map: Record<string, { wellbeing: number; symptoms: number; foods: number }> = {};
    for (const entry of entries.slice(0, 14)) {
      const key = entry.date.slice(0, 10);
      if (!map[key]) map[key] = { wellbeing: 0, symptoms: 0, foods: 0 };
      map[key].wellbeing = Math.max(map[key].wellbeing, entry.wellbeing);
      map[key].symptoms += entry.symptoms.length;
      map[key].foods += entry.consumedFoods.length;
    }
    return Object.entries(map)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 7);
  }, [entries]);

  if (last14.length === 0) return null;

  return (
    <Card bordered>
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 className="w-4 h-4 text-purple-500" />
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {isRo ? "Raport zilnic (ultimele 7 zile)" : "Daily report (last 7 days)"}
        </p>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">Pro+</span>
      </div>

      <div className="space-y-2">
        {last14.map(([date, data]) => (
          <div key={date} className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">
              {formatDateShort(date, locale)}
            </span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{data.wellbeing}/5</span>
                <span className="text-xs text-slate-400">{isRo ? "stare" : "wb"}</span>
              </div>
              <div className="w-px h-3 bg-slate-200 dark:bg-slate-600" />
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`text-xs font-semibold ${data.symptoms > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}>
                  {data.symptoms}
                </span>
                <span className="text-xs text-slate-400">{isRo ? "simptome" : "symptoms"}</span>
              </div>
              <div className="w-px h-3 bg-slate-200 dark:bg-slate-600" />
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{data.foods}</span>
                <span className="text-xs text-slate-400">{isRo ? "alimente" : "foods"}</span>
              </div>
            </div>
            <div className="flex-shrink-0 w-20">
              <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${data.wellbeing >= 4 ? "bg-green-400" : data.wellbeing === 3 ? "bg-yellow-400" : "bg-red-400"}`}
                  style={{ width: `${(data.wellbeing / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

type DetailState = GuidanceResult | "loading" | "error";

export default function HistoryPage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const locale = isRo ? "ro-RO" : "en-US";
  const [entries, setEntries] = useState<GuidanceHistoryEntry[]>([]);
  const [monitoringEntries, setMonitoringEntries] = useState<MonitoringEntry[]>([]);
  const [planTier, setPlanTier] = useState<PlanTier>("basic");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, DetailState>>({});

  useEffect(() => {
    Promise.allSettled([
      getHistory(),
      listMonitoringEntries(),
      fetch("/api/billing/subscription").then((r) => r.ok ? r.json() : { planTier: "none" }),
    ])
      .then(([hRes, mRes, sRes]) => {
        if (hRes.status === "fulfilled") setEntries(hRes.value);
        else setError(isRo ? "Nu am putut incarca istoricul." : "Could not load history.");
        if (mRes.status === "fulfilled") setMonitoringEntries(mRes.value);
        if (sRes.status === "fulfilled") {
          setPlanTier((sRes.value as { planTier?: PlanTier }).planTier ?? "none");
        }
      })
      .finally(() => setLoading(false));
  }, [isRo]);

  const handleToggleDetails = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (detailCache[id]) return;
    setDetailCache((prev) => ({ ...prev, [id]: "loading" }));
    try {
      const result = await getGuidanceById(id);
      setDetailCache((prev) => ({ ...prev, [id]: result ?? "error" }));
    } catch {
      setDetailCache((prev) => ({ ...prev, [id]: "error" }));
    }
  };

  if (loading) return <PageLoader />;

  const canSeeEvolution = planAllows(planTier, "pro");
  const canSeeDailyReports = planAllows(planTier, "pro_plus");

  const getEntrySummary = (entry: GuidanceHistoryEntry) => {
    const labels = entry.intolerances.map((intol) => getIntoleranceLabel(intol, lang));
    if (labels.length === 0) {
      return isRo ? "Recomandari fara restrictii specifice" : "Guidance with no specific restrictions";
    }
    return isRo ? `Recomandari pentru: ${labels.join(", ")}` : `Guidance for: ${labels.join(", ")}`;
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
          <History className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {isRo ? "Istoric & Evoluție" : "History & Evolution"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isRo ? "Recomandări generate și tendințele tale" : "Generated guidance and your trends"}
          </p>
        </div>
      </div>

      {/* Pro evolution section */}
      {canSeeEvolution ? (
        <ProEvolutionSection entries={monitoringEntries} lang={lang as "ro" | "en"} isRo={isRo} />
      ) : (
        <div className="relative rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {isRo ? "Evoluție detaliată & corelații" : "Detailed evolution & correlations"}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Pro</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {isRo ? "Tendințe simptome, statistici evoluție și analiză de corelații." : "Symptom trends, evolution stats, and correlation analysis."}
              </p>
            </div>
            <Link
              href="/pricing"
              className="flex-shrink-0 text-xs font-semibold text-green-600 hover:text-green-700 dark:text-green-400 transition-colors"
            >
              {isRo ? "Upgrade" : "Upgrade"}
            </Link>
          </div>
        </div>
      )}

      {/* Pro+ daily reports */}
      {canSeeDailyReports ? (
        monitoringEntries.length > 0 && (
          <ProPlusDailyReports entries={monitoringEntries} isRo={isRo} locale={locale} />
        )
      ) : (
        <div className="relative rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {isRo ? "Rapoarte zilnice" : "Daily reports"}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">Pro+</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {isRo ? "Rapoarte zilnice detaliate cu stare, simptome și tendințe." : "Detailed daily reports with wellbeing, symptoms, and trends."}
              </p>
            </div>
            <Link
              href="/pricing"
              className="flex-shrink-0 text-xs font-semibold text-green-600 hover:text-green-700 dark:text-green-400 transition-colors"
            >
              {isRo ? "Upgrade" : "Upgrade"}
            </Link>
          </div>
        </div>
      )}

      {/* Guidance history list */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRo ? "Recomandări generate" : "Generated guidance"}
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {isRo ? "Nicio recomandare generata" : "No guidance generated"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs">
              {isRo
                ? "Mergi la sectiunea Recomandari pentru a genera prima ta recomandare."
                : "Go to the Guidance section to generate your first recommendation."}
            </p>
            <Link
              href="/dashboard/guidance"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {isRo ? "Genereaza prima recomandare" : "Generate first guidance"}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const detail = detailCache[entry.id];
              return (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden transition-shadow hover:shadow-sm"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {getEntrySummary(entry)}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          {formatDate(entry.generatedAt, locale)}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.intolerances.map((intol) => (
                            <Badge key={intol} variant="green" size="sm">
                              {getIntoleranceLabel(intol, lang)}
                            </Badge>
                          ))}
                          <Badge variant="teal" size="sm">
                            {getDietaryLabel(entry.dietaryPreference, lang)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={`/api/guidance/history/${entry.id}/pdf`}
                          download
                          title={isRo ? "Descarcă PDF" : "Download PDF"}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-green-100 dark:bg-slate-700 dark:hover:bg-green-900/30 text-slate-500 hover:text-green-700 dark:text-slate-400 dark:hover:text-green-400 transition-colors text-[10px] font-bold uppercase tracking-wide"
                        >
                          <FileDown className="w-3 h-3" />
                          PDF
                        </a>
                        <button
                          type="button"
                          onClick={() => handleToggleDetails(entry.id)}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        >
                          <span className="hidden sm:block">{isRo ? "Vezi detalii" : "View details"}</span>
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30 px-5 py-4 space-y-5">
                      {detail === "loading" && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 py-4 justify-center">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isRo ? "Se incarca detaliile..." : "Loading details..."}
                        </div>
                      )}
                      {detail === "error" && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 py-4 justify-center">
                          <AlertTriangle className="w-4 h-4" />
                          {isRo ? "Nu am putut incarca detaliile." : "Could not load details."}
                        </div>
                      )}
                      {detail && detail !== "loading" && detail !== "error" && (
                        <>
                          {detail.recommendedFoods.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                  {isRo ? "Alimente recomandate" : "Recommended foods"}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {detail.recommendedFoods.map((food, i) => (
                                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                                    {food}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {detail.avoidFoods.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-2">
                                <XCircle className="w-3.5 h-3.5 text-red-500" />
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                  {isRo ? "Alimente de evitat" : "Foods to avoid"}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {detail.avoidFoods.map((food, i) => (
                                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium">
                                    {food}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {detail.mealExamples.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-2">
                                <UtensilsCrossed className="w-3.5 h-3.5 text-teal-500" />
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                  {isRo ? "Exemple de mese" : "Meal examples"}
                                </p>
                              </div>
                              {(() => {
                                const grouped = groupMealExamplesByDay(detail.mealExamples, isRo ? "ro" : "en");
                                if (grouped) {
                                  return (
                                    <div className="space-y-3">
                                      {grouped.map((dayGroup) => (
                                        <div key={dayGroup.day}>
                                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {dayGroup.label}
                                          </p>
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            {dayGroup.meals.map(({ mealType, label, meal }) => (
                                              <div key={mealType} className="rounded-lg bg-white dark:bg-slate-800 border border-teal-100 dark:border-teal-900/40 p-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-500 dark:text-teal-400 mb-1">{label}</p>
                                                <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-1">{meal.name}</p>
                                                {(meal.ingredients ?? []).length > 0 && (
                                                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                    {(meal.ingredients ?? []).join(", ")}
                                                  </p>
                                                )}
                                                {meal.notes && (
                                                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">{meal.notes}</p>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }

                                return (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {detail.mealExamples.map((meal, i) => (
                                      <div key={i} className="rounded-lg bg-white dark:bg-slate-800 border border-teal-100 dark:border-teal-900/40 p-3">
                                        <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-1">{meal.name}</p>
                                        {(meal.ingredients ?? []).length > 0 && (
                                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {(meal.ingredients ?? []).join(", ")}
                                          </p>
                                        )}
                                        {meal.notes && (
                                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">{meal.notes}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {detail.generalTips.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-2">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                  {isRo ? "Sfaturi generale" : "General tips"}
                                </p>
                              </div>
                              <ul className="space-y-1.5">
                                {detail.generalTips.map((tip, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="pt-1 border-t border-slate-100 dark:border-slate-700/50">
                            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                              {detail.disclaimer}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
