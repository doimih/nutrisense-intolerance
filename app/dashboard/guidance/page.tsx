"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, XCircle, UtensilsCrossed, Lightbulb, AlertTriangle } from "lucide-react";
import Card, { CardHeader, CardTitle } from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import ErrorAlert from "@/components/ErrorAlert";
import { PageLoader } from "@/components/LoadingOverlay";
import { useLanguage } from "@/components/LanguageProvider";
import { getProfile } from "@/lib/api/profile";
import { generateGuidance } from "@/lib/api/guidance";
import { getDietaryLabel, getIntoleranceLabel } from "@/lib/i18n/labels";
import type { GuidanceResult, DetailLevel } from "@/types/guidance";
import type { Intolerance, DietaryPreference } from "@/types/profile";
import { INTOLERANCE_LABELS, DIETARY_PREFERENCE_LABELS } from "@/types/profile";

const ALL_INTOLERANCES = Object.keys(INTOLERANCE_LABELS) as Intolerance[];

const detailLevels: DetailLevel[] = ["basic", "detailed", "comprehensive"];

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

export default function GuidancePage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GuidanceResult | null>(null);
  const [form, setForm] = useState({
    intolerances: [] as Intolerance[],
    dietaryPreference: "normal" as DietaryPreference,
    detailLevel: "detailed" as DetailLevel,
  });

  useEffect(() => {
    getProfile().then((p) => {
      setForm((f) => ({
        ...f,
        intolerances: p.intolerances,
        dietaryPreference: p.dietaryPreference,
      }));
      setLoadingProfile(false);
    });
  }, []);

  const toggleIntolerance = (intol: Intolerance) => {
    setForm((f) => ({
      ...f,
      intolerances: f.intolerances.includes(intol)
        ? f.intolerances.filter((i) => i !== intol)
        : [...f.intolerances, intol],
    }));
  };

  const handleGenerate = async () => {
    setError("");
    setGenerating(true);
    try {
      const res = await generateGuidance(form);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : isRo ? "Generare esuata." : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  if (loadingProfile) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-3xl">
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

      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

      {/* Form */}
      <Card bordered>
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

          {/* Dietary preference */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {isRo ? "Preferinta alimentara" : "Dietary preference"}
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(DIETARY_PREFERENCE_LABELS) as DietaryPreference[]).map(
                (pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setForm({ ...form, dietaryPreference: pref })}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-150 ${
                      form.dietaryPreference === pref
                        ? "bg-teal-600 border-teal-600 text-white"
                        : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-teal-400"
                    }`}
                  >
                    {getDietaryLabel(pref, lang)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Detail level */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {isRo ? "Nivel de detaliu" : "Detail level"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {detailLevels.map((dl) => (
                <button
                  key={dl}
                  type="button"
                  onClick={() => setForm({ ...form, detailLevel: dl })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form.detailLevel === dl
                      ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                      : "border-gray-200 dark:border-slate-600 hover:border-green-300"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      form.detailLevel === dl
                        ? "text-green-700 dark:text-green-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {getDetailLabel(dl, isRo)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {getDetailDescription(dl, isRo)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            loading={generating}
            leftIcon={<Sparkles className="w-4 h-4" />}
            size="lg"
            fullWidth
          >
            {generating ? (isRo ? "Se genereaza recomandarile..." : "Generating guidance...") : (isRo ? "Genereaza recomandari" : "Generate guidance")}
          </Button>
        </div>
      </Card>

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
            <div className="space-y-4">
              {result.mealExamples.map((meal, i) => (
                <div
                  key={i}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4"
                >
                  <p className="font-semibold text-slate-900 dark:text-white text-sm mb-2">
                    {meal.name}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {meal.ingredients.map((ing, j) => (
                      <Badge key={j} variant="teal" size="sm">
                        {ing}
                      </Badge>
                    ))}
                  </div>
                  {meal.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {meal.notes}
                    </p>
                  )}
                </div>
              ))}
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
        </div>
      )}
    </div>
  );
}
