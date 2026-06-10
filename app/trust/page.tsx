import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

type TrustCopy = {
  metaDescription: string;
  hero: {
    title: string;
    subtitle: string[];
  };
  section1: {
    title: string;
    intro: string;
    bullets: string[];
    ending: string[];
  };
  section2: {
    title: string;
    intro: string;
    bullets: string[];
    ending: string[];
  };
  section3: {
    title: string;
    doTitle: string;
    doList: string[];
    dontTitle: string;
    dontList: string[];
    ending: string[];
  };
  section4: {
    title: string;
    bullets: string[];
    ending: string[];
  };
  section5: {
    title: string;
    checks: string[];
    ending: string;
  };
  section6: {
    title: string;
    intro: string;
    bullets: string[];
    ending: string[];
  };
  section7: {
    title: string;
    quotes: string[];
    ending: string[];
  };
  section8: {
    title: string;
    intro: string;
    bullets: string[];
    ending: string;
  };
  section9: {
    title: string[];
    primaryCta: string;
    secondaryCta: string;
  };
};

const copy: Record<"ro" | "en", TrustCopy> = {
  ro: {
    metaDescription:
      "De ce sa ai incredere in NutriAID Intolerances: transparenta, siguranta, profesionalism si empatie.",
    hero: {
      title: "De ce sa ai incredere in NutriAID Intolerances?",
      subtitle: [
        "Pentru ca stim prin ce treci.",
        "Pentru ca am construit aceasta platforma pentru oameni ca tine.",
        "Pentru ca nu promitem miracole - oferim claritate reala.",
      ],
    },
    section1: {
      title: "Stim cat de greu este sa cauti raspunsuri",
      intro: "Majoritatea utilizatorilor nostri au trecut prin:",
      bullets: [
        "ani de simptome fara explicatie",
        "analize perfecte, dar corpul lor suferea",
        "medici care le-au spus ca nu au nimic",
        "diete extreme care nu au functionat",
        "frica de mancare",
        "confuzie, frustrare, neputinta",
      ],
      ending: [
        "Stim cat de greu este.",
        "Stim cat de singur te poti simti.",
        "Stim cat de mult iti doresti un raspuns real.",
        "De aceea am creat NutriAID Intolerances.",
      ],
    },
    section2: {
      title: "Nu suntem o aplicatie generica. Suntem un sistem construit pentru oameni bolnavi.",
      intro: "NutriAID Intolerances este construit special pentru:",
      bullets: [
        "oameni cu simptome digestive",
        "oameni cu migrene",
        "oameni cu oboseala cronica",
        "oameni cu reactii ciudate dupa masa",
        "oameni care au fost ignorati",
        "oameni care au nevoie de claritate",
      ],
      ending: [
        "Nu suntem o aplicatie de dieta.",
        "Nu suntem o aplicatie de fitness.",
        "Nu suntem un jurnal alimentar.",
        "Suntem un sistem de analiza a corpului tau.",
      ],
    },
    section3: {
      title: "Transparenta totala: ce facem si ce NU facem",
      doTitle: "Ce facem:",
      doList: [
        "analizam ce mananci",
        "analizam simptomele tale",
        "identificam tipare",
        "gasim corelatii",
        "detectam alimente suspecte",
        "gasim alimente sigure",
        "oferim ghidare personalizata",
        "iti aratam evolutia in timp",
      ],
      dontTitle: "Ce NU facem:",
      dontList: [
        "nu punem diagnostice",
        "nu inlocuim medicul",
        "nu oferim tratamente",
        "nu prescriem diete extreme",
        "nu promitem vindecari miraculoase",
        "nu manipulam datele tale",
      ],
      ending: ["Suntem sinceri.", "Suntem clari.", "Suntem reali."],
    },
    section4: {
      title: "De ce poti avea incredere in AI-ul nostru?",
      bullets: [
        "nu ghiceste",
        "nu uita",
        "nu se incurca",
        "nu judeca",
        "nu presupune",
        "nu se bazeaza pe opinii",
        "analizeaza doar date reale",
        "vede tipare pe care un om nu le poate observa",
      ],
      ending: [
        "AI-ul nu te inlocuieste.",
        "AI-ul te ajuta sa intelegi ceea ce corpul tau incearca sa iti spuna.",
      ],
    },
    section5: {
      title: "De ce suntem diferiti de orice ai incercat pana acum?",
      checks: [
        "Nu iti spunem sa elimini jumatate din alimente",
        "Nu iti dam sfaturi generice",
        "Nu iti cerem sa fii perfect",
        "Nu iti cerem sa tii jurnale complicate",
        "Nu iti cerem sa ghicesti",
        "Nu iti spunem ca e doar stres",
      ],
      ending:
        "NutriAID Intolerances este construit pentru oameni reali, cu vieti reale, cu probleme reale.",
    },
    section6: {
      title: "De ce functioneaza?",
      intro: "Pentru ca:",
      bullets: [
        "este simplu",
        "este personalizat",
        "este logic",
        "este bazat pe date reale",
        "este adaptat corpului tau",
        "este empatic",
        "este construit pentru tine",
      ],
      ending: [
        "Functioneaza pentru ca nu te trateaza ca pe un pacient generic.",
        "Te trateaza ca pe un om.",
      ],
    },
    section7: {
      title: "Ce spun oamenii despre noi?",
      quotes: [
        "In sfarsit cineva ma intelege.",
        "Nu mai sunt singur.",
        "Nu mai sunt nebun.",
        "Nu mai traiesc cu frica de mancare.",
        "Simptomele mele au scazut.",
        "Am din nou control.",
      ],
      ending: ["Increderea se castiga prin rezultate.", "Iar rezultatele sunt reale."],
    },
    section8: {
      title: "Siguranta si confidentialitate",
      intro: "Datele tale:",
      bullets: [
        "sunt protejate",
        "sunt folosite doar pentru analiza personalizata",
        "nu sunt vandute",
        "nu sunt partajate",
        "nu sunt folosite in scopuri comerciale",
      ],
      ending: "Siguranta ta este prioritatea noastra.",
    },
    section9: {
      title: ["Poti avea incredere in noi.", "Dar cel mai important: poti avea incredere in tine."],
      primaryCta: "Incepe analiza intolerantelor tale",
      secondaryCta: "Vezi cum functioneaza NutriAID",
    },
  },
  en: {
    metaDescription:
      "Why trust NutriAID Intolerances: transparency, safety, professionalism, and empathy.",
    hero: {
      title: "Why trust NutriAID Intolerances?",
      subtitle: [
        "Because we know what you are going through.",
        "Because we built this platform for people like you.",
        "Because we do not promise miracles - we offer real clarity.",
      ],
    },
    section1: {
      title: "We know how hard it is to search for answers",
      intro: "Most of our users have gone through:",
      bullets: [
        "years of symptoms without explanation",
        "perfect tests while their body was still suffering",
        "doctors saying there was nothing wrong",
        "extreme diets that did not work",
        "fear of food",
        "confusion, frustration, helplessness",
      ],
      ending: [
        "We know how hard it is.",
        "We know how lonely it can feel.",
        "We know how much you want real answers.",
        "That is why we created NutriAID Intolerances.",
      ],
    },
    section2: {
      title: "We are not a generic app. We are a system built for people who suffer.",
      intro: "NutriAID Intolerances is built specifically for:",
      bullets: [
        "people with digestive symptoms",
        "people with migraines",
        "people with chronic fatigue",
        "people with unusual reactions after meals",
        "people who have been ignored",
        "people who need clarity",
      ],
      ending: [
        "We are not a diet app.",
        "We are not a fitness app.",
        "We are not a food journal.",
        "We are a body analysis system.",
      ],
    },
    section3: {
      title: "Total transparency: what we do and what we do NOT do",
      doTitle: "What we do:",
      doList: [
        "analyze what you eat",
        "analyze your symptoms",
        "identify patterns",
        "find correlations",
        "detect suspected foods",
        "find safe foods",
        "offer personalized guidance",
        "show your progress over time",
      ],
      dontTitle: "What we do NOT do:",
      dontList: [
        "we do not diagnose",
        "we do not replace your doctor",
        "we do not provide treatments",
        "we do not prescribe extreme diets",
        "we do not promise miracle cures",
        "we do not manipulate your data",
      ],
      ending: ["We are honest.", "We are clear.", "We are real."],
    },
    section4: {
      title: "Why can you trust our AI?",
      bullets: [
        "it does not guess",
        "it does not forget",
        "it does not get confused",
        "it does not judge",
        "it does not assume",
        "it is not based on opinions",
        "it analyzes only real data",
        "it sees patterns a human cannot observe",
      ],
      ending: [
        "AI does not replace you.",
        "AI helps you understand what your body is trying to tell you.",
      ],
    },
    section5: {
      title: "Why are we different from anything you have tried so far?",
      checks: [
        "We do not tell you to eliminate half of your foods",
        "We do not give generic advice",
        "We do not ask you to be perfect",
        "We do not ask you to keep complicated journals",
        "We do not ask you to guess",
        "We do not tell you it is just stress",
      ],
      ending: "NutriAID Intolerances is built for real people with real lives and real problems.",
    },
    section6: {
      title: "Why does it work?",
      intro: "Because it is:",
      bullets: [
        "simple",
        "personalized",
        "logical",
        "based on real data",
        "adapted to your body",
        "empathetic",
        "built for you",
      ],
      ending: [
        "It works because it does not treat you like a generic patient.",
        "It treats you like a person.",
      ],
    },
    section7: {
      title: "What do people say about us?",
      quotes: [
        "Finally, someone understands me.",
        "I am not alone anymore.",
        "I am not crazy anymore.",
        "I no longer live in fear of food.",
        "My symptoms have decreased.",
        "I have control again.",
      ],
      ending: ["Trust is earned through results.", "And those results are real."],
    },
    section8: {
      title: "Safety and privacy",
      intro: "Your data:",
      bullets: [
        "is protected",
        "is used only for personalized analysis",
        "is not sold",
        "is not shared",
        "is not used for commercial purposes",
      ],
      ending: "Your safety is our priority.",
    },
    section9: {
      title: ["You can trust us.", "But most importantly: you can trust yourself."],
      primaryCta: "Start your intolerance analysis",
      secondaryCta: "See how NutriAID works",
    },
  },
};

export function generateMetadata(): Metadata {
  const lang = getServerLanguage();
  const t = copy[lang];

  const isRo = lang === "ro";
  return {
    title: isRo ? "De ce să ai încredere în NutriAID Intolerances" : "Why Trust NutriAID Intolerances",
    description: t.metaDescription,
    alternates: {
      canonical: "/trust",
    },
    openGraph: {
      title: isRo ? "De ce să ai încredere în NutriAID Intolerances" : "Why Trust NutriAID Intolerances",
      description: t.metaDescription,
      url: "/trust",
      locale: isRo ? "ro_RO" : "en_US",
    },
  };
}

export default function TrustPage() {
  const lang = getServerLanguage();
  const isRo = lang === "ro";
  const t = copy[lang];

  return (
    <div className="pb-20 bg-slate-50 dark:bg-slate-950">
      <section className="relative overflow-hidden border-y border-cyan-100 dark:border-cyan-900/40 bg-gradient-to-b from-cyan-100 via-white to-slate-50 dark:from-cyan-950/30 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 right-0 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-600/10 text-cyan-700 dark:text-cyan-300 px-4 py-1.5 text-sm font-semibold mb-6">
            <ShieldCheck className="h-4 w-4" />
            Transparenta. Siguranta. Profesionalism. Empatie.
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white max-w-5xl">
            {t.hero.title}
          </h1>
          <div className="mt-6 space-y-2 text-lg text-slate-700 dark:text-slate-300 max-w-4xl">
            {t.hero.subtitle.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t.section1.title}</h2>
        <p className="text-slate-700 dark:text-slate-300 mb-6">{t.section1.intro}</p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 list-none p-0">
          {t.section1.bullets.map((item) => (
            <li key={item} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-slate-700 dark:text-slate-200">
              {item}
            </li>
          ))}
        </ul>
        <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/20 p-6 space-y-1">
          {t.section1.ending.map((line) => (
            <p key={line} className="text-slate-900 dark:text-cyan-100 font-medium">{line}</p>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t.section2.title}</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-6">{t.section2.intro}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 list-none p-0">
            {t.section2.bullets.map((item) => (
              <li key={item} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-4 text-slate-700 dark:text-slate-200">
                {item}
              </li>
            ))}
          </ul>
          <div className="space-y-1 text-slate-900 dark:text-white font-medium">
            {t.section2.ending.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">{t.section3.title}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <article className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6">
            <h3 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200 mb-4">{t.section3.doTitle}</h3>
            <ul className="space-y-2">
              {t.section3.doList.map((item) => (
                <li key={item} className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 p-6">
            <h3 className="text-xl font-semibold text-rose-800 dark:text-rose-200 mb-4">{t.section3.dontTitle}</h3>
            <ul className="space-y-2">
              {t.section3.dontList.map((item) => (
                <li key={item} className="text-slate-800 dark:text-slate-200">{item}</li>
              ))}
            </ul>
          </article>
        </div>
        <div className="space-y-1 text-lg font-medium text-slate-900 dark:text-white">
          {t.section3.ending.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">{t.section4.title}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 list-none p-0">
            {t.section4.bullets.map((item) => (
              <li key={item} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-4 text-slate-700 dark:text-slate-200">
                {item}
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/20 p-6 space-y-1">
            {t.section4.ending.map((line) => (
              <p key={line} className="text-slate-900 dark:text-cyan-100 font-semibold">{line}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">{t.section5.title}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 list-none p-0">
          {t.section5.checks.map((item) => (
            <li key={item} className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-4 text-slate-900 dark:text-emerald-100 font-medium">
              {`✔ ${item}`}
            </li>
          ))}
        </ul>
        <p className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-lg text-slate-900 dark:text-white font-medium">
          {t.section5.ending}
        </p>
      </section>

      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t.section6.title}</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-6">{t.section6.intro}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 list-none p-0">
            {t.section6.bullets.map((item) => (
              <li key={item} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-4 text-slate-700 dark:text-slate-200">
                {item}
              </li>
            ))}
          </ul>
          <div className="space-y-1 text-lg font-medium text-slate-900 dark:text-white">
            {t.section6.ending.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">{t.section7.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {t.section7.quotes.map((quote) => (
            <blockquote key={quote} className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-4 text-slate-800 dark:text-slate-200">
              {quote}
            </blockquote>
          ))}
        </div>
        <div className="space-y-1 text-lg font-semibold text-slate-900 dark:text-white">
          {t.section7.ending.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t.section8.title}</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-6">{t.section8.intro}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 list-none p-0">
            {t.section8.bullets.map((item) => (
              <li key={item} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-4 text-slate-700 dark:text-slate-200">
                {item}
              </li>
            ))}
          </ul>
          <p className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/20 p-6 text-lg font-semibold text-slate-900 dark:text-cyan-100">
            {t.section8.ending}
          </p>
        </div>
      </section>

      {/* GEO Summary + mini-FAQ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/20 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            {isRo ? "Siguranță și confidențialitate la NutriAID" : "Safety and privacy at NutriAID"}
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            {isRo
              ? "NutriAID Intolerances respectă pe deplin Regulamentul GDPR. Datele tale de sănătate sunt stocate criptat și nu sunt vândute sau partajate cu terți în niciun scop comercial. Colectăm exclusiv datele furnizate voluntar de tine — mese, simptome, preferințe. Nu există tracking de comportament sau profilare comercială. Poți solicita ștergerea completă a datelor tale oricând prin email la contact@nutriaid.eu, iar procesăm solicitarea în maxim 30 de zile."
              : "NutriAID Intolerances fully complies with GDPR. Your health data is stored encrypted and is not sold or shared with third parties for any commercial purpose. We collect exclusively data voluntarily provided by you — meals, symptoms, preferences. There is no behavioral tracking or commercial profiling. You can request complete deletion of your data at any time by email at contact@nutriaid.eu, and we process the request within 30 days."}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            {isRo ? "Întrebări despre siguranță și confidențialitate" : "Questions about safety and privacy"}
          </h2>
          <dl className="space-y-3">
            {(isRo
              ? [
                  { q: "NutriAID respectă GDPR?", a: "Da. Toate datele sunt procesate conform Regulamentului General privind Protecția Datelor (GDPR) al Uniunii Europene." },
                  { q: "Datele mele de sănătate sunt vândute?", a: "Nu. Datele tale nu sunt vândute sau partajate cu terți în niciun scop comercial." },
                  { q: "Pot cere ștergerea completă a datelor mele?", a: "Da. Trimiți email la contact@nutriaid.eu și procesăm solicitarea de ștergere completă în maxim 30 de zile." },
                ]
              : [
                  { q: "Does NutriAID comply with GDPR?", a: "Yes. All data is processed in accordance with the EU General Data Protection Regulation (GDPR)." },
                  { q: "Is my health data sold?", a: "No. Your data is not sold or shared with third parties for any commercial purpose." },
                  { q: "Can I request complete deletion of my data?", a: "Yes. Send an email to contact@nutriaid.eu and we process the complete deletion request within 30 days." },
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

      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-700 to-emerald-700 dark:from-cyan-900 dark:to-emerald-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 mb-5">
            <Sparkles className="h-4 w-4" />
            NutriAID Intolerances
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight text-white mb-8">
            {t.section9.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-cyan-700 transition hover:bg-cyan-50"
            >
              {t.section9.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-xl border border-white/35 bg-white/10 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/20"
            >
              {t.section9.secondaryCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
