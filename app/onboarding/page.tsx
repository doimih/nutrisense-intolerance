"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, ChevronRight, ChevronLeft, Check, User, AlertCircle, Utensils } from "lucide-react";
import clsx from "clsx";
import { getSessionUser } from "@/lib/api/auth";
import { getProfile, updateProfile } from "@/lib/api/profile";
import { useLanguage } from "@/components/LanguageProvider";
import type { ActivityLevel, DietaryPreference, Intolerance } from "@/types/profile";

// ─── Constants ────────────────────────────────────────────────────────────────

const INTOLERANCES: { value: Intolerance; labelRo: string; labelEn: string }[] = [
  { value: "lactoza",       labelRo: "Lactoza",            labelEn: "Lactose" },
  { value: "gluten",        labelRo: "Gluten",             labelEn: "Gluten" },
  { value: "nuci",          labelRo: "Nuci",               labelEn: "Nuts" },
  { value: "histamina",     labelRo: "Histamina",          labelEn: "Histamine" },
  { value: "fodmap",        labelRo: "FODMAP",             labelEn: "FODMAP" },
  { value: "fructoza",      labelRo: "Fructoza",           labelEn: "Fructose" },
  { value: "sorbitol",      labelRo: "Sorbitol",           labelEn: "Sorbitol" },
  { value: "sulfiti",       labelRo: "Sulfiti",            labelEn: "Sulfites" },
  { value: "ou",            labelRo: "Oua",                labelEn: "Eggs" },
  { value: "soia",          labelRo: "Soia",               labelEn: "Soy" },
  { value: "peste",         labelRo: "Peste",              labelEn: "Fish" },
  { value: "crustacee",     labelRo: "Crustacee",          labelEn: "Shellfish" },
  { value: "proteina-lapte",labelRo: "Proteina din lapte", labelEn: "Milk protein" },
  { value: "solanacee",     labelRo: "Solanacee",          labelEn: "Nightshades" },
];

const DIETARY: { value: DietaryPreference; labelRo: string; labelEn: string; descRo: string; descEn: string }[] = [
  { value: "normal",      labelRo: "Normal / Omnivor",  labelEn: "Normal / Omnivore",  descRo: "Mananci orice tip de aliment",                descEn: "You eat all food types" },
  { value: "vegetarian",  labelRo: "Vegetarian",        labelEn: "Vegetarian",          descRo: "Fara carne, dar cu oua si lactate",           descEn: "No meat, but eggs & dairy ok" },
  { value: "vegan",       labelRo: "Vegan",             labelEn: "Vegan",               descRo: "Fara niciun produs de origine animala",       descEn: "No animal products at all" },
  { value: "low-carb",    labelRo: "Low-Carb / Keto",   labelEn: "Low-Carb / Keto",    descRo: "Carbohidrati redusi, mai multe grasimi bune", descEn: "Reduced carbs, more healthy fats" },
  { value: "gluten-free", labelRo: "Fara Gluten",       labelEn: "Gluten-Free",         descRo: "Eviti graul, orzul si secara",                descEn: "Avoid wheat, barley, rye" },
  { value: "dairy-free",  labelRo: "Fara Lactate",      labelEn: "Dairy-Free",          descRo: "Fara lapte, branza sau smantana",             descEn: "No milk, cheese or cream" },
];

const ACTIVITY: { value: ActivityLevel; labelRo: string; labelEn: string }[] = [
  { value: "sedentary",   labelRo: "Sedentar (fara sport)",          labelEn: "Sedentary (no exercise)" },
  { value: "light",       labelRo: "Usor activ (1-2 zile/sapt.)",   labelEn: "Lightly active (1-2 days/wk)" },
  { value: "moderate",    labelRo: "Moderat activ (3-4 zile/sapt.)",labelEn: "Moderately active (3-4 days/wk)" },
  { value: "active",      labelRo: "Activ (5+ zile/sapt.)",         labelEn: "Active (5+ days/wk)" },
  { value: "very_active", labelRo: "Foarte activ (zilnic intens)",   labelEn: "Very active (daily intense)" },
];

// ─── Step indicator ───────────────────────────────────────────────────────────

function Steps({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
              i < current
                ? "bg-green-600 text-white"
                : i === current
                ? "bg-green-600 text-white ring-4 ring-green-100"
                : "bg-slate-100 text-slate-400"
            )}
          >
            {i < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={clsx("flex-1 h-0.5 transition-all", i < current ? "bg-green-600" : "bg-slate-200")} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [intolerances, setIntolerances] = useState<Intolerance[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>(["normal"]);

  useEffect(() => {
    let active = true;
    Promise.all([getSessionUser(), getProfile()])
      .then(([user, profile]) => {
        if (!active) return;
        if (!user) { router.replace("/auth/login"); return; }
        // Already completed onboarding
        if (profile?.onboardingCompleted) { router.replace("/dashboard"); return; }
        setName(user.name || "");
        if (profile) {
          if (profile.age) setAge(String(profile.age));
          if (profile.heightCm) setHeightCm(String(profile.heightCm));
          if (profile.weightKg) setWeightKg(String(profile.weightKg));
          if (profile.activityLevel) setActivityLevel(profile.activityLevel);
          if (profile.intolerances?.length) setIntolerances(profile.intolerances);
          if (profile.dietaryPreferences?.length) setDietaryPreferences(profile.dietaryPreferences);
        }
        setLoading(false);
      })
      .catch(() => { if (active) router.replace("/auth/login"); });
    return () => { active = false; };
  }, [router]);

  function toggleIntolerance(v: Intolerance) {
    setIntolerances((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  function toggleDietary(v: DietaryPreference) {
    setDietaryPreferences((prev) => {
      if (prev.includes(v)) return prev.length > 1 ? prev.filter((x) => x !== v) : prev;
      return [...prev, v];
    });
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await updateProfile({
        age: age ? parseInt(age) : null,
        heightCm: heightCm ? parseInt(heightCm) : null,
        weightKg: weightKg ? parseInt(weightKg) : null,
        activityLevel,
        intolerances,
        dietaryPreferences,
        onboardingCompleted: true,
      });
      router.push("/dashboard");
    } catch {
      setSaving(false);
    }
  }

  async function handleNextStep() {
    if (step < 2) {
      // Save profile data on step 1 transition silently
      if (step === 0) {
        try {
          await updateProfile({
            age: age ? parseInt(age) : null,
            heightCm: heightCm ? parseInt(heightCm) : null,
            weightKg: weightKg ? parseInt(weightKg) : null,
            activityLevel,
          });
        } catch { /* non-blocking */ }
      }
      setStep((s) => s + 1);
    } else {
      await handleFinish();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stepTitles = isRo
    ? ["Profilul tau", "Intolerante alimentare", "Preferinte alimentare"]
    : ["Your profile", "Food intolerances", "Dietary preferences"];
  const stepIcons = [User, AlertCircle, Utensils];
  const StepIcon = stepIcons[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-slate-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-900 text-lg">NutriAID</span>
        <span className="ml-auto text-xs text-slate-400 font-medium">
          {isRo ? "Configurare cont" : "Account setup"}
        </span>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {/* Welcome banner — only on step 0 */}
          {step === 0 && (
            <div className="mb-6 text-center">
              <p className="text-2xl font-extrabold text-slate-900">
                {isRo ? `Bun venit, ${name.split(" ")[0]}!` : `Welcome, ${name.split(" ")[0]}!`}
              </p>
              <p className="mt-1 text-slate-500 text-sm">
                {isRo
                  ? "Configureaza profilul tau in 3 pasi simpli. AI-ul va personaliza recomandarile pentru tine."
                  : "Set up your profile in 3 simple steps. The AI will personalise recommendations for you."}
              </p>
            </div>
          )}

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <Steps current={step} total={3} />

            {/* Step header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <StepIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                  {isRo ? `Pasul ${step + 1} din 3` : `Step ${step + 1} of 3`}
                </p>
                <h2 className="font-bold text-slate-900 text-lg leading-tight">{stepTitles[step]}</h2>
              </div>
            </div>

            {/* ── STEP 0: Profile ── */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      {isRo ? "Varsta" : "Age"}
                    </label>
                    <input
                      type="number"
                      min={10} max={120}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder={isRo ? "ex. 28" : "e.g. 28"}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      {isRo ? "Inaltime (cm)" : "Height (cm)"}
                    </label>
                    <input
                      type="number"
                      min={100} max={250}
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder={isRo ? "ex. 172" : "e.g. 172"}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {isRo ? "Greutate (kg)" : "Weight (kg)"}
                  </label>
                  <input
                    type="number"
                    min={30} max={300}
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder={isRo ? "ex. 70" : "e.g. 70"}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    {isRo ? "Nivel activitate fizica" : "Physical activity level"}
                  </label>
                  <div className="space-y-2">
                    {ACTIVITY.map((a) => (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => setActivityLevel(a.value)}
                        className={clsx(
                          "w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                          activityLevel === a.value
                            ? "border-green-500 bg-green-50 text-green-800"
                            : "border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50/50"
                        )}
                      >
                        {isRo ? a.labelRo : a.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: Intolerances ── */}
            {step === 1 && (
              <div>
                <p className="text-sm text-slate-500 mb-4">
                  {isRo
                    ? "Selecteaza intolerante cunoscute sau sarita daca nu ai. AI-ul va evita alimentele problematice."
                    : "Select known intolerances or skip if you have none. The AI will avoid problematic foods."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTOLERANCES.map((item) => {
                    const active = intolerances.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleIntolerance(item.value)}
                        className={clsx(
                          "px-3 py-1.5 rounded-full border text-sm font-medium transition-all",
                          active
                            ? "border-red-400 bg-red-50 text-red-700"
                            : "border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50/50"
                        )}
                      >
                        {isRo ? item.labelRo : item.labelEn}
                      </button>
                    );
                  })}
                </div>
                {intolerances.length > 0 && (
                  <p className="mt-4 text-xs text-slate-400">
                    {isRo
                      ? `${intolerances.length} intoleran${intolerances.length === 1 ? "ta" : "te"} selectat${intolerances.length === 1 ? "a" : "e"}`
                      : `${intolerances.length} intolerance${intolerances.length !== 1 ? "s" : ""} selected`}
                  </p>
                )}
              </div>
            )}

            {/* ── STEP 2: Dietary preferences ── */}
            {step === 2 && (
              <div>
                <p className="text-sm text-slate-500 mb-4">
                  {isRo
                    ? "Poti selecta mai multe. AI-ul va tine cont de combinatia alegerilor tale."
                    : "You can select multiple. The AI will combine your choices intelligently."}
                </p>
                <div className="space-y-2">
                  {DIETARY.map((item) => {
                    const active = dietaryPreferences.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleDietary(item.value)}
                        className={clsx(
                          "w-full text-left px-4 py-3 rounded-xl border transition-all",
                          active
                            ? "border-teal-400 bg-teal-50"
                            : "border-slate-200 hover:border-teal-300 hover:bg-teal-50/40"
                        )}
                      >
                        <p className={clsx("text-sm font-semibold", active ? "text-teal-800" : "text-slate-700")}>
                          {isRo ? item.labelRo : item.labelEn}
                        </p>
                        <p className={clsx("text-xs mt-0.5", active ? "text-teal-600" : "text-slate-400")}>
                          {isRo ? item.descRo : item.descEn}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {isRo ? "Inapoi" : "Back"}
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNextStep}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : step === 2 ? (
                  <>
                    <Check className="w-4 h-4" />
                    {isRo ? "Finalizeaza" : "Finish"}
                  </>
                ) : (
                  <>
                    {isRo ? "Continua" : "Continue"}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Skip link */}
          <p className="text-center mt-4">
            <button
              type="button"
              onClick={handleFinish}
              disabled={saving}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
            >
              {isRo ? "Sarita pentru moment, configureaza mai tarziu" : "Skip for now, configure later"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
