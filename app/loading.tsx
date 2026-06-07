"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function Loading() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-16">
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
        <div className="w-5 h-5 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
        <span className="text-sm font-medium">{lang === "ro" ? "Se incarca..." : "Loading..."}</span>
      </div>
    </div>
  );
}
