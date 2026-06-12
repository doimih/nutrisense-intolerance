"use client";

import React, { useEffect, useState } from "react";
import { useCookies } from "./CookieContext";
import { useLanguage } from "./LanguageProvider";

const copy = {
  ro: {
    text: "folosește cookie-uri pentru funcționarea corectă a platformei, pentru analiză și pentru personalizarea experienței. Poți alege ce tipuri de date permiți.",
    customize: "Personalizează",
    reject: "Respinge opționale",
    accept: "Acceptă toate",
  },
  en: {
    text: "uses cookies for the correct functioning of the platform, for analytics and to personalise your experience. You can choose which data types to allow.",
    customize: "Customise",
    reject: "Reject optional",
    accept: "Accept all",
  },
} as const;

export default function CookieBanner() {
  const { showBanner, acceptAll, rejectOptional, openModal } = useCookies();
  const { lang } = useLanguage();
  const t = copy[lang];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [showBanner]);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icon + text */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white">NutriAID</span>{" "}
                {t.text}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <button
                onClick={openModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-600 rounded-xl hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
              >
                {t.customize}
              </button>
              <button
                onClick={rejectOptional}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-600 rounded-xl hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
              >
                {t.reject}
              </button>
              <button
                onClick={acceptAll}
                className="px-5 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-sm"
              >
                {t.accept}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
