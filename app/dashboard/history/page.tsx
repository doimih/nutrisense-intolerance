"use client";

import React, { useEffect, useState } from "react";
import { History, Sparkles, ChevronRight, Inbox } from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { PageLoader } from "@/components/LoadingOverlay";
import { useLanguage } from "@/components/LanguageProvider";
import { getHistory } from "@/lib/api/guidance";
import { getDietaryLabel, getIntoleranceLabel } from "@/lib/i18n/labels";
import type { GuidanceHistoryEntry } from "@/types/guidance";
import Link from "next/link";

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const locale = isRo ? "ro-RO" : "en-US";
  const [entries, setEntries] = useState<GuidanceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getHistory()
      .then((h) => {
        setEntries(h);
      })
      .catch((err: unknown) => {
        void err;
        setError(isRo ? "Nu am putut incarca istoricul." : "Could not load history.");
      })
      .finally(() => setLoading(false));
  }, [isRo]);

  if (loading) return <PageLoader />;

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
        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
          <History className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {isRo ? "Istoric recomandari" : "Guidance history"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isRo ? "Toate recomandarile generate anterior" : "All previously generated guidance"}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
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
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 hover:shadow-sm transition-shadow"
            >
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
                <Link
                  href="/dashboard/guidance"
                  className="flex-shrink-0 flex items-center gap-1 text-xs text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  <span className="hidden sm:block">{isRo ? "Vezi detalii" : "View details"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
