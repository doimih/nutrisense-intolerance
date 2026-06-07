"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const isRo = lang === "ro";

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setLang("ro")}
        className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
          lang === "ro"
            ? "bg-green-600 text-white"
            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        }`}
        aria-label={isRo ? "Schimba in romana" : "Switch to Romanian"}
      >
        RO
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
          lang === "en"
            ? "bg-green-600 text-white"
            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        }`}
        aria-label={isRo ? "Schimba in engleza" : "Switch to English"}
      >
        EN
      </button>
    </div>
  );
}
