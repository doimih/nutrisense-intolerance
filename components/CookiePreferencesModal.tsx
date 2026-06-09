"use client";

import React, { useState, useEffect } from "react";
import { useCookies } from "./CookieContext";
import type { CookiePreferences } from "./CookieContext";

type Category = {
  key: keyof Omit<CookiePreferences, "necessary">;
  label: string;
  description: string;
};

const CATEGORIES: Category[] = [
  {
    key: "analytics",
    label: "Analiză",
    description: "Ne ajută să înțelegem cum este folosită platforma pentru a îmbunătăți performanța.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Folosite pentru a afișa conținut relevant și pentru a măsura eficiența campaniilor.",
  },
  {
    key: "personalization",
    label: "Personalizare",
    description: "Permite personalizarea experienței în funcție de preferințele tale.",
  },
];

export default function CookiePreferencesModal() {
  const { showModal, closeModal, acceptAll, rejectOptional, savePreferences, preferences } = useCookies();
  const [toggles, setToggles] = useState({ analytics: false, marketing: false, personalization: false });

  useEffect(() => {
    if (showModal && preferences) {
      setToggles({
        analytics: preferences.analytics,
        marketing: preferences.marketing,
        personalization: preferences.personalization,
      });
    }
  }, [showModal, preferences]);

  if (!showModal) return null;

  const toggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Setări cookie-uri</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Închide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Categories */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Strictly necessary */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Strict necesare</p>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                  Întotdeauna activ
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Cookie-uri esențiale pentru autentificare, securitate și funcționarea de bază a platformei. Nu pot fi dezactivate.
              </p>
            </div>
            {/* Always-on toggle (disabled) */}
            <div className="flex-shrink-0 pt-0.5">
              <div className="w-11 h-6 bg-green-500 rounded-full relative opacity-60 cursor-not-allowed">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>

          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{cat.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{cat.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={toggles[cat.key]}
                aria-label={cat.label}
                onClick={() => toggle(cat.key)}
                className={`flex-shrink-0 pt-0.5 w-11 h-6 rounded-full relative transition-colors duration-200 ${
                  toggles[cat.key] ? "bg-green-500" : "bg-slate-200 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                    toggles[cat.key] ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <button
            onClick={() => savePreferences(toggles)}
            className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors"
          >
            Salvează preferințele
          </button>
          <button
            onClick={acceptAll}
            className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Acceptă toate
          </button>
          <button
            onClick={rejectOptional}
            className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            Respinge opționale
          </button>
        </div>
      </div>
    </div>
  );
}
