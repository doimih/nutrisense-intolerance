"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, XCircle, UtensilsCrossed, Lightbulb, AlertTriangle, Lock, Zap, FileDown, RefreshCw } from "lucide-react";
import Card, { CardHeader, CardTitle } from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import ErrorAlert from "@/components/ErrorAlert";
import { PageLoader } from "@/components/LoadingOverlay";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { getProfile } from "@/lib/api/profile";
import { generateGuidance } from "@/lib/api/guidance";
import { getDietaryLabel, getIntoleranceLabel } from "@/lib/i18n/labels";
import type { GuidanceResult, DetailLevel } from "@/types/guidance";
import type { Intolerance, DietaryPreference } from "@/types/profile";
import { INTOLERANCE_LABELS, DIETARY_PREFERENCE_LABELS } from "@/types/profile";
import { groupMealExamplesByDay } from "@/lib/guidance/mealGrouping";

type PlanTier = "none" | "basic" | "pro" | "pro_plus" | "enterprise";

const ALL_INTOLERANCES = Object.keys(INTOLERANCE_LABELS) as Intolerance[];

const detailLevels: DetailLevel[] = ["basic", "detailed", "comprehensive"];

function getPlanLabel(planTier: PlanTier, isRo: boolean): string {
  if (planTier === "enterprise") return "Enterprise";
  if (planTier === "pro_plus") return "Pro+";
  if (planTier === "pro") return "Pro";
  if (planTier === "basic") return "Basic";
  return isRo ? "Fara plan activ" : "No active plan";
}

function getPlanColor(planTier: PlanTier): string {
  if (planTier === "enterprise") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  if (planTier === "pro_plus") return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
  if (planTier === "pro") return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
  if (planTier === "basic") return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
}

function getDetailLabel(level: DetailLevel, isRo: boolean) {
  if (level === "basic") return isRo ? "De baza" : "Basic";
  if (level === "detailed") return isRo ? "Detaliat" : "Detailed";
  return isRo ? "Complet" : "Comprehensive";
}

function getDetailDescription(level: DetailLevel, isRo: boolean) {
  if (level === "basic") return isRo ? "Recomandari esentiale" : "Essential guidance";
  if (level === "detailed") return isRo ? "Cu sfaturi practice" : "With practical tips";
  return isRo ? "Ghid extins" : "Extended guide";
}

function getDetailRequiredPlan(level: DetailLevel): PlanTier {
  if (level === "basic") return "basic";
  if (level === "detailed") return "pro";
  return "pro_plus";
}

function planAllows(userPlan: PlanTier, required: PlanTier): boolean {
  const order: PlanTier[] = ["none", "basic", "pro", "pro_plus", "enterprise"];
  return order.indexOf(userPlan) >= order.indexOf(required);
}

export default function GuidancePage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GuidanceResult | null>(null);
  const [planTier, setPlanTier] = useState<PlanTier>("none");
  const [form, setForm] = useState({
    intolerances: [] as Intolerance[],
    dietaryPreferences: ["normal"] as DietaryPreference[],
    detailLevel: "basic" as DetailLevel,
  });

  useEffect(() => {
    Promise.all([
      getProfile(),
      fetch("/api/billing/subscription").then((r) => r.ok ? r.json() : { planTier: "none" }),
    ]).then(([p, sub]) => {
      const tier: PlanTier = (sub as { planTier?: PlanTier }).planTier ?? "none";
      setPlanTier(tier);
      // Default detail level to max allowed by plan
      const defaultDetail: DetailLevel =
        (tier === "pro_plus" || tier === "enterprise") ? "comprehensive" :
        tier === "pro" ? "detailed" : "basic";
      setForm((f) => ({
        ...f,
        intolerances: p.intolerances,
        dietaryPreferences: p.dietaryPreferences ?? [p.dietaryPreference],
        detailLevel: defaultDetail,
      }));
      setLoadingProfile(false);
    });
  }, []);

  const toggleDietaryPreference = (pref: DietaryPreference) => {
    setForm((f) => {
      const current = f.dietaryPreferences;
      if (current.includes(pref)) {
        const next = current.filter((p) => p !== pref);
        return { ...f, dietaryPreferences: next.length > 0 ? next : ["normal"] };
      }
      return { ...f, dietaryPreferences: [...current, pref] };
    });
  };

  const toggleIntolerance = (intol: Intolerance) => {
    setForm((f) => ({
      ...f,
      intolerances: f.intolerances.includes(intol)
        ? f.intolerances.filter((i) => i !== intol)
        : [...f.intolerances, intol],
    }));
  };

  const handleGenerate = async (forceRegenerate = false) => {
    setError("");
    setGenerating(true);
    try {
      const res = await generateGuidance({
        ...form,
        dietaryPreference: form.dietaryPreferences[0] ?? "normal",
        dietaryPreferences: form.dietaryPreferences,
        lang: lang as "ro" | "en",
        forceRegenerate,
      });
      setResult(res);
    } catch (err: unknown) {
      const fallbackMessage = isRo
        ? "Nu am putut procesa analiza acum, încearcă din nou."
        : "We could not process the analysis right now. Please try again.";
      setError(err instanceof Error ? err.message : fallbackMessage);
    } finally {
      setGenerating(false);
    }
  };

  if (loadingProfile) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {isRo ? "Recomandari generale" : "General guidance"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRo ? "Personalizate pe baza intolerantelor selectate" : "Personalized based on selected intolerances"}
            </p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getPlanColor(planTier)}`}>
          {getPlanLabel(planTier, isRo)}
        </span>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

      {planTier === "none" && (
        <div className="relative rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 p-10 text-center">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {isRo ? "Perioada de probă a expirat" : "Free trial has ended"}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {isRo
              ? "Alege un plan pentru a accesa recomandările AI personalizate, analiza alimentară și ghidarea nutrițională."
              : "Choose a plan to access personalized AI guidance, food analysis, and nutritional recommendations."}
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Zap className="w-4 h-4" />
            {isRo ? "Alege un plan" : "Choose a plan"}
          </Link>
        </div>
      )}

      {/* Form – hidden when no active plan */}
      {planTier === "none" ? null : <Card bordered>
        <CardHeader>
          <CardTitle>{isRo ? "Configureaza recomandarile" : "Configure guidance"}</CardTitle>
        </CardHeader>
        <div className="space-y-5">
          {/* Intolerances */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {isRo ? "Intolerante" : "Intolerances"}
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_INTOLERANCES.map((intol) => {
                const selected = form.intolerances.includes(intol);
                return (
                  <button
                    key={intol}
                    type="button"
                    onClick={() => toggleIntolerance(intol)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-150 ${
                      selected
                        ? "bg-green-600 border-green-600 text-white"
                        : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-green-400"
                    }`}
                  >
                    {getIntoleranceLabel(intol, lang)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary preferences - multi-select */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isRo ? "Preferinte alimentare" : "Dietary preferences"}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
              {isRo ? "Poti selecta mai multe. AI-ul le combina." : "You can select multiple. The AI combines them."}
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(DIETARY_PREFERENCE_LABELS) as DietaryPreference[]).map((pref) => {
                const selected = form.dietaryPreferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => toggleDietaryPreference(pref)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-150 ${
                      selected
                        ? "bg-teal-600 border-teal-600 text-white"
                        : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-teal-400"
                    }`}
                  >
                    {getDietaryLabel(pref, lang)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail level */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {isRo ? "Nivel de detaliu" : "Detail level"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {detailLevels.map((dl) => {
                const required = getDetailRequiredPlan(dl);
                const locked = !planAllows(planTier, required);
                const active = form.detailLevel === dl;
                return (
                  <button
                    key={dl}
                    type="button"
                    disabled={locked}
                    onClick={() => !locked && setForm({ ...form, detailLevel: dl })}
                    title={locked ? (isRo ? `Necesita plan ${getPlanLabel(required, isRo)}` : `Requires ${getPlanLabel(required, isRo)} plan`) : undefined}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      locked
                        ? "border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60 cursor-not-allowed"
                        : active
                          ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                          : "border-gray-200 dark:border-slate-600 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm font-semibold ${
                        locked ? "text-slate-400 dark:text-slate-500"
                          : active ? "text-green-700 dark:text-green-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}>
                        {getDetailLabel(dl, isRo)}
                      </p>
                      {locked && <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {locked
                        ? (isRo ? `Plan ${getPlanLabel(required, isRo)}` : `${getPlanLabel(required, isRo)} plan`)
                        : getDetailDescription(dl, isRo)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={() => handleGenerate()}
            loading={generating}
            leftIcon={<Sparkles className="w-4 h-4" />}
            size="lg"
            fullWidth
          >
            {generating ? (isRo ? "Se genereaza recomandarile..." : "Generating guidance...") : (isRo ? "Genereaza recomandari" : "Generate guidance")}
          </Button>
        </div>
      </Card>}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          {/* Recommended */}
          <Card bordered>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <CardTitle>{isRo ? "Alimente recomandate" : "Recommended foods"}</CardTitle>
              </div>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {result.recommendedFoods.map((food, i) => (
                <Badge key={i} variant="green">
                  {food}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Avoid */}
          <Card bordered>
            <CardHeader>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <CardTitle>{isRo ? "Alimente de evitat" : "Foods to avoid"}</CardTitle>
              </div>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {result.avoidFoods.map((food, i) => (
                <Badge key={i} variant="red">
                  {food}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Meal examples */}
          <Card bordered>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <CardTitle>{isRo ? "Exemple de mese" : "Meal examples"}</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-5">
              {(() => {
                const grouped = groupMealExamplesByDay(result.mealExamples, isRo ? "ro" : "en");
                if (grouped) {
                  return grouped.map((dayGroup) => (
                    <div key={dayGroup.day}>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                        {dayGroup.label}
                      </p>
                      <div className="space-y-2">
                        {dayGroup.meals.map(({ mealType, label, meal }) => (
                          <div
                            key={mealType}
                            className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
                              {label}
                            </p>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm mb-2">
                              {meal.name}
                            </p>
                            {(meal.ingredients ?? []).length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {(meal.ingredients ?? []).map((ing, j) => (
                                  <Badge key={j} variant="teal" size="sm">
                                    {ing}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {meal.notes && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                                {meal.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                }

                // Fallback for older results without day/mealType metadata.
                return result.mealExamples.map((meal, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4"
                  >
                    <p className="font-semibold text-slate-900 dark:text-white text-sm mb-2">
                      {meal.name}
                    </p>
                    {(meal.ingredients ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(meal.ingredients ?? []).map((ing, j) => (
                          <Badge key={j} variant="teal" size="sm">
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {meal.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        {meal.notes}
                      </p>
                    )}
                  </div>
                ));
              })()}
            </div>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                disabled={generating}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-sm font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
                {generating ? (isRo ? "Se regenereaza..." : "Regenerating...") : (isRo ? "Regenereaza mese noi" : "Regenerate new meals")}
              </button>
            </div>
          </Card>

          {/* Tips */}
          <Card bordered>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <CardTitle>{isRo ? "Sfaturi generale" : "General tips"}</CardTitle>
              </div>
            </CardHeader>
            <ul className="space-y-2">
              {result.generalTips.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </Card>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-orange-700 dark:text-orange-400">
              <strong>{isRo ? "Disclaimer medical:" : "Medical disclaimer:"}</strong> {result.disclaimer}
            </p>
          </div>

          {/* PDF Export */}
          <div className="flex justify-end">
            <a
              href="/api/guidance/pdf"
              download="nutriaid_raport.pdf"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
            >
              <FileDown className="w-4 h-4" />
              {isRo ? "Exportă raport PDF" : "Export PDF report"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
