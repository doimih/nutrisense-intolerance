"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, Sparkles, ChefHat, CheckCircle2 } from "lucide-react";
import type { UserProfile } from "@/types/profile";
import { updateProfile } from "@/lib/api/profile";

type Lang = "ro" | "en";
type Scenario = "A" | "B" | "C";

function getScenario(profile: UserProfile | null, hasGuidance: boolean): Scenario {
  const complete = profile && profile.weightKg && profile.heightCm && profile.age && profile.activityLevel;
  if (!complete) return "A";
  if (!hasGuidance) return "B";
  return "C";
}

const CONTENT = {
  A: {
    ro: {
      title: "Bun venit în NutriAID! Hai să te cunoaștem.",
      message: "Durează 2 minute și tot ceea ce urmează va fi personalizat exact pentru tine — de la mese la rețete.",
      bullets: [
        "Spune-ne greutatea și înălțimea ta",
        "Alege obiectivul tău (slăbit, menținere, masă musculară)",
        "Adaugă alergiile sau intoleranțele tale",
        "Selectează preferințele alimentare",
        "AI-ul tău personal se calibrează pe baza acestor date",
      ],
      cta: "Completează profilul acum",
      href: "/dashboard/profile",
    },
    en: {
      title: "Welcome to NutriAID! Let's get to know you.",
      message: "It takes 2 minutes — and everything that follows will be personalised just for you, from meals to recipes.",
      bullets: [
        "Tell us your weight and height",
        "Choose your goal (weight loss, maintenance, muscle gain)",
        "Add any allergies or intolerances",
        "Select your dietary preferences",
        "Your personal AI calibrates itself based on this information",
      ],
      cta: "Complete your profile now",
      href: "/dashboard/profile",
    },
  },
  B: {
    ro: {
      title: "Profilul tău e gata. Acum generăm primul tău plan!",
      message: "Ai completat profilul — excelent! Un singur tap și AI-ul NutriAID îți construieste un plan alimentar adaptat zilei tale.",
      bullets: [
        "Mic dejun, prânz, cină și gustări — toate adaptate pentru tine",
        "Ingrediente reale, porții calculate la greutatea ta",
        "Fiecare masă are o rețetă completă cu pași de preparare",
        'Poți găti pas cu pas prin modul "Găteste"',
        "Regenerezi planul oricând vrei ceva diferit",
      ],
      cta: "Generează primul meu plan",
      href: "/dashboard/guidance",
    },
    en: {
      title: "Your profile is ready. Let's build your first plan!",
      message: "Great job completing your profile! One tap and NutriAID's AI builds a meal plan tailored to your day.",
      bullets: [
        "Breakfast, lunch, dinner, and snacks — all adapted for you",
        "Real ingredients, portions calculated to your weight",
        "Every meal comes with a full recipe and step-by-step instructions",
        "Cook each meal step by step with Cook Mode",
        "Regenerate your plan anytime you want something different",
      ],
      cta: "Generate my first plan",
      href: "/dashboard/guidance",
    },
  },
  C: {
    ro: {
      title: "Ești gata să gătesti! Iată ce poți face azi.",
      message: "Planul tău e generat. Descoperă tot ce poți face cu NutriAID — de la gătit ghidat până la arhiva ta de rețete.",
      bullets: [
        'Găteste ghidat — urmăreste pașii pe ecran complet cu modul "Găteste"',
        "Regenerează — nu îți place o masă? Un tap și apare alta",
        "Ingrediente — vezi tot ce ai nevoie dintr-o privire",
        "Pași de preparare — instrucțiuni clare, pas cu pas",
        "Salvează rețete — descarcă-le ca PDF sau păstrează-le în arhivă",
      ],
      cta: "Explorează planul meu",
      href: "/dashboard/guidance",
    },
    en: {
      title: "Ready to cook! Here's what you can do today.",
      message: "Your plan is ready. Discover everything NutriAID can do for you — from guided cooking to your personal recipe archive.",
      bullets: [
        "Guided cooking — follow full-screen step-by-step instructions with Cook Mode",
        "Regenerate — don't like a meal? One tap and you get a new one",
        "Ingredients — see everything you need at a glance",
        "Preparation steps — clear, actionable instructions for every recipe",
        "Save recipes — download as PDF or keep them in your archive",
      ],
      cta: "Explore my plan",
      href: "/dashboard/guidance",
    },
  },
} as const;

const ICON_MAP = { A: UserCircle, B: Sparkles, C: ChefHat };
const ICON_BG = {
  A: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  B: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  C: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
};

interface Props {
  profile: UserProfile | null;
  hasGuidance: boolean;
  lang: Lang;
}

export default function OnboardingModal({ profile, hasGuidance, lang }: Props) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [entering, setEntering] = useState(false);
  const [busy, setBusy] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!profile || profile.onboardingCompleted) return;
    const t = setTimeout(() => {
      setShow(true);
      rafRef.current = requestAnimationFrame(() => setEntering(true));
    }, 600);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
    };
  }, [profile?.onboardingCompleted]);

  if (!show || !profile) return null;

  const scenario = getScenario(profile, hasGuidance);
  const content = CONTENT[scenario][lang];
  const Icon = ICON_MAP[scenario];

  const close = (withSave: boolean) => {
    setEntering(false);
    if (withSave && !busy) {
      setBusy(true);
      updateProfile({ onboardingCompleted: true }).catch(() => {}).finally(() => setBusy(false));
    }
    setTimeout(() => setShow(false), 280);
  };

  const handleCta = () => {
    close(true);
    setTimeout(() => router.push(content.href), 100);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${entering ? "opacity-100" : "opacity-0"}`}
        onClick={() => close(false)}
      />

      {/* Modal — bottom-sheet on mobile, centered dialog on sm+ */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed z-50 left-4 right-4 bottom-4 sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-280 ease-out ${
          entering
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 sm:translate-y-2"
        }`}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="p-6 pb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${ICON_BG[scenario]}`}>
            <Icon className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
            {content.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {content.message}
          </p>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 mx-6" />

        {/* Bullets */}
        <div className="px-6 py-4 space-y-2.5">
          {content.bullets.map((bullet, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{bullet}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 mx-6" />

        {/* Actions */}
        <div className="p-6 pt-4 space-y-3">
          <button
            onClick={handleCta}
            disabled={busy}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors duration-150 flex items-center justify-center"
          >
            {content.cta}
          </button>
          <button
            onClick={() => close(true)}
            disabled={busy}
            className="w-full py-1 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-150 text-center"
          >
            {lang === "ro" ? "Nu mai afișa acest mesaj" : "Don't show this again"}
          </button>
        </div>
      </div>
    </>
  );
}
