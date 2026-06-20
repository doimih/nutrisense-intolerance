"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, CheckCircle2, Lightbulb, Clock, ChefHat } from "lucide-react";
import type { RecipeStep, RecipeIngredient, RecipeSubstitution } from "@/types/recipes";

type CookingModeProps = {
  recipeId: string;
  title: string;
  steps: RecipeStep[];
  ingredients: RecipeIngredient[];
  substitutions: RecipeSubstitution[] | null;
  cookingTips: string[] | null;
  prepTimeMinutes: number;
  lang: "ro" | "en";
  onClose: () => void;
};

const copy = {
  ro: {
    step: "Pasul",
    of: "din",
    ingredients: "Ingrediente",
    tips: "Sfaturi utile",
    substitutions: "Substituții",
    substituteWith: "Înlocuitor",
    back: "Înapoi",
    next: "Următorul pas",
    finish: "Finalizat!",
    prepTime: "Timp preparare",
    minutes: "min",
    done: "Rețetă completă!",
    doneDesc: "Bucurați-vă de masă!",
    close: "Închide",
  },
  en: {
    step: "Step",
    of: "of",
    ingredients: "Ingredients",
    tips: "Cooking tips",
    substitutions: "Substitutions",
    substituteWith: "Substitute with",
    back: "Back",
    next: "Next step",
    finish: "Done!",
    prepTime: "Prep time",
    minutes: "min",
    done: "Recipe complete!",
    doneDesc: "Enjoy your meal!",
    close: "Close",
  },
};

export default function CookingMode({
  title,
  steps,
  ingredients,
  substitutions,
  cookingTips,
  prepTimeMinutes,
  lang,
  onClose,
}: CookingModeProps) {
  const t = copy[lang];
  const [currentStep, setCurrentStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const totalSteps = steps.length;
  const isLast = currentStep === totalSteps - 1;
  const isFinished = currentStep >= totalSteps;

  const goNext = useCallback(() => {
    setCompletedSteps((prev) => new Set(Array.from(prev).concat(currentStep)));
    setCurrentStep((s) => s + 1);
  }, [currentStep]);

  const goBack = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") goNext();
      if (e.key === "ArrowLeft") goBack();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goBack, onClose]);

  // Prevent body scroll while in cooking mode
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const progress = totalSteps > 0 ? ((isFinished ? totalSteps : currentStep) / totalSteps) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight line-clamp-1 max-w-[200px] sm:max-w-xs">
              {title}
            </p>
            <p className="text-slate-400 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {prepTimeMinutes} {t.minutes}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowIngredients((v) => !v)}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-colors"
          >
            {t.ingredients}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex-shrink-0 h-1 bg-slate-700">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Ingredients panel */}
      {showIngredients && (
        <div className="flex-shrink-0 border-b border-slate-700 bg-slate-800 px-4 py-3 max-h-48 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
            {t.ingredients}
          </p>
          <ul className="space-y-1">
            {ingredients.map((ing, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />
                <span>
                  <span className="font-medium text-white">{ing.quantity} {ing.unit}</span>{" "}
                  {ing.name}
                </span>
              </li>
            ))}
          </ul>

          {substitutions && substitutions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                {t.substitutions}
              </p>
              {substitutions.map((sub, i) => (
                <p key={i} className="text-xs text-slate-400">
                  <span className="text-slate-300">{sub.for}</span> → {sub.substitute_with}
                  {sub.note ? ` (${sub.note})` : ""}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-8">
        {isFinished ? (
          <div className="text-center animate-slide-up">
            <div className="w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{t.done}</h2>
            <p className="text-slate-400 text-lg mb-8">{t.doneDesc}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
            >
              {t.close}
            </button>
          </div>
        ) : (
          <div className="w-full max-w-xl text-center animate-slide-up">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-4">
              {t.step} {currentStep + 1} {t.of} {totalSteps}
            </p>
            <p className="text-white text-2xl sm:text-3xl font-medium leading-relaxed mb-8">
              {steps[currentStep]?.text ?? ""}
            </p>

            {/* Completed steps mini-list */}
            {completedSteps.size > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mb-6">
                {Array.from(completedSteps)
                  .sort((a, b) => a - b)
                  .slice(-4)
                  .map((idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-900/40 text-emerald-400 text-xs rounded-full"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {t.step} {idx + 1}
                    </span>
                  ))}
              </div>
            )}

            {/* Cooking tip for this step (rotate) */}
            {cookingTips && cookingTips.length > 0 && (
              <div className="flex items-start gap-2 bg-slate-800 rounded-xl p-4 text-left mb-6">
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 italic">
                  {cookingTips[currentStep % cookingTips.length]}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer navigation */}
      {!isFinished && (
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-4 border-t border-slate-700">
          <button
            type="button"
            onClick={goBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.back}
          </button>
          <button
            type="button"
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
          >
            {isLast ? t.finish : t.next}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
