import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return {
    title: isRo
      ? "Analiza simptomelor cu AI — Knowledge Hub NutriAID"
      : "AI Symptom Analysis — NutriAID Knowledge Hub",
    description: isRo
      ? "Cum analizează AI-ul NutriAID simptomele tale digestive, migrenele și oboseala pentru a identifica alimentele declanșatoare."
      : "How NutriAID AI analyzes your digestive symptoms, migraines, and fatigue to identify trigger foods.",
    alternates: { canonical: "/knowledge-hub/analiza-simptomelor", languages: { ro: "/knowledge-hub/analiza-simptomelor", en: "/knowledge-hub/analiza-simptomelor", "x-default": "/knowledge-hub/analiza-simptomelor" } },
    openGraph: {
      title: isRo ? "Analiza simptomelor cu AI — NutriAID" : "AI Symptom Analysis — NutriAID",
      description: isRo
        ? "Balonare, dureri, migrene, oboseală — AI-ul corelează fiecare simptom cu alimentele consumate."
        : "Bloating, pain, migraines, fatigue — the AI correlates each symptom with the foods you consumed.",
      url: "/knowledge-hub/analiza-simptomelor",
      locale: isRo ? "ro_RO" : "en_US",
    },
  };
}

export default function AnalizaSimptomelorPage() {
  const isRo = getServerLanguage() === "ro";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isRo ? "Analiza simptomelor cu AI" : "AI Symptom Analysis",
    description: isRo
      ? "AI-ul NutriAID corelează simptomele cu mesele pentru a detecta intoleranțe și sensibilități alimentare."
      : "NutriAID AI correlates symptoms with meals to detect food intolerances and sensitivities.",
    author: { "@type": "Organization", name: "NutriAID Intolerances" },
    publisher: { "@type": "Organization", name: "NutriAID Intolerances" },
    url: "/knowledge-hub/analiza-simptomelor",
    inLanguage: isRo ? "ro-RO" : "en-US",
  };

  const symptoms = isRo
    ? ["Balonare", "Dureri abdominale", "Reflux gastric", "Greață", "Oboseală după masă", "Migrene", "Erupții pe piele", "Anxietate după masă", "Tranzit intestinal imprevizibil", "Senzație de greutate în stomac", "Dureri de cap difuze", "Ceață mentală (brain fog)"]
    : ["Bloating", "Abdominal pain", "Gastric reflux", "Nausea", "Post-meal fatigue", "Migraines", "Skin rashes", "Post-meal anxiety", "Unpredictable bowel movements", "Feeling of heaviness in the stomach", "Diffuse headaches", "Mental fog (brain fog)"];

  const howToLog = isRo
    ? [
        { title: "Tipul simptomului", body: "Balonare, durere, migrenă, oboseală, reflux, erupție, greață etc." },
        { title: "Intensitatea (1-10)", body: "Cât de sever a fost simptomul. Chiar și simptomele ușoare sunt relevante." },
        { title: "Momentul apariției", body: "Cât timp a trecut de la ultima masă. Crucial pentru detectarea reacțiilor întârziate." },
        { title: "Durata", body: "Cât a durat simptomul — minute, ore sau toată ziua." },
      ]
    : [
        { title: "Symptom type", body: "Bloating, pain, migraine, fatigue, reflux, rash, nausea, etc." },
        { title: "Intensity (1-10)", body: "How severe the symptom was. Even mild symptoms are relevant." },
        { title: "Onset time", body: "How long after the last meal the symptom appeared. Crucial for detecting delayed reactions." },
        { title: "Duration", body: "How long the symptom lasted — minutes, hours, or all day." },
      ];

  const faqItems = isRo
    ? [
        { q: "Ce simptome pot introduce in NutriAID?", a: "Orice reactie a corpului care ar putea fi legata de alimentatie: balonare, dureri abdominale, migrena, oboseala dupa masa, reflux, eruptii pe piele, greata, anxietate sau ceata mentala (brain fog)." },
        { q: "Trebuie sa introduc si simptomele usoare, de intensitate mica?", a: "Da. Chiar si simptomele usoare, cu intensitate 1-2 din 10, sunt relevante pentru identificarea tiparelor. AI-ul lucreaza cu toate datele disponibile, nu doar cu cele severe." },
        { q: "Ce fac daca am mai multe simptome dupa aceeasi masa?", a: "Introduci fiecare simptom separat, cu tipul, intensitatea si momentul aparitiei. Cu cat mai multe detalii, cu atat analiza AI este mai precisa si mai utila." },
        { q: "Pot introduce simptome care nu sunt digestive?", a: "Da. Migrenele, oboseala, eruptiile pe piele, ceata mentala si anxietatea pot fi legate de alimentatie si sunt analizate de NutriAID la fel ca simptomele digestive." },
        { q: "Cat de repede apar primele corelatii intre simptome si alimente?", a: "De obicei dupa 3-7 zile de inregistrare consistenta a ambelor — atat mese cat si simptome. Cu cat volumul de date este mai mare, cu atat corelatiile sunt mai sigure." },
      ]
    : [
        { q: "What symptoms can I log in NutriAID?", a: "Any body reaction that could be related to food: bloating, abdominal pain, migraine, post-meal fatigue, reflux, skin rashes, nausea, anxiety, or mental fog (brain fog)." },
        { q: "Should I log mild symptoms with low intensity?", a: "Yes. Even mild symptoms, with intensity 1-2 out of 10, are relevant for identifying patterns. The AI works with all available data, not only severe cases." },
        { q: "What should I do if I have multiple symptoms after the same meal?", a: "Log each symptom separately, with its type, intensity, and onset time. The more detail you provide, the more precise and useful the AI analysis will be." },
        { q: "Can I log symptoms that are not digestive?", a: "Yes. Migraines, fatigue, skin rashes, brain fog, and anxiety can all be linked to food and are analyzed by NutriAID just like digestive symptoms." },
        { q: "How quickly do the first symptom-food correlations appear?", a: "Usually after 3-7 days of consistent logging of both meals and symptoms. The larger the data volume, the more reliable the correlations." },
      ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="pb-20 bg-slate-50 dark:bg-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="relative overflow-hidden border-y border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-100 via-white to-slate-50 dark:from-emerald-950/30 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <Link href="/knowledge-hub" className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 text-sm font-semibold mb-6 hover:bg-emerald-600/20 transition">
            <BookOpen className="h-4 w-4" />
            Knowledge Hub
          </Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900 dark:text-white">
            {isRo ? "Analiza simptomelor cu AI" : "AI Symptom Analysis"}
          </h1>
          <p className="mt-5 text-xl text-slate-700 dark:text-slate-300 max-w-3xl">
            {isRo
              ? "Orice simptom pe care îl notezi devine o piesă din puzzle. AI-ul corelează fiecare reacție cu mesele consumate și identifică tipare invizibile pentru ochiul uman."
              : "Every symptom you log becomes a piece of the puzzle. The AI correlates each reaction with the meals consumed and identifies patterns invisible to the human eye."}
          </p>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "Ce simptome poate analiza NutriAID?" : "What symptoms can NutriAID analyze?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-5">
            {isRo
              ? "Orice reacție a corpului care ar putea fi legată de alimentație:"
              : "Any body reaction that could be related to food:"}
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 list-none p-0">
            {symptoms.map((s) => (
              <li key={s} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 text-center font-medium">
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Cum să notezi corect un simptom?" : "How to correctly log a symptom?"}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0">
            {howToLog.map((item) => (
              <li key={item.title} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "De ce sunt importante reacțiile întârziate?" : "Why are delayed reactions important?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            {isRo
              ? "Spre deosebire de alergiile clasice (reacție imediată), intoleranțele alimentare pot cauza simptome la 2-48 de ore după consum. Aceasta face identificarea manuală aproape imposibilă."
              : "Unlike classic allergies (immediate reaction), food intolerances can cause symptoms 2-48 hours after consumption. This makes manual identification nearly impossible."}
          </p>
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6">
            <p className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
              {isRo ? "Exemplu real:" : "Real example:"}
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              {isRo
                ? "Migrena care apare luni dimineața poate fi cauzată de o combinație alimentară consumată duminică seara. AI-ul detectează această conexiune pe baza istoricului tău — fără să fie nevoie să faci tu această legătură."
                : "The migraine appearing Monday morning may be caused by a food combination consumed Sunday evening. The AI detects this connection based on your history — without you needing to make this link yourself."}
            </p>
          </div>
        </section>

        {/* Definitie */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "Ce este analiza simptomelor cu AI?" : "What is AI symptom analysis?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            {isRo
              ? "Analiza simptomelor cu AI înseamnă corelarea automată a fiecărei reacții raportate (balonare, durere, migrenă, oboseală) cu mesele consumate în intervalul de timp relevant — inclusiv în fereastra de 2–48 de ore, unde identificarea manuală este practic imposibilă."
              : "AI symptom analysis means automatically correlating each reported reaction (bloating, pain, migraine, fatigue) with meals consumed in the relevant time window — including within the 2–48 hour range, where manual identification is practically impossible."}
          </p>
        </section>

        {/* Importanta */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "De ce este importantă înregistrarea simptomelor?" : "Why is symptom logging important?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            {isRo
              ? "Fără date despre simptome, AI-ul poate analiza mesele dar nu poate detecta corelații. Simptomele sunt jumătatea esențială a ecuației: aliment + timp + reacție = tipar. Cu cât mai complete și precise sunt datele despre simptome, cu atât corelațiile identificate sunt mai sigure."
              : "Without symptom data, the AI can analyze meals but cannot detect correlations. Symptoms are the essential half of the equation: food + time + reaction = pattern. The more complete and precise the symptom data, the more reliable the identified correlations."}
          </p>
        </section>

        {/* Tabel comparativ */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Intoleranță alimentară vs. Alergie alimentară" : "Food intolerance vs. Food allergy"}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-600 text-white text-left">
                  <th className="px-4 py-3 font-semibold">{isRo ? "Criteriu" : "Criterion"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Intoleranță alimentară" : "Food intolerance"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Alergie alimentară" : "Food allergy"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {(isRo
                  ? [
                      ["Timing reacție", "2–48 ore", "Minute (imediat)"],
                      ["Severitate", "Moderată, cronică", "Poate fi severă (anafilaxie)"],
                      ["Detectare manuală", "Dificilă", "Mai ușoară"],
                      ["Test medical standard", "Nu există", "Prick test / IgE"],
                      ["Exemple comune", "Lactoză, gluten, FODMAP", "Arahide, lapte, ouă"],
                      ["NutriAID poate ajuta", "✅ Da", "Urgent: consultați medicul"],
                    ]
                  : [
                      ["Reaction timing", "2–48 hours", "Minutes (immediate)"],
                      ["Severity", "Moderate, chronic", "Can be severe (anaphylaxis)"],
                      ["Manual detection", "Difficult", "Easier"],
                      ["Standard medical test", "Does not exist", "Prick test / IgE"],
                      ["Common examples", "Lactose, gluten, FODMAP", "Peanuts, milk, eggs"],
                      ["NutriAID can help", "✅ Yes", "Urgent: see a doctor"],
                    ]
                ).map((row) => (
                  <tr key={row[0]} className="bg-white dark:bg-slate-900 even:bg-slate-50 even:dark:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row[0]}</td>
                    <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300">{row[1]}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Întrebări frecvente" : "Frequently asked questions"}
          </h2>
          <dl className="space-y-3">
            {faqItems.map((item) => (
              <div key={item.q} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                <dt className="font-semibold text-slate-900 dark:text-white mb-2">{item.q}</dt>
                <dd className="text-slate-600 dark:text-slate-400 text-sm m-0">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Rezumat */}
        <section className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            {isRo ? "Rezumat" : "Summary"}
          </h2>
          <ul className="space-y-2 list-none p-0">
            {(isRo
              ? [
                  "Orice simptom corelabil cu alimentația poate fi introdus: digestiv, neurologic, cutanat",
                  "Elementele esențiale: tipul simptomului, intensitatea (1–10), ora apariției, durata",
                  "AI-ul detectează și reacții la 2–48h — cruciale pentru intoleranțe, imposibil de urmărit manual",
                  "Simptomele ușoare (intensitate 1–2) sunt la fel de valoroase ca cele severe",
                  "Primele corelații simptome-alimente apar după 3–7 zile de înregistrare a ambelor",
                ]
              : [
                  "Any food-related symptom can be logged: digestive, neurological, skin-related",
                  "Essential elements: symptom type, intensity (1–10), onset time, duration",
                  "The AI detects reactions at 2–48h — crucial for intolerances, impossible to track manually",
                  "Mild symptoms (intensity 1–2) are just as valuable as severe ones",
                  "First symptom-food correlations appear after 3–7 days of logging both",
                ]
            ).map((point) => (
              <li key={point} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-none text-emerald-500 dark:text-emerald-400" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-emerald-700 to-cyan-700 p-8 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">
            {isRo ? "Fiecare simptom notat este un pas spre claritate." : "Every symptom logged is a step toward clarity."}
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition">
              {isRo ? "Începe analiza" : "Start analysis"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/knowledge-hub" className="inline-flex items-center rounded-xl border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition">
              {isRo ? "Înapoi la Knowledge Hub" : "Back to Knowledge Hub"}
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
