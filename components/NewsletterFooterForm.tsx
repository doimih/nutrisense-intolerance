"use client";

import { useState } from "react";
import { Send } from "lucide-react";

const copy = {
  ro: {
    label: "Newsletter",
    placeholder: "adresa@email.ro",
    button: "Abonează-te",
    sending: "Se trimite...",
    success: "Te-ai abonat! Verifică email-ul.",
    error: "Adresă invalidă sau eroare. Încearcă din nou.",
    gdpr: "Te poți dezabona oricând. Vezi",
    privacy: "Politica de Confidențialitate",
  },
  en: {
    label: "Newsletter",
    placeholder: "your@email.com",
    button: "Subscribe",
    sending: "Sending...",
    success: "Subscribed! Check your email.",
    error: "Invalid address or error. Please try again.",
    gdpr: "Unsubscribe anytime. See our",
    privacy: "Privacy Policy",
  },
};

type FormState = "idle" | "loading" | "success" | "error";

export default function NewsletterFooterForm({ lang }: { lang: "ro" | "en" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const t = copy[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setState("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), language: lang }),
      });
      if (res.ok) {
        setState("success");
        setEmail("");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-white font-semibold text-sm">{t.label}</p>

      {state === "success" ? (
        <p className="text-sm text-emerald-400 font-medium">{t.success}</p>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
            placeholder={t.placeholder}
            required
            className="flex-1 min-w-0 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-3 py-2 transition-colors disabled:opacity-60"
          >
            <Send className="w-3.5 h-3.5" />
            {state === "loading" ? t.sending : t.button}
          </button>
        </form>
      )}

      {state === "error" && (
        <p className="text-xs text-red-400">{t.error}</p>
      )}

      <p className="text-xs text-slate-500 leading-relaxed">
        {t.gdpr}{" "}
        <a href="/legal/privacy-policy" className="underline hover:text-slate-400 transition-colors">
          {t.privacy}
        </a>
        .
      </p>
    </div>
  );
}
