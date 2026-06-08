"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function LanguageSwitcher() {
  const { lang } = useLanguage();

  return (
    <span
      className="inline-flex items-center rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 px-2.5 py-1.5 text-xs font-semibold"
      aria-label="Limba platformei: romana"
    >
      {lang.toUpperCase()}
    </span>
  );
}
