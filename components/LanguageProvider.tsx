"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { AppLanguage, LANGUAGE_COOKIE } from "@/lib/i18n/config";

type LanguageContextValue = {
  lang: AppLanguage;
  setLang: (value: AppLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: AppLanguage;
  children: React.ReactNode;
}) {
  const [lang] = useState<AppLanguage>(initialLang);

  const setLang = (value: AppLanguage) => {
    if (value === lang) return;
    document.cookie = `${LANGUAGE_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.location.reload();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contextValue = useMemo(() => ({ lang, setLang }), [lang]);

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
