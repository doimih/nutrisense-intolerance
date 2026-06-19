import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return {
    title: isRo
      ? "Plan alimentar AI personalizat — Knowledge Hub NutriAID"
      : "Personalized AI Food Plan — NutriAID Knowledge Hub",
    description: isRo
      ? "Cum generează NutriAID planuri alimentare personalizate bazate pe istoricul tău de simptome și alimente. Nu diete generice — ghidare adaptată corpului tău."
      : "How NutriAID generates personalized food plans based on your symptom and meal history. Not generic diets — guidance adapted to your body.",
    alternates: { canonical: "/knowledge-hub/plan-alimentar-ai", languages: { ro: "/knowledge-hub/plan-alimentar-ai", en: "/knowledge-hub/plan-alimentar-ai", "x-default": "/knowledge-hub/plan-alimentar-ai" } },
    openGraph: {
      title: isRo ? "Plan alimentar AI personalizat — NutriAID" : "Personalized AI Food Plan — NutriAID",
      description: isRo
        ? "Planul tău alimentar generat de AI pe baza datelor reale despre corpul tău."
        : "Your AI-generated food plan based on real data about your body.",
      url: "/knowledge-hub/plan-alimentar-ai",
      locale: isRo ? "ro_RO" : "en_US",
    },
  };
}

export default function PlanAlimentarAiPage() {
  const isRo = getServerLanguage() === "ro";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isRo ? "Plan alimentar AI personalizat" : "Personalized AI Food Plan",
    description: isRo
      ? "NutriAID generează planuri alimentare personalizate bazate pe corelații reale dintre mese și simptome."
      : "NutriAID generates personalized food plans based on real correlations between meals and symptoms.",
    author: { "@type": "Organization", name: "NutriAID Intolerances" },
    publisher: { "@type": "Organization", name: "NutriAID Intolerances" },
    url: "/knowledge-hub/plan-alimentar-ai",
    inLanguage: isRo ? "ro-RO" : "en-US",
  };

  const includes = isRo
    ? ["Lista alimentelor sigure identificate pentru corpul tău", "Lista alimentelor suspecte de evitat sau testat", "Combinații alimentare sigure recomandate", "Combinații de evitat (chiar dacă ingredientele singure nu sunt problematice)", "Sugestii de mese bazate pe preferințele tale și toleranțele identificate", "Actualizări zilnice pe măsură ce AI-ul acumulează mai multe date"]
    : ["List of safe foods identified for your body", "List of suspected foods to avoid or test", "Recommended safe food combinations", "Combinations to avoid (even if individual ingredients are not problematic)", "Meal suggestions based on your preferences and identified tolerances", "Daily updates as the AI accumulates more data"];

  const notIncludes = isRo
    ? ["Nu este o dietă de slăbire", "Nu impune calorii sau macronutrienți", "Nu elimină grupuri întregi de alimente fără dovezi", "Nu este static — se actualizează constant", "Nu înlocuiește recomandările medicale sau ale nutriționistului"]
    : ["It is not a weight loss diet", "Does not impose calories or macronutrients", "Does not eliminate entire food groups without evidence", "It is not static — it updates constantly", "Does not replace medical or nutritionist recommendations"];

  const faqItems = isRo
    ? [
        { q: "Cat dureaza pana sa primesc primul plan alimentar?", a: "Primele recomandari apar in 3-7 zile de la inregistrare consistenta a meselor si simptomelor. Cu cat adaugi mai multe date, cu atat planul devine mai precis si mai adaptat corpului tau." },
        { q: "Planul alimentar se schimba in timp?", a: "Da. Planul se actualizeaza zilnic pe masura ce AI-ul acumuleaza noi date si detecteaza noi tipare sau confirma corelatii existente. Nu este un plan static." },
        { q: "Planul alimentar AI inlocuieste nutritionistul?", a: "Nu. Planul AI este un instrument de orientare personalizat, bazat pe datele tale. Nu inlocuieste recomandarile unui specialist in nutritie sau consultul medical." },
        { q: "Ce fac daca planul recomanda sa evit un aliment preferat?", a: "Poti testa deliberat alimentul respectiv, notand mesele si simptomele, pentru a confirma sau infirma corelatia. AI-ul nu impune nimic — iti ofera date si tu decizi." },
        { q: "Planul este util si daca nu am simptome grave?", a: "Da. Planul este util si pentru preventie sau pentru identificarea sensibilitatilor subclinice — simptome usoare pe care le-ai putea ignora altfel, dar care afecteaza calitatea vietii." },
      ]
    : [
        { q: "How long until I receive my first food plan?", a: "First recommendations appear within 3-7 days of consistent logging. The more data you add, the more precise and adapted to your body the plan becomes." },
        { q: "Does the food plan change over time?", a: "Yes. The plan updates daily as the AI accumulates new data and detects new patterns or confirms existing correlations. It is not a static plan." },
        { q: "Does the AI food plan replace a nutritionist?", a: "No. The AI plan is a personalized guidance tool based on your data. It does not replace the recommendations of a nutrition specialist or medical consultation." },
        { q: "What if the plan recommends avoiding a favorite food?", a: "You can deliberately test that food by logging meals and symptoms, to confirm or disprove the correlation. The AI imposes nothing — it gives you data and you decide." },
        { q: "Is the plan useful even without severe symptoms?", a: "Yes. The plan is also useful for prevention or identifying subclinical sensitivities — mild symptoms you might otherwise ignore but that affect quality of life." },
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
            {isRo ? "Plan alimentar AI personalizat" : "Personalized AI Food Plan"}
          </h1>
          <p className="mt-5 text-xl text-slate-700 dark:text-slate-300 max-w-3xl">
            {isRo
              ? "Nu o dietă generică. Un plan generat exclusiv pentru corpul tău, bazat pe corelațiile reale dintre mesele tale și simptomele raportate."
              : "Not a generic diet. A plan generated exclusively for your body, based on real correlations between your meals and reported symptoms."}
          </p>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "Cum este generat planul tău alimentar?" : "How is your food plan generated?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            {isRo
              ? "Planul alimentar nu este creat manual sau pe baza unor template-uri. AI-ul NutriAID îl construiește dinamic, pe baza datelor tale reale:"
              : "The food plan is not created manually or based on templates. NutriAID AI builds it dynamically, based on your real data:"}
          </p>
          <ol className="space-y-3 list-none p-0">
            {(isRo
              ? [
                  "Analizează toate mesele introduse și simptomele raportate",
                  "Identifică alimentele și combinațiile care corelează cu simptomele",
                  "Separă alimentele sigure de cele suspecte pe baza probabilităților calculate",
                  "Generează recomandări adaptate preferințelor tale și toleranțelor identificate",
                  "Actualizează planul zilnic pe măsură ce adaugi noi date",
                ]
              : [
                  "Analyzes all logged meals and reported symptoms",
                  "Identifies foods and combinations that correlate with symptoms",
                  "Separates safe foods from suspected ones based on calculated probabilities",
                  "Generates recommendations adapted to your preferences and identified tolerances",
                  "Updates the plan daily as you add new data",
                ]
            ).map((step, i) => (
              <li key={step} className="flex items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white text-xs font-bold flex-none">{i + 1}</span>
                <span className="text-slate-700 dark:text-slate-200">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Ce conține planul alimentar AI?" : "What does the AI food plan include?"}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6">
              <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-4">
                {isRo ? "Ce include:" : "What it includes:"}
              </h3>
              <ul className="space-y-2 list-none p-0">
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-slate-800 dark:text-slate-200 text-sm">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-none text-emerald-600 dark:text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                {isRo ? "Ce nu este:" : "What it is not:"}
              </h3>
              <ul className="space-y-2 list-none p-0">
                {notIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 text-sm">
                    <XCircle className="h-4 w-4 mt-0.5 flex-none text-slate-400 dark:text-slate-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6">
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-3">
            {isRo ? "Cât durează până la primul plan personalizat?" : "How long until the first personalized plan?"}
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            {isRo
              ? "Primele recomandări apar în 3-7 zile de la înregistrare consistentă. Cu cât adaugi mai multe date, cu atât planul devine mai precis și mai adaptat corpului tău specific."
              : "First recommendations appear within 3-7 days of consistent logging. The more data you add, the more precise and adapted to your specific body the plan becomes."}
          </p>
        </section>

        {/* Definitie */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "Ce este un plan alimentar AI personalizat?" : "What is a personalized AI food plan?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            {isRo
              ? "Un plan alimentar AI personalizat este o ghidare alimentară generată dinamic de AI exclusiv pe baza datelor tale individuale de mese și simptome — nu pe baza unor template-uri generice sau recomandări standard. Se actualizează zilnic și reflectă starea reală a corpului tău."
              : "A personalized AI food plan is dietary guidance dynamically generated by AI exclusively based on your individual meal and symptom data — not on generic templates or standard recommendations. It updates daily and reflects the real state of your body."}
          </p>
        </section>

        {/* Importanta */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "De ce este important un plan alimentar personalizat?" : "Why is a personalized food plan important?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            {isRo
              ? "Dietele generice nu funcționează pentru intoleranțe alimentare pentru că intoleranțele sunt individuale. Ce face rău altcuiva poate fi complet sigur pentru tine. Un plan bazat pe datele tale specifice elimină restricțiile inutile și îți permite să mănânci cât mai variat posibil, evitând doar ce corpul tău demonstrează că nu tolerează."
              : "Generic diets do not work for food intolerances because intolerances are individual. What harms someone else may be completely safe for you. A plan based on your specific data eliminates unnecessary restrictions and allows you to eat as varied as possible, avoiding only what your body demonstrates it cannot tolerate."}
          </p>
        </section>

        {/* Exemplu */}
        <section className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6">
          <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-3">
            {isRo ? "Exemplu concret de plan AI" : "Concrete AI plan example"}
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            {isRo
              ? "Corina înregistrează mese și simptome 5 zile. AI-ul generează planul ei: 38 de alimente confirmate sigure (inclusiv lactoză — contrar temerii inițiale), 3 alimente de evitat (grâu, roșii cherry, vin roșu — corelații puternice cu migrena), combinații sigure recomandate pentru mic dejun, prânz și cină. Planul se actualizează a doua zi cu datele noi."
              : "Corina logs meals and symptoms for 5 days. The AI generates her plan: 38 foods confirmed safe (including lactose — contrary to her initial fear), 3 foods to avoid (wheat, cherry tomatoes, red wine — strong migraine correlations), safe combinations recommended for breakfast, lunch, and dinner. The plan updates the next day with new data."}
          </p>
        </section>

        {/* Tabel comparativ */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Plan AI NutriAID vs. diete populare" : "NutriAID AI plan vs. popular diets"}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-600 text-white text-left">
                  <th className="px-4 py-3 font-semibold">{isRo ? "Criteriu" : "Criterion"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Plan AI NutriAID" : "NutriAID AI Plan"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Dietă generică" : "Generic diet"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Dietă eliminare" : "Elimination diet"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {(isRo
                  ? [
                      ["Bazat pe datele tale", "✅ Da", "❌ Nu", "❌ Nu"],
                      ["Se actualizează dinamic", "✅ Zilnic", "❌ Nu", "❌ Nu"],
                      ["Elimină fără dovezi", "Nu", "Uneori", "Da"],
                      ["Personalizat la corpul tău", "✅ Da", "❌ Nu", "❌ Nu"],
                      ["Timp până la rezultate", "3–7 zile", "Variabil", "Săptămâni"],
                      ["Restricții inutile", "Minime", "Posibile", "Frecvente"],
                    ]
                  : [
                      ["Based on your data", "✅ Yes", "❌ No", "❌ No"],
                      ["Updates dynamically", "✅ Daily", "❌ No", "❌ No"],
                      ["Eliminates without evidence", "No", "Sometimes", "Yes"],
                      ["Personalized to your body", "✅ Yes", "❌ No", "❌ No"],
                      ["Time to results", "3–7 days", "Variable", "Weeks"],
                      ["Unnecessary restrictions", "Minimal", "Possible", "Frequent"],
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
                  "Planul AI se bazează exclusiv pe datele tale personale de mese și simptome",
                  "Conține: alimente sigure, suspecte, combinații de evitat și sugestii de mese",
                  "Se actualizează zilnic pe măsură ce apar date noi",
                  "Nu este o dietă de slăbire și nu impune calorii sau restricții fără dovezi",
                  "Primele recomandări apar în 3–7 zile de înregistrare consistentă",
                  "Nu înlocuiește recomandările unui specialist în nutriție",
                ]
              : [
                  "The AI plan is based exclusively on your personal meal and symptom data",
                  "Contains: safe foods, suspected foods, combinations to avoid, and meal suggestions",
                  "Updates daily as new data is added",
                  "It is not a weight loss diet and does not impose calories or unsupported restrictions",
                  "First recommendations appear within 3–7 days of consistent logging",
                  "Does not replace the recommendations of a nutrition specialist",
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
            {isRo ? "Planul tău alimentar personalizat te așteaptă." : "Your personalized food plan is waiting."}
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
