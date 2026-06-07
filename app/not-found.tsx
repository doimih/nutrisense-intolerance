"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function NotFound() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center">
        <p className="text-sm font-semibold text-green-600 dark:text-green-400">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
          {lang === "ro" ? "Pagina nu a fost gasita" : "Page not found"}
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          {lang === "ro"
            ? "Linkul poate fi expirat sau adresa introdusa este incorecta."
            : "The link may be expired or the entered address is incorrect."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
          >
            {lang === "ro" ? "Mergi acasa" : "Go home"}
          </Link>
          <Link
            href="/contact"
            className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
