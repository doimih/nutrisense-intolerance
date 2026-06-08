import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Sparkles } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

type Step = {
  title: string;
  lead: string[];
  bullets?: string[];
  ending?: string[];
};

type GuideCopy = {
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string[];
  section1: {
    title: string;
    intro: string;
    bullets: string[];
    ending: string;
  };
  section2: {
    title: string;
    days: Step[];
  };
  section3: {
    title: string;
    intro: string;
    bullets: string[];
    ending: string;
  };
  section4: {
    title: string;
    quotes: string[];
  };
  section5: {
    title: string;
    intro: string;
    bullets: string[];
    ending: string;
  };
  section6: {
    title: string;
    primaryCta: string;
    secondaryCta: string;
  };
};

const copy: Record<"ro" | "en", GuideCopy> = {
  ro: {
    metaDescription:
      "Ghidul tău în 7 zile cu NutriAID Intolerances: primele corelații, primele răspunsuri și primele schimbări reale.",
    heroTitle:
      "Ghidul tău în 7 zile — primele răspunsuri, primele corelații, primele schimbări",
    heroSubtitle: [
      "Nu ai nevoie de luni de analiză.",
      "Nu ai nevoie de diete extreme.",
      "Nu ai nevoie de perfecțiune.",
      "În doar 7 zile, NutriAID Intolerances îți arată primele tipare reale.",
    ],
    section1: {
      title: "Ce vei obține în 7 zile?",
      intro: "În prima săptămână vei avea:",
      bullets: [
        "primele corelații între alimente și simptome",
        "primele alimente suspecte",
        "primele alimente sigure",
        "primele combinații problematice",
        "primele recomandări personalizate",
        "primele îmbunătățiri ale simptomelor",
        "primele momente de «Aha! Acum are sens.»",
      ],
      ending: "7 zile = începutul clarității.",
    },
    section2: {
      title: "Planul complet pe 7 zile",
      days: [
        {
          title: "Ziua 1 — Începi să notezi tot ce mănânci",
          lead: [
            "Nu trebuie să fii exact.",
            "Nu trebuie să cântărești.",
            "Nu trebuie să fii perfect.",
            "Scrii doar:",
          ],
          bullets: ["alimentul", "ora", "cantitatea aproximativă"],
          ending: ["AI-ul începe deja să învețe."],
        },
        {
          title: "Ziua 2 — Începi să notezi simptomele",
          lead: ["Orice simți este important:"],
          bullets: [
            "balonare",
            "durere",
            "greață",
            "migrenă",
            "oboseală",
            "reflux",
            "erupții",
          ],
          ending: ["Nu există «simptome prea mici»."],
        },
        {
          title: "Ziua 3 — AI-ul detectează primele tipare",
          lead: ["În această zi, majoritatea utilizatorilor văd:"],
          bullets: [
            "primele corelații",
            "primele alimente suspecte",
            "primele combinații problematice",
          ],
          ending: ["Este momentul în care totul începe să capete sens."],
        },
        {
          title: "Ziua 4 — Începi să vezi alimentele sigure",
          lead: [
            "Nu este vorba doar despre ce îți face rău.",
            "Este vorba și despre ce îți face bine.",
            "AI-ul îți arată:",
          ],
          bullets: [
            "alimente fără reacții",
            "combinații sigure",
            "mese care nu declanșează simptome",
          ],
          ending: ["Acest lucru reduce anxietatea alimentară."],
        },
        {
          title: "Ziua 5 — Ajustări personalizate",
          lead: ["AI-ul îți oferă:"],
          bullets: [
            "recomandări adaptate corpului tău",
            "sugestii de mese",
            "combinații de evitat",
            "alimente de testat",
          ],
          ending: ["Nu este o dietă.", "Este ghidare personalizată."],
        },
        {
          title: "Ziua 6 — Începi să simți schimbări reale",
          lead: ["Majoritatea utilizatorilor raportează:"],
          bullets: [
            "mai puțină balonare",
            "mai puțină oboseală",
            "mai puține migrene",
            "mai puțină confuzie",
            "mai puțină anxietate după masă",
          ],
          ending: ["Corpul tău începe să răspundă."],
        },
        {
          title: "Ziua 7 — Primele concluzii clare",
          lead: ["În această zi vei avea:"],
          bullets: [
            "o listă clară de alimente suspecte",
            "o listă clară de alimente sigure",
            "primele explicații logice",
            "primele rezultate reale",
            "un plan pentru săptămâna următoare",
          ],
          ending: ["În 7 zile, ai deja direcție."],
        },
      ],
    },
    section3: {
      title: "De ce funcționează acest ghid?",
      intro: "Pentru că:",
      bullets: [
        "este simplu",
        "este realist",
        "nu cere perfecțiune",
        "nu cere timp",
        "nu cere cunoștințe",
        "nu cere sacrificii inutile",
      ],
      ending: "Funcționează pentru că este construit pentru oameni reali.",
    },
    section4: {
      title: "Ce spun utilizatorii după 7 zile?",
      quotes: [
        "Nu credeam că pot afla atât de repede ce îmi face rău.",
        "În 3 zile am avut primele corelații.",
        "În 7 zile am simțit primele îmbunătățiri.",
        "Nu mai trăiesc cu frică de mâncare.",
        "În sfârșit are sens.",
      ],
    },
    section5: {
      title: "Ce urmează după cele 7 zile?",
      intro: "După prima săptămână:",
      bullets: [
        "AI-ul devine și mai precis",
        "recomandările devin mai clare",
        "tiparele devin evidente",
        "simptomele continuă să scadă",
        "încrederea în corpul tău crește",
      ],
      ending: "Primele 7 zile sunt doar începutul.",
    },
    section6: {
      title: "E timpul să începi cele 7 zile care îți pot schimba viața.",
      primaryCta: "Începe analiza intoleranțelor tale",
      secondaryCta: "Vezi cum funcționează NutriAID",
    },
  },
  en: {
    metaDescription:
      "Your 7-day guide with NutriAID Intolerances: first correlations, first answers, and first meaningful changes.",
    heroTitle: "Your 7-day guide — first answers, first correlations, first changes",
    heroSubtitle: [
      "You do not need months of analysis.",
      "You do not need extreme diets.",
      "You do not need perfection.",
      "In just 7 days, NutriAID Intolerances shows you the first real patterns.",
    ],
    section1: {
      title: "What will you get in 7 days?",
      intro: "In the first week you will get:",
      bullets: [
        "first correlations between foods and symptoms",
        "first suspected foods",
        "first safe foods",
        "first problematic combinations",
        "first personalized recommendations",
        "first symptom improvements",
        "first moments of 'Aha! Now it makes sense.'",
      ],
      ending: "7 days = the beginning of clarity.",
    },
    section2: {
      title: "The complete 7-day plan",
      days: [
        {
          title: "Day 1 — Start logging everything you eat",
          lead: [
            "You do not have to be exact.",
            "You do not have to weigh food.",
            "You do not have to be perfect.",
            "You only write:",
          ],
          bullets: ["food", "time", "approximate quantity"],
          ending: ["The AI already starts learning."],
        },
        {
          title: "Day 2 — Start logging symptoms",
          lead: ["Anything you feel is important:"],
          bullets: [
            "bloating",
            "pain",
            "nausea",
            "migraine",
            "fatigue",
            "reflux",
            "rashes",
          ],
          ending: ["There are no 'too small symptoms'."],
        },
        {
          title: "Day 3 — AI detects first patterns",
          lead: ["On this day, most users see:"],
          bullets: [
            "first correlations",
            "first suspected foods",
            "first problematic combinations",
          ],
          ending: ["This is the moment when everything starts to make sense."],
        },
        {
          title: "Day 4 — You start seeing safe foods",
          lead: [
            "It is not only about what harms you.",
            "It is also about what helps you.",
            "The AI shows you:",
          ],
          bullets: [
            "foods without reactions",
            "safe combinations",
            "meals that do not trigger symptoms",
          ],
          ending: ["This reduces food-related anxiety."],
        },
        {
          title: "Day 5 — Personalized adjustments",
          lead: ["The AI gives you:"],
          bullets: [
            "recommendations adapted to your body",
            "meal suggestions",
            "combinations to avoid",
            "foods to test",
          ],
          ending: ["It is not a diet.", "It is personalized guidance."],
        },
        {
          title: "Day 6 — You begin to feel real changes",
          lead: ["Most users report:"],
          bullets: [
            "less bloating",
            "less fatigue",
            "fewer migraines",
            "less confusion",
            "less anxiety after meals",
          ],
          ending: ["Your body starts responding."],
        },
        {
          title: "Day 7 — First clear conclusions",
          lead: ["On this day you will have:"],
          bullets: [
            "a clear list of suspected foods",
            "a clear list of safe foods",
            "first logical explanations",
            "first real results",
            "a plan for the following week",
          ],
          ending: ["In 7 days, you already have direction."],
        },
      ],
    },
    section3: {
      title: "Why does this guide work?",
      intro: "Because it:",
      bullets: [
        "is simple",
        "is realistic",
        "does not require perfection",
        "does not require much time",
        "does not require advanced knowledge",
        "does not require unnecessary sacrifices",
      ],
      ending: "It works because it is built for real people.",
    },
    section4: {
      title: "What do users say after 7 days?",
      quotes: [
        "I did not think I could find out so quickly what harms me.",
        "In 3 days I had my first correlations.",
        "In 7 days I felt the first improvements.",
        "I no longer live in fear of food.",
        "It finally makes sense.",
      ],
    },
    section5: {
      title: "What comes after the 7 days?",
      intro: "After the first week:",
      bullets: [
        "the AI becomes even more precise",
        "recommendations become clearer",
        "patterns become obvious",
        "symptoms keep decreasing",
        "confidence in your body increases",
      ],
      ending: "The first 7 days are only the beginning.",
    },
    section6: {
      title: "It is time to start the 7 days that can change your life.",
      primaryCta: "Start your intolerance analysis",
      secondaryCta: "See how NutriAID works",
    },
  },
};

export function generateMetadata(): Metadata {
  const lang = getServerLanguage();
  const t = copy[lang];

  return {
    title: lang === "ro" ? "Ghidul tău în 7 zile" : "Your 7-Day Guide",
    description: t.metaDescription,
    alternates: {
      canonical: "/about",
    },
  };
}

export default function AboutPage() {
  const lang = getServerLanguage();
  const t = copy[lang];

  return (
    <div className="pt-24 pb-20 bg-slate-50 dark:bg-slate-950">
      <section className="relative overflow-hidden border-y border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-100 via-white to-slate-50 dark:from-emerald-950/30 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4" />
            NutriAID Intolerances
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white max-w-5xl">
            {t.heroTitle}
          </h1>
          <div className="mt-6 space-y-2 text-lg text-slate-700 dark:text-slate-300 max-w-4xl">
            {t.heroSubtitle.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          {t.section1.title}
        </h2>
        <p className="text-slate-700 dark:text-slate-300 mb-6">{t.section1.intro}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-7">
          {t.section1.bullets.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-slate-700 dark:text-slate-200"
            >
              {item}
            </div>
          ))}
        </div>
        <p className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-6 text-lg font-semibold text-slate-900 dark:text-emerald-100">
          {t.section1.ending}
        </p>
      </section>

      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-8">
            {t.section2.title}
          </h2>
          <div className="space-y-6">
            {t.section2.days.map((day, index) => (
              <article
                key={day.title}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 p-6"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white text-sm font-bold">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{day.title}</h3>
                </div>

                <div className="space-y-1 mb-3 text-slate-700 dark:text-slate-300">
                  {day.lead.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>

                {day.bullets && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {day.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-700 dark:text-slate-200"
                      >
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {day.ending && (
                  <div className="space-y-1 text-slate-900 dark:text-white font-medium">
                    {day.ending.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          {t.section3.title}
        </h2>
        <p className="text-slate-700 dark:text-slate-300 mb-6">{t.section3.intro}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-7">
          {t.section3.bullets.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-slate-700 dark:text-slate-200"
            >
              {item}
            </div>
          ))}
        </div>
        <p className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/20 p-6 text-lg text-slate-900 dark:text-cyan-100 font-medium">
          {t.section3.ending}
        </p>
      </section>

      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            {t.section4.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {t.section4.quotes.map((quote) => (
              <blockquote
                key={quote}
                className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-4 text-slate-800 dark:text-slate-200"
              >
                {quote}
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          {t.section5.title}
        </h2>
        <p className="text-slate-700 dark:text-slate-300 mb-6">{t.section5.intro}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {t.section5.bullets.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-800 dark:text-slate-200"
            >
              {item}
            </div>
          ))}
        </div>
        <p className="rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 p-6 text-lg text-slate-900 dark:text-emerald-100 font-medium">
          {t.section5.ending}
        </p>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 to-cyan-700 dark:from-emerald-900 dark:to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 mb-5">
            <CalendarDays className="h-4 w-4" />
            7 days
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight text-white mb-8">
            {t.section6.title}
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              {t.section6.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/backend"
              className="inline-flex items-center rounded-xl border border-white/35 bg-white/10 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/20"
            >
              {t.section6.secondaryCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
