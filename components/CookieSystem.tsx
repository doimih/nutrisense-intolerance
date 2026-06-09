"use client";

import React from "react";
import { CookieProvider } from "./CookieContext";
import CookieBanner from "./CookieBanner";
import CookiePreferencesModal from "./CookiePreferencesModal";

export default function CookieSystem({ children }: { children: React.ReactNode }) {
  return (
    <CookieProvider>
      {children}
      <CookieBanner />
      <CookiePreferencesModal />
    </CookieProvider>
  );
}
