import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Lock, ShieldCheck, XCircle } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return {
    title: isRo
      ? "GDPR & Confidențialitate — Knowledge Hub NutriAID"
      : "GDPR & Privacy — NutriAID Knowledge Hub",
    description: isRo
      ? "Cum sunt protejate datele tale în NutriAID Intolerances, drepturile tale GDPR, ce date colectăm și cum le folosim."
      : "How your data is protected in NutriAID Intolerances, your GDPR rights, what data we collect and how we use it.",
    alternates: { canonical: "/knowledge-hub/gdpr-confidentialitate" },
    openGraph: {
      title: isRo ? "GDPR & Confidențialitate — NutriAID" : "GDPR & Privacy — NutriAID",
      description: isRo
        ? "Datele tale de sănătate sunt protejate. Drepturile tale GDPR, ce colectăm și ce nu facem cu datele tale."
        : "Your health data is protected. Your GDPR rights, what we collect, and what we do not do with your data.",
      url: "/knowledge-hub/gdpr-confidentialitate",
      locale: isRo ? "ro_RO" : "en_US",
    },
  };
}

export default function GdprConfidentialitatePage() {
  const isRo = getServerLanguage() === "ro";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isRo ? "GDPR & Confidențialitate — NutriAID Intolerances" : "GDPR & Privacy — NutriAID Intolerances",
    description: isRo
      ? "Informații complete despre protecția datelor în NutriAID Intolerances conform GDPR."
      : "Complete information about data protection in NutriAID Intolerances according to GDPR.",
    author: { "@type": "Organization", name: "NutriAID Intolerances" },
    publisher: { "@type": "Organization", name: "NutriAID Intolerances" },
    url: "/knowledge-hub/gdpr-confidentialitate",
    inLanguage: isRo ? "ro-RO" : "en-US",
  };

  const gdprRights = isRo
    ? [
        { title: "Dreptul de acces", body: "Poți solicita oricând o copie completă a datelor tale stocate în platformă." },
        { title: "Dreptul la rectificare", body: "Poți corecta sau actualiza orice date incorecte sau incomplete." },
        { title: "Dreptul la ștergere", body: "Poți solicita ștergerea completă a contului și a tuturor datelor asociate." },
        { title: "Dreptul la portabilitate", body: "Poți exporta datele tale într-un format utilizabil (JSON, CSV)." },
        { title: "Dreptul de opoziție", body: "Poți obiecta față de orice tip de prelucrare a datelor tale." },
        { title: "Dreptul la restricționare", body: "Poți solicita limitarea prelucrării datelor tale în anumite situații." },
      ]
    : [
        { title: "Right of access", body: "You can request a complete copy of your data stored on the platform at any time." },
        { title: "Right to rectification", body: "You can correct or update any incorrect or incomplete data." },
        { title: "Right to erasure", body: "You can request complete deletion of your account and all associated data." },
        { title: "Right to portability", body: "You can export your data in a usable format (JSON, CSV)." },
        { title: "Right to object", body: "You can object to any type of processing of your data." },
        { title: "Right to restriction", body: "You can request limitation of the processing of your data in certain situations." },
      ];

  const doWith = isRo
    ? ["Furnizăm funcționalitățile aplicației (jurnal, analiză AI, recomandări)", "Asigurăm securitatea contului tău", "Trimitem comunicări tehnice necesare (resetare parolă, notificări de securitate)", "Îmbunătățim aplicația pe baza utilizării agregate și anonimizate"]
    : ["We provide app features (journal, AI analysis, recommendations)", "We ensure your account security", "We send necessary technical communications (password reset, security notifications)", "We improve the app based on aggregated and anonymized usage"];

  const dontWith = isRo
    ? ["Nu vindem datele tale nimănui", "Nu le partajăm cu terțe părți în scop comercial", "Nu le folosim pentru publicitate targetată", "Nu creăm profiluri de marketing", "Nu accesăm datele tale fără motiv tehnic justificat"]
    : ["We do not sell your data to anyone", "We do not share them with third parties for commercial purposes", "We do not use them for targeted advertising", "We do not create marketing profiles", "We do not access your data without a justified technical reason"];

  const faqItems = isRo
    ? [
        { q: "Ce date colecteaza NutriAID despre mine?", a: "Colectam date de cont (nume, email, parola criptata), date de jurnal (mese si simptome introduse voluntar), preferinte de profil si date tehnice minimale (IP, browser) necesare exclusiv pentru securitate." },
        { q: "Cine are acces la datele mele de sanatate?", a: "Numai tu si sistemele automate NutriAID care ruleaza analiza AI. Nu exista acces uman la datele tale fara motiv tehnic justificat si documentat." },
        { q: "Pot solicita stergerea completa a datelor mele?", a: "Da. Trimite email la contact@nutriaid.eu cu subiectul 'Cerere stergere cont'. Contul si toate datele asociate vor fi sterse permanent. Raspundem in maxim 30 de zile." },
        { q: "NutriAID vinde datele mele catre terte parti?", a: "Nu. Datele tale nu sunt vandute nimainui si nu sunt partajate cu terte parti in scop comercial. Aceasta este o politica fundamentala si neconditionata a platformei." },
        { q: "Datele mele sunt stocate in siguranta conform GDPR?", a: "Da. Infrastructura NutriAID respecta cerintele GDPR privind stocarea si prelucrarea datelor cu caracter personal, inclusiv datele de sanatate care sunt considerate date sensibile conform regulamentului european." },
      ]
    : [
        { q: "What data does NutriAID collect about me?", a: "We collect account data (name, email, encrypted password), journal data (meals and symptoms you voluntarily log), profile preferences, and minimal technical data (IP, browser) exclusively for security." },
        { q: "Who has access to my health data?", a: "Only you and the NutriAID automated systems running the AI analysis. There is no human access to your data without a justified and documented technical reason." },
        { q: "Can I request complete deletion of my data?", a: "Yes. Send an email to contact@nutriaid.eu with the subject 'Account deletion request'. The account and all associated data will be permanently deleted. We respond within 30 days." },
        { q: "Does NutriAID sell my data to third parties?", a: "No. Your data is not sold to anyone and is not shared with third parties for commercial purposes. This is a fundamental and unconditional policy of the platform." },
        { q: "Is my data stored securely and in compliance with GDPR?", a: "Yes. NutriAID infrastructure complies with GDPR requirements for storing and processing personal data, including health data considered sensitive under European regulation." },
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

      <section className="relative overflow-hidden border-y border-cyan-100 dark:border-cyan-900/40 bg-gradient-to-b from-cyan-100 via-white to-slate-50 dark:from-cyan-950/30 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <Link href="/knowledge-hub" className="inline-flex items-center gap-2 rounded-full bg-cyan-600/10 text-cyan-700 dark:text-cyan-300 px-4 py-1.5 text-sm font-semibold mb-6 hover:bg-cyan-600/20 transition">
            <BookOpen className="h-4 w-4" />
            Knowledge Hub
          </Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900 dark:text-white">
            {isRo ? "GDPR & Confidențialitate" : "GDPR & Privacy"}
          </h1>
          <p className="mt-5 text-xl text-slate-700 dark:text-slate-300 max-w-3xl">
            {isRo
              ? "Datele tale de sănătate sunt dintre cele mai sensibile. NutriAID Intolerances le tratează cu respectul și protecția pe care le merită, conform GDPR."
              : "Your health data is among the most sensitive. NutriAID Intolerances treats it with the respect and protection it deserves, in compliance with GDPR."}
          </p>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "Ce date colectăm?" : "What data do we collect?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-5">
            {isRo
              ? "Colectăm exclusiv datele pe care tu le furnizezi voluntar:"
              : "We collect only the data that you voluntarily provide:"}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
            {(isRo
              ? [
                  "Date de cont: nume, email, parolă criptată",
                  "Date de jurnal: mese introduse și simptome raportate",
                  "Date de profil: preferințe alimentare setate de tine",
                  "Date tehnice: adresă IP, tip browser (doar pentru securitate)",
                ]
              : [
                  "Account data: name, email, encrypted password",
                  "Journal data: logged meals and reported symptoms",
                  "Profile data: food preferences set by you",
                  "Technical data: IP address, browser type (security purposes only)",
                ]
            ).map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-700 dark:text-slate-200">
                <Lock className="h-4 w-4 mt-0.5 flex-none text-cyan-500 dark:text-cyan-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {isRo
              ? "Nu colectăm numere de card, CNP, date financiare sau identificatoare guvernamentale."
              : "We do not collect card numbers, national ID numbers, financial data, or government identifiers."}
          </p>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Ce facem și ce nu facem cu datele tale?" : "What do and do not we do with your data?"}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6">
              <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-4">
                {isRo ? "Ce facem:" : "What we do:"}
              </h3>
              <ul className="space-y-2 list-none p-0">
                {doWith.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-slate-800 dark:text-slate-200 text-sm">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-none text-emerald-600 dark:text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 p-6">
              <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-4">
                {isRo ? "Ce nu facem:" : "What we do not do:"}
              </h3>
              <ul className="space-y-2 list-none p-0">
                {dontWith.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-slate-800 dark:text-slate-200 text-sm">
                    <XCircle className="h-4 w-4 mt-0.5 flex-none text-rose-500 dark:text-rose-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Drepturile tale GDPR" : "Your GDPR rights"}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0">
            {gdprRights.map((right) => (
              <li key={right.title} className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/20 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 flex-none text-cyan-600 dark:text-cyan-400" />
                  <p className="font-semibold text-slate-900 dark:text-white">{right.title}</p>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{right.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            {isRo ? "Cum îți exerciți drepturile?" : "How do you exercise your rights?"}
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-3">
            {isRo
              ? "Poți trimite orice solicitare GDPR la adresa:"
              : "You can send any GDPR request to:"}
          </p>
          <p className="font-semibold text-emerald-700 dark:text-emerald-300 mb-3">contact@nutriaid.eu</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {isRo
              ? "Răspundem la solicitările GDPR în maximum 30 de zile calendaristice, conform reglementărilor europene."
              : "We respond to GDPR requests within a maximum of 30 calendar days, in accordance with European regulations."}
          </p>
        </section>

        <section className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/legal/privacy-policy"
            className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 text-center hover:border-emerald-400 dark:hover:border-emerald-600 transition"
          >
            <p className="font-semibold text-slate-900 dark:text-white mb-1">
              {isRo ? "Politica de Confidențialitate" : "Privacy Policy"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRo ? "Documentul complet GDPR" : "Complete GDPR document"}
            </p>
          </Link>
          <Link
            href="/legal/data-retention"
            className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 text-center hover:border-emerald-400 dark:hover:border-emerald-600 transition"
          >
            <p className="font-semibold text-slate-900 dark:text-white mb-1">
              {isRo ? "Retenția datelor" : "Data Retention"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRo ? "Cât timp păstrăm datele" : "How long we keep data"}
            </p>
          </Link>
          <Link
            href="/legal/account-deletion"
            className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 text-center hover:border-emerald-400 dark:hover:border-emerald-600 transition"
          >
            <p className="font-semibold text-slate-900 dark:text-white mb-1">
              {isRo ? "Ștergerea contului" : "Account Deletion"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRo ? "Cum îți ștergi datele" : "How to delete your data"}
            </p>
          </Link>
        </section>

        {/* Definitie */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-5">
            {isRo ? "Ce este GDPR și de ce contează?" : "What is GDPR and why does it matter?"}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            {isRo
              ? "GDPR (Regulamentul General privind Protecția Datelor) este regulamentul european care stabilește drepturile persoanelor fizice asupra datelor lor personale și obligațiile organizațiilor care le prelucrează."
              : "GDPR (General Data Protection Regulation) is the European regulation that establishes the rights of individuals over their personal data and the obligations of organizations that process it."}
          </p>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            {isRo
              ? "Pentru NutriAID Intolerances este deosebit de important deoarece datele de sănătate (mese, simptome, toleranțe) sunt considerate date sensibile conform GDPR și beneficiază de protecție sporită."
              : "For NutriAID Intolerances it is particularly important because health data (meals, symptoms, tolerances) is considered sensitive data under GDPR and benefits from enhanced protection."}
          </p>
        </section>

        {/* Pasi concreti */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "Cum îți exerciți drepturile GDPR la NutriAID?" : "How do you exercise your GDPR rights at NutriAID?"}
          </h2>
          <ol className="space-y-3 list-none p-0">
            {(isRo
              ? [
                  { n: "1", t: "Identifici dreptul pe care vrei să-l exerciți", b: "Acces, rectificare, ștergere, portabilitate, opoziție sau restricționare — alege ce se aplică situației tale." },
                  { n: "2", t: "Trimiți email la contact@nutriaid.eu", b: "Menționezi clar dreptul solicitat și furnizezi datele de identificare a contului (adresa de email)." },
                  { n: "3", t: "Primești confirmare", b: "Confirmăm primirea solicitării tale în maxim 72 de ore." },
                  { n: "4", t: "Procesăm solicitarea", b: "Procesăm și răspundem la orice solicitare GDPR în maxim 30 de zile calendaristice, conform reglementărilor europene." },
                  { n: "5", t: "Primești răspunsul", b: "Primești confirmarea că dreptul tău a fost exercitat — ștergere completă, copie date, corecție sau restricție aplicată." },
                ]
              : [
                  { n: "1", t: "Identify the right you want to exercise", b: "Access, rectification, erasure, portability, objection, or restriction — choose what applies to your situation." },
                  { n: "2", t: "Send an email to contact@nutriaid.eu", b: "Clearly state the right requested and provide your account identification data (email address)." },
                  { n: "3", t: "Receive confirmation", b: "We confirm receipt of your request within 72 hours." },
                  { n: "4", t: "We process the request", b: "We process and respond to any GDPR request within a maximum of 30 calendar days, in accordance with European regulations." },
                  { n: "5", t: "Receive the response", b: "You receive confirmation that your right has been exercised — complete deletion, data copy, correction, or restriction applied." },
                ]
            ).map((step) => (
              <li key={step.n} className="flex items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-cyan-600 text-white text-xs font-bold flex-none">{step.n}</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{step.t}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{step.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Exemplu */}
        <section className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/20 p-6">
          <h2 className="text-xl font-bold text-cyan-800 dark:text-cyan-200 mb-3">
            {isRo ? "Exemplu exercitare drept de ștergere" : "Example: exercising the right to erasure"}
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            {isRo
              ? "Mihai decide să nu mai folosească NutriAID. Trimite email la contact@nutriaid.eu: 'Bună ziua, solicit ștergerea completă a contului și a tuturor datelor mele. Email cont: mihai@email.com.' În 72h primește confirmare. În 30 de zile: contul este dezactivat, toate mesele, simptomele și profilul sunt șterse permanent. Mihai primește confirmare scrisă că ștergerea a fost completă și ireversibilă."
              : "Mihai decides to stop using NutriAID. He sends an email to contact@nutriaid.eu: 'Hello, I request complete deletion of my account and all my data. Account email: mihai@email.com.' Within 72h he receives confirmation. Within 30 days: the account is deactivated, all meals, symptoms, and profile are permanently deleted. Mihai receives written confirmation that the deletion was complete and irreversible."}
          </p>
        </section>

        {/* Tabel comparativ */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {isRo ? "NutriAID vs. platforme fără politică GDPR clară" : "NutriAID vs. platforms without clear GDPR policy"}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cyan-600 text-white text-left">
                  <th className="px-4 py-3 font-semibold">{isRo ? "Criteriu" : "Criterion"}</th>
                  <th className="px-4 py-3 font-semibold">NutriAID Intolerances</th>
                  <th className="px-4 py-3 font-semibold">{isRo ? "Platforme fără GDPR clar" : "Platforms without clear GDPR"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {(isRo
                  ? [
                      ["Date vândute terților", "Nu", "Posibil"],
                      ["Acces comercial la date", "Nu", "Posibil"],
                      ["Ștergere date la cerere", "✅ Da, în 30 zile", "Incert"],
                      ["Transparență utilizare date", "✅ Completă", "Parțială"],
                      ["Stocare criptată", "✅ Da", "Variabil"],
                      ["Respectare GDPR", "✅ Complet", "Nespecificat"],
                    ]
                  : [
                      ["Data sold to third parties", "No", "Possible"],
                      ["Commercial data access", "No", "Possible"],
                      ["Data deletion on request", "✅ Yes, within 30 days", "Uncertain"],
                      ["Transparency of data use", "✅ Complete", "Partial"],
                      ["Encrypted storage", "✅ Yes", "Variable"],
                      ["GDPR compliance", "✅ Full", "Unspecified"],
                    ]
                ).map((row) => (
                  <tr key={row[0]} className="bg-white dark:bg-slate-900 even:bg-slate-50 even:dark:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row[0]}</td>
                    <td className="px-4 py-3 text-cyan-700 dark:text-cyan-300 font-medium">{row[1]}</td>
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
        <section className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/20 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            {isRo ? "Rezumat" : "Summary"}
          </h2>
          <ul className="space-y-2 list-none p-0">
            {(isRo
              ? [
                  "NutriAID colectează exclusiv datele furnizate voluntar de tine — fără tracking sau profilare comercială",
                  "Datele nu sunt vândute sau partajate cu terți în niciun scop comercial",
                  "Ai 6 drepturi GDPR: acces, rectificare, ștergere, portabilitate, opoziție, restricționare",
                  "Poți exercita orice drept GDPR prin email la contact@nutriaid.eu",
                  "Răspundem la toate solicitările GDPR în maxim 30 de zile calendaristice",
                  "Datele de sănătate sunt considerate date sensibile și beneficiază de protecție GDPR sporită",
                ]
              : [
                  "NutriAID collects exclusively data voluntarily provided by you — no tracking or commercial profiling",
                  "Data is not sold or shared with third parties for any commercial purpose",
                  "You have 6 GDPR rights: access, rectification, erasure, portability, objection, restriction",
                  "You can exercise any GDPR right by email at contact@nutriaid.eu",
                  "We respond to all GDPR requests within a maximum of 30 calendar days",
                  "Health data is considered sensitive data and benefits from enhanced GDPR protection",
                ]
            ).map((point) => (
              <li key={point} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-none text-cyan-500 dark:text-cyan-400" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-cyan-700 to-emerald-700 p-8 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">
            {isRo ? "Datele tale sunt ale tale. Noi doar le analizăm pentru tine." : "Your data belongs to you. We only analyze it for you."}
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-cyan-700 hover:bg-cyan-50 transition">
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
