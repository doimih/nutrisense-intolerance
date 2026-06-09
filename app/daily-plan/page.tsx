import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

type DailyPlanText = {
  title: string;
  subtitle: string;
  stepsTitle: string;
  steps: string[];
  remindersTitle: string;
  reminders: string[];
  ctaPrimary: string;
  ctaSecondary: string;
};

const text: Record<"ro" | "en", DailyPlanText> = {
  ro: {
    title: "Planul tau zilnic",
    subtitle: "5 minute pe zi pentru a intelege ce iti face rau si ce iti face bine.",
    stepsTitle: "Rutina zilnica recomandata",
    steps: [
      "Dimineata: verifica recomandarile si alimentele sigure (30 secunde).",
      "La fiecare masa: noteaza ce ai mancat si ora aproximativa (20-30 secunde).",
      "Cand apar simptome: noteaza simptomul si intensitatea (10 secunde).",
      "Seara: revizuieste corelatiile zilei si ajustarile pentru maine (1 minut).",
    ],
    remindersTitle: "Reguli simple",
    reminders: [
      "Nu trebuie sa fii perfect, doar consecvent.",
      "Nu elimina alimente la intamplare.",
      "Nu face diete extreme fara ghidare medicala.",
      "Lasa AI-ul sa identifice tiparele in timp.",
    ],
    ctaPrimary: "Incepe analiza intolerantelor tale",
    ctaSecondary: "Ai nevoie de ajutor? Contacteaza-ne",
  },
  en: {
    title: "Your daily plan",
    subtitle: "5 minutes a day to understand what harms you and what helps you.",
    stepsTitle: "Recommended daily routine",
    steps: [
      "Morning: check recommendations and safe foods (30 seconds).",
      "At each meal: log what you ate and approximate time (20-30 seconds).",
      "When symptoms appear: log symptom and intensity (10 seconds).",
      "Evening: review daily correlations and tomorrow adjustments (1 minute).",
    ],
    remindersTitle: "Simple rules",
    reminders: [
      "You do not need perfection, only consistency.",
      "Do not eliminate foods randomly.",
      "Avoid extreme diets without medical guidance.",
      "Let AI detect patterns over time.",
    ],
    ctaPrimary: "Start your intolerance analysis",
    ctaSecondary: "Need help? Contact us",
  },
};

export default function DailyPlanPage() {
  const lang = getServerLanguage();
  const t = text[lang];

  return (
    <div className="pt-24 pb-20 bg-slate-50 dark:bg-slate-950">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 text-sm font-semibold mb-5">
            <Sparkles className="h-4 w-4" />
            NutriAID Intolerances
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-300">{t.subtitle}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            {t.stepsTitle}
          </h2>
          <ul className="space-y-3">
            {t.steps.map((step) => (
              <li key={step} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 mt-1 text-emerald-600 dark:text-emerald-400" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t.remindersTitle}</h2>
          <ul className="space-y-3">
            {t.reminders.map((item) => (
              <li key={item} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 mt-1 text-cyan-600 dark:text-cyan-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-cyan-700 p-8 text-white text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              {t.ctaPrimary}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/15"
            >
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
