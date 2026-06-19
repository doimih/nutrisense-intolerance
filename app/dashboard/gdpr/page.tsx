"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  FileText,
  Lock,
  Cookie,
  Database,
  Stethoscope,
  Trash2,
  Download,
  ChevronRight,
  AlertTriangle,
  Mail,
  MailX,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const LEGAL_LINKS = [
  {
    href: "/legal/terms",
    icon: FileText,
    titleRo: "Termeni și Condiții",
    titleEn: "Terms & Conditions",
    descRo: "Regulile de utilizare a platformei NutriAID",
    descEn: "Platform usage rules and agreements",
  },
  {
    href: "/legal/privacy-policy",
    icon: Lock,
    titleRo: "Politica de Confidențialitate",
    titleEn: "Privacy Policy",
    descRo: "Cum colectăm, folosim și protejăm datele tale",
    descEn: "How we collect, use and protect your data",
  },
  {
    href: "/legal/cookies-policy",
    icon: Cookie,
    titleRo: "Politica de Cookies",
    titleEn: "Cookies Policy",
    descRo: "Tipuri de cookie-uri folosite și cum le gestionezi",
    descEn: "Cookie types used and how to manage them",
  },
  {
    href: "/legal/data-retention",
    icon: Database,
    titleRo: "Politica de Retenție a Datelor",
    titleEn: "Data Retention Policy",
    descRo: "Cât timp păstrăm datele tale și în ce condiții",
    descEn: "How long we keep your data and under what conditions",
  },
  {
    href: "/legal/medical-disclaimer",
    icon: Stethoscope,
    titleRo: "Disclaimer Medical",
    titleEn: "Medical Disclaimer",
    descRo: "NutriAID nu oferă consultanță medicală",
    descEn: "NutriAID does not provide medical advice",
  },
  {
    href: "/legal/account-deletion",
    icon: Trash2,
    titleRo: "Politica de Ștergere Cont",
    titleEn: "Account Deletion Policy",
    descRo: "Drepturile tale privind ștergerea datelor (GDPR Art. 17)",
    descEn: "Your rights regarding data deletion (GDPR Art. 17)",
  },
  {
    href: "/legal/security-policy",
    icon: ShieldCheck,
    titleRo: "Politica de Securitate",
    titleEn: "Security Policy",
    descRo: "Măsurile tehnice de protecție a datelor",
    descEn: "Technical measures for data protection",
  },
];

export default function GdprPage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const router = useRouter();

  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm" | "deleting" | "done">("idle");
  const [deleteError, setDeleteError] = useState("");
  const [exporting, setExporting] = useState(false);

  // Newsletter state
  const [newsletterOptIn, setNewsletterOptIn] = useState<boolean | null>(null);
  const [newsletterLoading, setNewsletterLoading] = useState(true);
  const [newsletterWorking, setNewsletterWorking] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/newsletter/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { newsletterOptIn?: boolean } | null) => {
        setNewsletterOptIn(d?.newsletterOptIn ?? false);
      })
      .catch(() => setNewsletterOptIn(false))
      .finally(() => setNewsletterLoading(false));
  }, []);

  const handleNewsletterOptOut = async () => {
    setNewsletterWorking(true);
    setNewsletterMsg(null);
    try {
      const res = await fetch("/api/newsletter/decline", { method: "POST" });
      if (res.ok) {
        setNewsletterOptIn(false);
        setNewsletterMsg({
          ok: true,
          text: isRo
            ? "Te-ai dezabonat cu succes. Nu vei mai primi emailuri de newsletter."
            : "Successfully unsubscribed. You will no longer receive newsletter emails.",
        });
      } else {
        setNewsletterMsg({ ok: false, text: isRo ? "A apărut o eroare. Încearcă din nou." : "An error occurred. Please try again." });
      }
    } catch {
      setNewsletterMsg({ ok: false, text: isRo ? "Cererea a eșuat." : "Request failed." });
    } finally {
      setNewsletterWorking(false);
    }
  };

  const handleNewsletterOptIn = async () => {
    setNewsletterWorking(true);
    setNewsletterMsg(null);
    try {
      const res = await fetch("/api/newsletter/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang }),
      });
      if (res.ok) {
        setNewsletterOptIn(true);
        setNewsletterMsg({
          ok: true,
          text: isRo
            ? "Te-ai abonat cu succes la newsletter."
            : "Successfully subscribed to the newsletter.",
        });
      } else {
        setNewsletterMsg({ ok: false, text: isRo ? "A apărut o eroare. Încearcă din nou." : "An error occurred. Please try again." });
      }
    } catch {
      setNewsletterMsg({ ok: false, text: isRo ? "Cererea a eșuat." : "Request failed." });
    } finally {
      setNewsletterWorking(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/auth/export-data", { method: "GET" });
      if (!res.ok) { setExporting(false); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nutriaid-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteStep("deleting");
    setDeleteError("");
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setDeleteError(payload.error || (isRo ? "A apărut o eroare." : "An error occurred."));
        setDeleteStep("confirm");
        return;
      }
      setDeleteStep("done");
      setTimeout(() => router.push("/"), 2500);
    } catch {
      setDeleteError(isRo ? "Cererea a eșuat. Încearcă din nou." : "Request failed. Please try again.");
      setDeleteStep("confirm");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-green-700 dark:text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {isRo ? "Confidențialitate & GDPR" : "Privacy & GDPR"}
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 ml-12">
          {isRo
            ? "Drepturile tale privind datele personale și documentele legale ale platformei."
            : "Your personal data rights and platform legal documents."}
        </p>
      </div>

      {/* Legal documents */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {isRo ? "Documente legale" : "Legal documents"}
          </h2>
        </div>
        <ul className="divide-y divide-gray-100 dark:divide-slate-700">
          {LEGAL_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {isRo ? item.titleRo : item.titleEn}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {isRo ? item.descRo : item.descEn}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors flex-shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Data rights */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {isRo ? "Drepturile tale (GDPR)" : "Your rights (GDPR)"}
          </h2>
        </div>
        <div className="px-5 py-4 space-y-2.5">
          {(isRo
            ? [
                { text: "Dreptul de acces — poți solicita oricând datele stocate despre tine.", export: false },
                { text: "Dreptul la rectificare — poți corecta datele incorecte din Profil.", export: false },
                { text: "Dreptul la ștergere — poți șterge complet contul și toate datele.", export: false },
                { text: "Dreptul la portabilitate — poți exporta datele tale în format JSON.", export: true },
                { text: "Dreptul la opoziție — poți refuza prelucrarea datelor în scop de marketing.", export: false },
              ]
            : [
                { text: "Right of access — you can request your stored data at any time.", export: false },
                { text: "Right to rectification — you can correct incorrect data in your Profile.", export: false },
                { text: "Right to erasure — you can delete your account and all data completely.", export: false },
                { text: "Right to portability — you can export your data in JSON format.", export: true },
                { text: "Right to object — you can refuse processing for marketing purposes.", export: false },
              ]
          ).map((item) => (
            <div key={item.text} className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <p className="text-sm text-slate-600 dark:text-slate-300 flex-1">{item.text}</p>
              {item.export && (
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  title={isRo ? "Descarcă datele tale în format JSON" : "Download your data as JSON"}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  <Download className="w-3 h-3" />
                  {exporting
                    ? (isRo ? "Export..." : "Exporting...")
                    : "JSON"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {isRo ? "Abonare newsletter" : "Newsletter subscription"}
          </h2>
        </div>
        <div className="px-5 py-5">
          {newsletterLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
              <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
              {isRo ? "Se încarcă..." : "Loading..."}
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                newsletterOptIn
                  ? "bg-emerald-50 dark:bg-emerald-900/30"
                  : "bg-slate-100 dark:bg-slate-700"
              }`}>
                {newsletterOptIn
                  ? <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  : <MailX className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                }
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {newsletterOptIn
                      ? (isRo ? "Ești abonat la newsletter" : "You are subscribed to the newsletter")
                      : (isRo ? "Nu ești abonat la newsletter" : "You are not subscribed to the newsletter")}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {isRo
                      ? "Conform GDPR Art. 21, poți refuza sau retrage consimțământul pentru comunicări de marketing oricând."
                      : "Under GDPR Art. 21, you can refuse or withdraw consent for marketing communications at any time."}
                  </p>
                </div>

                {newsletterMsg && (
                  <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
                    newsletterMsg.ok
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                      : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                  }`}>
                    {newsletterMsg.ok && <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    {newsletterMsg.text}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {newsletterOptIn ? (
                    <button
                      onClick={() => void handleNewsletterOptOut()}
                      disabled={newsletterWorking}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                      <MailX className="w-4 h-4" />
                      {newsletterWorking
                        ? (isRo ? "Se procesează..." : "Processing...")
                        : (isRo ? "Dezabonare newsletter" : "Unsubscribe from newsletter")}
                    </button>
                  ) : (
                    <button
                      onClick={() => void handleNewsletterOptIn()}
                      disabled={newsletterWorking}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors disabled:opacity-50"
                    >
                      <Mail className="w-4 h-4" />
                      {newsletterWorking
                        ? (isRo ? "Se procesează..." : "Processing...")
                        : (isRo ? "Abonare la newsletter" : "Subscribe to newsletter")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete account */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-900/50 p-5">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
              {isRo ? "Ștergerea contului" : "Delete account"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              {isRo
                ? "Această acțiune este permanentă și ireversibilă. Toate datele tale (profil, jurnal, istoric) vor fi șterse imediat."
                : "This action is permanent and irreversible. All your data (profile, journal, history) will be deleted immediately."}
            </p>

            {deleteStep === "idle" && (
              <button
                onClick={() => setDeleteStep("confirm")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {isRo ? "Șterge contul meu" : "Delete my account"}
              </button>
            )}

            {deleteStep === "confirm" && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    {isRo
                      ? "Ești sigur? Această acțiune nu poate fi anulată."
                      : "Are you sure? This action cannot be undone."}
                  </p>
                </div>
                {deleteError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    {isRo ? "Da, șterge definitiv" : "Yes, delete permanently"}
                  </button>
                  <button
                    onClick={() => { setDeleteStep("idle"); setDeleteError(""); }}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {isRo ? "Anulează" : "Cancel"}
                  </button>
                </div>
              </div>
            )}

            {deleteStep === "deleting" && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isRo ? "Se șterge contul..." : "Deleting account..."}
              </p>
            )}

            {deleteStep === "done" && (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                {isRo ? "Cont șters. Vei fi redirecționat..." : "Account deleted. Redirecting..."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
