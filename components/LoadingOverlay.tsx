"use client";

import React from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface LoadingOverlayProps {
  text?: string;
  fullPage?: boolean;
  className?: string;
}

export default function LoadingOverlay({
  text,
  fullPage = false,
  className,
}: LoadingOverlayProps) {
  const { lang } = useLanguage();
  const resolvedText = text ?? (lang === "ro" ? "Se incarca..." : "Loading...");

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-3",
        fullPage ? "fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50" : "py-16",
        className
      )}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-green-100 dark:border-green-900" />
        <Loader2 className="w-12 h-12 text-green-600 animate-spin absolute inset-0" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{resolvedText}</p>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={clsx("animate-spin text-green-600", className ?? "w-5 h-5")}
    />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingOverlay />
    </div>
  );
}
