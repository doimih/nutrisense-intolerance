import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Shield } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return {
    title: isRo
      ? "Siguranță alimentară cu AI — Knowledge Hub NutriAID"
      : "AI Food Safety — NutriAID Knowledge Hub",
    description: isRo
      ? "Ce înseamnă un aliment sigur în contextul intoleranțelor alimentare și cum identifică AI-ul NutriAID alimentele care nu îți provoacă simptome."
      : "What a safe food means in the context of food intolerances and how NutriAID AI identifies foods that do not trigger your symptoms.",
    alternates: { canonical: "/knowledge-hub/siguranta-alimentara" },
    openGraph: {
      title: isRo ? "Siguranță alimentară cu AI — NutriAID" : "AI Food Safety — NutriAID",
      description: isRo
        ? "Cum AI-ul NutriAID identifică alimentele sigure pentru corpul tău — nu reguli generice, ci date personale."
        : "How NutriAID AI identifies safe foods for your body — not generic rules, but personal data.",
      url: "/knowledge-hub/siguranta-alimentara",
      locale: isRo ? "ro_RO" : "en_US",
    },
  };
}

export default function SigurantaAlimentaraPage() {
  const isRo = getServerLanguage() === "ro";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isRo ? "Siguranță alimentară cu AI" : "AI Food Safety",
    description: isRo
      ? "Cum NutriAID identifică alimentele sigure pentru corpul tău pe baza corelațiilor dintre mese și simptome."
      : "How NutriAID identifies safe foods for your body based on correlations between meals and symptoms.",
    author: { "@type": "Organization", name: "NutriAID Intolerances" },
    publisher: { "@type": "Organization", name: "NutriAID Intolerances" },
    url: "/knowledge-hub/siguranta-alimentara",
    inLanguage: isRo ? "ro-RO" : "en-US",
  };

  const safeCriteria = isRo
    ? [
        { title: "Fără corelație cu simptomele", body: "Alimentul a fost consumat de mai multe ori fără ca simptome să apară după." },
        { title: "Combinații testate pozitiv", body: "Inclusiv combinat cu alte alimente consumate frecvent, nu a generat reacții." },
        { title: "Consistență în timp", body: "Sigur nu doar o dată, ci repetat — în zile diferite, la ore diferite, în contexte diferite." },
        { title: "Fără reacții întârziate", body: "Nici în fereastra de 24-48h după consum nu au apărut simptome corelabile." },
      ]
    : [
        { title: "No correlation with symptoms", body: "The food was consumed multiple times without symptoms appearing afterward." },
        { title: "Positively tested combinations", body: "Even combined with other frequently consumed foods, it generated no reactions." },
        { title: "Consistency over time", body: "Safe not just once, but repeatedly — on different days, at different times, in different contexts." },
        { title: "No delayed reactions", body: "Even in the 24-48h window after consumption, no correlated symptoms appeared." },
      ];

  const faqItems = isRo
    ? [
        { q: "Ce inseamna ca un aliment este sigur in NutriAID?", a: "Un aliment este considerat sigur daca datele tale arata ca, consumat in diferite contexte si combinatii, nu a declansat niciun simptom corelabil in fereastra de 24-48 ore dupa consum." },
        { q: "Un aliment sigur pentru mine poate fi problematic pentru altcineva?", a: "Da. Siguranta alimentara in NutriAID este complet personalizata. Lactoza poate fi sigura pentru tine dar problematica pentru altcineva, in functie de datele individuale ale fiecaruia." },
        { q: "Cat dureaza sa confirmi ca un aliment este sigur?", a: "AI-ul confirma siguranta unui aliment dupa ce acesta a fost consumat de mai multe ori in contexte diferite, fara corelatii cu simptome. Procesul dureaza de obicei 1-2 saptamani de inregistrare." },
        { q: "Poate un aliment sigur sa devina problematic in timp?", a: "Da. Toleranta alimentara poate evolua. NutriAID monitorizeaza continuu si poate actualiza statusul unui aliment daca apar noi date care indica o schimbare in reactia corpului tau." },
        { q: "Cum difera un aliment sigur de unul suspect?", a: "Un aliment sigur nu a generat corelatii cu simptome in datele tale. Un aliment suspect are corelatii posibile dar insuficient confirmate — necesita mai multe date pentru o concluzie certa." },
      ]
    : [
        { q: "What does it mean that a food is safe in NutriAID?", a: "A food is considered safe if your data shows that, consumed in various contexts and combinations, it has not triggered any correlated symptom in the 24-48 hour window after consumption." },
        { q: "Can a food that is safe for me be problematic for someone else?", a: "Yes. Food safety in NutriAID is completely personalized. Lactose may be safe for you but problematic for someone else, depending on each person's individual data." },
        { q: "How long does it take to confirm a food is safe?", a: "The AI confirms a food's safety after it has been consumed multiple times in different contexts without symptom correlations. The process usually takes 1-2 weeks of logging." },
        { q: "Can a safe food become problematic over time?", a: "Yes. Food tolerance can evolve. NutriAID continuously monitors and can update a food's status if new data appears indicating a change in your body's reaction." },
        { q: "How does a safe food differ from a suspected one?", a: "A safe food has not generated correlations with symptoms in your data. A suspected food has possible but insufficiently confirmed correlations — it requires more data for a definitive conclusion." },
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
            {isRo ? "Siguranță alimentară cu AI" : "AI Food Safety"}
          </h1>
          <p className="mt-5 text-xl text-slate-700 dark:text-slate-300 max-w-3xl">
            {isRo
              ? "Un aliment sigur nu este un aliment recomandat de un ghid general — este un aliment despre care datele corpului tău arată că nu îți provoacă simptome."
              : "A safe food is not a food recommended by a general guide — it is a food that your body's data shows does not trigger symptoms for you."}
          </p>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "Ce înseamnă un aliment sigur pentru NutriAID?" : "What does a safe food mean to NutriAID?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            {isRo
              ? "NutriAID nu foloseste liste predefinite de alimente sanatoase sau periculoase. Un aliment este considerat sigur pentru tine daca datele tale personale arata ca nu declanseaza reactii."
              : "NutriAID does not use predefined lists of 'healthy' or 'dangerous' foods. A food is considered safe for you if your personal data shows it does not trigger reactions."}
          </p>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            {isRo
              ? "Acesta este un avantaj major față de abordările generice: lactoza poate fi sigură pentru tine dar problematică pentru altcineva, și invers."
              : "This is a major advantage over generic approaches: lactose may be safe for you but problematic for someone else, and vice versa."}
          </p>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Cum determină AI-ul că un aliment este sigur?" : "How does the AI determine a food is safe?"}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0">
            {safeCriteria.map((item) => (
              <li key={item.title} className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 flex-none text-emerald-600 dark:text-emerald-400" />
                  <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "Beneficiile identificării alimentelor sigure" : "Benefits of identifying safe foods"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-5">
            {isRo
              ? "Identificarea alimentelor sigure este la fel de importantă ca identificarea celor problematice:"
              : "Identifying safe foods is just as important as identifying problematic ones:"}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
            {(isRo
              ? [
                  "Reduci anxietatea legată de mâncare",
                  "Poți construi mese complete fără frică",
                  "Eviți restricțiile inutile",
                  "Menții o nutriție echilibrată",
                  "Îți recapeți plăcerea de a mânca",
                  "Ai o bază solidă pentru experimentarea alimentelor noi",
                ]
              : [
                  "Reduces food-related anxiety",
                  "You can build complete meals without fear",
                  "Avoids unnecessary restrictions",
                  "Maintains balanced nutrition",
                  "Regains the pleasure of eating",
                  "Provides a solid base for experimenting with new foods",
                ]
            ).map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-none text-emerald-500 dark:text-emerald-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Pasi concreti */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Cum lucrezi cu lista de alimente sigure?" : "How do you work with the safe foods list?"}
          </h2>
          <ol className="space-y-3 list-none p-0">
            {(isRo
              ? [
                  { n: "1", t: "Construiești baza de date", b: "Înregistrezi mese și simptome zilnic. AI-ul colectează datele și începe analiza." },
                  { n: "2", t: "Identifici alimentele sigure", b: "După 3–7 zile, AI-ul confirmă alimentele consumate repetat fără corelații cu simptome." },
                  { n: "3", t: "Construiești mese pe baza listei", b: "Folosești alimentele sigure ca bază — mănânci liber din ele, fără restricții." },
                  { n: "4", t: "Testezi alimentele suspecte", b: "Introduci alimentele suspecte unul câte unul, monitorizând reacțiile cu atenție." },
                  { n: "5", t: "Extinzi lista în timp", b: "Pe măsură ce adaugi date, lista de alimente sigure crește și devine mai precisă." },
                ]
              : [
                  { n: "1", t: "Build the database", b: "Log meals and symptoms daily. The AI collects the data and starts analysis." },
                  { n: "2", t: "Identify safe foods", b: "After 3–7 days, the AI confirms foods consumed repeatedly without symptom correlations." },
                  { n: "3", t: "Build meals from the list", b: "Use safe foods as a base — eat freely from them without restrictions." },
                  { n: "4", t: "Test suspected foods", b: "Introduce suspected foods one by one, carefully monitoring reactions." },
                  { n: "5", t: "Expand the list over time", b: "As you add data, the safe foods list grows and becomes more precise." },
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

        {/* Exemplu */}
        <section className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6">
          <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-3">
            {isRo ? "Exemplu: același aliment, statusuri diferite" : "Example: same food, different statuses"}
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            {isRo
              ? "Ion consumă avocado de 4 ori în 2 săptămâni — nicio reacție. AI-ul marchează avocado ca sigur pentru Ion. Andrei consumă avocado de 4 ori — balonare la 3 ore după fiecare. AI-ul marchează avocado ca de evitat pentru Andrei. Același aliment, statusuri opuse — pentru că analiza este personalizată, nu generică."
              : "Ion eats avocado 4 times in 2 weeks — no reaction. The AI marks avocado as safe for Ion. Andrei eats avocado 4 times — bloating 3 hours after each time. The AI marks avocado as to-avoid for Andrei. Same food, opposite statuses — because the analysis is personalized, not generic."}
          </p>
        </section>

        {/* Tabel comparativ */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Statusurile alimentelor în NutriAID" : "Food statuses in NutriAID"}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-600 text-white text-left">
                  <th className="px-4 py-3 font-semibold">{isRo ? "Status" : "Status"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Definiție" : "Definition"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Corelație simptome" : "Symptom correlation"}</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Recomandare" : "Recommendation"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {(isRo
                  ? [
                      ["Sigur", "Consumat repetat fără reacții", "Niciuna confirmată", "Consumă liber"],
                      ["Suspect", "Corelație posibilă, neconfirmată", "Posibilă", "Testează cu atenție"],
                      ["De evitat", "Corelație confirmată în date", "Confirmată", "Evită sau elimină"],
                      ["Neconfirmat", "Date insuficiente", "Necunoscută", "Adaugă mai multe mese"],
                    ]
                  : [
                      ["Safe", "Consumed repeatedly without reactions", "None confirmed", "Eat freely"],
                      ["Suspected", "Possible, unconfirmed correlation", "Possible", "Test carefully"],
                      ["To avoid", "Confirmed correlation in data", "Confirmed", "Avoid or eliminate"],
                      ["Unconfirmed", "Insufficient data", "Unknown", "Add more meals"],
                    ]
                ).map((row) => (
                  <tr key={row[0]} className="bg-white dark:bg-slate-900 even:bg-slate-50 even:dark:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row[0]}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row[1]}</td>
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
                  "Un aliment este sigur numai dacă datele tale confirmă că nu declanșează simptome",
                  "Siguranța e complet personalizată — un aliment sigur pentru tine poate fi problematic pentru altcineva",
                  "AI-ul confirmă siguranța după consum repetat în contexte diferite (1–2 săptămâni)",
                  "Identificarea alimentelor sigure e la fel de importantă ca identificarea celor problematice",
                  "Toleranța alimentară poate evolua — NutriAID monitorizează continuu și actualizează statusurile",
                ]
              : [
                  "A food is safe only if your data confirms it does not trigger symptoms",
                  "Safety is completely personalized — a safe food for you may be problematic for someone else",
                  "The AI confirms safety after repeated consumption in different contexts (1–2 weeks)",
                  "Identifying safe foods is just as important as identifying problematic ones",
                  "Food tolerance can evolve — NutriAID continuously monitors and updates statuses",
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
            {isRo ? "Descoperă ce poți mânca fără frică." : "Discover what you can eat without fear."}
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
