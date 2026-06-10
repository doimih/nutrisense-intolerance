import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, FileText, Lock, Pizza, Shield, Stethoscope, UtensilsCrossed } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return {
    title: isRo ? "Knowledge Hub — NutriAID Intolerances" : "Knowledge Hub — NutriAID Intolerances",
    description: isRo
      ? "Resurse educaționale despre intoleranțele alimentare, analiza AI a simptomelor, planuri alimentare personalizate și confidențialitatea datelor tale."
      : "Educational resources about food intolerances, AI symptom analysis, personalized food plans, and your data privacy.",
    alternates: { canonical: "/knowledge-hub" },
    openGraph: {
      title: isRo ? "Knowledge Hub — NutriAID Intolerances" : "Knowledge Hub — NutriAID Intolerances",
      description: isRo
        ? "Tot ce trebuie să știi despre NutriAID: cum funcționează AI-ul, analiza meselor, simptomelor și confidențialitate."
        : "Everything about NutriAID: how the AI works, meal and symptom analysis, and privacy.",
      url: "/knowledge-hub",
      locale: isRo ? "ro_RO" : "en_US",
    },
  };
}

const articles = [
  {
    href: "/knowledge-hub/ce-este-nutriaid",
    icon: BookOpen,
    titleRo: "Ce este NutriAID Intolerances?",
    titleEn: "What is NutriAID Intolerances?",
    descRo: "Ghid complet despre platforma NutriAID, scopul ei și ce o diferențiază de alte soluții.",
    descEn: "Complete guide to the NutriAID platform, its purpose, and what sets it apart.",
  },
  {
    href: "/knowledge-hub/cum-functioneaza-ai",
    icon: Brain,
    titleRo: "Cum funcționează AI-ul NutriAID?",
    titleEn: "How does NutriAID AI work?",
    descRo: "Explicație clară despre tehnologia AI folosită pentru a detecta intoleranțele alimentare.",
    descEn: "Clear explanation of the AI technology used to detect food intolerances.",
  },
  {
    href: "/knowledge-hub/analiza-meselor",
    icon: UtensilsCrossed,
    titleRo: "Analiza meselor cu AI",
    titleEn: "AI Meal Analysis",
    descRo: "Cum AI-ul analizează mesele tale și identifică tiparele declanșatoare.",
    descEn: "How the AI analyzes your meals and identifies trigger patterns.",
  },
  {
    href: "/knowledge-hub/analiza-simptomelor",
    icon: Stethoscope,
    titleRo: "Analiza simptomelor cu AI",
    titleEn: "AI Symptom Analysis",
    descRo: "Cum sunt corelate simptomele cu alimentele și ce tipare detectează AI-ul.",
    descEn: "How symptoms are correlated with foods and what patterns the AI detects.",
  },
  {
    href: "/knowledge-hub/plan-alimentar-ai",
    icon: Pizza,
    titleRo: "Plan alimentar AI",
    titleEn: "AI Food Plan",
    descRo: "Cum generează NutriAID planuri alimentare personalizate bazate pe datele tale reale.",
    descEn: "How NutriAID generates personalized food plans based on your real data.",
  },
  {
    href: "/knowledge-hub/siguranta-alimentara",
    icon: Shield,
    titleRo: "Siguranță alimentară cu AI",
    titleEn: "AI Food Safety",
    descRo: "Ce înseamnă un aliment sigur în contextul intoleranțelor și cum îl identifici.",
    descEn: "What a safe food means in the context of intolerances and how to identify it.",
  },
  {
    href: "/knowledge-hub/pdf-uri-generate",
    icon: FileText,
    titleRo: "PDF-uri generate cu AI",
    titleEn: "AI-Generated PDFs",
    descRo: "Rapoartele PDF generate automat: ce conțin, cum le folosești și cum le partajezi.",
    descEn: "Auto-generated PDF reports: what they contain, how to use them and share them.",
  },
  {
    href: "/knowledge-hub/gdpr-confidentialitate",
    icon: Lock,
    titleRo: "GDPR & Confidențialitate",
    titleEn: "GDPR & Privacy",
    descRo: "Cum sunt protejate datele tale, drepturile tale GDPR și ce putem și nu putem face cu informațiile tale.",
    descEn: "How your data is protected, your GDPR rights, and what we can and cannot do with your data.",
  },
];

export default function KnowledgeHubPage() {
  const lang = getServerLanguage();
  const isRo = lang === "ro";

  const hubSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: isRo ? "Knowledge Hub — NutriAID Intolerances" : "Knowledge Hub — NutriAID Intolerances",
    description: isRo
      ? "Resurse educaționale despre intoleranțele alimentare și AI."
      : "Educational resources about food intolerances and AI.",
    url: "/knowledge-hub",
    hasPart: articles.map((a) => ({
      "@type": "Article",
      name: isRo ? a.titleRo : a.titleEn,
      url: a.href,
    })),
  };

  return (
    <div className="pb-20 bg-slate-50 dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-y border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-100 via-white to-slate-50 dark:from-emerald-950/30 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 text-sm font-semibold mb-6">
            <BookOpen className="h-4 w-4" />
            Knowledge Hub
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white max-w-5xl">
            {isRo
              ? "Totul despre NutriAID Intolerances, explicat simplu"
              : "Everything about NutriAID Intolerances, explained simply"}
          </h1>
          <div className="mt-6 space-y-2 text-lg text-slate-700 dark:text-slate-300 max-w-4xl">
            <p>
              {isRo
                ? "Resurse educaționale clare despre cum funcționează platforma, cum AI-ul analizează mesele și simptomele, ce planuri generează și cum sunt protejate datele tale."
                : "Clear educational resources about how the platform works, how AI analyzes meals and symptoms, what plans it generates, and how your data is protected."}
            </p>
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">
          {isRo ? "Articole disponibile" : "Available articles"}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0">
          {articles.map((article) => {
            const Icon = article.icon;
            return (
              <li key={article.href}>
                <Link
                  href={article.href}
                  className="group flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-emerald-100 dark:bg-emerald-400/10 p-3 text-emerald-700 dark:text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition">
                    {isRo ? article.titleRo : article.titleEn}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                    {isRo ? article.descRo : article.descEn}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {isRo ? "Citește articolul" : "Read article"}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 to-cyan-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white mb-4">
            {isRo ? "Gata să descoperi ce îți face rău?" : "Ready to discover what harms you?"}
          </h2>
          <p className="text-lg text-emerald-100 mb-8">
            {isRo
              ? "Cunoașterea este primul pas. Al doilea este analiza personalizată."
              : "Knowledge is the first step. The second is personalized analysis."}
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            {isRo ? "Începe analiza intoleranțelor tale" : "Start your intolerance analysis"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
