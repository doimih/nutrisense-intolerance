'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Mail, Clock3, MessageSquare, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const copy = {
  ro: {
    badge: 'Contact NutriAID',
    title: 'Contacteaza-ne',
    subtitle: 'Ai o intrebare, o problema sau o sugestie? Scrie-ne si revenim rapid cu un raspuns.',
    infoTitle: 'Detalii de contact',
    emailLabel: 'Email suport',
    emailValue: 'contact@nutriaid.eu',
    hoursLabel: 'Program suport',
    hoursValue: 'Luni - Vineri, 09:00 - 18:00',
    responseLabel: 'Timp de raspuns',
    responseValue: 'De obicei sub 24 ore',
    formTitle: 'Trimite-ne un mesaj',
    name: 'Nume',
    namePlaceholder: 'Ana Ionescu',
    email: 'Email',
    emailPlaceholder: 'ana@exemplu.ro',
    subject: 'Subiect',
    subjectPlaceholder: 'Intrebare despre platforma',
    message: 'Mesaj',
    messagePlaceholder: 'Descrie intrebarea sau problema ta...',
    submit: 'Trimite mesajul',
    submitting: 'Se trimite...',
    successTitle: 'Mesaj trimis!',
    successBody: 'Ti-am primit mesajul si iti vom raspunde in cel mai scurt timp.',
    sendAnother: 'Trimite alt mesaj',
    dailyPlanTitle: 'Cauti Planul tau zilnic?',
    dailyPlanBody: 'L-am mutat pe o pagina dedicata, separata de contact.',
    dailyPlanCta: 'Vezi Planul tau zilnic',
    recaptchaNote: 'Acest formular este protejat de Google reCAPTCHA v3.',
  },
  en: {
    badge: 'Contact NutriAID',
    title: 'Get in touch',
    subtitle: 'Have a question, issue, or suggestion? Send us a message and we will reply quickly.',
    infoTitle: 'Contact details',
    emailLabel: 'Support email',
    emailValue: 'contact@nutriaid.eu',
    hoursLabel: 'Support hours',
    hoursValue: 'Monday - Friday, 09:00 - 18:00',
    responseLabel: 'Response time',
    responseValue: 'Usually under 24 hours',
    formTitle: 'Send us a message',
    name: 'Name',
    namePlaceholder: 'Anna Johnson',
    email: 'Email',
    emailPlaceholder: 'anna@example.com',
    subject: 'Subject',
    subjectPlaceholder: 'Question about the platform',
    message: 'Message',
    messagePlaceholder: 'Describe your question or issue...',
    submit: 'Send message',
    submitting: 'Sending...',
    successTitle: 'Message sent!',
    successBody: "We've received your message and will reply as soon as possible.",
    sendAnother: 'Send another message',
    dailyPlanTitle: 'Looking for your daily plan?',
    dailyPlanBody: 'We moved it to a dedicated page, separate from contact.',
    dailyPlanCta: 'Open Your Daily Plan',
    recaptchaNote: 'This form is protected by Google reCAPTCHA v3.',
  },
} as const;

type Lang = keyof typeof copy;

function useLang(): Lang {
  const [lang, setLang] = useState<Lang>('ro');
  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored === 'en' || stored === 'ro') setLang(stored);
    else if (navigator.language.startsWith('en')) setLang('en');
  }, []);
  return lang;
}

type RecaptchaConfig = { enabled: boolean; siteKey: string };

function useRecaptcha(): RecaptchaConfig {
  const [config, setConfig] = useState<RecaptchaConfig>({ enabled: false, siteKey: '' });
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    fetch('/api/runtime-settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { settings?: { recaptcha?: RecaptchaConfig } } | null) => {
        const rc = data?.settings?.recaptcha;
        if (!rc?.enabled || !rc.siteKey) return;
        setConfig({ enabled: true, siteKey: rc.siteKey });

        // Inject reCAPTCHA v3 script
        if (!document.getElementById('recaptcha-script')) {
          const script = document.createElement('script');
          script.id = 'recaptcha-script';
          script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(rc.siteKey)}`;
          script.async = true;
          document.head.appendChild(script);
          scriptRef.current = script;
        }
      })
      .catch(() => {});

    return () => {
      // cleanup only if this component unmounts during the fetch
    };
  }, []);

  return config;
}

async function getRecaptchaToken(siteKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) { reject(new Error('reCAPTCHA not loaded')); return; }
    window.grecaptcha.ready(() => {
      window.grecaptcha!
        .execute(siteKey, { action: 'contact' })
        .then(resolve)
        .catch(reject);
    });
  });
}

export default function ContactPage() {
  const lang = useLang();
  const t = copy[lang];
  const recaptcha = useRecaptcha();

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let recaptchaToken: string | undefined;
      if (recaptcha.enabled && recaptcha.siteKey) {
        recaptchaToken = await getRecaptchaToken(recaptcha.siteKey).catch(() => undefined);
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, recaptchaToken }),
      });

      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? (lang === 'ro' ? 'A aparut o eroare. Incearca din nou.' : 'An error occurred. Please try again.'));
        return;
      }
      setSuccess(true);
    } catch {
      setError(lang === 'ro' ? 'A aparut o eroare de retea. Incearca din nou.' : 'A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition';
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="pb-20 bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-y border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-100 via-white to-slate-50 dark:from-emerald-950/30 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 right-0 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 text-sm font-semibold mb-6">
            <MessageSquare className="h-4 w-4" />
            {t.badge}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white max-w-5xl">
            {t.title}
          </h1>
          <p className="mt-6 text-lg text-slate-700 dark:text-slate-300 max-w-4xl">{t.subtitle}</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Info */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">{t.infoTitle}</h2>
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-1 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.emailLabel}</p>
                <a className="text-emerald-700 dark:text-emerald-300 hover:underline" href={`mailto:${t.emailValue}`}>
                  {t.emailValue}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="h-4 w-4 mt-1 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.hoursLabel}</p>
                <p>{t.hoursValue}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="h-4 w-4 mt-1 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.responseLabel}</p>
                <p>{t.responseValue}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/30 p-4">
            <p className="font-semibold text-slate-900 dark:text-cyan-100 mb-1">{t.dailyPlanTitle}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{t.dailyPlanBody}</p>
            <Link
              href="/daily-plan"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
            >
              {t.dailyPlanCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">{t.formTitle}</h2>

          {success ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{t.successTitle}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{t.successBody}</p>
              <button
                type="button"
                onClick={() => { setSuccess(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {t.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 px-4 py-3">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="contact-name" className={labelCls}>{t.name}</label>
                <input id="contact-name" name="name" type="text" required placeholder={t.namePlaceholder} className={inputCls} {...field('name')} />
              </div>
              <div>
                <label htmlFor="contact-email" className={labelCls}>{t.email}</label>
                <input id="contact-email" name="email" type="email" required placeholder={t.emailPlaceholder} className={inputCls} {...field('email')} />
              </div>
              <div>
                <label htmlFor="contact-subject" className={labelCls}>{t.subject}</label>
                <input id="contact-subject" name="subject" type="text" required placeholder={t.subjectPlaceholder} className={inputCls} {...field('subject')} />
              </div>
              <div>
                <label htmlFor="contact-message" className={labelCls}>{t.message}</label>
                <textarea id="contact-message" name="message" rows={5} required placeholder={t.messagePlaceholder} className={inputCls} {...field('message')} />
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {submitting ? t.submitting : t.submit}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>

                {recaptcha.enabled && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-right max-w-[180px]">
                    {t.recaptchaNote}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </section>

      {/* GEO Summary + mini-FAQ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            {lang === 'ro' ? "Contact NutriAID Intolerances" : "Contact NutriAID Intolerances"}
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            {lang === 'ro'
              ? "Echipa NutriAID Intolerances răspunde la toate mesajele în maxim 24–48 ore în zilele lucrătoare. Ne poți contacta pentru întrebări despre aplicație, probleme tehnice, solicitări GDPR (acces, rectificare, ștergere date) sau sugestii de îmbunătățire. Adresa noastră de email este contact@nutriaid.eu. Nu oferim consultanță medicală sau nutrițională — pentru acestea recomandăm contactarea unui specialist."
              : "The NutriAID Intolerances team responds to all messages within 24–48 hours on business days. You can contact us for questions about the application, technical issues, GDPR requests (data access, rectification, deletion), or improvement suggestions. Our email address is contact@nutriaid.eu. We do not provide medical or nutritional consultancy — for these we recommend contacting a specialist."}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            {lang === 'ro' ? "Întrebări despre contact și suport" : "Questions about contact and support"}
          </h2>
          <dl className="space-y-3">
            {(lang === 'ro'
              ? [
                  { q: "Cât timp durează să primesc un răspuns?", a: "Răspundem la toate mesajele în maxim 24–48 ore în zilele lucrătoare (luni–vineri)." },
                  { q: "Cum solicit ștergerea datelor mele (GDPR)?", a: "Trimiți un email la contact@nutriaid.eu cu subiectul 'Solicitare ștergere date GDPR' și procesăm solicitarea în maxim 30 de zile." },
                  { q: "Pot raporta o problemă tehnică prin formularul de contact?", a: "Da. Selectează subiectul 'Problemă tehnică', descrie problema și adaugă capturi de ecran dacă este posibil — te ajutăm rapid." },
                ]
              : [
                  { q: "How long does it take to receive a response?", a: "We respond to all messages within 24–48 hours on business days (Monday–Friday)." },
                  { q: "How do I request deletion of my data (GDPR)?", a: "Send an email to contact@nutriaid.eu with the subject 'GDPR Data Deletion Request' and we process the request within 30 days." },
                  { q: "Can I report a technical issue through the contact form?", a: "Yes. Select the subject 'Technical issue', describe the problem and add screenshots if possible — we will help you quickly." },
                ]
            ).map((item) => (
              <div key={item.q} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                <dt className="font-semibold text-slate-900 dark:text-white mb-2">{item.q}</dt>
                <dd className="text-slate-600 dark:text-slate-400 text-sm m-0">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
