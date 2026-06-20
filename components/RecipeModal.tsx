"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  ChefHat,
  Flame,
  AlertTriangle,
  Shuffle,
  UtensilsCrossed,
  Play,
  CheckCircle2,
  FileDown,
} from "lucide-react";
import CookingMode from "@/components/CookingMode";
import type { RecipeLocalized } from "@/types/recipes";

type RecipeModalProps = {
  recipe: RecipeLocalized;
  lang: "ro" | "en";
  onClose: () => void;
};

const copy = {
  ro: {
    prepTime: "Timp preparare",
    minutes: "min",
    calories: "calorii",
    ingredients: "Ingrediente",
    instructions: "Instrucțiuni",
    tips: "Sfaturi",
    substitutions: "Substituții",
    substituteWith: "Înlocuitor",
    allergens: "Alergeni",
    macros: "Macronutrienți",
    protein: "Proteine",
    carbs: "Carbohidrați",
    fats: "Grăsimi",
    difficulty: { easy: "Ușor", medium: "Mediu", hard: "Dificil" },
    category: {
      breakfast: "Mic dejun",
      lunch: "Prânz",
      dinner: "Cină",
      snack: "Gustare",
    },
    startCooking: "Pornește Cooking Mode",
    downloadPdf: "Descarcă PDF",
    close: "Închide",
    noInstructions: "Instrucțiunile vor fi disponibile după generarea completă.",
  },
  en: {
    prepTime: "Prep time",
    minutes: "min",
    calories: "calories",
    ingredients: "Ingredients",
    instructions: "Instructions",
    tips: "Tips",
    substitutions: "Substitutions",
    substituteWith: "Substitute with",
    allergens: "Allergens",
    macros: "Macros",
    protein: "Protein",
    carbs: "Carbs",
    fats: "Fats",
    difficulty: { easy: "Easy", medium: "Medium", hard: "Hard" },
    category: {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snack: "Snack",
    },
    startCooking: "Start Cooking Mode",
    downloadPdf: "Download PDF",
    close: "Close",
    noInstructions: "Instructions will be available after full generation.",
  },
};

const difficultyColors = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function RecipeModal({ recipe, lang, onClose }: RecipeModalProps) {
  const t = copy[lang];
  const [cookingMode, setCookingMode] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !cookingMode) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, cookingMode]);

  useEffect(() => {
    if (!cookingMode) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [cookingMode]);

  if (cookingMode) {
    return (
      <CookingMode
        recipeId={recipe.id}
        title={recipe.title}
        steps={recipe.instructions}
        ingredients={recipe.ingredients}
        substitutions={recipe.substitutions}
        cookingTips={recipe.cookingTips}
        prepTimeMinutes={recipe.prepTimeMinutes}
        lang={lang}
        onClose={() => setCookingMode(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.category[recipe.category]}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColors[recipe.difficulty]}`}>
                {t.difficulty[recipe.difficulty]}
              </span>
              {recipe.cuisine && (
                <span className="text-xs text-slate-400 dark:text-slate-500">{recipe.cuisine}</span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {recipe.title}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {recipe.prepTimeMinutes} {t.minutes}
              </span>
              {recipe.calories && (
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  {recipe.calories} {t.calories}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex-shrink-0 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Macros */}
          {recipe.macros && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: t.protein, value: recipe.macros.protein, color: "text-blue-600 dark:text-blue-400" },
                { label: t.carbs, value: recipe.macros.carbs, color: "text-amber-600 dark:text-amber-400" },
                { label: t.fats, value: recipe.macros.fats, color: "text-green-600 dark:text-green-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                  <p className={`text-lg font-bold ${color}`}>{value}g</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Allergens */}
          {recipe.allergens && recipe.allergens.length > 0 && (
            <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-0.5">
                  {t.allergens}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-300">
                  {recipe.allergens.join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Ingredients */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <UtensilsCrossed className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {t.ingredients}
            </h3>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />
                  <span>
                    <span className="font-medium">{ing.quantity} {ing.unit}</span> {ing.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          {recipe.instructions.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                {t.instructions}
              </h3>
              <ol className="space-y-3">
                {recipe.instructions.map((step) => (
                  <li key={step.step_index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center justify-center mt-0.5">
                      {step.step_index}
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {step.text}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">{t.noInstructions}</p>
          )}

          {/* Cooking tips */}
          {recipe.cookingTips && recipe.cookingTips.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <ChefHat className="w-4 h-4 text-amber-500" />
                {t.tips}
              </h3>
              <ul className="space-y-1.5">
                {recipe.cookingTips.map((tip, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-400 italic flex items-start gap-2">
                    <span className="text-amber-400 flex-shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Substitutions */}
          {recipe.substitutions && recipe.substitutions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <Shuffle className="w-4 h-4 text-purple-500" />
                {t.substitutions}
              </h3>
              <div className="space-y-2">
                {recipe.substitutions.map((sub, i) => (
                  <div key={i} className="text-sm bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{sub.for}</span>
                    <span className="text-slate-400 dark:text-slate-500"> → </span>
                    <span className="text-purple-600 dark:text-purple-400">{sub.substitute_with}</span>
                    {sub.note && (
                      <span className="text-slate-400 dark:text-slate-500 text-xs ml-1">({sub.note})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {recipe.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer — PDF + Start Cooking */}
        <div className="flex-shrink-0 p-4 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-2">
          {/* PDF download — only for persisted recipes (id not starting with temp_) */}
          {!recipe.id.startsWith("temp_") && (
            <a
              href={`/api/recipes/${recipe.id}/pdf?lang=${lang}`}
              download
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl transition-colors text-sm"
            >
              <FileDown className="w-4 h-4" />
              {t.downloadPdf}
            </a>
          )}
          <button
            type="button"
            onClick={() => setCookingMode(true)}
            disabled={recipe.instructions.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white disabled:text-slate-400 font-semibold rounded-2xl transition-colors text-sm"
          >
            <Play className="w-4 h-4" />
            {t.startCooking}
          </button>
        </div>
      </div>
    </div>
  );
}
