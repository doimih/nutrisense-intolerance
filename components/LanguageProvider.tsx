"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { AppLanguage, LANGUAGE_COOKIE } from "@/lib/i18n/config";

const RUNTIME_LANGUAGE: AppLanguage = "ro";

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
  void initialLang;
  const [lang, setLangState] = useState<AppLanguage>(RUNTIME_LANGUAGE);

  const setLang = (value: AppLanguage) => {
    void value;
    setLangState(RUNTIME_LANGUAGE);
    document.cookie = `${LANGUAGE_COOKIE}=${RUNTIME_LANGUAGE}; Path=/; Max-Age=31536000; SameSite=Lax`;
  };

  const contextValue = useMemo(
    () => ({
      lang,
      setLang,
    }),
    [lang]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
