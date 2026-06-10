import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";
import BillingCancelledNotice from "./_components/BillingCancelledNotice";
import PlanCheckoutButton from "./_components/PlanCheckoutButton";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";
import type { BillingPlanCode } from "@/lib/billing/plans";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";

export const dynamic = "force-dynamic";

type Plan = {
  code: BillingPlanCode;
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  highlight?: boolean;
};

type PricingCopy = {
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string[];
  section1: {
    title: string;
    bullets: string[];
    ending: string[];
  };
  section2: {
    title: string;
    note: string;
    plans: Plan[];
  };
  section3: {
    title: string;
    bullets: string[];
    ending: string;
  };
  section4: {
    title: string;
    quotes: string[];
    ending: string;
  };
  section5: {
    title: string;
    checks: string[];
    ending: string[];
  };
  section6: {
    title: string[];
    actions: string[];
    primaryCta: string;
    secondaryCta: string;
  };
};

const copy: Record<"ro" | "en", PricingCopy> = {
  ro: {
    metaDescription:
      "Incepe acum cu NutriAID Intolerances: planuri clare, analiza AI si primele raspunsuri reale in doar cateva zile.",
    heroTitle: "E timpul sa afli ce iti face rau. Incepe acum.",
    heroSubtitle: [
      "Nu trebuie sa traiesti cu durere, confuzie sau frica de mancare.",
      "In cateva zile poti avea primele raspunsuri reale.",
      "Tot ce trebuie sa faci este sa incepi.",
    ],
    section1: {
      title: "Ce primesti cand incepi?",
      bullets: [
        "Analiza AI avansata a simptomelor",
        "Identificarea alimentelor declansatoare",
        "Detectarea combinatiilor problematice",
        "Alimente sigure pentru corpul tau",
        "Recomandari personalizate",
        "Monitorizare zilnica",
        "Evolutia simptomelor in timp",
        "Ghidare empatica, clara, logica",
      ],
      ending: ["Totul intr-un singur loc.", "Totul pentru tine."],
    },
    section2: {
      title: "Planurile noastre",
      note: "Poti adapta preturile in functie de strategia ta finala.",
      plans: [
        {
          code: "basic",
          name: "Basic",
          price: "9.99 EUR / luna",
          subtitle: "Ideal pentru cei care vor sa inceapa.",
          features: [
            "introducerea meselor",
            "introducerea simptomelor",
            "corelatii de baza",
            "alimente suspecte",
            "alimente sigure",
            "evolutia simptomelor",
          ],
        },
        {
          code: "pro",
          name: "Pro",
          price: "14.99 EUR / luna",
          subtitle: "Cel mai popular. Perfect pentru claritate rapida.",
          highlight: true,
          features: [
            "tot din Basic",
            "analiza AI avansata",
            "detectarea combinatiilor problematice",
            "recomandari personalizate",
            "planuri alimentare adaptate",
            "rapoarte zilnice",
            "evolutie detaliata",
          ],
        },
        {
          code: "pro_plus",
          name: "Pro+",
          price: "35.99 EUR / luna",
          subtitle: "Pentru cei care vor maximul de precizie.",
          features: [
            "tot din Pro",
            "analiza AI extinsa",
            "predictii avansate",
            "detectarea reactiilor intarziate complexe",
            "ghidare premium",
            "suport prioritar",
            "actualizari personalizate in timp real",
          ],
        },
      ],
    },
    section3: {
      title: "De ce merita investitia?",
      bullets: [
        "ai trait prea mult timp cu durere",
        "ai trait prea mult timp cu confuzie",
        "ai trait prea mult timp cu frica de mancare",
        "ai trait prea mult timp fara raspunsuri",
        "ai incercat tot ce se putea",
        "ai fost ignorat",
        "ai fost neinteles",
      ],
      ending: "Acum ai o solutie reala.",
    },
    section4: {
      title: "Ce spun oamenii dupa ce incep?",
      quotes: [
        "Nu credeam ca pot afla atat de repede ce imi face rau.",
        "In 3 zile am avut primele corelatii.",
        "Simptomele mele au scazut.",
        "Nu mai traiesc cu frica de mancare.",
        "In sfarsit are sens.",
      ],
      ending: "Si tu poti avea aceeasi transformare.",
    },
    section5: {
      title: "Garantia noastra",
      checks: [
        "Fara riscuri",
        "Fara contracte",
        "Poti renunta oricand",
        "Poti incepe oricand",
        "Primesti rezultate chiar din primele zile",
      ],
      ending: ["Nu ai nimic de pierdut.", "Ai totul de castigat."],
    },
    section6: {
      title: [
        "E timpul sa ai raspunsurile pe care le cauti de ani de zile.",
        "Nu maine. Nu cand ai timp. Nu poate.",
        "Acum.",
      ],
      actions: [
        "Incepe analiza intolerantelor tale",
        "Alege planul potrivit pentru tine",
        "Fa primul pas spre claritate",
      ],
      primaryCta: "Incepe analiza intolerantelor tale",
      secondaryCta: "Alege planul potrivit",
    },
  },
  en: {
    metaDescription:
      "Start now with NutriAID Intolerances: clear pricing plans, AI analysis, and your first real answers in just days.",
    heroTitle: "It is time to find what harms you. Start now.",
    heroSubtitle: [
      "You do not have to live with pain, confusion, or fear of food.",
      "In a few days you can have your first real answers.",
      "All you need to do is start.",
    ],
    section1: {
      title: "What do you get when you start?",
      bullets: [
        "Advanced AI symptom analysis",
        "Trigger food identification",
        "Problematic combination detection",
        "Safe foods for your body",
        "Personalized recommendations",
        "Daily monitoring",
        "Symptom evolution over time",
        "Empathetic, clear, logical guidance",
      ],
      ending: ["Everything in one place.", "Everything for you."],
    },
    section2: {
      title: "Our plans",
      note: "You can adapt these prices based on your final strategy.",
      plans: [
        {
          code: "basic",
          name: "Basic",
          price: "9.99 EUR / month",
          subtitle: "Ideal for people who want to start.",
          features: [
            "meal logging",
            "symptom logging",
            "basic correlations",
            "suspected foods",
            "safe foods",
            "symptom evolution",
          ],
        },
        {
          code: "pro",
          name: "Pro",
          price: "14.99 EUR / month",
          subtitle: "Most popular. Perfect for fast clarity.",
          highlight: true,
          features: [
            "everything in Basic",
            "advanced AI analysis",
            "problematic combination detection",
            "personalized recommendations",
            "adapted food plans",
            "daily reports",
            "detailed evolution",
          ],
        },
        {
          code: "pro_plus",
          name: "Pro+",
          price: "35.99 EUR / month",
          subtitle: "For those who want maximum precision.",
          features: [
            "everything in Pro",
            "extended AI analysis",
            "advanced predictions",
            "complex delayed reaction detection",
            "premium guidance",
            "priority support",
            "real-time personalized updates",
          ],
        },
      ],
    },
    section3: {
      title: "Why is the investment worth it?",
      bullets: [
        "you lived too long with pain",
        "you lived too long with confusion",
        "you lived too long with fear of food",
        "you lived too long without answers",
        "you tried everything",
        "you were ignored",
        "you were misunderstood",
      ],
      ending: "Now you have a real solution.",
    },
    section4: {
      title: "What do people say after they start?",
      quotes: [
        "I did not think I could find out this fast what harms me.",
        "In 3 days I had my first correlations.",
        "My symptoms dropped.",
        "I no longer live in fear of food.",
        "It finally makes sense.",
      ],
      ending: "You can have the same transformation.",
    },
    section5: {
      title: "Our guarantee",
      checks: [
        "No risks",
        "No contracts",
        "Cancel anytime",
        "Start anytime",
        "Get results from the first days",
      ],
      ending: ["You have nothing to lose.", "You have everything to gain."],
    },
    section6: {
      title: [
        "It is time to get the answers you have been searching for.",
        "Not tomorrow. Not when you have time. Not maybe.",
        "Now.",
      ],
      actions: [
        "Start your intolerance analysis",
        "Choose the plan that fits you",
        "Take your first step toward clarity",
      ],
      primaryCta: "Start your intolerance analysis",
      secondaryCta: "Choose your plan",
    },
  },
};

export function generateMetadata(): Metadata {
  const lang = getServerLanguage();
  const t = copy[lang];

  const isRo = lang === "ro";
  return {
    title: isRo ? "Prețuri — NutriAID Intolerances" : "Pricing — NutriAID Intolerances",
    description: t.metaDescription,
    alternates: {
      canonical: "/pricing",
    },
    openGraph: {
      title: isRo ? "Planuri și prețuri — NutriAID Intolerances" : "Plans & Pricing — NutriAID Intolerances",
      description: t.metaDescription,
      url: "/pricing",
      locale: isRo ? "ro_RO" : "en_US",
    },
  };
}

export default async function PricingPage() {
  const lang = getServerLanguage();
  const isRo = lang === "ro";
  const t = copy[lang];
  const settings = await getRuntimeSettings();
  const pricing = settings.pricing;

  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = authCookie ? await readSessionToken(authCookie) : null;
  const isLoggedIn = !!session;

  function formatPrice(amount: string, currency: string, interval: string, lang: 'ro' | 'en'): string {
    const curr = currency.toUpperCase();
    const intervalLabel = interval === 'year'
      ? (lang === 'ro' ? 'an' : 'year')
      : (lang === 'ro' ? 'luna' : 'month');
    return `${amount} ${curr} / ${intervalLabel}`;
  }

  const dynamicPlans = t.section2.plans.map((plan) => {
    const adminPlan = pricing[plan.code as 'basic' | 'pro' | 'pro_plus'];
    return {
      ...plan,
      price: adminPlan.amount
        ? formatPrice(adminPlan.amount, adminPlan.currency || 'eur', adminPlan.interval || 'month', lang)
        : plan.price,
      features: lang === 'ro' && adminPlan.features?.length ? adminPlan.features : plan.features,
      subtitle: lang === 'ro' && adminPlan.description ? adminPlan.description : plan.subtitle,
    };
  });

  return (
    <div className="pb-20 bg-slate-50 dark:bg-slate-950">
      <BillingCancelledNotice lang={lang} />
      <section className="relative overflow-hidden border-y border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-100 via-white to-slate-50 dark:from-emerald-950/30 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4" />
            Preturi
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white max-w-5xl">
            {t.heroTitle}
          </h1>
          <div className="mt-6 space-y-2 text-lg text-slate-700 dark:text-slate-300 max-w-4xl">
            {t.heroSubtitle.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">{t.section1.title}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 list-none p-0">
          {t.section1.bullets.map((item) => (
            <li key={item} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-slate-800 dark:text-slate-200">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-2">✔</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="space-y-1 text-lg font-semibold text-slate-900 dark:text-white">
          {t.section1.ending.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <section id="plans" className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">{t.section2.title}</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">{t.section2.note}</p>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-5 py-2 text-sm font-semibold mb-8 shadow-sm">
            <span>🎁</span>
            <span>{lang === "ro" ? "7 zile gratuit · Fără card · Anulezi oricând" : "7 days free · No card required · Cancel anytime"}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {dynamicPlans.map((plan) => (
              <article
                key={plan.name}
                className={
                  plan.highlight
                    ? "rounded-2xl border-2 border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/20 p-6 shadow-sm"
                    : "rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-6"
                }
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  {plan.highlight ? (
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                      Popular
                    </span>
                  ) : null}
                </div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mb-0.5">{plan.price}</p>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                  {lang === "ro" ? "✓ 7 zile gratuit la început" : "✓ 7-day free trial included"}
                </p>
                <p className="text-slate-700 dark:text-slate-300 mb-5">{plan.subtitle}</p>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                      <BadgeCheck className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {isLoggedIn ? (
                  <PlanCheckoutButton
                    planCode={plan.code}
                    label={lang === "ro" ? "Continua catre plata" : "Continue to checkout"}
                    loginRequiredLabel={lang === "ro" ? "Autentificare necesara." : "Login required."}
                    loadingLabel={lang === "ro" ? "Se incarca..." : "Loading..."}
                  />
                ) : (
                  <div className="mt-6">
                    <Link
                      href="/auth/register"
                      className="block w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      {lang === "ro" ? "Continua catre plata" : "Continue to checkout"}
                    </Link>
                  </div>
                )}
              </article>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            {isRo
              ? "Prin activarea unui abonament plătit îți exprimi acordul expres pentru livrarea imediată a conținutului digital și renunți la dreptul de retragere de 14 zile prevăzut de OUG nr. 34/2014."
              : "By activating a paid subscription you expressly consent to immediate delivery of digital content and waive the 14-day withdrawal right under applicable consumer law."}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">{t.section3.title}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 list-none p-0">
          {t.section3.bullets.map((item) => (
            <li key={item} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-slate-800 dark:text-slate-200">
              {item}
            </li>
          ))}
        </ul>
        <p className="rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 p-6 text-lg text-slate-900 dark:text-emerald-100 font-medium">
          {t.section3.ending}
        </p>
      </section>

      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">{t.section4.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {t.section4.quotes.map((quote) => (
              <blockquote key={quote} className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-4 text-slate-800 dark:text-slate-200">
                {quote}
              </blockquote>
            ))}
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{t.section4.ending}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">{t.section5.title}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6 list-none p-0">
          {t.section5.checks.map((item) => (
            <li key={item} className="rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/20 p-4 text-slate-900 dark:text-cyan-100 font-medium">
              {`✔ ${item}`}
            </li>
          ))}
        </ul>
        <div className="space-y-1 text-lg font-semibold text-slate-900 dark:text-white">
          {t.section5.ending.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      {/* GEO Summary + mini-FAQ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            {isRo ? "Prețuri NutriAID Intolerances" : "NutriAID Intolerances Pricing"}
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            {isRo
              ? "NutriAID Intolerances oferă un plan gratuit cu funcționalități de bază și un plan Pro cu analiză AI completă. Planul gratuit permite înregistrarea meselor și simptomelor și vizualizarea istoricului. Planul Pro deblochează analiza AI a corelațiilor, planul alimentar personalizat și generarea rapoartelor PDF. Nu există contract pe termen lung — poți anula oricând. Prețul Pro este fix, fără costuri ascunse."
              : "NutriAID Intolerances offers a free plan with basic features and a Pro plan with full AI analysis. The free plan allows meal and symptom logging and history viewing. The Pro plan unlocks AI correlation analysis, personalized food plans, and PDF report generation. There is no long-term contract — you can cancel at any time. The Pro price is fixed, with no hidden costs."}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            {isRo ? "Întrebări despre prețuri și planuri" : "Questions about pricing and plans"}
          </h2>
          <dl className="space-y-3">
            {(isRo
              ? [
                  { q: "Pot folosi NutriAID gratuit?", a: "Da. Planul gratuit include înregistrarea meselor și simptomelor și vizualizarea istoricului fără limită de timp." },
                  { q: "Ce include planul Pro față de cel gratuit?", a: "Planul Pro include analiză AI completă a corelațiilor, plan alimentar personalizat actualizat zilnic și generare rapoarte PDF." },
                  { q: "Pot anula abonamentul Pro oricând?", a: "Da. Nu există perioadă minimă de contract. Anulezi oricând din setările contului, fără penalizări." },
                ]
              : [
                  { q: "Can I use NutriAID for free?", a: "Yes. The free plan includes meal and symptom logging and history viewing with no time limit." },
                  { q: "What does the Pro plan include compared to free?", a: "The Pro plan includes full AI correlation analysis, daily-updated personalized food plan, and PDF report generation." },
                  { q: "Can I cancel the Pro subscription at any time?", a: "Yes. There is no minimum contract period. Cancel anytime from account settings, with no penalties." },
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

      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 to-cyan-700 dark:from-emerald-900 dark:to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 mb-5">
            <ShieldCheck className="h-4 w-4" />
            {isRo ? "Începe acum" : "Start now"}
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight text-white mb-6">
            {t.section6.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          <div className="mb-8 space-y-1 text-white/95 text-lg font-medium">
            {t.section6.actions.map((item) => (
              <p key={item}>→ {item}</p>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              {t.section6.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center rounded-xl border border-white/35 bg-white/10 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/20"
            >
              {t.section6.secondaryCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
