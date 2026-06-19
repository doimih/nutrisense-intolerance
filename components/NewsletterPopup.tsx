"use client";

import { useEffect, useState } from "react";
import { X, Mail, CheckCircle } from "lucide-react";

type Status = "idle" | "loading" | "accepted" | "declined" | "closed";

const PROMPT_KEY = "ns_newsletter_prompt_shown";

const copy = {
  ro: {
    title: "Rămâi la curent cu NutriAID",
    body: "Primești săptămânal sfaturi despre intoleranțe alimentare, noutăți din platformă și ghiduri utile. Te poți dezabona oricând.",
    accept: "Da, abonează-mă",
    decline: "Nu, mulțumesc",
    gdpr: "Prin abonare îți exprimi acordul pentru primirea newsletter-ului NutriAID. Vezi",
    privacy: "Politica de Confidențialitate",
    successTitle: "Ești abonat!",
    successBody: "Vei primi noutăți NutriAID pe email. Te poți dezabona oricând.",
  },
  en: {
    title: "Stay updated with NutriAID",
    body: "Receive weekly tips about food intolerances, platform updates, and helpful guides. Unsubscribe anytime.",
    accept: "Yes, subscribe me",
    decline: "No, thanks",
    gdpr: "By subscribing you agree to receive the NutriAID newsletter. See our",
    privacy: "Privacy Policy",
    successTitle: "You're subscribed!",
    successBody: "You'll receive NutriAID updates by email. Unsubscribe anytime.",
  },
};

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [lang, setLang] = useState<"ro" | "en">("ro");

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(PROMPT_KEY) === "true";
    if (alreadyShown) return;

    fetch("/api/newsletter/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { newsletterOptIn: boolean | null; language: string | null } | null) => {
        if (!data) return;
        if (data.newsletterOptIn === null) {
          setLang((data.language === "en" ? "en" : "ro") as "ro" | "en");
          // Small delay so the page loads before popup appears
          setTimeout(() => setVisible(true), 1500);
        }
      })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(PROMPT_KEY, "true");
    setVisible(false);
  };

  const handleAccept = async () => {
    setStatus("loading");
    try {
      await fetch("/api/newsletter/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang }),
      });
      setStatus("accepted");
      sessionStorage.setItem(PROMPT_KEY, "true");
      setTimeout(() => setVisible(false), 2500);
    } catch {
      setStatus("idle");
    }
  };

  const handleDecline = async () => {
    setStatus("declined");
    sessionStorage.setItem(PROMPT_KEY, "true");
    await fetch("/api/newsletter/decline", { method: "POST" }).catch(() => {});
    setTimeout(() => setVisible(false), 800);
  };

  if (!visible) return null;

  const t = copy[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Close button */}
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {status === "accepted" ? (
          <div className="flex flex-col items-center text-center p-8 gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{t.successTitle}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.successBody}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.body}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => void handleAccept()}
                disabled={status === "loading"}
                className="w-full rounded-xl bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                {status === "loading" ? "..." : t.accept}
              </button>
              <button
                type="button"
                onClick={() => void handleDecline()}
                disabled={status === "loading"}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {t.decline}
              </button>
            </div>

            {/* GDPR */}
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              {t.gdpr}{" "}
              <a href="/legal/privacy-policy" className="underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                {t.privacy}
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
