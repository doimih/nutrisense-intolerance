"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language switcher"
      className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold"
    >
      <button
        onClick={() => setLang("ro")}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          lang === "ro"
            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
        aria-pressed={lang === "ro"}
      >
        ro
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          lang === "en"
            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
        aria-pressed={lang === "en"}
      >
        en
      </button>
    </div>
  );
}
