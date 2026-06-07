"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import StructuredData from "@/components/StructuredData";
import { useLanguage } from "@/components/LanguageProvider";

const faqContent = {
  ro: [
  {
    category: "General",
    items: [
      {
        q: "Ce este NutriSense Intolerances?",
        a: "NutriSense Intolerances este o aplicație web gratuită care te ajută să organizezi informațiile despre intoleranțele tale alimentare, să primești recomandări generale și să monitorizezi reacțiile corpului tău la alimente.",
      },
      {
        q: "Este aplicația gratuită?",
        a: "Da, complet gratuită. Nu există abonamente, nu există funcționalități premium ascunse și nu există reclame. Aplicația este oferită gratuit pentru toți utilizatorii.",
      },
      {
        q: "Cine poate folosi aplicația?",
        a: "Oricine are intoleranțe alimentare sau vrea să-și monitorizeze reacțiile la alimente. Aplicația este potrivită pentru adulți și familii. Recomandăm supraveghere parentală pentru copii sub 16 ani.",
      },
    ],
  },
  {
    category: "Cont și date",
    items: [
      {
        q: "Ce date sunt necesare pentru înregistrare?",
        a: "Ai nevoie doar de un nume, adresă de email și parolă. Nu colectăm informații medicale sensibile, numere de telefon sau date financiare.",
      },
      {
        q: "Pot șterge contul oricând?",
        a: "Da, absolut. Poți solicita ștergerea completă a contului și datelor tale din secțiunea de Profil sau prin contactarea noastră la adresa de email. Ștergerea este permanentă și ireversibilă.",
      },
      {
        q: "Datele mele sunt partajate cu terți?",
        a: "Nu. Datele tale nu sunt vândute, închiriate sau partajate cu terți în scopuri comerciale. Singurele situații în care datele pot fi dezvăluite sunt cele prevăzute de lege.",
      },
      {
        q: "Îmi pot exporta datele?",
        a: "Da, ai dreptul de a solicita exportul datelor tale în format JSON sau CSV. Contactează-ne la adresa de email și procesăm cererea în termen de 30 de zile.",
      },
    ],
  },
  {
    category: "Recomandări și jurnal",
    items: [
      {
        q: "Recomandările sunt personalizate medical?",
        a: "Nu. Recomandările generate de aplicație au caracter general și informativ. Ele sunt bazate pe informații general disponibile despre intoleranțele selectate, nu pe evaluare medicală individuală. Consultați întotdeauna un medic sau nutriționist.",
      },
      {
        q: "Cât de des pot genera recomandări?",
        a: "Poți genera recomandări oricând dorești. Nu există limite de generare.",
      },
      {
        q: "Jurnalul meu de monitorizare este vizibil pentru alții?",
        a: "Nu. Jurnalul tău de monitorizare este complet privat și vizibil doar de tine. Niciunul dintre angajații noștri nu accesează jurnalele utilizatorilor.",
      },
      {
        q: "Pot urmări evoluția simptomelor în timp?",
        a: "Da. Fiecare înregistrare din jurnal include data, alimentele consumate, simptomele, intensitatea și starea generală. Poți revizui istoricul și observa tipare.",
      },
    ],
  },
  {
    category: "Tehnic",
    items: [
      {
        q: "Aplicația funcționează pe mobil?",
        a: "Da. Aplicația este complet responsive și funcționează pe orice dispozitiv — telefon, tabletă sau calculator.",
      },
      {
        q: "Am nevoie de o aplicație instalată?",
        a: "Nu. NutriSense Intolerances este o aplicație web, accesibilă direct din browser, fără instalare.",
      },
      {
        q: "Ce browser-e sunt suportate?",
        a: "Aplicația funcționează pe toate browser-ele moderne: Chrome, Firefox, Safari, Edge, în versiunile recente.",
      },
    ],
  },
  ],
  en: [
    {
      category: "General",
      items: [
        {
          q: "What is NutriSense Intolerances?",
          a: "NutriSense Intolerances is a free web app that helps you organize information about your food intolerances, receive general guidance and track your body's reactions to food.",
        },
        {
          q: "Is the app free?",
          a: "Yes, completely free. There are no subscriptions, no hidden premium features and no ads.",
        },
        {
          q: "Who can use the app?",
          a: "Anyone with food intolerances or anyone who wants to track food reactions. The app is suitable for adults and families. We recommend parental supervision for children under 16.",
        },
      ],
    },
    {
      category: "Account and data",
      items: [
        {
          q: "What data is needed to register?",
          a: "You only need a name, an email address and a password. We do not collect sensitive medical data, phone numbers or financial information.",
        },
        {
          q: "Can I delete my account anytime?",
          a: "Yes. You can request complete account and data deletion from your Profile section or by contacting us via email. Deletion is permanent and irreversible.",
        },
        {
          q: "Is my data shared with third parties?",
          a: "No. Your data is not sold, rented or shared with third parties for commercial purposes. Data may only be disclosed in situations required by law.",
        },
        {
          q: "Can I export my data?",
          a: "Yes, you can request an export of your data in JSON or CSV format. Contact us by email and we process requests within 30 days.",
        },
      ],
    },
    {
      category: "Guidance and journal",
      items: [
        {
          q: "Are recommendations medically personalized?",
          a: "No. Recommendations generated by the app are general and informational. They are based on publicly available intolerance information, not on individual medical assessment. Always consult a doctor or dietitian.",
        },
        {
          q: "How often can I generate guidance?",
          a: "You can generate guidance whenever you want. There are no generation limits.",
        },
        {
          q: "Is my monitoring journal visible to others?",
          a: "No. Your monitoring journal is private and visible only to you.",
        },
        {
          q: "Can I track symptom trends over time?",
          a: "Yes. Each journal entry includes date, consumed foods, symptoms, intensity and wellbeing. You can review history and spot patterns.",
        },
      ],
    },
    {
      category: "Technical",
      items: [
        {
          q: "Does the app work on mobile?",
          a: "Yes. The app is fully responsive and works on phone, tablet and desktop.",
        },
        {
          q: "Do I need an installed app?",
          a: "No. NutriSense Intolerances is a web app available directly in your browser, with no installation.",
        },
        {
          q: "Which browsers are supported?",
          a: "The app works on modern browsers such as Chrome, Firefox, Safari and Edge in recent versions.",
        },
      ],
    },
  ],
} as const;

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-slate-700 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left gap-4"
      >
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
          {q}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed pr-8">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const faqs = faqContent[lang];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      }))
    ),
  };

  return (
    <div className="pt-24 pb-16 bg-white dark:bg-slate-900">
      <StructuredData data={faqSchema} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {isRo ? "Intrebari frecvente" : "Frequently asked questions"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isRo
              ? "Gasesti raspunsurile la cele mai comune intrebari. Nu ai gasit ce cauti? "
              : "Find answers to the most common questions. Did not find what you need? "}
            <a
              href="/contact"
              className="text-green-600 dark:text-green-400 hover:underline"
            >
              {isRo ? "Contacteaza-ne" : "Contact us"}
            </a>
            .
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-3">
                {section.category}
              </h2>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 px-5 shadow-sm">
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
