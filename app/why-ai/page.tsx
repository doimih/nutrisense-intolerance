import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Eye,
  Calculator,
  GraduationCap,
  Database,
  CheckCircle2,
  XCircle,
  Sparkles,
  HeartHandshake,
  Stethoscope,
  ShieldCheck,
  Quote,
} from "lucide-react";

export const metadata: Metadata = {
  title: "De ce AI?",
  description:
    "Explicam tehnologia pe intelesul oamenilor bolnavi, fara jargon, fara frica.",
  alternates: {
    canonical: "/why-ai",
  },
};

const truthReasons = [
  "simptomele apar uneori imediat, alteori după 48 de ore",
  "reacțiile pot fi declanșate de combinații de alimente",
  "corpul reacționează diferit în funcție de stres, somn, hormoni",
  "nu există analize standard care să le detecteze",
  "oamenii nu pot ține minte tot ce mănâncă",
  "corelațiile sunt imposibil de observat manual",
];

const aiCapabilities = [
  {
    icon: Layers,
    title: "Analizează sute de variabile simultan",
    body: "Ce ai mâncat, când ai mâncat, cum te-ai simțit, cât a durat reacția, cât de intensă a fost.",
  },
  {
    icon: Eye,
    title: "Observă tipare ascunse",
    body: "Reacții întârziate, combinații problematice, declanșatori subtili.",
  },
  {
    icon: Calculator,
    title: "Corelează simptomele cu alimentele",
    body: "Nu ghicește. Calculează.",
  },
  {
    icon: GraduationCap,
    title: "Învață din datele tale",
    body: "Cu cât îl folosești mai mult, cu atât devine mai precis.",
  },
  {
    icon: Database,
    title: "Nu uită nimic",
    body: "Nu pierde informații. Nu se încurcă. Nu se lasă păcălit de reacții întârziate.",
  },
];

const dailyTasks = [
  "Analizează toate mesele introduse",
  "Corelează simptomele cu alimentele",
  "Identifică declanșatori probabili",
  "Observă reacțiile întârziate",
  "Măsoară intensitatea simptomelor",
  "Calculează probabilități",
  "Actualizează lista alimentelor suspecte",
  "Actualizează lista alimentelor sigure",
  "Ajustează recomandările zilnice",
];

const humanLimits = [
  "nu poate ține minte tot ce ai mâncat",
  "nu poate analiza reacții întârziate",
  "nu poate calcula probabilități",
  "nu poate observa tipare subtile",
  "nu poate analiza sute de combinații",
  "nu poate procesa date zilnice timp de săptămâni",
];

const safetyPoints = [
  "nu pune diagnostice",
  "nu înlocuiește medicul",
  "nu oferă tratament",
  "nu îți spune ce să mănânci „obligatoriu”",
  "nu îți impune diete extreme",
];

const peopleQuotes = [
  "Acum are sens.",
  "Nu e magie, e logic.",
  "În sfârșit cineva poate vedea ce eu nu pot.",
  "Nu mă mai simt pierdut.",
  "Nu mă mai simt nebun.",
];

const medicineLimits = [
  "se bazează pe analize",
  "analizele nu detectează intoleranțele",
  "medicii nu pot urmări zilnic ce mănânci",
  "nimeni nu poate analiza sute de combinații",
  "nimeni nu poate observa reacții întârziate",
];

export default function WhyAiPage() {
  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-emerald-50 to-cyan-50 dark:border-white/10 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.35),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.25),transparent_40%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28 flex flex-col items-start text-left">
          <p className="mb-5 inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-emerald-800 dark:border-emerald-300/30 dark:bg-emerald-400/10 dark:text-emerald-200">
            De ce AI?
          </p>
          <p className="mb-6 max-w-3xl text-base italic text-slate-600 dark:text-slate-300 sm:text-lg">
            Explicăm tehnologia pe înțelesul oamenilor bolnavi, fără jargon, fără frică.
          </p>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            De ce AI? Pentru că intoleranțele alimentare sunt prea complexe pentru a fi înțelese manual.
          </h1>
          <div className="mt-6 max-w-3xl space-y-2 text-lg text-slate-700 dark:text-slate-200">
            <p>Simptomele tale nu sunt simple.</p>
            <p>Reacțiile corpului tău nu sunt lineare.</p>
            <p>Intoleranțele nu sunt evidente.</p>
            <p className="font-semibold text-slate-900 dark:text-white">
              AI-ul poate vedea tipare pe care niciun om nu le poate observa.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1 — Adevarul pe care nimeni nu ti-l spune */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Adevărul pe care nimeni nu ți-l spune
        </h2>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">
          Intoleranțele alimentare sunt greu de identificat pentru că:
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {truthReasons.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-none"
            >
              {item}
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <HeartHandshake className="mt-0.5 h-6 w-6 flex-none text-emerald-600 dark:text-emerald-300" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            Nu este vina ta că nu ai găsit răspunsuri. Este vina complexității.
          </p>
        </div>
      </section>

      {/* Section 2 — De ce AI-ul poate vedea ceea ce tu nu poti */}
      <section className="border-y border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            De ce AI-ul poate vedea ceea ce tu nu poți?
          </h2>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">Pentru că AI-ul:</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {aiCapabilities.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:shadow-none"
              >
                <div className="mb-3 inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Ce face AI-ul NutriAID in fiecare zi */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Ce face AI-ul NutriAID în fiecare zi?
        </h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dailyTasks.map((task) => (
            <div
              key={task}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-none"
            >
              <CheckCircle2 className="h-5 w-5 flex-none text-emerald-500 dark:text-emerald-300" />
              <span>{task}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["Totul automat.", "Totul personalizat.", "Totul pentru tine."].map((line) => (
            <p
              key={line}
              className="rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-5 text-lg font-semibold text-slate-900 dark:bg-emerald-950/20 dark:text-white"
            >
              {line}
            </p>
          ))}
        </div>
      </section>

      {/* Section 4 — De ce nu poate face asta un om */}
      <section className="border-y border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            De ce nu poate face asta un om?
          </h2>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">Pentru că un om:</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {humanLimits.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
              >
                <XCircle className="h-5 w-5 flex-none text-rose-400 dark:text-rose-400/80" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <Sparkles className="mt-0.5 h-6 w-6 flex-none text-emerald-600 dark:text-emerald-300" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              AI-ul nu te înlocuiește. Te ajută să înțelegi ceea ce corpul tău încearcă să îți spună.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 — Este sigur? Este de incredere? */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 flex-none text-emerald-600 dark:text-emerald-300" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Este sigur? Este de încredere?
          </h2>
        </div>
        <p className="mt-5 text-xl font-semibold text-emerald-700 dark:text-emerald-300">Da.</p>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">NutriAID Intolerances:</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {safetyPoints.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-none"
            >
              <XCircle className="h-5 w-5 flex-none text-slate-400 dark:text-slate-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["Îți oferă claritate.", "Îți oferă logică.", "Îți oferă explicații.", "Îți oferă control."].map(
              (line) => (
                <p key={line} className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="h-5 w-5 flex-none text-emerald-600 dark:text-emerald-300" />
                  {line}
                </p>
              )
            )}
          </div>
          <p className="mt-5 text-slate-700 dark:text-slate-200">
            Totul într-un mod sigur, empatic, uman.
          </p>
        </div>
      </section>

      {/* Section 6 — Ce simt oamenii */}
      <section className="border-y border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Ce simt oamenii când înțeleg cum funcționează AI-ul?
          </h2>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">Majoritatea utilizatorilor spun:</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {peopleQuotes.map((quote) => (
              <blockquote
                key={quote}
                className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 text-lg font-medium text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:shadow-none"
              >
                <Quote className="mb-2 h-6 w-6 text-emerald-500/70 dark:text-emerald-300/70" />
                „{quote}”
              </blockquote>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-6 dark:bg-emerald-950/20">
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              AI-ul nu te judecă. AI-ul te ajută.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7 — De ce AI-ul este solutia */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <Stethoscope className="mt-1 h-8 w-8 flex-none text-emerald-600 dark:text-emerald-300" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            De ce AI-ul este soluția pe care medicina tradițională nu ți-a oferit-o?
          </h2>
        </div>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">Pentru că medicina:</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {medicineLimits.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-none"
            >
              {item}
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            AI-ul completează ceea ce medicina nu poate face.
          </p>
          <p className="mt-1 text-slate-700 dark:text-slate-200">Nu concurează cu ea. Lucrează alături de tine.</p>
        </div>
      </section>

      {/* Section 8 — CTA final */}
      <section className="relative overflow-hidden border-t border-slate-200 bg-gradient-to-br from-emerald-700 to-cyan-700 dark:border-white/10 dark:from-emerald-700 dark:to-cyan-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_35%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="mx-auto max-w-4xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            E timpul să folosești tehnologia pentru a înțelege ce îți face rău.
          </h2>
          <div className="mx-auto mt-6 max-w-2xl space-y-1 text-lg text-emerald-50">
            <p>Nu trebuie să suferi în tăcere.</p>
            <p>Nu trebuie să ghicești.</p>
            <p>Nu trebuie să trăiești cu frica de mâncare.</p>
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Începe analiza intoleranțelor tale
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/guidance"
              className="inline-flex items-center rounded-xl border border-white/35 bg-white/10 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/20"
            >
              Vezi cum funcționează NutriAID
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
