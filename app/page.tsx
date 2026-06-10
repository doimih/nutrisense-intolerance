import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Brain,
  Target,
  LineChart,
  CalendarCheck,
  HeartHandshake,
} from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

type HomeContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitleLines: string[];
    primaryCta: string;
    secondaryCta: string;
    trustItems: string[];
  };
  symptoms: {
    title: string;
    intro: string;
    items: string[];
    quotes: string[];
    ending: string[];
  };
  whyDifferent: {
    title: string;
    intro: string[];
    points: Array<{ title: string; body: string }>;
  };
  howItWorks: {
    title: string;
    steps: Array<{ title: string; body: string }>;
  };
  audience: {
    title: string;
    intro: string;
    items: string[];
    ending: string;
  };
  testimonials: {
    title: string;
    subtitle: string[];
    featured: Array<{
      quote: string;
      author: string;
      body: string;
    }>;
    storiesTitle: string;
    stories: Array<{
      title: string;
      paragraphs: string[];
    }>;
    commonTitle: string;
    commonPoints: string[];
    commonEnding: string[];
  };
  fastResults: {
    title: string;
    quotes: string[];
  };
  science: {
    title: string;
    items: string[];
    ending: string[];
  };
  finalCta: {
    titleLines: string[];
    primary: string;
    secondary: string;
  };
};

const content: Record<"ro" | "en", HomeContent> = {
  ro: {
    hero: {
      eyebrow: "In sfarsit intelegi ce iti face rau",
      title: "Descopera ce alimente iti provoaca simptomele. Rapid. Clar. Personalizat.",
      subtitleLines: [
        "Balonare, dureri abdominale, oboseala, migrene, reflux, greata, eruptii pe piele - toate au o cauza.",
        "NutriAID Intolerances foloseste AI pentru a identifica alimentele care iti declanseaza reactiile.",
      ],
      primaryCta: "Incepe analiza intolerantelor tale",
      secondaryCta: "Vezi cum functioneaza",
      trustItems: [
        "Fara diete extreme",
        "Fara eliminari inutile",
        "Fara ghicit",
        "Doar claritate reala",
      ],
    },
    symptoms: {
      title: "Simptomele tale nu sunt intamplatoare",
      intro: "Daca ai ajuns aici, probabil traiesti cu simptome care iti afecteaza viata:",
      items: [
        "balonare dupa aproape orice masa",
        "dureri abdominale care apar fara motiv",
        "oboseala intensa dupa mancare",
        "migrene care te scot din ritm",
        "reflux, greata, greutate in stomac",
        "eruptii pe piele dupa anumite alimente",
        "tranzit imprevizibil",
        "reactii intarziate la 24-48h",
      ],
      quotes: [
        "Nu ai nimic.",
        "Analizele sunt bune.",
        "Probabil e stres.",
        "Incearca sa scoti glutenul.",
      ],
      ending: [
        "Dar tu stii ca nu e in capul tau.",
        "Stii ca ceva iti face rau.",
        "Si meriti sa afli ce anume.",
      ],
    },
    whyDifferent: {
      title: "De ce NutriAID Intolerances este diferit?",
      intro: [
        "Pentru ca nu iti dam sfaturi generice.",
        "Nu iti spunem sa elimini jumatate din alimente.",
        "Nu iti cerem sa tii jurnale imposibile.",
      ],
      points: [
        {
          title: "AI avansat care analizeaza simptomele tale",
          body: "Tu introduci ce ai mancat si cum te-ai simtit. AI-ul detecteaza tipare pe care un om nu le poate observa.",
        },
        {
          title: "Identificarea alimentelor declansatoare",
          body: "Nu ghicim. Calculam corelatii, intensitati, frecvente si contexte.",
        },
        {
          title: "Recomandari personalizate",
          body: "Nu pentru toti pacientii. Pentru tine.",
        },
        {
          title: "Monitorizare zilnica",
          body: "Vezi cum se schimba corpul tau in timp real.",
        },
        {
          title: "Un ghid empatic, clar, logic",
          body: "Fara panica. Fara restrictii inutile. Fara confuzie.",
        },
      ],
    },
    howItWorks: {
      title: "Cum functioneaza NutriAID Intolerances?",
      steps: [
        {
          title: "1. Introduci ce ai mancat",
          body: "Simplu, rapid, fara detalii complicate.",
        },
        {
          title: "2. Notezi simptomele",
          body: "Durere, balonare, migrena, greata, orice simti.",
        },
        {
          title: "3. AI-ul analizeaza totul",
          body: "Coreleaza alimentele cu reactiile tale.",
        },
        {
          title: "4. Primesti raspunsuri clare",
          body: "Ce iti face rau. Ce combinatii sunt problematice. Ce alimente sunt sigure.",
        },
        {
          title: "5. Urmezi ghidarea personalizata",
          body: "Planuri alimentare adaptate corpului tau.",
        },
      ],
    },
    audience: {
      title: "Pentru cine este NutriAID Intolerances?",
      intro: "Pentru tine, daca:",
      items: [
        "ai simptome digestive recurente",
        "ai reactii ciudate dupa masa",
        "ai migrene sau oboseala dupa anumite alimente",
        "ai incercat diete de eliminare fara succes",
        "ai primit raspunsuri vagi sau incomplete",
        "simti ca nimeni nu te asculta cu adevarat",
      ],
      ending: "NutriAID Intolerances este pentru oamenii care vor claritate, control si o viata normala.",
    },
    testimonials: {
      title: "Oamenii care au trecut prin ce treci tu. Si au gasit raspunsuri.",
      subtitle: [
        "Nu sunt povesti inventate.",
        "Nu sunt promisiuni goale.",
        "Sunt oameni reali, cu simptome reale, care au trait ani de confuzie si care, in sfarsit, au inteles ce le face rau.",
      ],
      featured: [
        {
          quote: "Am plans cand am vazut prima corelatie. Nu exagerez.",
          author: "Andreea, 34 ani",
          body: "Dupa 8 ani de balonare si dureri, dupa zeci de analize perfecte, NutriAID a fost singurul loc unde am simtit ca cineva ma intelege. In 3 zile am aflat ce imi provoca simptomele.",
        },
        {
          quote: "Nu mai traiesc cu frica de mancare.",
          author: "Radu, 41 ani",
          body: "Inainte, fiecare masa era o ruleta ruseasca. Acum stiu exact ce imi face rau si ce pot manca linistit.",
        },
        {
          quote: "Medicii mi-au spus ca e stres. Nu era stres.",
          author: "Ioana, 29 ani",
          body: "NutriAID a gasit o combinatie alimentara la care reactionam. Nici nu mi-ar fi trecut prin cap.",
        },
        {
          quote: "Simptomele mele au scazut cu 60% in prima saptamana.",
          author: "Cristina, 52 ani",
          body: "Nu credeam ca e posibil. Dupa ani de chin, in sfarsit simt ca am control.",
        },
        {
          quote: "Nu mai sunt prizonierul propriului corp.",
          author: "Mihai, 38 ani",
          body: "Inainte ma trezeam cu dureri, balonare, oboseala. Acum stiu exact ce sa evit si ce sa combin.",
        },
      ],
      storiesTitle: "Povesti lungi, reale, cu transformare",
      stories: [
        {
          title: "Povestea Anei - 12 ani de simptome, 3 zile pana la primele raspunsuri",
          paragraphs: [
            "Am trait 12 ani cu balonare, dureri abdominale si oboseala cronica.",
            "Am facut toate analizele posibile. Toate perfecte.",
            "Am fost trimisa la psiholog pentru ca probabil e anxietate.",
            "Cand am inceput NutriAID, am introdus cateva mese si cateva simptome.",
            "In a treia zi, AI-ul a identificat o combinatie alimentara la care reactionam.",
            "Niciun medic nu mi-a spus asta vreodata.",
            "Dupa o saptamana, simptomele mele s-au redus la jumatate.",
            "Dupa o luna, am simtit ca traiesc din nou.",
          ],
        },
        {
          title: "Povestea lui Dan - 6 ani de migrene, 1 saptamana pana la claritate",
          paragraphs: [
            "Migrenele mele apareau fara logica.",
            "Uneori dupa mancare, alteori nu.",
            "Am incercat diete, suplimente, medicamente.",
            "NutriAID a descoperit ca reactionam la o combinatie intre lactate si gluten.",
            "Nu lactatele singure.",
            "Nu glutenul singur.",
            "Ci combinatia.",
            "Nici nu m-as fi gandit vreodata la asta.",
          ],
        },
        {
          title: "Povestea Mariei - Nu mai pot manca nimic -> Acum stiu exact ce pot manca",
          paragraphs: [
            "Ajunsesem sa mananc doar 5 alimente.",
            "Orice altceva imi provoca reactii.",
            "NutriAID m-a ajutat sa descopar alimente sigure.",
            "Nu doar ce imi face rau, ci si ce imi face bine.",
            "Acum pot manca normal.",
            "Fara frica.",
            "Fara panica.",
          ],
        },
      ],
      commonTitle: "Ce au in comun toti acesti oameni?",
      commonPoints: [
        "au avut simptome reale",
        "au fost ignorati",
        "au fost frustrati",
        "au fost confuzi",
        "au fost convinsi ca nu vor afla niciodata",
        "au incercat tot",
        "au fost la medici",
        "au facut analize",
        "au primit raspunsuri vagi",
      ],
      commonEnding: [
        "Si totusi au gasit raspunsuri aici.",
        "Pentru ca NutriAID Intolerances analizeaza, coreleaza, explica, simplifica si ghideaza.",
        "Si o face in fiecare zi.",
      ],
    },
    fastResults: {
      title: "Ce spun oamenii dupa prima saptamana?",
      quotes: [
        "Nu mai sunt pierdut.",
        "Nu mai sunt singur.",
        "Nu mai sunt nebun.",
        "Nu mai ghicesc.",
        "Nu mai traiesc cu frica.",
        "In sfarsit are sens.",
        "In sfarsit am control.",
      ],
    },
    science: {
      title: "Nu este magie. Este stiinta + tehnologie + empatie.",
      items: ["nu pune diagnostice", "nu inlocuieste medicul", "nu ofera tratament"],
      ending: [
        "Dar iti ofera ceva ce nimeni nu ti-a oferit pana acum:",
        "O harta clara a corpului tau. Un ghid real. Un sistem care te asculta.",
      ],
    },
    finalCta: {
      titleLines: [
        "Si tu poti avea aceeasi transformare.",
        "Nu trebuie sa traiesti cu durere.",
        "Nu trebuie sa traiesti cu confuzie.",
        "Nu trebuie sa traiesti cu frica de mancare.",
      ],
      primary: "Incepe analiza intolerantelor tale",
      secondary: "Vezi cum functioneaza NutriAID",
    },
  },
  en: {
    hero: {
      eyebrow: "Finally understand what is harming you",
      title: "Discover which foods trigger your symptoms. Fast. Clear. Personalized.",
      subtitleLines: [
        "Bloating, abdominal pain, fatigue, migraines, reflux, nausea, skin rashes - they all have a cause.",
        "NutriAID Intolerances uses AI to identify the foods that trigger your reactions.",
      ],
      primaryCta: "Start your intolerance analysis",
      secondaryCta: "See how it works",
      trustItems: [
        "No extreme diets",
        "No unnecessary eliminations",
        "No guessing",
        "Only real clarity",
      ],
    },
    symptoms: {
      title: "Your symptoms are not random",
      intro: "If you are here, you are probably living with symptoms that affect your life:",
      items: [
        "bloating after almost every meal",
        "abdominal pain that appears for no clear reason",
        "intense fatigue after eating",
        "migraines that throw you off rhythm",
        "reflux, nausea, heaviness in the stomach",
        "skin rashes after certain foods",
        "unpredictable bowel habits",
        "delayed reactions at 24-48h",
      ],
      quotes: [
        "There is nothing wrong.",
        "Your tests are normal.",
        "It is probably stress.",
        "Try removing gluten.",
      ],
      ending: [
        "But you know this is not in your head.",
        "You know something is harming you.",
        "And you deserve to find out exactly what.",
      ],
    },
    whyDifferent: {
      title: "Why is NutriAID Intolerances different?",
      intro: [
        "Because we do not give you generic advice.",
        "We do not tell you to eliminate half of your foods.",
        "We do not ask you to keep impossible journals.",
      ],
      points: [
        {
          title: "Advanced AI that analyzes your symptoms",
          body: "You enter what you ate and how you felt. The AI detects patterns that are hard to notice manually.",
        },
        {
          title: "Trigger food identification",
          body: "We do not guess. We calculate correlations, intensities, frequencies, and contexts.",
        },
        {
          title: "Personalized recommendations",
          body: "Not for all patients. For you.",
        },
        {
          title: "Daily monitoring",
          body: "See how your body changes in real time.",
        },
        {
          title: "An empathetic, clear, logical guide",
          body: "No panic. No unnecessary restrictions. No confusion.",
        },
      ],
    },
    howItWorks: {
      title: "How does NutriAID Intolerances work?",
      steps: [
        {
          title: "1. Enter what you ate",
          body: "Simple, fast, without complicated details.",
        },
        {
          title: "2. Record your symptoms",
          body: "Pain, bloating, migraine, nausea, anything you feel.",
        },
        {
          title: "3. The AI analyzes everything",
          body: "It correlates foods with your reactions.",
        },
        {
          title: "4. You get clear answers",
          body: "What harms you. Which combinations are problematic. Which foods are safe.",
        },
        {
          title: "5. Follow personalized guidance",
          body: "Food plans adapted to your body.",
        },
      ],
    },
    audience: {
      title: "Who is NutriAID Intolerances for?",
      intro: "For you, if:",
      items: [
        "you have recurring digestive symptoms",
        "you have strange reactions after meals",
        "you have migraines or fatigue after certain foods",
        "you tried elimination diets without success",
        "you received vague or incomplete answers",
        "you feel nobody truly listens to you",
      ],
      ending: "NutriAID Intolerances is for people who want clarity, control, and a normal life.",
    },
    testimonials: {
      title: "People who went through what you are going through. And found answers.",
      subtitle: [
        "These are not invented stories.",
        "These are not empty promises.",
        "These are real people, with real symptoms, who lived for years in confusion and finally understood what was harming them.",
      ],
      featured: [
        {
          quote: "I cried when I saw the first correlation. I am not exaggerating.",
          author: "Andreea, 34",
          body: "After 8 years of bloating and pain, after dozens of perfect tests, NutriAID was the only place where I felt someone understood me. In 3 days I found out what was causing my symptoms.",
        },
        {
          quote: "I no longer live in fear of food.",
          author: "Radu, 41",
          body: "Before, every meal felt like Russian roulette. Now I know exactly what harms me and what I can eat safely.",
        },
        {
          quote: "Doctors told me it was stress. It was not stress.",
          author: "Ioana, 29",
          body: "NutriAID found a food combination I was reacting to. It never would have crossed my mind.",
        },
        {
          quote: "My symptoms dropped by 60% in the first week.",
          author: "Cristina, 52",
          body: "I did not think it was possible. After years of struggle, I finally feel in control.",
        },
        {
          quote: "I am no longer a prisoner of my own body.",
          author: "Mihai, 38",
          body: "I used to wake up with pain, bloating, and exhaustion. Now I know exactly what to avoid and what to combine.",
        },
      ],
      storiesTitle: "Longer stories, real stories, real transformation",
      stories: [
        {
          title: "Ana's story - 12 years of symptoms, 3 days to the first answers",
          paragraphs: [
            "I lived for 12 years with bloating, abdominal pain, and chronic fatigue.",
            "I did every test possible. All of them were perfect.",
            "I was sent to a psychologist because it was probably anxiety.",
            "When I started NutriAID, I logged a few meals and a few symptoms.",
            "On the third day, the AI identified a food combination I reacted to.",
            "No doctor had ever told me that.",
            "After one week, my symptoms were cut in half.",
            "After a month, I felt like I was living again.",
          ],
        },
        {
          title: "Dan's story - 6 years of migraines, 1 week to clarity",
          paragraphs: [
            "My migraines appeared without any logic.",
            "Sometimes after food, sometimes not.",
            "I tried diets, supplements, medications.",
            "NutriAID discovered I was reacting to a combination of dairy and gluten.",
            "Not dairy alone.",
            "Not gluten alone.",
            "But the combination.",
            "I would never have thought of that.",
          ],
        },
        {
          title: "Maria's story - I can't eat anything anymore -> Now I know exactly what I can eat",
          paragraphs: [
            "I had reached the point where I was eating only 5 foods.",
            "Anything else triggered reactions.",
            "NutriAID helped me discover safe foods.",
            "Not only what harms me, but also what works for me.",
            "Now I can eat normally.",
            "Without fear.",
            "Without panic.",
          ],
        },
      ],
      commonTitle: "What do all these people have in common?",
      commonPoints: [
        "they had real symptoms",
        "they were ignored",
        "they were frustrated",
        "they were confused",
        "they were convinced they would never find out",
        "they tried everything",
        "they went to doctors",
        "they did the tests",
        "they received vague answers",
      ],
      commonEnding: [
        "And still, they found answers here.",
        "Because NutriAID Intolerances analyzes, correlates, explains, simplifies, and guides.",
        "And it does it every day.",
      ],
    },
    fastResults: {
      title: "What do people say after the first week?",
      quotes: [
        "I am no longer lost.",
        "I am no longer alone.",
        "I am no longer crazy.",
        "I am no longer guessing.",
        "I no longer live with fear.",
        "It finally makes sense.",
        "I finally have control.",
      ],
    },
    science: {
      title: "This is not magic. It is science + technology + empathy.",
      items: [
        "does not provide diagnoses",
        "does not replace your doctor",
        "does not provide treatment",
      ],
      ending: [
        "But it gives you something nobody has given you before:",
        "A clear map of your body. A real guide. A system that listens to you.",
      ],
    },
    finalCta: {
      titleLines: [
        "You can have the same transformation too.",
        "You do not need to live with pain.",
        "You do not need to live with confusion.",
        "You do not need to live in fear of food.",
      ],
      primary: "Start your intolerance analysis",
      secondary: "See how NutriAID works",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = getServerLanguage();
  const isRo = lang === "ro";

  return {
    title: "NutriAID Intolerances",
    description: isRo
      ? "Descopera ce alimente iti provoaca simptomele cu ajutorul AI-ului, rapid si personalizat."
      : "Discover which foods trigger your symptoms with AI-powered, fast, personalized analysis.",
    alternates: {
      canonical: "/",
    },
  };
}

export default function HomePage() {
  const lang = getServerLanguage();
  const t = content[lang];

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-emerald-50 to-cyan-50 dark:border-white/10 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.35),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.25),transparent_40%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
          <p className="mb-5 inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-800 dark:border-emerald-300/30 dark:bg-emerald-400/10 dark:text-emerald-200">
            {t.hero.eyebrow}
          </p>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            {t.hero.title}
          </h1>
          <div className="mt-6 max-w-3xl space-y-2 text-lg text-slate-700 dark:text-slate-200">
            {t.hero.subtitleLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-7 py-3.5 text-base font-semibold text-slate-900 transition hover:bg-emerald-300"
            >
              {t.hero.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#cum-functioneaza"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              {t.hero.secondaryCta}
            </Link>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 list-none p-0">
            {t.hero.trustItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:shadow-none"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{t.symptoms.title}</h2>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">{t.symptoms.intro}</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 list-none p-0">
          {t.symptoms.items.map((item) => (
            <li key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-none">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-300/20 dark:bg-amber-300/5">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-200/90">
            {lang === "ro" ? "Poate ai auzit" : "Maybe you heard"}
          </p>
          <div className="mt-3 space-y-2 text-lg text-amber-900 dark:text-amber-100">
            {t.symptoms.quotes.map((quote) => (
              <p key={quote}>&quot;{quote}&quot;</p>
            ))}
          </div>
        </div>
        <div className="mt-8 space-y-2 text-lg font-medium text-slate-900 dark:text-white">
          {t.symptoms.ending.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{t.testimonials.title}</h2>
        <div className="mt-5 space-y-2 text-lg text-slate-600 dark:text-slate-300">
          {t.testimonials.subtitle.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {t.testimonials.featured.map((item) => (
            <article
              key={item.quote}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none"
            >
              <p className="text-xl font-bold text-slate-900 dark:text-white">⭐ {item.quote}</p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                {item.author}
              </p>
              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">{item.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-16 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 dark:border-emerald-900/40 dark:bg-emerald-950/10">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t.testimonials.storiesTitle}</h3>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {t.testimonials.stories.map((story) => (
              <article
                key={story.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/60 dark:shadow-none"
              >
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{story.title}</h4>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {story.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t.testimonials.commonTitle}</h3>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 list-none p-0">
            {t.testimonials.commonPoints.map((point) => (
              <li
                key={point}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
              >
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-2 text-lg font-medium text-slate-900 dark:text-white">
            {t.testimonials.commonEnding.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{t.fastResults.title}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.fastResults.quotes.map((quote) => (
              <blockquote
                key={quote}
                className="rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-5 text-lg font-medium text-slate-800 dark:bg-emerald-950/20 dark:text-slate-100"
              >
                {quote}
              </blockquote>
            ))}
          </div>
        </div>
      </section>
      <section className="border-y border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{t.whyDifferent.title}</h2>
          <div className="mt-6 space-y-2 text-lg text-slate-600 dark:text-slate-300">
            {t.whyDifferent.intro.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {t.whyDifferent.points.map((point, idx) => {
              const icons = [Brain, Target, Sparkles, LineChart, HeartHandshake];
              const Icon = icons[idx] || Sparkles;
              return (
                <div key={point.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:shadow-none">
                  <div className="mb-3 inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{point.title}</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">{point.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="cum-functioneaza" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{t.howItWorks.title}</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {t.howItWorks.steps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <div className="mb-2 inline-flex rounded-md bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{t.audience.title}</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t.audience.intro}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 list-none p-0">
            {t.audience.items.map((item) => (
              <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-lg font-medium text-slate-900 dark:text-white">{t.audience.ending}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{t.science.title}</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {t.science.items.map((item) => (
            <div key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:shadow-none">
              {item}
            </div>
          ))}
        </div>
        <p className="mt-8 text-lg text-slate-700 dark:text-slate-200">{t.science.ending[0]}</p>
        <p className="mt-3 text-2xl font-bold leading-relaxed text-emerald-700 dark:text-emerald-200">{t.science.ending[1]}</p>
      </section>

      <section className="relative overflow-hidden border-t border-slate-200 bg-gradient-to-br from-emerald-700 to-cyan-700 dark:border-white/10 dark:from-emerald-700 dark:to-cyan-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_35%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="mx-auto max-w-4xl text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            {t.finalCta.titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              {t.finalCta.primary}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#cum-functioneaza"
              className="inline-flex items-center rounded-xl border border-white/35 bg-white/10 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/20"
            >
              {t.finalCta.secondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
