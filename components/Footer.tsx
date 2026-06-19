"use client";

import React from "react";
import Link from "next/link";
import { Leaf, Heart, Shield } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { getUiCopy } from "@/lib/i18n/ui";
import { useCookies } from "@/components/CookieContext";
import { usePathname } from "next/navigation";
import NewsletterFooterForm from "@/components/NewsletterFooterForm";

export default function Footer() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const copy = getUiCopy(lang);
  const currentYear = new Date().getFullYear();
  const { openModal } = useCookies();
  const pathname = usePathname();

  if (pathname.startsWith("/auth")) return null;

  const legalLinks = [
    { href: "/legal/privacy-policy", label: isRo ? "Politica de Confidentialitate" : "Privacy Policy" },
    { href: "/legal/cookies-policy", label: isRo ? "Politica de Cookies" : "Cookies Policy" },
    { href: "/legal/terms", label: isRo ? "Termeni si Conditii" : "Terms and Conditions" },
    { href: "/legal/security-policy", label: isRo ? "Politica de Securitate" : "Security Policy" },
    { href: "/legal/data-retention", label: isRo ? "Retentia Datelor" : "Data Retention" },
    { href: "/legal/account-deletion", label: isRo ? "Stergere Cont" : "Account Deletion" },
    { href: "/legal/medical-disclaimer", label: isRo ? "Disclaimer Medical" : "Medical Disclaimer" },
  ];

  const appLinks = [
    { href: "/", label: copy.nav.home },
    { href: "/about", label: copy.nav.about },
    { href: "/faq", label: copy.nav.faq },
    { href: "/contact", label: copy.nav.contact },
    { href: "/auth/register", label: copy.nav.signUp },
    { href: "/auth/login", label: copy.nav.signIn },
  ];

  const knowledgeLinks = [
    { href: "/knowledge-hub", label: isRo ? "Toate articolele" : "All articles" },
    { href: "/knowledge-hub/ce-este-nutriaid", label: isRo ? "Ce este NutriAID?" : "What is NutriAID?" },
    { href: "/knowledge-hub/cum-functioneaza-ai", label: isRo ? "Cum funcționează AI?" : "How AI works" },
    { href: "/knowledge-hub/analiza-meselor", label: isRo ? "Analiza meselor" : "Meal analysis" },
    { href: "/knowledge-hub/analiza-simptomelor", label: isRo ? "Analiza simptomelor" : "Symptom analysis" },
    { href: "/knowledge-hub/plan-alimentar-ai", label: isRo ? "Plan alimentar AI" : "AI meal plan" },
    { href: "/knowledge-hub/siguranta-alimentara", label: isRo ? "Siguranță alimentară" : "Food safety AI" },
    { href: "/knowledge-hub/pdf-uri-generate", label: isRo ? "PDF-uri generate" : "Generated PDFs" },
    { href: "/knowledge-hub/gdpr-confidentialitate", label: isRo ? "GDPR & Confidențialitate" : "GDPR & Privacy" },
  ];

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Top section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">NutriAID</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 mb-4">
              {isRo
                ? "Un loc sigur pentru a intelege mai bine intolerantele alimentare si reactiile tale. Fara reclame."
                : "A safe place to better understand food intolerances and your reactions. No ads, no fees."}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span>{copy.footer.secure}</span>
            </div>
          </div>

          {/* App links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{copy.footer.app}</h3>
            <ul className="space-y-2">
              {appLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Knowledge Hub links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{copy.footer.knowledge}</h3>
            <ul className="space-y-2">
              {knowledgeLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{copy.footer.legal}</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={openModal}
                  className="text-sm text-slate-400 hover:text-green-400 transition-colors text-left"
                >
                  {isRo ? "Preferințe Cookie" : "Cookie Preferences"}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-slate-800 pt-8 mb-8">
          <div className="max-w-sm">
            <NewsletterFooterForm lang={isRo ? "ro" : "en"} />
          </div>
        </div>

        {/* SAL / SOL — obligatoriu ANPC România */}
        <div className="border-t border-slate-800 pt-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 font-semibold shrink-0">
              {isRo ? "Soluționarea litigiilor:" : "Dispute resolution:"}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://anpc.ro/ce-este-sal/"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-900/40 border border-blue-700/50 text-xs font-semibold text-blue-300 hover:bg-blue-900/70 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                SAL — {isRo ? "Soluționarea Alternativă a Litigiilor" : "Alternative Dispute Resolution"}
              </a>
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-900/40 border border-indigo-700/50 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/70 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                SOL — {isRo ? "Soluționarea Online a Litigiilor (UE)" : "Online Dispute Resolution (EU)"}
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-slate-800 pt-6 mb-6">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <Shield className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">{copy.footer.disclaimerTitle}</strong> {copy.footer.disclaimerBody}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            © {currentYear} NutriAID Intolerances. {copy.footer.copyright}
          </span>
          <span className="flex items-center gap-1">
            {copy.footer.madeWith} <Heart className="w-3 h-3 text-red-400 fill-red-400" /> {copy.footer.forYourHealth}
          </span>
        </div>
      </div>
    </footer>
  );
}
