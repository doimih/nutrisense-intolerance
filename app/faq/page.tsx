import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle, ShieldCheck } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

type FaqItem = {
  id: string;
  question: string;
  paragraphs?: string[];
  bullets?: string[];
};

type FaqSection = {
  title: string;
  items: FaqItem[];
};

type FaqPageCopy = {
  hero: {
    title: string;
    subtitle: string[];
  };
  sections: FaqSection[];
  finalCta: {
    title: string;
    primary: string;
    secondary: string;
  };
};

const copy: Record<"ro" | "en", FaqPageCopy> = {
  ro: {
    hero: {
      title: "Intrebari frecvente - tot ce trebuie sa stii inainte sa incepi",
      subtitle: [
        "Nu vrem sa ai dubii.",
        "Nu vrem sa ai frici.",
        "Nu vrem sa ai intrebari fara raspuns.",
        "Aici gasesti tot ce trebuie sa stii, explicat simplu si uman.",
      ],
    },
    sections: [
      {
        title: "Despre aplicatie",
        items: [
          {
            id: "1",
            question: "1. Ce este NutriAID Intolerances?",
            paragraphs: [
              "Este o platforma inteligenta care te ajuta sa intelegi ce alimente iti provoaca simptome precum balonare, dureri, migrene, oboseala, greata sau eruptii.",
              "Nu pune diagnostice.",
              "Nu inlocuieste medicul.",
              "Dar iti ofera claritate reala.",
            ],
          },
          {
            id: "2",
            question: "2. Cum ma ajuta concret?",
            paragraphs: [
              "Analizeaza ce mananci si cum te simti, apoi identifica tipare, corelatii si alimente suspecte.",
              "Iti arata ce iti face rau si ce iti face bine.",
              "Iti ofera ghidare zilnica.",
            ],
          },
          {
            id: "3",
            question: "3. Trebuie sa fiu expert in nutritie ca sa folosesc aplicatia?",
            paragraphs: ["Nu.", "Scrii doar ce ai mancat si ce simptome ai avut.", "Atat.", "AI-ul face restul."],
          },
          {
            id: "4",
            question: "4. Trebuie sa cantaresc mancarea?",
            paragraphs: ["Nu.", "Nu trebuie sa fii exact.", "Nu trebuie sa fii perfect.", "Doar notezi aproximativ."],
          },
        ],
      },
      {
        title: "Despre simptome si intolerante",
        items: [
          {
            id: "5",
            question: "5. Ce simptome pot fi analizate?",
            paragraphs: ["Orice reactie a corpului tau. Totul conteaza."],
            bullets: [
              "balonare",
              "dureri abdominale",
              "migrene",
              "greata",
              "reflux",
              "oboseala",
              "eruptii",
              "anxietate dupa masa",
              "tranzit imprevizibil",
            ],
          },
          {
            id: "6",
            question: "6. Poate aplicatia sa imi spuna exact ce intoleranta am?",
            paragraphs: [
              "Nu pune diagnostice.",
              "Dar poate identifica tipare clare care indica sensibilitati la:",
              "Este un ghid, nu un medic.",
            ],
            bullets: ["lactate", "gluten", "oua", "soia", "porumb", "zahar", "aditivi", "combinatii alimentare"],
          },
          {
            id: "7",
            question: "7. Daca am simptome severe, ma poate ajuta?",
            paragraphs: [
              "Te poate ajuta sa intelegi tiparele, dar pentru simptome severe trebuie sa consulti un medic.",
              "Aplicatia nu inlocuieste ingrijirea medicala.",
            ],
          },
        ],
      },
      {
        title: "Despre AI",
        items: [
          {
            id: "8",
            question: "8. Cum functioneaza AI-ul?",
            paragraphs: [
              "Analizeaza ce ai mancat, cand ai mancat, ce simptome ai avut, cat au durat, cat de intense au fost si ce combinatii ai consumat.",
              "Apoi identifica tipare pe care un om nu le poate observa.",
            ],
          },
          {
            id: "9",
            question: "9. Este sigur sa folosesc AI pentru sanatate?",
            paragraphs: [
              "Da.",
              "AI-ul nu ia decizii medicale.",
              "Nu pune diagnostice.",
              "Nu iti spune ce tratament sa urmezi.",
              "Iti ofera doar claritate si corelatii.",
            ],
          },
          {
            id: "10",
            question: "10. AI-ul imi spune ce sa mananc?",
            paragraphs: ["Nu.", "Iti arata ce iti face rau si ce iti face bine.", "Tu decizi ce faci mai departe."],
          },
        ],
      },
      {
        title: "Despre utilizare",
        items: [
          {
            id: "11",
            question: "11. Cat timp trebuie sa folosesc aplicatia ca sa vad rezultate?",
            paragraphs: [
              "Majoritatea utilizatorilor vad primele corelatii in 3-7 zile.",
              "Primele imbunatatiri apar rapid.",
            ],
          },
          {
            id: "12",
            question: "12. Trebuie sa introduc fiecare masa?",
            paragraphs: ["Ideal, da.", "Dar daca uiti o masa, nu e o problema.", "AI-ul se adapteaza."],
          },
          {
            id: "13",
            question: "13. Ce se intampla daca nu am simptome intr-o zi?",
            paragraphs: ["Este perfect normal.", "Si asta este o informatie importanta pentru AI."],
          },
        ],
      },
      {
        title: "Despre rezultate",
        items: [
          {
            id: "14",
            question: "14. Pot elimina complet simptomele?",
            paragraphs: [
              "Multi utilizatori raporteaza reducerea simptomelor cu 50-80% in primele saptamani.",
              "Depinde de corpul tau.",
              "Depinde de consecventa.",
              "Depinde de declansatori.",
            ],
          },
          {
            id: "15",
            question: "15. Ce fac daca descopar un aliment problematic?",
            paragraphs: [
              "Aplicatia iti ofera recomandari personalizate.",
              "Nu trebuie sa elimini tot.",
              "Nu trebuie sa intri in panica.",
              "Primesti ghidare clara.",
            ],
          },
          {
            id: "16",
            question: "16. Pot folosi aplicatia impreuna cu un medic sau nutritionist?",
            paragraphs: ["Da.", "Multi specialisti o folosesc ca instrument de analiza."],
          },
        ],
      },
      {
        title: "Despre siguranta si confidentialitate",
        items: [
          {
            id: "17",
            question: "17. Datele mele sunt in siguranta?",
            paragraphs: [
              "Da.",
              "Datele tale sunt protejate si folosite doar pentru analiza personalizata.",
              "Nu sunt vandute.",
              "Nu sunt partajate.",
            ],
          },
          {
            id: "18",
            question: "18. Aplicatia imi poate afecta sanatatea?",
            paragraphs: [
              "Nu.",
              "Nu ofera tratamente.",
              "Nu ofera medicamente.",
              "Nu pune diagnostice.",
              "Este un instrument de claritate, nu de interventie medicala.",
            ],
          },
        ],
      },
    ],
    finalCta: {
      title: "Ai intrebari? Ai raspunsuri. Acum e timpul sa ai si claritate.",
      primary: "Incepe analiza intolerantelor tale",
      secondary: "Vezi cum functioneaza NutriAID",
    },
  },
  en: {
    hero: {
      title: "Frequently asked questions - everything you need to know before you start",
      subtitle: [
        "We do not want you to have doubts.",
        "We do not want you to have fears.",
        "We do not want you to have unanswered questions.",
        "Here you will find everything explained simply and humanly.",
      ],
    },
    sections: [
      {
        title: "About the app",
        items: [
          {
            id: "1",
            question: "1. What is NutriAID Intolerances?",
            paragraphs: [
              "It is an intelligent platform that helps you understand which foods trigger symptoms such as bloating, pain, migraines, fatigue, nausea, or rashes.",
              "It does not diagnose.",
              "It does not replace your doctor.",
              "But it gives you real clarity.",
            ],
          },
          {
            id: "2",
            question: "2. How does it help me concretely?",
            paragraphs: [
              "It analyzes what you eat and how you feel, then identifies patterns, correlations, and suspicious foods.",
              "It shows what harms you and what helps you.",
              "It provides daily guidance.",
            ],
          },
          {
            id: "3",
            question: "3. Do I need to be a nutrition expert to use the app?",
            paragraphs: ["No.", "You only log what you ate and what symptoms you had.", "That is all.", "The AI does the rest."],
          },
          {
            id: "4",
            question: "4. Do I need to weigh food?",
            paragraphs: ["No.", "You do not have to be exact.", "You do not have to be perfect.", "Just log approximate amounts."],
          },
        ],
      },
      {
        title: "About symptoms and intolerances",
        items: [
          {
            id: "5",
            question: "5. What symptoms can be analyzed?",
            paragraphs: ["Any reaction from your body. Everything matters."],
            bullets: [
              "bloating",
              "abdominal pain",
              "migraines",
              "nausea",
              "reflux",
              "fatigue",
              "rashes",
              "anxiety after meals",
              "unpredictable digestion",
            ],
          },
          {
            id: "6",
            question: "6. Can the app tell me exactly what intolerance I have?",
            paragraphs: [
              "It does not diagnose.",
              "But it can identify clear patterns indicating sensitivities to:",
              "It is a guide, not a doctor.",
            ],
            bullets: ["dairy", "gluten", "eggs", "soy", "corn", "sugar", "additives", "food combinations"],
          },
          {
            id: "7",
            question: "7. If I have severe symptoms, can it help me?",
            paragraphs: [
              "It can help you understand patterns, but for severe symptoms you should consult a doctor.",
              "The app does not replace medical care.",
            ],
          },
        ],
      },
      {
        title: "About AI",
        items: [
          {
            id: "8",
            question: "8. How does the AI work?",
            paragraphs: [
              "It analyzes what you ate, when you ate, what symptoms you had, how long they lasted, how intense they were, and which combinations you consumed.",
              "Then it identifies patterns that a human cannot observe.",
            ],
          },
          {
            id: "9",
            question: "9. Is it safe to use AI for health?",
            paragraphs: [
              "Yes.",
              "AI does not make medical decisions.",
              "It does not diagnose.",
              "It does not tell you what treatment to follow.",
              "It provides clarity and correlations only.",
            ],
          },
          {
            id: "10",
            question: "10. Does AI tell me what to eat?",
            paragraphs: ["No.", "It shows you what harms you and what helps you.", "You decide what to do next."],
          },
        ],
      },
      {
        title: "About usage",
        items: [
          {
            id: "11",
            question: "11. How long do I need to use the app to see results?",
            paragraphs: [
              "Most users see the first correlations in 3-7 days.",
              "The first improvements appear quickly.",
            ],
          },
          {
            id: "12",
            question: "12. Do I need to log every meal?",
            paragraphs: ["Ideally, yes.", "But if you forget a meal, that is not a problem.", "The AI adapts."],
          },
          {
            id: "13",
            question: "13. What happens if I have no symptoms one day?",
            paragraphs: ["That is perfectly normal.", "And it is also important information for the AI."],
          },
        ],
      },
      {
        title: "About results",
        items: [
          {
            id: "14",
            question: "14. Can I eliminate symptoms completely?",
            paragraphs: [
              "Many users report reducing symptoms by 50-80% in the first weeks.",
              "It depends on your body.",
              "It depends on consistency.",
              "It depends on triggers.",
            ],
          },
          {
            id: "15",
            question: "15. What do I do if I discover a problematic food?",
            paragraphs: [
              "The app gives you personalized recommendations.",
              "You do not need to eliminate everything.",
              "You do not need to panic.",
              "You get clear guidance.",
            ],
          },
          {
            id: "16",
            question: "16. Can I use the app together with a doctor or nutritionist?",
            paragraphs: ["Yes.", "Many specialists use it as an analysis tool."],
          },
        ],
      },
      {
        title: "About safety and privacy",
        items: [
          {
            id: "17",
            question: "17. Is my data safe?",
            paragraphs: [
              "Yes.",
              "Your data is protected and used only for personalized analysis.",
              "It is not sold.",
              "It is not shared.",
            ],
          },
          {
            id: "18",
            question: "18. Can the app affect my health?",
            paragraphs: [
              "No.",
              "It does not provide treatments.",
              "It does not provide medication.",
              "It does not diagnose.",
              "It is a clarity tool, not a medical intervention tool.",
            ],
          },
        ],
      },
    ],
    finalCta: {
      title: "You have questions? You have answers. Now it is time for clarity.",
      primary: "Start your intolerance analysis",
      secondary: "See how NutriAID works",
    },
  },
};

export function generateMetadata(): Metadata {
  const lang = getServerLanguage();
  const isRo = lang === "ro";

  return {
    title: isRo ? "Întrebări Frecvente — NutriAID Intolerances" : "Frequently Asked Questions — NutriAID Intolerances",
    description: isRo
      ? "Găsește răspunsuri la toate întrebările despre NutriAID Intolerances: cum funcționează AI-ul, ce simptome analizează, siguranță și confidențialitate."
      : "Find answers to all your questions about NutriAID Intolerances: how the AI works, which symptoms it analyzes, safety, and privacy.",
    alternates: {
      canonical: "/faq",
      languages: { ro: "/faq", en: "/faq", "x-default": "/faq" },
    },
    openGraph: {
      title: isRo ? "Întrebări Frecvente — NutriAID Intolerances" : "FAQ — NutriAID Intolerances",
      description: isRo
        ? "Tot ce trebuie să știi înainte să începi: AI, simptome, rezultate, siguranță, prețuri."
        : "Everything you need to know before starting: AI, symptoms, results, safety, pricing.",
      url: "/faq",
      locale: isRo ? "ro_RO" : "en_US",
    },
  };
}

function buildFaqSchema(sections: FaqSection[]) {
  const allItems = sections.flatMap((s) => s.items);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: [
          ...(item.paragraphs ?? []),
          ...(item.bullets ?? []),
        ].join(" "),
      },
    })),
  };
}

export default function FaqPage() {
  const lang = getServerLanguage();
  const isRo = lang === "ro";
  const t = copy[lang];
  const faqSchema = buildFaqSchema(t.sections);

  return (
    <div className="pb-20 bg-slate-50 dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="relative overflow-hidden border-y border-cyan-100 dark:border-cyan-900/40 bg-gradient-to-b from-cyan-100 via-white to-slate-50 dark:from-cyan-950/30 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 right-0 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-600/10 text-cyan-700 dark:text-cyan-300 px-4 py-1.5 text-sm font-semibold mb-6">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white max-w-5xl">
            {t.hero.title}
          </h1>
          <div className="mt-6 space-y-2 text-lg text-slate-700 dark:text-slate-300 max-w-4xl">
            {t.hero.subtitle.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        {t.sections.map((section) => (
          <section key={section.title} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">{section.title}</h2>
            <div className="space-y-4">
              {section.items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-5">
                  {item.question && (
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{item.question}</h3>
                  )}

                  {item.paragraphs && (
                    <div className="space-y-2 text-slate-700 dark:text-slate-300">
                      {item.paragraphs.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  )}

                  {item.bullets && (
                    <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-200"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* GEO Summary + mini-FAQ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/20 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            {isRo ? "Despre intoleranțele alimentare și NutriAID" : "About food intolerances and NutriAID"}
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            {isRo
              ? "Intoleranțele alimentare sunt reacții întârziate ale sistemului digestiv la anumite alimente sau combinații de alimente. Simptomele tipice includ balonare, dureri abdominale, oboseală sau cefalee apărute la 2–48 ore după masă. NutriAID identifică aceste tipare de disconfort prin analiza AI a jurnalului tău de mese și simptome. Procesul nu necesită analize medicale și funcționează independent — ca instrument de conștientizare alimentară, nu ca instrument de diagnostic."
              : "Food intolerances are delayed reactions of the digestive system to certain foods or food combinations. Typical symptoms include bloating, abdominal pain, fatigue, or headaches appearing 2–48 hours after eating. NutriAID identifies these discomfort patterns through AI analysis of your meal and symptom journal. The process requires no medical tests and works independently — as a food awareness tool, not a diagnostic instrument."}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            {isRo ? "Cele mai căutate întrebări despre intoleranțe" : "Most searched questions about intolerances"}
          </h2>
          <dl className="space-y-3">
            {(isRo
              ? [
                  { q: "Care este diferența dintre intoleranță și alergie alimentară?", a: "Alergia este o reacție imediată a sistemului imunitar (minute) și poate fi periculoasă. Intoleranța este o reacție digestivă întârziată (ore sau zile), inconfortabilă dar nu periculoasă." },
                  { q: "Pot identifica intoleranțele fără analize medicale?", a: "Da. Monitorizarea sistematică a meselor și simptomelor urmată de analiza corelațiilor (prin NutriAID sau manual) poate identifica intoleranțele fără analize." },
                  { q: "Cât timp durează să confirm o intoleranță alimentară?", a: "Cu NutriAID, primele corelații clare apar după 1–2 săptămâni de înregistrare consistentă. Confirmarea completă necesită de obicei 3–4 săptămâni." },
                ]
              : [
                  { q: "What is the difference between food intolerance and allergy?", a: "Allergy is an immediate immune system reaction (minutes) and can be dangerous. Intolerance is a delayed digestive reaction (hours or days), uncomfortable but not dangerous." },
                  { q: "Can I identify intolerances without medical tests?", a: "Yes. Systematic monitoring of meals and symptoms followed by correlation analysis (via NutriAID or manually) can identify intolerances without tests." },
                  { q: "How long does it take to confirm a food intolerance?", a: "With NutriAID, the first clear correlations appear after 1–2 weeks of consistent logging. Full confirmation usually takes 3–4 weeks." },
                ]
            ).map((item) => (
              <div key={item.q} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                <dt className="font-semibold text-slate-900 dark:text-white mb-2">{item.q}</dt>
                <dd className="text-slate-600 dark:text-slate-400 text-sm m-0">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-700 to-emerald-700 dark:from-cyan-900 dark:to-emerald-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 mb-5">
            <ShieldCheck className="h-4 w-4 mr-2" />
            NutriAID Intolerances
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight text-white mb-8">{t.finalCta.title}</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-cyan-700 transition hover:bg-cyan-50"
            >
              {t.finalCta.primary}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
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
