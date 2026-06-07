import React from "react";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalLayout({
  title,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  return (
    <div className="pt-24 pb-16 bg-white dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Înapoi la pagina principală
        </Link>

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-slate-700">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>Ultima actualizare: {lastUpdated}</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose-legal">{children}</div>

        {/* Legal nav */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Alte documente legale
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/legal/privacy-policy", label: "Confidențialitate" },
              { href: "/legal/cookies-policy", label: "Cookies" },
              { href: "/legal/terms", label: "Termeni" },
              { href: "/legal/security-policy", label: "Securitate" },
              { href: "/legal/data-retention", label: "Retenția Datelor" },
              { href: "/legal/account-deletion", label: "Ștergere Cont" },
              { href: "/legal/medical-disclaimer", label: "Disclaimer Medical" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-green-700 dark:hover:text-green-400 bg-slate-100 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
