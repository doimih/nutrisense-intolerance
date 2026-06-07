"use client";

import { useEffect } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import { useLanguage } from "@/components/LanguageProvider";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useLanguage();

  useEffect(() => {
    console.error("Global app error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {lang === "ro" ? "A aparut o eroare neasteptata" : "An unexpected error occurred"}
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          {lang === "ro"
            ? "Te rugam sa incerci din nou. Daca problema persista, revino mai tarziu."
            : "Please try again. If the problem persists, come back later."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button type="button" onClick={reset}>
            {lang === "ro" ? "Reincearca" : "Retry"}
          </Button>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {lang === "ro" ? "Inapoi acasa" : "Back to home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
