"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
};

type CookieContextValue = {
  preferences: CookiePreferences | null;
  showBanner: boolean;
  showModal: boolean;
  openModal: () => void;
  closeModal: () => void;
  acceptAll: () => void;
  rejectOptional: () => void;
  savePreferences: (prefs: Omit<CookiePreferences, "necessary">) => void;
};

const STORAGE_KEY = "cookiePreferences";

const CookieContext = createContext<CookieContextValue | null>(null);

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored) as CookiePreferences);
        setShowBanner(false);
      } else {
        setShowBanner(true);
      }
    } catch {
      setShowBanner(true);
    }
  }, []);

  const persist = (prefs: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowModal(false);
  };

  const acceptAll = () => persist({ necessary: true, analytics: true, marketing: true, personalization: true });
  const rejectOptional = () => persist({ necessary: true, analytics: false, marketing: false, personalization: false });
  const savePreferences = (partial: Omit<CookiePreferences, "necessary">) =>
    persist({ necessary: true, ...partial });

  return (
    <CookieContext.Provider value={{
      preferences,
      showBanner,
      showModal,
      openModal: () => setShowModal(true),
      closeModal: () => setShowModal(false),
      acceptAll,
      rejectOptional,
      savePreferences,
    }}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookies(): CookieContextValue {
  const ctx = useContext(CookieContext);
  if (!ctx) throw new Error("useCookies must be used inside CookieProvider");
  return ctx;
}
