import Link from "next/link";
import { Mail, Clock3, MessageSquare, ArrowRight } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

const copy = {
  ro: {
    badge: "Contact NutriAID",
    title: "Contacteaza-ne",
    subtitle:
      "Ai o intrebare, o problema sau o sugestie? Scrie-ne si revenim rapid cu un raspuns.",
    infoTitle: "Detalii de contact",
    emailLabel: "Email suport",
    emailValue: "contact@nutriaid.eu",
    hoursLabel: "Program suport",
    hoursValue: "Luni - Vineri, 09:00 - 18:00",
    responseLabel: "Timp de raspuns",
    responseValue: "De obicei sub 24 ore",
    formTitle: "Trimite-ne un mesaj",
    name: "Nume",
    email: "Email",
    subject: "Subiect",
    message: "Mesaj",
    submit: "Trimite mesajul",
    dailyPlanTitle: "Cauti Planul tau zilnic?",
    dailyPlanBody: "L-am mutat pe o pagina dedicata, separata de contact.",
    dailyPlanCta: "Vezi Planul tau zilnic",
  },
  en: {
    badge: "Contact NutriAID",
    title: "Get in touch",
    subtitle:
      "Have a question, issue, or suggestion? Send us a message and we will reply quickly.",
    infoTitle: "Contact details",
    emailLabel: "Support email",
    emailValue: "contact@nutriaid.ro",
    hoursLabel: "Support hours",
    hoursValue: "Monday - Friday, 09:00 - 18:00",
    responseLabel: "Response time",
    responseValue: "Usually under 24 hours",
    formTitle: "Send us a message",
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    submit: "Send message",
    dailyPlanTitle: "Looking for your daily plan?",
    dailyPlanBody: "We moved it to a dedicated page, separate from contact.",
    dailyPlanCta: "Open Your Daily Plan",
  },
} as const;

export default function ContactPage() {
  const lang = getServerLanguage();
  const t = copy[lang];

  return (
    <div className="pt-24 pb-20 bg-slate-50 dark:bg-slate-950">
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

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">{t.formTitle}</h2>
          <form className="space-y-4" action={`mailto:${t.emailValue}`} method="post" encType="text/plain">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.name}
              </label>
              <input id="contact-name" name="name" type="text" required className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.email}
              </label>
              <input id="contact-email" name="email" type="email" required className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.subject}
              </label>
              <input id="contact-subject" name="subject" type="text" required className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.message}
              </label>
              <textarea id="contact-message" name="message" rows={6} required className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-slate-900 dark:text-slate-100" />
            </div>
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              {t.submit}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
