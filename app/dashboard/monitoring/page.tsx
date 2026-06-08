"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Info,
  Calendar,
  Smile,
  Frown,
  Meh,
  List,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Inbox,
} from "lucide-react";
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

export default function MonitoringPage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const locale = isRo ? "ro-RO" : "en-US";
  const [entries, setEntries] = useState<MonitoringEntry[]>([]);
  const [loading, setLoading] = useState(true);
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
    listMonitoringEntries().then((e) => {
      setEntries(e);
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
      void err;
      setError(isRo ? "Eroare la salvare." : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

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
        <Button
          onClick={() => setShowForm(!showForm)}
          leftIcon={<Plus className="w-4 h-4" />}
          variant={showForm ? "outline" : "primary"}
        >
          {showForm ? (isRo ? "Anuleaza" : "Cancel") : (isRo ? "Adauga" : "Add")}
        </Button>
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

      {success && (
        <ErrorAlert
          type="success"
          message={isRo ? "Inregistrare salvata cu succes!" : "Entry saved successfully!"}
          onDismiss={() => setSuccess(false)}
        />
      )}

      {/* Form */}
      {showForm && (
        <Card bordered>
          <CardHeader>
            <CardTitle>{isRo ? "Inregistrare noua" : "New entry"}</CardTitle>
          </CardHeader>
          {error && <ErrorAlert message={error} className="mb-4" onDismiss={() => setError("")} />}
          <form onSubmit={handleSave} className="space-y-5">
            {/* Date */}
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

            {/* Foods */}
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

            {/* Symptoms */}
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

            {/* Intensity (only if symptoms) */}
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

            {/* Wellbeing */}
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

            {/* Notes */}
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

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-slate-400" />
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
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <List className="w-4 h-4 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isRo ? "Inregistrari recente" : "Recent entries"}
            </p>
          </div>
          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} lang={lang} isRo={isRo} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
