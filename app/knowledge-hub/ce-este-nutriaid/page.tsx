import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return {
    title: isRo
      ? "Ce este NutriAID Intolerances? — Knowledge Hub"
      : "What is NutriAID Intolerances? — Knowledge Hub",
    description: isRo
      ? "NutriAID Intolerances este o platformă AI care identifică alimentele ce îți provoacă simptome. Află ce face, pentru cine este și ce o diferențiază."
      : "NutriAID Intolerances is an AI platform that identifies foods causing your symptoms. Learn what it does, who it is for, and what sets it apart.",
    alternates: { canonical: "/knowledge-hub/ce-este-nutriaid", languages: { ro: "/knowledge-hub/ce-este-nutriaid", en: "/knowledge-hub/ce-este-nutriaid", "x-default": "/knowledge-hub/ce-este-nutriaid" } },
    openGraph: {
      title: isRo ? "Ce este NutriAID Intolerances?" : "What is NutriAID Intolerances?",
      description: isRo
        ? "Platformă AI pentru identificarea intoleranțelor alimentare — nu pune diagnostice, oferă claritate."
        : "AI platform for identifying food intolerances — no diagnoses, just clarity.",
      url: "/knowledge-hub/ce-este-nutriaid",
      locale: isRo ? "ro_RO" : "en_US",
    },
  };
}

export default function CeEsteNutriaidPage() {
  const isRo = getServerLanguage() === "ro";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isRo ? "Ce este NutriAID Intolerances?" : "What is NutriAID Intolerances?",
    description: isRo
      ? "NutriAID Intolerances este o platformă AI care identifică alimentele ce îți provoacă simptome digestive, migrene sau oboseală."
      : "NutriAID Intolerances is an AI platform that identifies foods causing digestive symptoms, migraines, or fatigue.",
    author: { "@type": "Organization", name: "NutriAID Intolerances" },
    publisher: { "@type": "Organization", name: "NutriAID Intolerances" },
    url: "/knowledge-hub/ce-este-nutriaid",
    inLanguage: isRo ? "ro-RO" : "en-US",
  };

  const faqItems = isRo
    ? [
        { q: "Ce este NutriAID Intolerances?", a: "NutriAID Intolerances este o platformă web bazată pe inteligență artificială care analizează corelațiile dintre mesele tale și simptomele raportate, cu scopul de a identifica alimentele sau combinațiile alimentare care îți provoacă reacții neplăcute." },
        { q: "Cât durează până văd primele rezultate?", a: "De obicei 3–7 zile de înregistrare consistentă a meselor și simptomelor sunt suficiente pentru primele corelații. Cu cât adaugi mai multe date, cu atât analiza devine mai precisă." },
        { q: "NutriAID Intolerances poate pune un diagnostic medical?", a: "Nu. NutriAID nu pune diagnostice medicale, nu prescrie tratamente și nu înlocuiește consultul unui medic sau nutriționist. Platforma oferă claritate bazată pe date, nu sfaturi medicale." },
        { q: "Este nevoie să cântăresc mâncarea sau să știu ingredientele exacte?", a: "Nu. AI-ul funcționează cu aproximații realiste. Nu trebuie să cântărești nimic — notezi ce ai mâncat și în ce combinație, atât." },
        { q: "Datele mele de sănătate sunt în siguranță?", a: "Da. Datele tale sunt stocate criptat, nu sunt vândute, nu sunt partajate cu terți în scop comercial și poți solicita ștergerea lor completă oricând, conform GDPR." },
      ]
    : [
        { q: "What is NutriAID Intolerances?", a: "NutriAID Intolerances is a web platform powered by artificial intelligence that analyzes correlations between your meals and reported symptoms to identify foods or food combinations causing unpleasant reactions." },
        { q: "How long until I see first results?", a: "Usually 3–7 days of consistent logging of meals and symptoms is enough for the first correlations. The more data you add, the more precise the analysis becomes." },
        { q: "Can NutriAID Intolerances make a medical diagnosis?", a: "No. NutriAID does not make medical diagnoses, does not prescribe treatments, and does not replace consultation with a doctor or nutritionist. The platform provides data-based clarity, not medical advice." },
        { q: "Do I need to weigh food or know exact ingredients?", a: "No. The AI works with realistic approximations. You do not need to weigh anything — just note what you ate and in what combination." },
        { q: "Is my health data safe?", a: "Yes. Your data is stored encrypted, is not sold, is not shared with third parties for commercial purposes, and you can request complete deletion at any time, in accordance with GDPR." },
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

      {/* Hero */}
      <section className="relative overflow-hidden border-y border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-100 via-white to-slate-50 dark:from-emerald-950/30 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <Link
            href="/knowledge-hub"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 text-sm font-semibold mb-6 hover:bg-emerald-600/20 transition"
          >
            <BookOpen className="h-4 w-4" />
            Knowledge Hub
          </Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900 dark:text-white">
            {isRo ? "Ce este NutriAID Intolerances?" : "What is NutriAID Intolerances?"}
          </h1>
          <p className="mt-5 text-xl text-slate-700 dark:text-slate-300 max-w-3xl">
            {isRo
              ? "O platformă inteligentă care te ajută să descoperi alimentele ce îți provoacă simptome — rapid, clar și personalizat, fără diagnostice medicale."
              : "An intelligent platform that helps you discover the foods causing your symptoms — fast, clear, and personalized, without medical diagnoses."}
          </p>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">

        {/* Ce este */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "Definiție simplă" : "Simple definition"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            {isRo
              ? "NutriAID Intolerances este o aplicație web care folosește inteligența artificială pentru a analiza ce mănânci și cum te simți, cu scopul de a identifica alimentele sau combinațiile alimentare care îți declanșează simptome neplăcute."
              : "NutriAID Intolerances is a web application that uses artificial intelligence to analyze what you eat and how you feel, with the goal of identifying foods or food combinations that trigger unpleasant symptoms."}
          </p>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            {isRo
              ? "Nu este o aplicație de dietă. Nu este un jurnal simplu. Este un sistem de analiză bazat pe corelații reale între alimente și reacțiile corpului tău."
              : "It is not a diet app. It is not a simple food journal. It is an analysis system based on real correlations between foods and your body's reactions."}
          </p>
        </section>

        {/* Pentru cine */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "Pentru cine este NutriAID Intolerances?" : "Who is NutriAID Intolerances for?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-5">
            {isRo ? "Este destinat persoanelor care:" : "It is designed for people who:"}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
            {(isRo
              ? [
                  "au simptome digestive recurente (balonare, dureri, reflux)",
                  "au migrene sau oboseală după anumite mese",
                  "au primit analize normale dar se simt rău",
                  "au încercat diete de eliminare fără succes clar",
                  "vor să înțeleagă cum reacționează corpul lor la alimente",
                  "caută claritate fără diagnostice sau restricții inutile",
                ]
              : [
                  "have recurring digestive symptoms (bloating, pain, reflux)",
                  "have migraines or fatigue after certain meals",
                  "received normal test results but still feel unwell",
                  "tried elimination diets without clear success",
                  "want to understand how their body reacts to foods",
                  "seek clarity without diagnoses or unnecessary restrictions",
                ]
            ).map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-none text-emerald-500 dark:text-emerald-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Ce face si ce nu face */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "Ce face NutriAID — și ce nu face" : "What NutriAID does — and does not do"}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6">
              <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-4">
                {isRo ? "Ce face:" : "What it does:"}
              </h3>
              <ul className="space-y-2 list-none p-0">
                {(isRo
                  ? [
                      "Analizează mesele introduse de tine",
                      "Corelează alimentele cu simptomele raportate",
                      "Identifică tipare și alimente suspecte",
                      "Detectează combinații alimentare problematice",
                      "Oferă recomandări personalizate",
                      "Urmărește evoluția simptomelor în timp",
                    ]
                  : [
                      "Analyzes the meals you log",
                      "Correlates foods with reported symptoms",
                      "Identifies patterns and suspected foods",
                      "Detects problematic food combinations",
                      "Provides personalized recommendations",
                      "Tracks symptom evolution over time",
                    ]
                ).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-none text-emerald-600 dark:text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 p-6">
              <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-4">
                {isRo ? "Ce nu face:" : "What it does not do:"}
              </h3>
              <ul className="space-y-2 list-none p-0">
                {(isRo
                  ? [
                      "Nu pune diagnostice medicale",
                      "Nu înlocuiește medicul sau nutriționistul",
                      "Nu prescrie tratamente sau medicamente",
                      "Nu impune diete extreme",
                      "Nu promite vindecări garantate",
                      "Nu vinde sau partajează datele tale",
                    ]
                  : [
                      "Does not make medical diagnoses",
                      "Does not replace doctors or nutritionists",
                      "Does not prescribe treatments or medications",
                      "Does not impose extreme diets",
                      "Does not promise guaranteed cures",
                      "Does not sell or share your data",
                    ]
                ).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                    <XCircle className="h-4 w-4 mt-0.5 flex-none text-rose-500 dark:text-rose-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* De ce este diferit */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "De ce este diferit față de alte soluții?" : "Why is it different from other solutions?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            {isRo
              ? "Majoritatea aplicațiilor de nutriție îți oferă informații generice despre calorii sau macronutrienți. NutriAID Intolerances face altceva:"
              : "Most nutrition apps give you generic information about calories or macronutrients. NutriAID Intolerances does something different:"}
          </p>
          <ul className="space-y-3 list-none p-0">
            {(isRo
              ? [
                  { title: "Analiză individuală, nu generică", body: "Sistemul analizează datele tale specifice, nu statistici de populație." },
                  { title: "Corelații complexe", body: "Detectează reacții întârziate (la 24-48h) și combinații de alimente, nu doar alergeni simpli." },
                  { title: "Fără eliminări inutile", body: "Nu îți cere să elimini tot glutenul sau toată lactoza — ci identifică ce anume, când și în ce combinație îți face rău." },
                  { title: "Empatie, nu panică", body: "Ghidarea este clară, logică și empatică. Fără frici, fără restricții nejustificate." },
                ]
              : [
                  { title: "Individual analysis, not generic", body: "The system analyzes your specific data, not population statistics." },
                  { title: "Complex correlations", body: "Detects delayed reactions (at 24-48h) and food combinations, not just simple allergens." },
                  { title: "No unnecessary eliminations", body: "Does not ask you to eliminate all gluten or all dairy — instead identifies what, when, and in what combination harms you." },
                  { title: "Empathy, not panic", body: "Guidance is clear, logical, and empathetic. No fears, no unjustified restrictions." },
                ]
            ).map((item) => (
              <li key={item.title} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Importanta */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "De ce este importantă identificarea intoleranțelor alimentare?" : "Why is identifying food intolerances important?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            {isRo
              ? "Intoleranțele neidentificate pot afecta calitatea vieții timp de ani de zile: oboseală cronică, stare generală proastă, productivitate scăzută — fără o cauză aparentă."
              : "Unidentified intolerances can affect quality of life for years: chronic fatigue, poor wellbeing, reduced productivity — without an apparent cause."}
          </p>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            {isRo
              ? "Identificarea lor precisă permite eliminarea restricțiilor inutile și recâștigarea plăcerii de a mânca fără frici nejustificate."
              : "Precisely identifying them allows eliminating unnecessary restrictions and regaining the pleasure of eating without unjustified fears."}
          </p>
        </section>

        {/* Exemplu */}
        <section className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6">
          <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-3">
            {isRo ? "Exemplu concret" : "Concrete example"}
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            {isRo
              ? "Maria, 32 de ani, suferea de balonare cronică după orice masă. Analizele medicale au ieșit normale. A folosit NutriAID 7 zile. AI-ul a identificat că balonarea apărea constant la 4–6 ore după combinația orez alb + ulei de floarea soarelui, nu de la niciunul din ingrediente separat. Eliminând această combinație, simptomele s-au redus cu 80% în 2 săptămâni."
              : "Maria, 32, suffered from chronic bloating after every meal. Medical tests came back normal. She used NutriAID for 7 days. The AI identified that bloating consistently appeared 4–6 hours after the combination of white rice + sunflower oil — not from either ingredient alone. By eliminating this combination, symptoms reduced by 80% in 2 weeks."}
          </p>
        </section>

        {/* Pasi concreți */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Cum începi cu NutriAID Intolerances?" : "How do you get started with NutriAID Intolerances?"}
          </h2>
          <ol className="space-y-3 list-none p-0">
            {(isRo
              ? [
                  { n: "1", t: "Creezi un cont gratuit", b: "Înregistrarea durează sub 2 minute. Nu este necesară nicio metodă de plată." },
                  { n: "2", t: "Introduci prima masă", b: "Notezi ce ai mâncat, ora și cantitatea aproximativă. Fără cântărire." },
                  { n: "3", t: "Notezi simptomele apărute", b: "Orice reacție — balonare, migrenă, oboseală — cu ora apariției și intensitatea." },
                  { n: "4", t: "Continui zilnic 3–7 zile", b: "Cu cât mai multe date, cu atât analiza este mai precisă și mai personalizată." },
                  { n: "5", t: "Primești primele corelații", b: "AI-ul identifică alimentele suspecte, combinațiile problematice și alimentele sigure pentru corpul tău." },
                ]
              : [
                  { n: "1", t: "Create a free account", b: "Registration takes under 2 minutes. No payment method required." },
                  { n: "2", t: "Log your first meal", b: "Note what you ate, the time, and approximate quantity. No weighing." },
                  { n: "3", t: "Log any symptoms that appear", b: "Any reaction — bloating, migraine, fatigue — with time of onset and intensity." },
                  { n: "4", t: "Continue daily for 3–7 days", b: "The more data you add, the more precise and personalized the analysis." },
                  { n: "5", t: "Receive first correlations", b: "The AI identifies suspected foods, problematic combinations, and safe foods for your body." },
                ]
            ).map((step) => (
              <li key={step.n} className="flex items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white text-xs font-bold flex-none">{step.n}</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{step.t}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{step.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Tabel comparativ */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "NutriAID vs. alte abordări" : "NutriAID vs. other approaches"}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-600 text-white text-left">
                  <th className="px-4 py-3 font-semibold">{isRo ? "Criteriu" : "Criterion"}</th>
                  <th className="px-4 py-3 font-semibold">NutriAID</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Dietă eliminare" : "Elimination diet"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Analize sânge" : "Blood tests"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Jurnal manual" : "Manual journal"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {(isRo
                  ? [
                      ["Personalizare", "Individuală", "Generică", "Parțial", "Subiectivă"],
                      ["Reacții întârziate (24–48h)", "✅ Detectate", "❌ Nu", "❌ Nu", "❌ Nu"],
                      ["Combinații alimentare", "✅ Analizate", "❌ Nu", "❌ Nu", "❌ Nu"],
                      ["Timp până la rezultate", "3–7 zile", "Săptămâni", "Zile", "Luni"],
                      ["Necesită specialist", "Nu", "Recomandat", "Da", "Nu"],
                    ]
                  : [
                      ["Personalization", "Individual", "Generic", "Partial", "Subjective"],
                      ["Delayed reactions (24–48h)", "✅ Detected", "❌ No", "❌ No", "❌ No"],
                      ["Food combinations", "✅ Analyzed", "❌ No", "❌ No", "❌ No"],
                      ["Time to results", "3–7 days", "Weeks", "Days", "Months"],
                      ["Requires specialist", "No", "Recommended", "Yes", "No"],
                    ]
                ).map((row) => (
                  <tr key={row[0]} className="bg-white dark:bg-slate-900 even:bg-slate-50 even:dark:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row[0]}</td>
                    <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300 font-medium">{row[1]}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row[2]}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row[3]}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row[4]}</td>
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
                  "NutriAID Intolerances este o platformă AI care identifică alimentele ce provoacă simptome",
                  "Analizează corelații mese ↔ simptome, inclusiv reacții întârziate la 24–48h",
                  "Nu pune diagnostice medicale și nu înlocuiește medicul sau nutriționistul",
                  "Funcționează cu aproximații — nu este nevoie să cântărești mâncarea",
                  "Primele corelații apar de obicei în 3–7 zile de înregistrare consistentă",
                  "Datele sunt criptate, securizate și nu sunt vândute nimănui",
                ]
              : [
                  "NutriAID Intolerances is an AI platform that identifies foods causing symptoms",
                  "Analyzes meal ↔ symptom correlations, including delayed reactions at 24–48h",
                  "Does not make medical diagnoses and does not replace a doctor or nutritionist",
                  "Works with approximations — no weighing needed",
                  "First correlations usually appear within 3–7 days of consistent logging",
                  "Data is encrypted, secured, and never sold to anyone",
                ]
            ).map((point) => (
              <li key={point} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-none text-emerald-500 dark:text-emerald-400" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-gradient-to-br from-emerald-700 to-cyan-700 p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            {isRo ? "Acum că știi ce este — hai să-l folosești." : "Now that you know what it is — let's use it."}
          </h2>
          <p className="text-emerald-100 mb-6">
            {isRo
              ? "Primele corelații apar de obicei în 3-7 zile de la înregistrare."
              : "First correlations usually appear within 3-7 days of registration."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition"
            >
              {isRo ? "Începe analiza intoleranțelor tale" : "Start your intolerance analysis"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/knowledge-hub"
              className="inline-flex items-center rounded-xl border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
            >
              {isRo ? "Înapoi la Knowledge Hub" : "Back to Knowledge Hub"}
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
