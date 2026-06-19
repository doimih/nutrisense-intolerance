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
import { getServerLanguage } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const lang = getServerLanguage();
  const isRo = lang === "ro";
  return {
    title: isRo ? "De ce AI? — NutriAID Intolerances" : "Why AI? — NutriAID Intolerances",
    description: isRo
      ? "Explicăm de ce AI-ul identifică intoleranțe alimentare pe care niciun om nu le poate detecta manual: reacții întârziate, combinații, tipare complexe."
      : "We explain why AI identifies food intolerances that no human can detect manually: delayed reactions, combinations, complex patterns.",
    alternates: { canonical: "/why-ai", languages: { ro: "/why-ai", en: "/why-ai", "x-default": "/why-ai" } },
    openGraph: {
      title: isRo ? "De ce AI? — NutriAID Intolerances" : "Why AI? — NutriAID Intolerances",
      description: isRo
        ? "De ce intoleranțele alimentare sunt prea complexe pentru a fi înțelese manual și cum AI-ul rezolvă ce medicina tradițională nu poate."
        : "Why food intolerances are too complex to understand manually and how AI solves what traditional medicine cannot.",
      url: "/why-ai",
      locale: lang === "ro" ? "ro_RO" : "en_GB",
    },
  };
}

const content = {
  ro: {
    heroBadge: "De ce AI?",
    heroIntro: "Explicăm tehnologia pe înțelesul oamenilor bolnavi, fără jargon, fără frică.",
    heroTitle: "De ce AI? Pentru că intoleranțele alimentare sunt prea complexe pentru a fi înțelese manual.",
    heroLines: [
      "Simptomele tale nu sunt simple.",
      "Reacțiile corpului tău nu sunt lineare.",
      "Intoleranțele nu sunt evidente.",
    ],
    heroStrong: "AI-ul poate vedea tipare pe care niciun om nu le poate observa.",
    s1Title: "Adevărul pe care nimeni nu ți-l spune",
    s1Intro: "Intoleranțele alimentare sunt greu de identificat pentru că:",
    s1Items: [
      "simptomele apar uneori imediat, alteori după 48 de ore",
      "reacțiile pot fi declanșate de combinații de alimente",
      "corpul reacționează diferit în funcție de stres, somn, hormoni",
      "nu există analize standard care să le detecteze",
      "oamenii nu pot ține minte tot ce mănâncă",
      "corelațiile sunt imposibil de observat manual",
    ],
    s1Callout: "Nu este vina ta că nu ai găsit răspunsuri. Este vina complexității.",
    s2Title: "De ce AI-ul poate vedea ceea ce tu nu poți?",
    s2Intro: "Pentru că AI-ul:",
    s2Caps: [
      { title: "Analizează sute de variabile simultan", body: "Ce ai mâncat, când ai mâncat, cum te-ai simțit, cât a durat reacția, cât de intensă a fost." },
      { title: "Observă tipare ascunse", body: "Reacții întârziate, combinații problematice, declanșatori subtili." },
      { title: "Corelează simptomele cu alimentele", body: "Nu ghicește. Calculează." },
      { title: "Învață din datele tale", body: "Cu cât îl folosești mai mult, cu atât devine mai precis." },
      { title: "Nu uită nimic", body: "Nu pierde informații. Nu se încurcă. Nu se lasă păcălit de reacții întârziate." },
    ],
    s3Title: "Ce face AI-ul NutriAID în fiecare zi?",
    s3Tasks: [
      "Analizează toate mesele introduse",
      "Corelează simptomele cu alimentele",
      "Identifică declanșatori probabili",
      "Observă reacțiile întârziate",
      "Măsoară intensitatea simptomelor",
      "Calculează probabilități",
      "Actualizează lista alimentelor suspecte",
      "Actualizează lista alimentelor sigure",
      "Ajustează recomandările zilnice",
    ],
    s3Bullets: ["Totul automat.", "Totul personalizat.", "Totul pentru tine."],
    s4Title: "De ce nu poate face asta un om?",
    s4Intro: "Pentru că un om:",
    s4Limits: [
      "nu poate ține minte tot ce ai mâncat",
      "nu poate analiza reacții întârziate",
      "nu poate calcula probabilități",
      "nu poate observa tipare subtile",
      "nu poate analiza sute de combinații",
      "nu poate procesa date zilnice timp de săptămâni",
    ],
    s4Callout: "AI-ul nu te înlocuiește. Te ajută să înțelegi ceea ce corpul tău încearcă să îți spună.",
    s5Title: "Este sigur? Este de încredere?",
    s5Yes: "Da.",
    s5Intro: "NutriAID Intolerances:",
    s5Safety: [
      "nu pune diagnostice",
      "nu înlocuiește medicul",
      "nu oferă tratament",
      "nu îti spune ce să mănânci „obligatoriu”",
      "nu îți impune diete extreme",
    ],
    s5Gives: ["Îți oferă claritate.", "Îți oferă logică.", "Îți oferă explicații.", "Îți oferă control."],
    s5End: "Totul într-un mod sigur, empatic, uman.",
    s6Title: "Ce simt oamenii când înțeleg cum funcționează AI-ul?",
    s6Intro: "Majoritatea utilizatorilor spun:",
    s6Quotes: ["Acum are sens.", "Nu e magie, e logic.", "În sfârșit cineva poate vedea ce eu nu pot.", "Nu mă mai simt pierdut.", "Nu mă mai simt nebun."],
    s6Callout: "AI-ul nu te judecă. AI-ul te ajută.",
    s7Title: "De ce AI-ul este soluția pe care medicina tradițională nu ți-a oferit-o?",
    s7Intro: "Pentru că medicina:",
    s7Limits: [
      "se bazează pe analize",
      "analizele nu detectează intoleranțele",
      "medicii nu pot urmări zilnic ce mănânci",
      "nimeni nu poate analiza sute de combinații",
      "nimeni nu poate observa reacții întârziate",
    ],
    s7Callout: "AI-ul completează ceea ce medicina nu poate face.",
    s7Sub: "Nu concurează cu ea. Lucrează alături de tine.",
    ctaTitle: "E timpul să folosești tehnologia pentru a înțelege ce îți face rău.",
    ctaLines: ["Nu trebuie să suferi în tăcere.", "Nu trebuie să ghicești.", "Nu trebuie să trăiești cu frica de mâncare."],
    ctaPrimary: "Începe analiza intoleranțelor tale",
    ctaSecondary: "Vezi cum funcționează NutriAID",
  },
  en: {
    heroBadge: "Why AI?",
    heroIntro: "We explain the technology in plain language, without jargon, without fear.",
    heroTitle: "Why AI? Because food intolerances are too complex to understand manually.",
    heroLines: [
      "Your symptoms are not simple.",
      "Your body's reactions are not linear.",
      "Intolerances are not obvious.",
    ],
    heroStrong: "AI can see patterns that no human can observe.",
    s1Title: "The truth nobody tells you",
    s1Intro: "Food intolerances are hard to identify because:",
    s1Items: [
      "symptoms sometimes appear immediately, sometimes after 48 hours",
      "reactions can be triggered by combinations of foods",
      "the body reacts differently depending on stress, sleep, hormones",
      "there are no standard tests that detect them",
      "people cannot remember everything they eat",
      "correlations are impossible to observe manually",
    ],
    s1Callout: "It is not your fault you have not found answers. The complexity is to blame.",
    s2Title: "Why can AI see what you cannot?",
    s2Intro: "Because AI:",
    s2Caps: [
      { title: "Analyses hundreds of variables simultaneously", body: "What you ate, when you ate it, how you felt, how long the reaction lasted, how intense it was." },
      { title: "Spots hidden patterns", body: "Delayed reactions, problematic combinations, subtle triggers." },
      { title: "Correlates symptoms with foods", body: "It does not guess. It calculates." },
      { title: "Learns from your data", body: "The more you use it, the more precise it becomes." },
      { title: "Never forgets anything", body: "It does not lose information. It does not get confused. It is not fooled by delayed reactions." },
    ],
    s3Title: "What does NutriAID AI do every day?",
    s3Tasks: [
      "Analyses all logged meals",
      "Correlates symptoms with foods",
      "Identifies probable triggers",
      "Observes delayed reactions",
      "Measures symptom intensity",
      "Calculates probabilities",
      "Updates the suspect foods list",
      "Updates the safe foods list",
      "Adjusts daily recommendations",
    ],
    s3Bullets: ["All automatic.", "All personalised.", "All for you."],
    s4Title: "Why can a human not do this?",
    s4Intro: "Because a human:",
    s4Limits: [
      "cannot remember everything you ate",
      "cannot analyse delayed reactions",
      "cannot calculate probabilities",
      "cannot observe subtle patterns",
      "cannot analyse hundreds of combinations",
      "cannot process daily data for weeks",
    ],
    s4Callout: "AI does not replace you. It helps you understand what your body is trying to tell you.",
    s5Title: "Is it safe? Is it trustworthy?",
    s5Yes: "Yes.",
    s5Intro: "NutriAID Intolerances:",
    s5Safety: [
      "does not put diagnoses",
      "does not replace the doctor",
      "does not provide treatment",
      "does not tell you what you \"must\" eat",
      "does not impose extreme diets",
    ],
    s5Gives: ["Gives you clarity.", "Gives you logic.", "Gives you explanations.", "Gives you control."],
    s5End: "All in a safe, empathetic, human way.",
    s6Title: "What do people feel when they understand how AI works?",
    s6Intro: "Most users say:",
    s6Quotes: ["Now it makes sense.", "It is not magic, it is logic.", "Finally someone can see what I cannot.", "I no longer feel lost.", "I no longer feel crazy."],
    s6Callout: "AI does not judge you. AI helps you.",
    s7Title: "Why is AI the solution that traditional medicine has not offered you?",
    s7Intro: "Because medicine:",
    s7Limits: [
      "relies on tests",
      "tests do not detect intolerances",
      "doctors cannot track what you eat daily",
      "nobody can analyse hundreds of combinations",
      "nobody can observe delayed reactions",
    ],
    s7Callout: "AI completes what medicine cannot do.",
    s7Sub: "It does not compete with it. It works alongside you.",
    ctaTitle: "It is time to use technology to understand what is harming you.",
    ctaLines: ["You do not have to suffer in silence.", "You do not have to guess.", "You do not have to live with the fear of food."],
    ctaPrimary: "Start your intolerance analysis",
    ctaSecondary: "See how NutriAID works",
  },
} as const;

const capIcons = [Layers, Eye, Calculator, GraduationCap, Database];

export default function WhyAiPage() {
  const lang = getServerLanguage();
  const c = content[lang];

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-emerald-50 to-cyan-50 dark:border-white/10 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.35),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.25),transparent_40%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28 flex flex-col items-start text-left">
          <p className="mb-5 inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-emerald-800 dark:border-emerald-300/30 dark:bg-emerald-400/10 dark:text-emerald-200">
            {c.heroBadge}
          </p>
          <p className="mb-6 max-w-3xl text-base italic text-slate-600 dark:text-slate-300 sm:text-lg">
            {c.heroIntro}
          </p>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            {c.heroTitle}
          </h1>
          <div className="mt-6 max-w-3xl space-y-2 text-lg text-slate-700 dark:text-slate-200">
            {c.heroLines.map((line) => <p key={line}>{line}</p>)}
            <p className="font-semibold text-slate-900 dark:text-white">{c.heroStrong}</p>
          </div>
        </div>
      </section>

      {/* Section 1 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{c.s1Title}</h2>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">{c.s1Intro}</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 list-none p-0">
          {c.s1Items.map((item) => (
            <li key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-none">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <HeartHandshake className="mt-0.5 h-6 w-6 flex-none text-emerald-600 dark:text-emerald-300" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{c.s1Callout}</p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="border-y border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{c.s2Title}</h2>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">{c.s2Intro}</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {c.s2Caps.map(({ title, body }, i) => {
              const Icon = capIcons[i];
              return (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:shadow-none">
                  <div className="mb-3 inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{c.s3Title}</h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 list-none p-0">
          {c.s3Tasks.map((task) => (
            <li key={task} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-none">
              <CheckCircle2 className="h-5 w-5 flex-none text-emerald-500 dark:text-emerald-300" />
              <span>{task}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {c.s3Bullets.map((line) => (
            <p key={line} className="rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-5 text-lg font-semibold text-slate-900 dark:bg-emerald-950/20 dark:text-white">
              {line}
            </p>
          ))}
        </div>
      </section>

      {/* Section 4 */}
      <section className="border-y border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{c.s4Title}</h2>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">{c.s4Intro}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 list-none p-0">
            {c.s4Limits.map((item) => (
              <li key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
                <XCircle className="h-5 w-5 flex-none text-rose-400 dark:text-rose-400/80" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <Sparkles className="mt-0.5 h-6 w-6 flex-none text-emerald-600 dark:text-emerald-300" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{c.s4Callout}</p>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 flex-none text-emerald-600 dark:text-emerald-300" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{c.s5Title}</h2>
        </div>
        <p className="mt-5 text-xl font-semibold text-emerald-700 dark:text-emerald-300">{c.s5Yes}</p>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">{c.s5Intro}</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 list-none p-0">
          {c.s5Safety.map((item) => (
            <li key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-none">
              <XCircle className="h-5 w-5 flex-none text-slate-400 dark:text-slate-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {c.s5Gives.map((line) => (
              <p key={line} className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <CheckCircle2 className="h-5 w-5 flex-none text-emerald-600 dark:text-emerald-300" />
                {line}
              </p>
            ))}
          </div>
          <p className="mt-5 text-slate-700 dark:text-slate-200">{c.s5End}</p>
        </div>
      </section>

      {/* Section 6 */}
      <section className="border-y border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{c.s6Title}</h2>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">{c.s6Intro}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.s6Quotes.map((quote) => (
              <blockquote key={quote} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 text-lg font-medium text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:shadow-none">
                <Quote className="mb-2 h-6 w-6 text-emerald-500/70 dark:text-emerald-300/70" />
                &ldquo;{quote}&rdquo;
              </blockquote>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-6 dark:bg-emerald-950/20">
            <p className="text-xl font-bold text-slate-900 dark:text-white">{c.s6Callout}</p>
          </div>
        </div>
      </section>

      {/* Section 7 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <Stethoscope className="mt-1 h-8 w-8 flex-none text-emerald-600 dark:text-emerald-300" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{c.s7Title}</h2>
        </div>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">{c.s7Intro}</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 list-none p-0">
          {c.s7Limits.map((item) => (
            <li key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-none">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{c.s7Callout}</p>
          <p className="mt-1 text-slate-700 dark:text-slate-200">{c.s7Sub}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-slate-200 bg-gradient-to-br from-emerald-700 to-cyan-700 dark:border-white/10 dark:from-emerald-700 dark:to-cyan-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_35%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="mx-auto max-w-4xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            {c.ctaTitle}
          </h2>
          <div className="mx-auto mt-6 max-w-2xl space-y-1 text-lg text-emerald-50">
            {c.ctaLines.map((line) => <p key={line}>{line}</p>)}
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              {c.ctaPrimary}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/guidance"
              className="inline-flex items-center rounded-xl border border-white/35 bg-white/10 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/20"
            >
              {c.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
