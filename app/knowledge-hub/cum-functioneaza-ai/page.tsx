import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Calculator, CheckCircle2, Database, Eye, GraduationCap, Layers } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return {
    title: isRo
      ? "Cum funcționează AI-ul NutriAID? — Knowledge Hub"
      : "How does NutriAID AI work? — Knowledge Hub",
    description: isRo
      ? "Explicație detaliată despre cum AI-ul NutriAID analizează mesele, detectează tipare, calculează corelații și generează recomandări personalizate."
      : "Detailed explanation of how NutriAID AI analyzes meals, detects patterns, calculates correlations, and generates personalized recommendations.",
    alternates: { canonical: "/knowledge-hub/cum-functioneaza-ai", languages: { ro: "/knowledge-hub/cum-functioneaza-ai", en: "/knowledge-hub/cum-functioneaza-ai", "x-default": "/knowledge-hub/cum-functioneaza-ai" } },
    openGraph: {
      title: isRo ? "Cum funcționează AI-ul NutriAID?" : "How does NutriAID AI work?",
      description: isRo
        ? "De la introducerea meselor la identificarea intoleranțelor — cum funcționează AI-ul pas cu pas."
        : "From logging meals to identifying intolerances — how the AI works step by step.",
      url: "/knowledge-hub/cum-functioneaza-ai",
      locale: isRo ? "ro_RO" : "en_US",
    },
  };
}

export default function CumFunctioneazaAiPage() {
  const isRo = getServerLanguage() === "ro";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isRo ? "Cum funcționează AI-ul NutriAID?" : "How does NutriAID AI work?",
    description: isRo
      ? "AI-ul NutriAID analizează corelații complexe între alimente și simptome pe care niciun om nu le poate urmări manual."
      : "NutriAID AI analyzes complex correlations between foods and symptoms that no human can track manually.",
    author: { "@type": "Organization", name: "NutriAID Intolerances" },
    publisher: { "@type": "Organization", name: "NutriAID Intolerances" },
    url: "/knowledge-hub/cum-functioneaza-ai",
    inLanguage: isRo ? "ro-RO" : "en-US",
  };

  const faqItems = isRo
    ? [
        { q: "Cum detectează AI-ul intoleranțele alimentare?", a: "AI-ul calculează corelații statistice între alimentele consumate și simptomele raportate, identificând frecvențe, intensități și tipare recurente — inclusiv reacții la combinații de alimente, nu doar la ingrediente individuale." },
        { q: "De câte date are nevoie AI-ul pentru primele corelații?", a: "Primele corelații apar după aproximativ 3–7 zile de înregistrare consistentă, adică în jur de 20–30 de intrări combinate de mese și simptome." },
        { q: "Poate AI-ul detecta reacții care apar la 24–48 de ore după masă?", a: "Da. AI-ul analizează fereastra temporală dintre mese și simptome, detectând inclusiv reacțiile întârziate — ceea ce face identificarea manuală practic imposibilă." },
        { q: "AI-ul devine mai precis pe măsură ce introduc mai multe date?", a: "Da. Cu fiecare masă și simptom introdus, modelul devine mai precis și mai adaptat corpului tău specific. Precizia crește proporțional cu volumul de date." },
        { q: "Ce se întâmplă dacă sar o masă sau uit să notez un simptom?", a: "Nu este o problemă. AI-ul se adaptează la date incomplete și rămâne funcțional chiar dacă nu introduci absolut fiecare masă sau simptom." },
      ]
    : [
        { q: "How does the AI detect food intolerances?", a: "The AI calculates statistical correlations between consumed foods and reported symptoms, identifying frequencies, intensities, and recurring patterns — including reactions to food combinations, not just individual ingredients." },
        { q: "How much data does the AI need for the first correlations?", a: "The first correlations appear after approximately 3–7 days of consistent logging, meaning around 20–30 combined meal and symptom entries." },
        { q: "Can the AI detect reactions that occur 24–48 hours after a meal?", a: "Yes. The AI analyzes the time window between meals and symptoms, detecting even delayed reactions — which makes manual identification practically impossible." },
        { q: "Does the AI become more accurate as I add more data?", a: "Yes. With each meal and symptom logged, the model becomes more precise and better adapted to your specific body. Accuracy increases proportionally with data volume." },
        { q: "What happens if I skip a meal or forget to log a symptom?", a: "That is not a problem. The AI adapts to incomplete data and remains functional even if you do not log every single meal or symptom." },
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

  const capabilities = [
    { icon: Layers, titleRo: "Analizează sute de variabile simultan", titleEn: "Analyzes hundreds of variables simultaneously", bodyRo: "Ce ai mâncat, când, cât, cu ce ai combinat, ce simptome ai avut, la ce intensitate și după cât timp.", bodyEn: "What you ate, when, how much, what you combined it with, what symptoms you had, at what intensity, and after how long." },
    { icon: Eye, titleRo: "Observă tipare ascunse", titleEn: "Observes hidden patterns", bodyRo: "Reacții întârziate la 24-48h, combinații problematice, sensibilități contextuale (stres, somn, hormoni).", bodyEn: "Delayed reactions at 24-48h, problematic combinations, contextual sensitivities (stress, sleep, hormones)." },
    { icon: Calculator, titleRo: "Calculează, nu ghicește", titleEn: "Calculates, does not guess", bodyRo: "Corelații statistice, frecvențe, intensități, probabilități — totul bazat pe datele tale reale.", bodyEn: "Statistical correlations, frequencies, intensities, probabilities — all based on your real data." },
    { icon: GraduationCap, titleRo: "Învață din datele tale", titleEn: "Learns from your data", bodyRo: "Cu fiecare masă și simptom introdus, modelul devine mai precis și mai adaptat corpului tău.", bodyEn: "With every meal and symptom logged, the model becomes more precise and better adapted to your body." },
    { icon: Database, titleRo: "Nu uită nimic", titleEn: "Forgets nothing", bodyRo: "Stochează și procesează întregul tău istoric — reacțiile din săptămâna trecută sunt la fel de relevante ca cele de azi.", bodyEn: "Stores and processes your entire history — reactions from last week are just as relevant as today's." },
    { icon: Brain, titleRo: "Personalizare reală", titleEn: "Real personalization", bodyRo: "Recomandările sunt generate exclusiv pentru corpul tău, nu pentru tipul tău de problemă.", bodyEn: "Recommendations are generated exclusively for your body, not for your type of problem." },
  ];

  const steps = isRo
    ? [
        { n: "1", title: "Introduci mesele", body: "Notezi ce ai mâncat — fără cântărire, fără precizie perfectă. AI-ul lucrează cu aproximații." },
        { n: "2", title: "Notezi simptomele", body: "Orice reacție: balonare, durere, oboseală, migrenă, reflux, erupții. Și momentul apariției." },
        { n: "3", title: "AI-ul detectează tipare", body: "Sistemul corelează alimentele cu simptomele, identifică frecvențe și intensități." },
        { n: "4", title: "Primești corelații clare", body: "Alimente suspecte, combinații problematice, alimente sigure — toate explicate logic." },
        { n: "5", title: "Urmezi ghidarea personalizată", body: "Recomandări adaptate corpului tău, actualizate zilnic pe baza noilor date." },
      ]
    : [
        { n: "1", title: "You log your meals", body: "Note what you ate — no weighing, no perfect precision. The AI works with approximations." },
        { n: "2", title: "You log your symptoms", body: "Any reaction: bloating, pain, fatigue, migraine, reflux, rashes. And when they appeared." },
        { n: "3", title: "AI detects patterns", body: "The system correlates foods with symptoms, identifies frequencies and intensities." },
        { n: "4", title: "You receive clear correlations", body: "Suspected foods, problematic combinations, safe foods — all explained logically." },
        { n: "5", title: "You follow personalized guidance", body: "Recommendations adapted to your body, updated daily based on new data." },
      ];

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
            {isRo ? "Cum funcționează AI-ul NutriAID?" : "How does NutriAID AI work?"}
          </h1>
          <p className="mt-5 text-xl text-slate-700 dark:text-slate-300 max-w-3xl">
            {isRo
              ? "AI-ul nu ghicește. Calculează corelații reale între ce mănânci și cum te simți — inclusiv reacții întârziate și combinații pe care niciun om nu le poate urmări manual."
              : "The AI does not guess. It calculates real correlations between what you eat and how you feel — including delayed reactions and combinations no human can track manually."}
          </p>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">

        {/* De ce e nevoie de AI */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "De ce este nevoie de AI pentru intoleranțe alimentare?" : "Why is AI needed for food intolerances?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            {isRo
              ? "Intoleranțele alimentare sunt dificil de identificat manual din cauza unor factori multipli:"
              : "Food intolerances are difficult to identify manually due to multiple factors:"}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
            {(isRo
              ? [
                  "Simptomele pot apărea la 24-48h după masă",
                  "Reacțiile sunt declanșate de combinații, nu de alimente singure",
                  "Corpul reacționează diferit în funcție de stres, somn sau hormoni",
                  "Nu există analize medicale standard care să detecteze toate sensibilitățile",
                  "Memoria umană nu poate urmări sute de mese și simptome",
                  "Corelațiile subtile sunt imposibil de observat fără date sistematice",
                ]
              : [
                  "Symptoms can appear 24-48h after a meal",
                  "Reactions are triggered by combinations, not individual foods",
                  "The body reacts differently depending on stress, sleep, or hormones",
                  "No standard medical tests detect all sensitivities",
                  "Human memory cannot track hundreds of meals and symptoms",
                  "Subtle correlations are impossible to observe without systematic data",
                ]
            ).map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-none text-emerald-500 dark:text-emerald-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Capacitati AI */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Ce poate face AI-ul NutriAID?" : "What can NutriAID AI do?"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div key={cap.titleRo} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="mb-3 inline-flex rounded-lg bg-emerald-100 dark:bg-emerald-400/10 p-2 text-emerald-700 dark:text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {isRo ? cap.titleRo : cap.titleEn}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {isRo ? cap.bodyRo : cap.bodyEn}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cum functioneaza pas cu pas */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Procesul pas cu pas" : "The step-by-step process"}
          </h2>
          <ol className="space-y-4 list-none p-0">
            {steps.map((step) => (
              <li key={step.n} className="flex items-start gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white text-sm font-bold flex-none">
                  {step.n}
                </span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{step.title}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Ce nu face AI-ul */}
        <section className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6">
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-4">
            {isRo ? "Important: ce nu face AI-ul NutriAID" : "Important: what NutriAID AI does not do"}
          </h2>
          <ul className="space-y-2 list-none p-0">
            {(isRo
              ? [
                  "Nu pune diagnostice medicale",
                  "Nu prescrie tratamente sau medicamente",
                  "Nu înlocuiește consultul medical",
                  "Nu ia decizii pentru tine",
                  "Nu se bazează pe opinii sau ghiceli",
                ]
              : [
                  "Does not make medical diagnoses",
                  "Does not prescribe treatments or medications",
                  "Does not replace medical consultations",
                  "Does not make decisions for you",
                  "Does not rely on opinions or guesses",
                ]
            ).map((item) => (
              <li key={item} className="text-amber-900 dark:text-amber-100 font-medium">
                → {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Exemplu */}
        <section className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6">
          <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-3">
            {isRo ? "Exemplu concret: cum detectează AI-ul o corelație" : "Concrete example: how the AI detects a correlation"}
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            {isRo
              ? "Andrei, 28 de ani, avea migrene recurente luni dimineața. Nu le corela cu alimentația — le atribuia stresului de weekend. AI-ul NutriAID a detectat, pe baza datelor din 10 zile, că migrenele apăreau la 14–16 ore după consumul de brânzeturi maturate duminica seara. Fără AI, această conexiune ar fi fost practic imposibil de identificat manual prin simplă memorie."
              : "Andrei, 28, had recurring migraines on Monday mornings. He did not associate them with food — he attributed them to weekend stress. NutriAID AI detected, based on 10 days of data, that the migraines appeared 14–16 hours after consuming aged cheeses on Sunday evenings. Without AI, this connection would have been practically impossible to identify manually through simple memory."}
          </p>
        </section>

        {/* Tabel comparativ */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "AI NutriAID vs. metode tradiționale" : "NutriAID AI vs. traditional methods"}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-600 text-white text-left">
                  <th className="px-4 py-3 font-semibold">{isRo ? "Criteriu" : "Criterion"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "AI NutriAID" : "NutriAID AI"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Auto-monitorizare" : "Self-monitoring"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Eliminare aleatorie" : "Random elimination"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {(isRo
                  ? [
                      ["Variabile analizate simultan", "Sute", "2–3", "1"],
                      ["Reacții întârziate (24–48h)", "✅ Detectate", "❌ Nu", "❌ Nu"],
                      ["Combinații alimentare", "✅ Analizate", "❌ Nu", "❌ Nu"],
                      ["Timp necesar", "3–7 zile", "Luni", "Luni"],
                      ["Precizie", "Statistică", "Subiectivă", "Aleatorie"],
                      ["Memorie necesară", "Zero", "Totală", "Totală"],
                    ]
                  : [
                      ["Variables analyzed simultaneously", "Hundreds", "2–3", "1"],
                      ["Delayed reactions (24–48h)", "✅ Detected", "❌ No", "❌ No"],
                      ["Food combinations", "✅ Analyzed", "❌ No", "❌ No"],
                      ["Time required", "3–7 days", "Months", "Months"],
                      ["Precision", "Statistical", "Subjective", "Random"],
                      ["Memory required", "None", "Complete", "Complete"],
                    ]
                ).map((row) => (
                  <tr key={row[0]} className="bg-white dark:bg-slate-900 even:bg-slate-50 even:dark:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row[0]}</td>
                    <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300 font-medium">{row[1]}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row[2]}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row[3]}</td>
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
                  "AI-ul NutriAID analizează sute de variabile simultan: mese, combinații, ore, simptome, intensități",
                  "Detectează reacții întârziate la 24–48h — imposibil de urmărit manual prin memorie",
                  "Calculează corelații statistice, nu ghiceli — bazat exclusiv pe datele tale reale",
                  "Cu fiecare intrare nouă, modelul devine mai precis și mai personalizat",
                  "Nu pune diagnostice — oferă corelații clare și recomandări bazate pe date",
                ]
              : [
                  "NutriAID AI analyzes hundreds of variables simultaneously: meals, combinations, times, symptoms, intensities",
                  "Detects delayed reactions at 24–48h — impossible to track manually from memory",
                  "Calculates statistical correlations, not guesses — based exclusively on your real data",
                  "With each new entry, the model becomes more precise and personalized",
                  "Does not make diagnoses — provides clear correlations and data-based recommendations",
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
          <h2 className="text-2xl font-extrabold text-white mb-3">
            {isRo ? "Testează AI-ul pe datele tale reale." : "Test the AI on your real data."}
          </h2>
          <p className="text-emerald-100 mb-6">
            {isRo ? "Primele corelații apar în 3-7 zile." : "First correlations appear in 3-7 days."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition"
            >
              {isRo ? "Începe analiza" : "Start analysis"}
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
