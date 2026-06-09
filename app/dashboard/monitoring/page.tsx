"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Info,
  Smile,
  Frown,
  Meh,
  List,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Inbox,
  Lock,
  TrendingUp,
  AlertTriangle,
  Zap,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import Card, { CardHeader, CardTitle } from "@/components/Card";
import Button from "@/components/Button";
import FormField, { Input, Textarea } from "@/components/FormField";
import Badge from "@/components/Badge";
import ErrorAlert from "@/components/ErrorAlert";
import { PageLoader } from "@/components/LoadingOverlay";
import { useLanguage } from "@/components/LanguageProvider";
import {
  addMonitoringEntry,
  listMonitoringEntries,
} from "@/lib/api/monitoring";
import { getSymptomLabel, getWellbeingLabel } from "@/lib/i18n/labels";
import type {
  MonitoringEntry,
  Symptom,
  WellbeingLevel,
} from "@/types/monitoring";
import { SYMPTOM_LABELS } from "@/types/monitoring";

type PlanTier = "none" | "basic" | "pro" | "pro_plus";

const ALL_SYMPTOMS = Object.keys(SYMPTOM_LABELS) as Symptom[];

const wellbeingIcons: Record<WellbeingLevel, React.ComponentType<{className?: string}>> = {
  1: Frown,
  2: Frown,
  3: Meh,
  4: Smile,
  5: Smile,
};

const wellbeingColors: Record<WellbeingLevel, string> = {
  1: "text-red-500",
  2: "text-orange-500",
  3: "text-yellow-500",
  4: "text-green-500",
  5: "text-green-600",
};

function planAllows(userPlan: PlanTier, required: PlanTier): boolean {
  const order: PlanTier[] = ["none", "basic", "pro", "pro_plus"];
  return order.indexOf(userPlan) >= order.indexOf(required);
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function EntryCard({ entry, lang, isRo, locale }: { entry: MonitoringEntry; lang: "ro" | "en"; isRo: boolean; locale: string }) {
  const [expanded, setExpanded] = useState(false);
  const WIcon = wellbeingIcons[entry.wellbeing];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <WIcon className={`w-5 h-5 ${wellbeingColors[entry.wellbeing]}`} />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {getWellbeingLabel(entry.wellbeing, lang)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {formatDate(entry.date, locale)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {entry.consumedFoods.slice(0, 3).join(", ")}
              {entry.consumedFoods.length > 3 && ` +${entry.consumedFoods.length - 3}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {entry.symptoms.length > 0 ? (
            <Badge variant="red" size="sm">
              {entry.symptoms.length} {isRo ? "simptome" : "symptoms"}
            </Badge>
          ) : (
            <Badge variant="green" size="sm" dot>
              {isRo ? "Fara simptome" : "No symptoms"}
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-slate-700 pt-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              {isRo ? "Alimente consumate" : "Consumed foods"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {entry.consumedFoods.map((food, i) => (
                <Badge key={i} variant="blue" size="sm">
                  {food}
                </Badge>
              ))}
            </div>
          </div>

          {entry.symptoms.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {isRo ? "Simptome" : "Symptoms"} ({isRo ? "intensitate" : "intensity"}: {entry.symptomsIntensity}/10)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.symptoms.map((s) => (
                  <Badge key={s} variant="red" size="sm">
                    {getSymptomLabel(s, lang)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {entry.notes && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {isRo ? "Note" : "Notes"}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                &ldquo;{entry.notes}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UpgradePrompt({ isRo }: { isRo: boolean }) {
  return (
    <div className="relative rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 p-8 text-center">
      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
        {isRo ? "Perioada de probă a expirat" : "Free trial has ended"}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 max-w-sm mx-auto">
        {isRo
          ? "Alege un plan pentru a continua jurnalizarea meselor și simptomelor."
          : "Choose a plan to continue logging meals and symptoms."}
      </p>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <Zap className="w-4 h-4" />
        {isRo ? "Alege un plan" : "Choose a plan"}
      </Link>
    </div>
  );
}

function CorrelationsSection({ entries, isRo, lang }: { entries: MonitoringEntry[]; isRo: boolean; lang: "ro" | "en" }) {
  const stats = useMemo(() => {
    const foodSymptomCount: Record<string, number> = {};
    const foodTotalCount: Record<string, number> = {};
    const foodSafeCount: Record<string, number> = {};
    const symptomCount: Record<string, number> = {};

    for (const entry of entries) {
      for (const food of entry.consumedFoods) {
        foodTotalCount[food] = (foodTotalCount[food] || 0) + 1;
        if (entry.symptoms.length > 0) {
          foodSymptomCount[food] = (foodSymptomCount[food] || 0) + 1;
        } else {
          foodSafeCount[food] = (foodSafeCount[food] || 0) + 1;
        }
      }
      for (const s of entry.symptoms) {
        symptomCount[s] = (symptomCount[s] || 0) + 1;
      }
    }

    const suspectFoods = Object.entries(foodSymptomCount)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([food, count]) => ({ food, count, total: foodTotalCount[food] || 0 }));

    const safeFoods = Object.entries(foodSafeCount)
      .filter(([food]) => !foodSymptomCount[food])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([food, count]) => ({ food, count }));

    const topSymptoms = Object.entries(symptomCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([s, count]) => ({ symptom: s as Symptom, count }));

    return { suspectFoods, safeFoods, topSymptoms };
  }, [entries]);

  if (entries.length < 3) {
    return (
      <Card bordered>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <CardTitle>{isRo ? "Corelații alimentare" : "Food correlations"}</CardTitle>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Pro</span>
          </div>
        </CardHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isRo ? "Adaugă cel puțin 3 înregistrări pentru a vedea corelațiile." : "Add at least 3 entries to see correlations."}
        </p>
      </Card>
    );
  }

  return (
    <Card bordered>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <CardTitle>{isRo ? "Corelații alimentare" : "Food correlations"}</CardTitle>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Pro</span>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Suspect foods */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {isRo ? "Alimente suspecte" : "Suspect foods"}
          </p>
          {stats.suspectFoods.length > 0 ? (
            <div className="space-y-1.5">
              {stats.suspectFoods.map(({ food, count, total }) => (
                <div key={food} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{food}</span>
                  <span className="text-xs text-red-600 dark:text-red-400 flex-shrink-0 font-medium">
                    {count}/{total}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">{isRo ? "Nu s-au detectat" : "None detected"}</p>
          )}
        </div>

        {/* Safe foods */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {isRo ? "Alimente sigure" : "Safe foods"}
          </p>
          {stats.safeFoods.length > 0 ? (
            <div className="space-y-1.5">
              {stats.safeFoods.map(({ food, count }) => (
                <div key={food} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{food}</span>
                  <span className="text-xs text-green-600 dark:text-green-400 flex-shrink-0 font-medium">
                    ×{count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">{isRo ? "Insuficiente date" : "Insufficient data"}</p>
          )}
        </div>

        {/* Top symptoms */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {isRo ? "Simptome frecvente" : "Frequent symptoms"}
          </p>
          {stats.topSymptoms.length > 0 ? (
            <div className="space-y-1.5">
              {stats.topSymptoms.map(({ symptom, count }) => (
                <div key={symptom} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                    {getSymptomLabel(symptom, lang)}
                  </span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 flex-shrink-0 font-medium">
                    ×{count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">{isRo ? "Fara simptome" : "No symptoms logged"}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function LatencySection({ entries, isRo }: { entries: MonitoringEntry[]; isRo: boolean }) {
  const stats = useMemo(() => {
    const foodLatencies: Record<string, number[]> = {};
    const wellbeingTrend: number[] = [];

    for (const entry of entries) {
      wellbeingTrend.push(entry.wellbeing);
      if (entry.symptoms.length > 0 && entry.reactionLatencyMinutes) {
        for (const food of entry.consumedFoods) {
          if (!foodLatencies[food]) foodLatencies[food] = [];
          foodLatencies[food].push(entry.reactionLatencyMinutes);
        }
      }
    }

    const latencyMap = Object.entries(foodLatencies)
      .filter(([, lats]) => lats.length >= 2)
      .map(([food, lats]) => ({
        food,
        avgMinutes: Math.round(lats.reduce((a, b) => a + b, 0) / lats.length),
        count: lats.length,
      }))
      .sort((a, b) => a.avgMinutes - b.avgMinutes)
      .slice(0, 5);

    const avgWellbeing =
      wellbeingTrend.length > 0
        ? (wellbeingTrend.reduce((a, b) => a + b, 0) / wellbeingTrend.length).toFixed(1)
        : null;

    const recentWellbeing = wellbeingTrend.slice(0, 7);
    const recentAvg =
      recentWellbeing.length > 0
        ? (recentWellbeing.reduce((a, b) => a + b, 0) / recentWellbeing.length).toFixed(1)
        : null;

    return { latencyMap, avgWellbeing, recentAvg };
  }, [entries]);

  return (
    <Card bordered>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-purple-500" />
          <CardTitle>{isRo ? "Analiză avansată" : "Advanced analysis"}</CardTitle>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">Pro+</span>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Wellbeing stats */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {isRo ? "Evoluția stării generale" : "Wellbeing evolution"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgWellbeing ?? "—"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{isRo ? "medie totală" : "overall avg"}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.recentAvg ?? "—"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{isRo ? "ultimele 7" : "last 7"}</p>
            </div>
          </div>
        </div>

        {/* Reaction latency */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {isRo ? "Latența reacțiilor (min)" : "Reaction latency (min)"}
          </p>
          {stats.latencyMap.length > 0 ? (
            <div className="space-y-1.5">
              {stats.latencyMap.map(({ food, avgMinutes, count }) => (
                <div key={food} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{food}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">~{avgMinutes} min</span>
                    <span className="text-xs text-slate-400">×{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              {isRo ? "Înregistrează latența în jurnal pentru analiză." : "Log reaction latency for analysis."}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function LockedFeatureCard({ planLabel, planColor, title, description, isRo }: {
  planLabel: string;
  planColor: string;
  title: string;
  description: string;
  isRo: boolean;
}) {
  return (
    <div className="relative rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-5 overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${planColor}`}>
              {planLabel}
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
        </div>
        <Link
          href="/pricing"
          className="flex-shrink-0 text-xs font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors whitespace-nowrap"
        >
          {isRo ? "Upgrade" : "Upgrade"}
        </Link>
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const locale = isRo ? "ro-RO" : "en-US";
  const [entries, setEntries] = useState<MonitoringEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [planTier, setPlanTier] = useState<PlanTier>("basic");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    date: today,
    mealTime: "",
    consumedFoodsText: "",
    symptoms: [] as Symptom[],
    symptomsIntensity: 0,
    reactionLatencyMinutes: "",
    wellbeing: 3 as WellbeingLevel,
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      listMonitoringEntries(),
      fetch("/api/billing/subscription").then((r) => r.ok ? r.json() : { planTier: "none" }),
    ]).then(([e, sub]) => {
      setEntries(e);
      setPlanTier((sub as { planTier?: PlanTier }).planTier ?? "none");
      setLoading(false);
    });
  }, []);

  const toggleSymptom = (s: Symptom) => {
    setForm((f) => ({
      ...f,
      symptoms: f.symptoms.includes(s)
        ? f.symptoms.filter((x) => x !== s)
        : [...f.symptoms, s],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const foods = form.consumedFoodsText
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    if (foods.length === 0) {
      setError(isRo ? "Adauga cel putin un aliment consumat." : "Add at least one consumed food.");
      return;
    }
    setSaving(true);
    try {
      const entry = await addMonitoringEntry({
        date: form.date,
        mealTime: form.mealTime || undefined,
        consumedFoods: foods,
        symptoms: form.symptoms,
        symptomsIntensity: form.symptoms.length > 0 ? form.symptomsIntensity : 0,
        reactionLatencyMinutes:
          form.symptoms.length > 0 && form.reactionLatencyMinutes
            ? Number(form.reactionLatencyMinutes)
            : null,
        wellbeing: form.wellbeing,
        notes: form.notes,
      });
      setEntries((prev) => [entry, ...prev]);
      setSuccess(true);
      setShowForm(false);
      setForm({
        date: today,
        mealTime: "",
        consumedFoodsText: "",
        symptoms: [],
        symptomsIntensity: 0,
        reactionLatencyMinutes: "",
        wellbeing: 3,
        notes: "",
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("plan_required") || message.includes("403")) {
        setError(isRo ? "Ai nevoie de un plan activ pentru a adauga inregistrari." : "You need an active plan to add entries.");
      } else {
        setError(isRo ? "Eroare la salvare." : "Save failed.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  const canAdd = planAllows(planTier, "basic");
  const canSeeCorrelations = planAllows(planTier, "pro");
  const canSeeAdvanced = planAllows(planTier, "pro_plus");

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {isRo ? "Jurnal de monitorizare" : "Monitoring journal"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {entries.length} {isRo ? "inregistrari" : "entries"}
            </p>
          </div>
        </div>
        {canAdd && (
          <Button
            onClick={() => setShowForm(!showForm)}
            leftIcon={<Plus className="w-4 h-4" />}
            variant={showForm ? "outline" : "primary"}
          >
            {showForm ? (isRo ? "Anuleaza" : "Cancel") : (isRo ? "Adauga" : "Add")}
          </Button>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          {isRo
            ? "Acest jurnal este doar pentru tine. Te ajuta sa observi legaturi intre alimente si reactiile tale. "
            : "This journal is private. It helps you identify links between foods and your reactions. "}
          <strong>{isRo ? "Nu este un instrument de diagnostic medical." : "It is not a medical diagnosis tool."}</strong>
        </p>
      </div>

      {/* No plan: upgrade prompt */}
      {!canAdd && <UpgradePrompt isRo={isRo} />}

      {success && (
        <ErrorAlert
          type="success"
          message={isRo ? "Inregistrare salvata cu succes!" : "Entry saved successfully!"}
          onDismiss={() => setSuccess(false)}
        />
      )}

      {/* Form */}
      {showForm && canAdd && (
        <Card bordered>
          <CardHeader>
            <CardTitle>{isRo ? "Inregistrare noua" : "New entry"}</CardTitle>
          </CardHeader>
          {error && <ErrorAlert message={error} className="mb-4" onDismiss={() => setError("")} />}
          <form onSubmit={handleSave} className="space-y-5">
            <FormField label={isRo ? "Data" : "Date"} required>
              <Input
                type="date"
                value={form.date}
                max={today}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </FormField>

            <FormField
              label={isRo ? "Ora mesei" : "Meal time"}
              hint={isRo ? "Optional, dar util pentru corelatii" : "Optional, but useful for correlations"}
            >
              <Input
                type="time"
                value={form.mealTime}
                onChange={(e) => setForm({ ...form, mealTime: e.target.value })}
              />
            </FormField>

            <FormField
              label={isRo ? "Alimente consumate" : "Consumed foods"}
              required
              hint={isRo ? "Separa alimentele cu virgula. Ex: orez, pui, morcovi" : "Separate foods with commas. Ex: rice, chicken, carrots"}
            >
              <Textarea
                rows={2}
                placeholder={isRo ? "orez, pui la gratar, salata, apa..." : "rice, grilled chicken, salad, water..."}
                value={form.consumedFoodsText}
                onChange={(e) => setForm({ ...form, consumedFoodsText: e.target.value })}
              />
            </FormField>

            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {isRo ? "Simptome" : "Symptoms"}
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_SYMPTOMS.map((s) => {
                  const selected = form.symptoms.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSymptom(s)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                        selected
                          ? "bg-red-500 border-red-500 text-white"
                          : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-red-300"
                      }`}
                    >
                      {getSymptomLabel(s, lang)}
                    </button>
                  );
                })}
              </div>
            </div>

            {form.symptoms.length > 0 && (
              <>
                <FormField
                  label={`${isRo ? "Intensitate simptome" : "Symptom intensity"}: ${form.symptomsIntensity}/10`}
                >
                  <input
                    type="range"
                    min={1}
                    max={10}
                    title={isRo ? "Intensitate simptome" : "Symptom intensity"}
                    aria-label={isRo ? "Intensitate simptome" : "Symptom intensity"}
                    value={form.symptomsIntensity}
                    onChange={(e) =>
                      setForm({ ...form, symptomsIntensity: Number(e.target.value) })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>{isRo ? "Usor" : "Mild"}</span>
                    <span>{isRo ? "Moderat" : "Moderate"}</span>
                    <span>{isRo ? "Sever" : "Severe"}</span>
                  </div>
                </FormField>

                <FormField
                  label={isRo ? "Latență reacție (minute)" : "Reaction latency (minutes)"}
                  hint={
                    isRo
                      ? "Timp aproximativ pana la aparitia simptomelor"
                      : "Approximate time until symptoms appeared"
                  }
                >
                  <Input
                    type="number"
                    min={0}
                    max={1440}
                    value={form.reactionLatencyMinutes}
                    onChange={(e) =>
                      setForm({ ...form, reactionLatencyMinutes: e.target.value })
                    }
                    placeholder={isRo ? "Ex: 45" : "Ex: 45"}
                  />
                </FormField>
              </>
            )}

            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {isRo ? "Stare generala" : "Overall wellbeing"}
              </p>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as WellbeingLevel[]).map((level) => {
                  const WIcon = wellbeingIcons[level];
                  const selected = form.wellbeing === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm({ ...form, wellbeing: level })}
                      className={`flex flex-col items-center gap-1 flex-1 py-2 px-1 rounded-xl border transition-all ${
                        selected
                          ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                          : "border-gray-200 dark:border-slate-600 hover:border-gray-300"
                      }`}
                    >
                      <WIcon className={`w-5 h-5 ${wellbeingColors[level]}`} />
                      <span className={`text-xs font-medium ${selected ? "text-green-700 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}>
                        {level}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 text-center mt-1">
                {getWellbeingLabel(form.wellbeing, lang)}
              </p>
            </div>

            <FormField label={isRo ? "Note personale" : "Personal notes"} hint={isRo ? "Orice observatie relevanta" : "Any relevant observation"}>
              <Textarea
                rows={3}
                placeholder={isRo ? "Cum te-ai simtit dupa masa? Ai observat ceva neobisnuit?..." : "How did you feel after the meal? Did you notice anything unusual?..."}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </FormField>

            <Button
              type="submit"
              loading={saving}
              fullWidth
              size="lg"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {saving ? (isRo ? "Se salveaza..." : "Saving...") : (isRo ? "Salveaza in jurnal" : "Save to journal")}
            </Button>
          </form>
        </Card>
      )}

      {/* Analytics sections (Pro / Pro+) */}
      {canAdd && entries.length > 0 && (
        <>
          {canSeeCorrelations ? (
            <CorrelationsSection entries={entries} isRo={isRo} lang={lang as "ro" | "en"} />
          ) : (
            <LockedFeatureCard
              planLabel="Pro"
              planColor="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              title={isRo ? "Corelații alimentare" : "Food correlations"}
              description={isRo ? "Descoperă care alimente sunt asociate cu simptomele tale." : "Discover which foods are linked to your symptoms."}
              isRo={isRo}
            />
          )}

          {canSeeAdvanced ? (
            <LatencySection entries={entries} isRo={isRo} />
          ) : (
            <LockedFeatureCard
              planLabel="Pro+"
              planColor="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
              title={isRo ? "Analiză avansată & predicții" : "Advanced analysis & predictions"}
              description={isRo ? "Latența reacțiilor, evoluția stării generale și tipare complexe." : "Reaction latency, wellbeing evolution, and complex patterns."}
              isRo={isRo}
            />
          )}
        </>
      )}

      {/* Entries list */}
      {entries.length === 0 && canAdd ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {isRo ? "Nicio inregistrare" : "No entries"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            {isRo
              ? "Adauga prima ta inregistrare pentru a incepe sa monitorizezi reactiile la alimente."
              : "Add your first entry to start tracking your reactions to food."}
          </p>
        </div>
      ) : entries.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <List className="w-4 h-4 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isRo ? "Inregistrari recente" : "Recent entries"}
            </p>
            {!canAdd && (
              <span className="ml-auto text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {isRo ? "Readonly – plan expirat" : "Read-only – plan expired"}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} lang={lang} isRo={isRo} locale={locale} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
