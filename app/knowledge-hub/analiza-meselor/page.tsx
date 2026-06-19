import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return {
    title: isRo
      ? "Analiza meselor cu AI — Knowledge Hub NutriAID"
      : "AI Meal Analysis — NutriAID Knowledge Hub",
    description: isRo
      ? "Cum analizează AI-ul NutriAID mesele tale: ce date contează, cum le introduci și ce informații extrage sistemul pentru a identifica intoleranțele."
      : "How NutriAID AI analyzes your meals: what data matters, how to log them, and what information the system extracts to identify intolerances.",
    alternates: { canonical: "/knowledge-hub/analiza-meselor", languages: { ro: "/knowledge-hub/analiza-meselor", en: "/knowledge-hub/analiza-meselor", "x-default": "/knowledge-hub/analiza-meselor" } },
    openGraph: {
      title: isRo ? "Analiza meselor cu AI — NutriAID" : "AI Meal Analysis — NutriAID",
      description: isRo
        ? "Fiecare masă introdusă devine o sursă de date pentru AI. Cum funcționează analiza meselor."
        : "Every logged meal becomes a data source for the AI. How meal analysis works.",
      url: "/knowledge-hub/analiza-meselor",
      locale: isRo ? "ro_RO" : "en_US",
    },
  };
}

export default function AnalizaMeselorPage() {
  const isRo = getServerLanguage() === "ro";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isRo ? "Analiza meselor cu AI" : "AI Meal Analysis",
    description: isRo
      ? "Cum AI-ul NutriAID analizează mesele introduse pentru a detecta intoleranțe și sensibilități alimentare."
      : "How NutriAID AI analyzes logged meals to detect food intolerances and sensitivities.",
    author: { "@type": "Organization", name: "NutriAID Intolerances" },
    publisher: { "@type": "Organization", name: "NutriAID Intolerances" },
    url: "/knowledge-hub/analiza-meselor",
    inLanguage: isRo ? "ro-RO" : "en-US",
  };

  const whatToLog = isRo
    ? ["Alimentele consumate (aproximativ, fără cântărire)", "Ora mesei", "Cantitatea aproximativă", "Combinațiile de alimente din aceeași masă", "Eventuale condimente, sosuri sau aditivi", "Dacă ai mâncat în afara casei (restaurant, fast-food)"]
    : ["Foods consumed (approximately, no weighing)", "Meal time", "Approximate quantity", "Food combinations within the same meal", "Any condiments, sauces, or additives", "If you ate out (restaurant, fast food)"];

  const whatAiDoes = isRo
    ? [
        { title: "Identifică ingredientele individuale", body: "Descompune fiecare masă în componente individuale pentru analiză detaliată." },
        { title: "Calculează frecvența consumului", body: "Urmărește cât de des apare fiecare aliment în dieta ta și corelează cu frecvența simptomelor." },
        { title: "Analizează combinațiile", body: "Detectează ce alimente sunt consumate împreună și dacă combinația declanșează simptome." },
        { title: "Observă contextul temporal", body: "Notează ora mesei față de ora simptomelor pentru a detecta reacții imediate vs. întârziate." },
        { title: "Construiește profilul tău alimentar", body: "Creează o hartă completă a alimentelor sigure, suspecte și problematice pentru corpul tău." },
      ]
    : [
        { title: "Identifies individual ingredients", body: "Breaks each meal into individual components for detailed analysis." },
        { title: "Calculates consumption frequency", body: "Tracks how often each food appears in your diet and correlates with symptom frequency." },
        { title: "Analyzes combinations", body: "Detects which foods are eaten together and whether the combination triggers symptoms." },
        { title: "Observes the temporal context", body: "Notes meal time vs. symptom time to detect immediate vs. delayed reactions." },
        { title: "Builds your food profile", body: "Creates a complete map of safe, suspected, and problematic foods for your body." },
      ];

  const faqItems = isRo
    ? [
        { q: "Ce trebuie sa introduc pentru fiecare masa?", a: "Alimentele principale, ora mesei, cantitatea aproximativa si combinatiile din aceeasi masa. Nu este nevoie de cantarire sau ingrediente exacte — aproximarile sunt suficiente." },
        { q: "Pot introduce mese din restaurant sau fast-food?", a: "Da. Notezi ce ai mancat la restaurant sau fast-food aproximativ. AI-ul lucreaza si cu descrieri generale, cum ar fi 'pizza cu mozzarella' sau 'burger cu cartofi prajiti'." },
        { q: "Ce se intampla daca uit sa introduc o masa?", a: "Nu este o problema. AI-ul functioneaza cu date incomplete si se adapteaza la lacunele din inregistrare fara a compromite calitatea analizei." },
        { q: "Cat de des trebuie sa introduc mesele pentru rezultate bune?", a: "Ideal, fiecare masa inclusiv gustarile. Primele corelatii apar dupa 3-7 zile de inregistrare consistenta. Consecventa conteaza mai mult decat precizia." },
        { q: "Trebuie sa introduc ingredientele dintr-un produs procesat?", a: "Daca le cunosti, da — ajuta la o analiza mai precisa. Daca nu, notezi numele produsului, iar AI-ul va analiza ce date are disponibile si va identifica tipare pe baza lor." },
      ]
    : [
        { q: "What should I log for each meal?", a: "The main foods, meal time, approximate quantity, and combinations within the same meal. No weighing or exact ingredients are needed — approximations are sufficient." },
        { q: "Can I log restaurant or fast-food meals?", a: "Yes. You note what you ate at a restaurant or fast-food approximately. The AI also works with general descriptions like 'pizza with mozzarella' or 'burger with fries'." },
        { q: "What happens if I forget to log a meal?", a: "That is not a problem. The AI works with incomplete data and adapts to logging gaps without compromising analysis quality." },
        { q: "How often should I log meals for good results?", a: "Ideally, every meal including snacks. First correlations appear after 3-7 days of consistent logging. Consistency matters more than precision." },
        { q: "Do I need to list ingredients from a processed product?", a: "If you know them, yes — it helps for more precise analysis. If not, just note the product name, and the AI will analyze available data and identify patterns based on it." },
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
            {isRo ? "Analiza meselor cu AI" : "AI Meal Analysis"}
          </h1>
          <p className="mt-5 text-xl text-slate-700 dark:text-slate-300 max-w-3xl">
            {isRo
              ? "Fiecare masă introdusă în NutriAID devine o sursă de date pentru AI. Cu cât notezi mai mult, cu atât sistemul devine mai precis."
              : "Every meal logged in NutriAID becomes a data source for the AI. The more you log, the more precise the system becomes."}
          </p>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "Ce trebuie să introduci pentru fiecare masă?" : "What should you log for each meal?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-5">
            {isRo
              ? "Nu ai nevoie de precizie perfectă. AI-ul funcționează bine și cu aproximații realiste:"
              : "You do not need perfect precision. The AI works well with realistic approximations:"}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
            {whatToLog.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-none text-emerald-500 dark:text-emerald-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Ce face AI-ul cu datele despre mese?" : "What does the AI do with meal data?"}
          </h2>
          <ul className="space-y-4 list-none p-0">
            {whatAiDoes.map((item) => (
              <li key={item.title} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/20 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-cyan-100 mb-3">
            {isRo ? "Cât de des trebuie să introduci mesele?" : "How often should you log meals?"}
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-3">
            {isRo
              ? "Ideal: fiecare masă, inclusiv gustările. Dacă uiți o masă, nu este o problemă — AI-ul se adaptează."
              : "Ideally: every meal, including snacks. If you miss a meal, that is not a problem — the AI adapts."}
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            {isRo
              ? "Primele corelații apar de obicei după 3-7 zile de înregistrare consistentă."
              : "First correlations usually appear after 3-7 days of consistent logging."}
          </p>
        </section>

        {/* Definitie */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "Ce înseamnă analiza meselor cu AI?" : "What does AI meal analysis mean?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            {isRo
              ? "Analiza meselor cu AI înseamnă procesarea automată a tuturor datelor despre ce mănânci — ingrediente, ore, combinații, frecvențe — pentru a detecta corelații cu simptomele raportate, imposibil de identificat manual."
              : "AI meal analysis means automatic processing of all data about what you eat — ingredients, times, combinations, frequencies — to detect correlations with reported symptoms, impossible to identify manually."}
          </p>
        </section>

        {/* Importanta */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "De ce este importantă analiza corectă a meselor?" : "Why is correct meal logging important?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            {isRo
              ? "Calitatea analizei AI depinde direct de calitatea datelor introduse. O masă notată cu ingredientele principale și ora ei oferă AI-ului materialul necesar pentru a detecta tipare. Cu cât mai multe mese sunt înregistrate, cu atât corelațiile devin mai precise și mai sigure."
              : "The quality of AI analysis depends directly on the quality of logged data. A meal noted with main ingredients and its time gives the AI the material needed to detect patterns. The more meals are logged, the more precise and reliable the correlations become."}
          </p>
        </section>

        {/* Exemplu */}
        <section className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6">
          <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-4">
            {isRo ? "Exemplu: logging eficient vs. ineficient" : "Example: efficient vs. inefficient logging"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 p-4">
              <p className="font-semibold text-rose-800 dark:text-rose-200 mb-2">{isRo ? "Ineficient:" : "Inefficient:"}</p>
              <p className="text-slate-700 dark:text-slate-300 text-sm italic">{isRo ? "\"Am mâncat ceva bun la prânz\"" : "\"Had something good for lunch\""}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">{isRo ? "Zero date utilizabile de AI" : "Zero AI-usable data"}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 p-4">
              <p className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">{isRo ? "Eficient:" : "Efficient:"}</p>
              <p className="text-slate-700 dark:text-slate-300 text-sm italic">{isRo ? "\"Prânz 13:00 — piept pui grătar, salată verde cu roșii, orez alb, dressing ulei măsline + lămâie\"" : "\"Lunch 1PM — grilled chicken breast, green salad with tomatoes, white rice, olive oil + lemon dressing\""}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">{isRo ? "Date complete pentru analiză AI" : "Complete data for AI analysis"}</p>
            </div>
          </div>
        </section>

        {/* Tabel comparativ */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Ce informații contează cel mai mult?" : "Which information matters most?"}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-600 text-white text-left">
                  <th className="px-4 py-3 font-semibold">{isRo ? "Element" : "Element"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Importanță" : "Importance"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Obligatoriu?" : "Required?"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Impact analiză" : "Analysis impact"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {(isRo
                  ? [
                      ["Alimentele principale", "Esențial", "Da", "Ridicat"],
                      ["Ora mesei", "Esențial", "Da", "Ridicat"],
                      ["Combinațiile din masă", "Important", "Da", "Ridicat"],
                      ["Cantitățile aproximative", "Util", "Nu", "Mediu"],
                      ["Metoda de gătire", "Util", "Nu", "Mediu"],
                      ["Condimente și aditivi", "Relevant", "Nu", "Mediu"],
                    ]
                  : [
                      ["Main foods", "Essential", "Yes", "High"],
                      ["Meal time", "Essential", "Yes", "High"],
                      ["Combinations within meal", "Important", "Yes", "High"],
                      ["Approximate quantities", "Useful", "No", "Medium"],
                      ["Cooking method", "Useful", "No", "Medium"],
                      ["Condiments and additives", "Relevant", "No", "Medium"],
                    ]
                ).map((row) => (
                  <tr key={row[0]} className="bg-white dark:bg-slate-900 even:bg-slate-50 even:dark:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row[0]}</td>
                    <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300">{row[1]}</td>
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
                  "Notezi mesele aproximativ — fără cântărire sau precizie perfectă",
                  "Elementele esențiale: alimentele, ora mesei, combinațiile",
                  "AI-ul descompune fiecare masă în componente și calculează frecvențe și corelații",
                  "Mesele din restaurant sau fast-food se introduc la fel — cu descrieri aproximative",
                  "Primele corelații apar după 3–7 zile de înregistrare consistentă",
                  "Cu cât mai multe date introduci, cu atât analiza este mai precisă",
                ]
              : [
                  "Log meals approximately — no weighing or perfect precision needed",
                  "Essential elements: foods, meal time, combinations",
                  "The AI breaks each meal into components and calculates frequencies and correlations",
                  "Restaurant or fast-food meals are logged the same way — with approximate descriptions",
                  "First correlations appear after 3–7 days of consistent logging",
                  "The more data you add, the more precise the analysis",
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
            {isRo ? "Începe să-ți analizezi mesele astăzi." : "Start analyzing your meals today."}
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
