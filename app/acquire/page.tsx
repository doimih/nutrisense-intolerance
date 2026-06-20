import type { Metadata } from "next";
import Link from "next/link";
import GeoReadyBadge from "./GeoReadyBadge";
import { getServerLanguage } from "@/lib/i18n/server";
import {
  Brain,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  Settings2,
  Download,
  ArrowRight,
  Lock,
  BarChart3,
  Rocket,
  Users,
  Server,
  TrendingUp,
  Gavel,
  BookOpen,
  PackageSearch,
  FlaskConical,
  Mail,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const lang = getServerLanguage();
  const isRo = lang === "ro";
  return {
    title: isRo ? "Portal de Achiziție — NutriAID" : "Acquisition Portal — NutriAID",
    description: isRo
      ? "Cameră de date privată pentru cumpărători calificați. NutriAID este o platformă SaaS de nutriție nativă AI disponibilă pentru achiziție la €50.000–€120.000."
      : "Private data room for qualified buyers. NutriAID is an AI-native nutrition SaaS platform available for acquisition at €50,000–€120,000.",
    robots: { index: false, follow: false },
  };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const DOWNLOAD_BASE = '/api/acquisition/download?file=';

type DocItem = {
  title: string;
  description: string;
  file: string;
  tag?: string;
};

type DocSection = {
  id: string;
  icon: React.ElementType;
  label: string;
  title: string;
  description: string;
  docs: DocItem[];
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function DealStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <p className="text-2xl font-extrabold text-emerald-600">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}

function HighlightCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-3">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-bold text-slate-900 leading-snug">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function DocCard({ doc }: { doc: DocItem }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all duration-200 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
            {doc.tag && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {doc.tag}
              </span>
            )}
          </div>
          <h4 className="font-bold text-slate-900 text-sm leading-snug">{doc.title}</h4>
        </div>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed flex-1">{doc.description}</p>
      <Link
        href={`${DOWNLOAD_BASE}${doc.file}`}
        download
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        {doc.file}
        <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function AcquisitionPortalPage() {
  const lang = getServerLanguage();
  const isRo = lang === "ro";

  // ── Deal stats ──────────────────────────────────────────────────────────────
  const DEAL_STATS = [
    { label: isRo ? "Preț de Achiziție" : "Asking Price", value: "€50k–€120k" },
    { label: isRo ? "Cost de Reconstrucție" : "Rebuild Cost", value: "€108,000+" },
    { label: isRo ? "Infrastructură/Lună" : "Monthly Infra", value: "<€200" },
    { label: isRo ? "Agenți AI" : "AI Workers", value: "10 Workers" },
    { label: isRo ? "Planuri de Abonament" : "Subscription Plans", value: "3 Tiers + EA" },
    { label: isRo ? "Timp de Instalare" : "Deploy Time", value: "<1 Hour" },
  ];

  // ── Platform highlights ─────────────────────────────────────────────────────
  const PLATFORM_HIGHLIGHTS = [
    {
      icon: Brain,
      title: isRo ? "AI Brain — Orchestrator" : "AI Brain — Orchestrator",
      description: isRo
        ? "Detecția intenției direcționează fiecare cerere a utilizatorului printr-un lanț de agenți ordonați. Complet bilingv (RO/EN) — orchestratorul detectează limba și o propagă fiecărui agent. Suportă GPT-4o, Gemini, Claude sau orice endpoint compatibil OpenAI — configurabil la runtime fără modificări de cod."
        : "Intent detection routes every user request through an ordered worker chain. Fully bilingual (RO/EN) — the orchestrator detects language and propagates it to every worker. Supports GPT-4o, Gemini, Claude, or any OpenAI-compatible endpoint — configurable at runtime without code changes.",
    },
    {
      icon: ShieldCheck,
      title: isRo ? "Layer Auto-Reparare" : "Self-Healing Layer",
      description: isRo
        ? "Fiecare ieșire a unui agent trece prin validare schema, validare semantică și verificări de siguranță. La eșec, Supervizorul declanșează auto-corectarea via modelul primar, cade pe cel secundar, apoi pe un motor bazat pe reguli — zero intervenție umană."
        : "Every worker output passes schema validation, semantic validation, and safety checks. On failure, the Worker Supervisor triggers auto-correction via the primary model, falls back to the secondary, then to a rule-based engine — zero human intervention required.",
    },
    {
      icon: FlaskConical,
      title: isRo ? "Motor de Diagnosticare" : "Diagnostic Engine",
      description: isRo
        ? "AI Test Lab pentru administratori permite operatorilor să ruleze teste live ale orchestratorului, să inspecteze secvențele de agenți, să urmărească evenimentele de corectare și să revizuiască rapoartele de supraveghere în timp real."
        : "Admin-facing AI Test Lab lets operators run live orchestrator tests, inspect worker sequences, trace correction events, and review per-worker supervision reports in real time.",
    },
    {
      icon: Cpu,
      title: isRo ? "Orchestrare Agenți" : "Worker Orchestration",
      description: isRo
        ? "10 agenți specializați — Analizor Profil, Verificator Intoleranțe, Verificator Alergii, Generator Plan Alimentar, Constructor Rețete, Calculator Nutrițional, Siguranță Medicală, Consilier Suplimente, Tracker Progres, Listă Cumpărături — fiecare cu scheme tipizate stricte și prompturi configurabile din admin fără redeployment."
        : "10 specialised workers — Profile Analyzer, Intolerance Checker, Allergy Checker, Meal Plan Generator, Recipe Builder, Nutrition Calculator, Medical Safety, Supplement Advisor, Progress Tracker, Shopping List — each with strict typed schemas and admin-configurable prompts that override built-in roles without redeployment.",
    },
    {
      icon: TrendingUp,
      title: isRo ? "Generare Multiplă" : "Multi-Series Generation",
      description: isRo
        ? "Utilizatorii pot regenera un set complet nou de recomandări oricând via butonul Regenerate dedicat. Fiecare set este produs independent de întregul pipeline al orchestratorului — fără refolosire cache — asigurând rezultate proaspete la fiecare cerere."
        : "Users can regenerate a completely new set of recommendations at any time via the dedicated Regenerate button. Each set is independently produced by the full orchestrator pipeline — no cache reuse — ensuring fresh, varied output on every request.",
    },
    {
      icon: FileText,
      title: isRo ? "Generare PDF" : "PDF Generation",
      description: isRo
        ? "Utilizatorii pot exporta raportul complet de nutriție, istoricul simptomelor și ghidajul AI ca PDF marcat — un singur click, redat server-side, fără dependențe terțe."
        : "Users can export their full nutrition report, symptom history, and AI-generated guidance as a branded PDF — one click, server-rendered, no third-party dependency.",
    },
    {
      icon: Settings2,
      title: isRo ? "Consolă Admin Fără Cod" : "Zero-Code Admin Console",
      description: isRo
        ? "Prețuri, configurare model AI, SMTP, chei Stripe, reCAPTCHA, 2FA, prompturi agenți, setări PWA — fiecare parametru operațional este configurabil din panoul superadmin fără deployment-uri necesare."
        : "Prices, AI model config, SMTP, Stripe keys, reCAPTCHA, 2FA, worker prompts, PWA settings — every operational parameter is configurable from the superadmin panel with no deployments required.",
    },
    {
      icon: Mail,
      title: isRo ? "Newsletter — Integrare Brevo" : "Newsletter — Brevo Integration",
      description: isRo
        ? "Sistem de newsletter integrat cu Brevo (Sendinblue). Utilizatorii se pot abona printr-un popup inteligent post-înregistrare sau din formularul din footer. Consimțământul este înregistrat cu timestamp și sursă pentru conformitate GDPR completă. Segmentare separată pentru utilizatori înregistrați și abonați publici — totul gestionat din tab-ul Brevo din consola admin."
        : "Integrated Brevo (Sendinblue) newsletter system. Users can opt in via a smart post-signup popup or the site-wide footer form. Consent is recorded with timestamp and source for full GDPR compliance. Separate list segmentation for registered users vs. public subscribers — all managed from the Brevo Settings tab in the admin console.",
    },
    {
      icon: Rocket,
      title: isRo ? "Modul Rețete & Cooking Mode" : "Recipes Module & Cooking Mode",
      description: isRo
        ? "Modul complet de rețete: generare AI cu RecipeModal, salvare rețete în cont, batches pentru regenerare multiplă, modul de gătit pas cu pas (CookingMode) optimizat pentru ecran complet, pagină dedicată în dashboard. Trei tabele DB noi: recipes, recipeBatches, recipeUsage — complet integrate în profilul de intoleranțe al utilizatorului."
        : "Full recipes module: AI generation via RecipeModal, per-user saved recipes, batch regeneration, step-by-step full-screen Cooking Mode, dedicated dashboard page. Three new DB tables: recipes, recipeBatches, recipeUsage — fully integrated with the user's intolerance profile.",
    },
    {
      icon: TrendingUp,
      title: isRo ? "TikTok Pixel & Early Adopter" : "TikTok Pixel & Early Adopter",
      description: isRo
        ? "Integrare TikTok Pixel configurabilă din admin — activat doar cu consimțământ explicit GDPR. Program Early Adopter: primii 100 de utilizatori înregistrați primesc acces Pro gratuit cu banner dedicat în dashboard. Onboarding Modal ghidează noii utilizatori prin completarea profilului imediat după înregistrare."
        : "Admin-configurable TikTok Pixel integration — fires only after explicit GDPR consent. Early Adopter programme: first 100 registered users receive free Pro access with a dedicated dashboard banner. Onboarding Modal guides new users through profile setup immediately after registration.",
    },
  ];

  // ── Documentation sections ──────────────────────────────────────────────────
  const DOC_SECTIONS: DocSection[] = [
    {
      id: "executive",
      icon: BookOpen,
      label: isRo ? "Executiv & Produs" : "Executive & Product",
      title: isRo ? "Rapoarte Executiv & Produs" : "Executive & Product Reports",
      description: isRo
        ? "Începeți aici. Patru documente care acoperă problema, soluția, ceea ce face NutriAID unic și un walkthrough al fiecărei funcționalități pe care un cumpărător ar dori să o demonstreze. Potrivit pentru investitori, achizitori și parteneri strategici."
        : "Start here. Four documents covering the problem, the solution, what makes NutriAID uniquely defensible, and a walkthrough of every feature a buyer would demo. Suitable for investors, acquirers, and strategic partners.",
      docs: [
        {
          title: "Executive Summary",
          description:
            "A concise, high-conviction overview of NutriAID: the problem, the solution, the market opportunity, the revenue model, and the key arguments for acquisition at the stated price.",
          file: "Executive-Summary.pdf",
          tag: isRo ? "Începeți aici" : "Start here",
        },
        {
          title: "Product Overview",
          description:
            "Full product specification: every end-user feature (guidance, journal, history, recipes, cooking mode, shopping list, progress, PDF export, PWA), every admin capability, billing tiers (Basic / Pro / Pro+ / Early Adopter), GDPR posture (TikTok Pixel consent, newsletter consent audit, data export/delete), i18n RO/EN, 2FA, and the complete feature-to-plan mapping.",
          file: "Product-Overview.pdf",
        },
        {
          title: "Unique Selling Points",
          description:
            "A structured comparison of the 15+ capabilities that no competing nutrition app ships: AI orchestration, self-healing output validation, advanced food comfort-pattern detection, GEO-localisation engine, zero-code admin, multi-model support (OpenAI / Gemini / Claude / any OpenAI-compatible endpoint), Brevo newsletter system with GDPR consent audit trail, full recipes module with Cooking Mode, TikTok Pixel integration with consent gating, Early Adopter programme, and more.",
          file: "Unique-Selling-Points.pdf",
        },
        {
          title: "Demo Walkthrough",
          description:
            "Step-by-step walkthrough of the live platform: onboarding flow, daily journal, AI guidance request, orchestrator execution trace, admin console, and billing portal — as a qualified buyer would experience it.",
          file: "Demo-Walkthrough.pdf",
        },
      ],
    },
    {
      id: "technical",
      icon: Layers,
      label: isRo ? "Tehnic" : "Technical",
      title: isRo ? "Documentație Tehnică" : "Technical Documentation",
      description: isRo
        ? "Nouă documente care acoperă întregul stack de inginerie — de la arhitectura sistemului la subsistemele AI individuale, modulul de rețete, suprafața API, schema bazei de date (11 tabele). Redactate pentru ingineri seniori care efectuează due diligence tehnic."
        : "Nine documents covering the full engineering stack — from system architecture to individual AI subsystems, the recipes module, API surface, and database schema (11 tables). Written for senior engineers conducting technical due diligence.",
      docs: [
        {
          title: "Architecture Report",
          description:
            "Full system topology: Next.js 14 frontend, Next.js 15 admin backend, PostgreSQL + Drizzle ORM, Docker + Traefik, inter-service communication, API endpoint map, and data flow diagrams.",
          file: "Architecture-Report.pdf",
          tag: isRo ? "Due diligence tehnic" : "Engineering DD",
        },
        {
          title: "AI Brain Documentation",
          description:
            "Deep dive into the AI Orchestrator: intent detection, worker routing table, context accumulation chain, model configuration (primary / fallback / rule-based), and live execution logs.",
          file: "AI-Brain-Documentation.pdf",
        },
        {
          title: "Self-Healing Layer",
          description:
            "Worker Supervisor pipeline: schema validation → semantic validation → safety checks → auto-correction → re-validation → structured logging. The mechanism that makes the platform autonomous.",
          file: "Self-Healing-Layer.pdf",
        },
        {
          title: "Diagnostic Engine",
          description:
            "AI Test Lab and worker diagnostic system: how operators run live orchestrator tests, inspect per-worker supervision reports, trace correction events, and identify model degradation in real time.",
          file: "Diagnostic-Engine.pdf",
        },
        {
          title: "Prompt Rewriter Documentation",
          description:
            "How admin-configurable prompts override built-in worker roles at runtime, without redeployment. Covers the system prompt hierarchy, per-worker override logic, and the correction prompt builder.",
          file: "Prompt-Rewriter.pdf",
        },
        {
          title: "Worker Orchestration Documentation",
          description:
            "Complete specification of all 10 AI workers: Profile Analyzer, Intolerance Checker, Allergy Checker, Meal Plan Generator, Recipe Builder (powers the Recipes module), Nutrition Calculator, Medical Safety, Supplement Advisor, Progress Tracker, Shopping List — schemas, validation rules, and routing logic.",
          file: "Worker-Orchestration.pdf",
        },
        {
          title: "Newsletter System (Brevo)",
          description:
            "Architecture and implementation of the Brevo-integrated newsletter system: database schema additions (newsletter_opt_in, newsletter_consent_at, newsletter_consent_source, language), the 4 REST endpoints (GET /api/newsletter/status, POST /accept, POST /decline, POST /subscribe-public), GDPR consent recording, bilingual smart popup and footer form, and Brevo API synchronisation via internal service authentication.",
          file: "Newsletter-System.pdf",
          tag: isRo ? "Nou" : "New",
        },
        {
          title: "API Documentation",
          description:
            "Full API reference for all public, internal, and superadmin endpoints. Covers authentication headers, request/response schemas, error codes, and rate-limit behaviour. Includes the 4 newsletter endpoints: GET /api/newsletter/status, POST /api/newsletter/accept, POST /api/newsletter/decline, POST /api/newsletter/subscribe-public.",
          file: "API-Documentation.pdf",
        },
        {
          title: "Database Schema Report",
          description:
            "PostgreSQL schema documentation: all 11 tables (users, userProfiles, monitoringEntries, userProblems, subscriptions, guidanceHistory, verificationTokens, passwordResetTokens, recipes, recipeBatches, recipeUsage) with column types, constraints, and index strategy. Includes newsletter columns on users table (newsletter_opt_in, newsletter_consent_at, newsletter_consent_source, language) and the complete recipes module schema.",
          file: "Database-Schema-Report.pdf",
        },
      ],
    },
    {
      id: "deployment",
      icon: Server,
      label: isRo ? "Deployment" : "Deployment",
      title: isRo ? "Instalare & Deployment" : "Installation & Deployment",
      description: isRo
        ? "Trei ghiduri care acoperă setup-ul local, deployment-ul în producție și scalarea orizontală — tot ce are nevoie un cumpărător tehnic pentru a instala platforma într-un mediu nou în mai puțin de o oră."
        : "Three guides covering local setup, production deployment, and horizontal scaling — everything a technical buyer needs to stand up the platform in a new environment within one hour.",
      docs: [
        {
          title: "Installation Guide",
          description:
            "Local development setup: Node.js prerequisites, environment variable configuration, PostgreSQL provisioning, database migration, first-run superadmin bootstrap, and smoke test checklist.",
          file: "Installation-Guide.pdf",
        },
        {
          title: "Deployment Guide",
          description:
            "Docker Compose production deployment: Traefik reverse proxy configuration, Let's Encrypt TLS, Stripe webhook registration, SMTP setup, S3 backup configuration, and post-deploy health checks.",
          file: "Deployment-Guide.pdf",
        },
        {
          title: "Scaling Guide",
          description:
            "Horizontal and vertical scaling playbook: PostgreSQL read replicas, CDN integration, AI API rate-limit management, caching strategy, and estimated infrastructure cost at 1k / 10k / 100k users.",
          file: "Scaling-Guide.pdf",
        },
      ],
    },
    {
      id: "business",
      icon: BarChart3,
      label: isRo ? "Business & Evaluare" : "Business & Valuation",
      title: isRo ? "Business & Evaluare" : "Business & Valuation",
      description: isRo
        ? "Șapte documente care acoperă imaginea comercială completă — dimensiunea pieței, publicul țintă, avantajul competitiv, modelele de monetizare, structura de costuri, evaluarea prin patru metode și foaia de parcurs pentru creștere."
        : "Seven documents covering the full commercial picture — market size, target audience, competitive moat, monetisation models, cost structure, four-method valuation, and growth roadmap.",
      docs: [
        {
          title: "Market Analysis",
          description:
            "Global nutrition app market: $8.5B TAM (2023), 21% CAGR. European intolerance-management segment, celiac disease prevalence, Romania / CEE opportunity, and health-tech regulatory tailwinds.",
          file: "Market-Analysis.pdf",
        },
        {
          title: "Target Audience Report",
          description:
            "Three buyer segments: B2C (intolerance sufferers, IBS/SIBO patients, performance athletes), B2B white-label (nutrition clinics, pharma wellness divisions, health insurers), and platform acquirers.",
          file: "Target-Audience-Report.pdf",
        },
        {
          title: "Competitive Analysis",
          description:
            "Side-by-side comparison with Cronometer, MyFitnessPal, Cara, Zoe, and Lifesum. NutriAID is the only solution combining AI orchestration, self-healing validation, and a zero-code admin console in one deployable package.",
          file: "Competitive-Analysis.pdf",
        },
        {
          title: "Monetization Models",
          description:
            "Five monetisation paths: B2C subscription (current), B2B white-label licensing, clinical API access, data insights (anonymised, GDPR-compliant), and premium one-time export credits.",
          file: "Monetization-Models.pdf",
        },
        {
          title: "Cost Structure",
          description:
            "Full cost breakdown: infrastructure (<€200/month for first 1,000 users), AI API costs (~€82/1,000 active users/month), email, support, and total OpEx at 500 / 2,000 / 10,000 user tiers.",
          file: "Cost-Structure.pdf",
        },
        {
          title: "Valuation Report (€70k–€120k)",
          description:
            "Four-method valuation convergence: replacement cost (€108k+ rebuild at €80/h senior rate), SaaS revenue multiple, asset-based valuation, and comparable transactions. Final justified asking price: €50,000–€120,000.",
          file: "Valuation-Report.pdf",
          tag: isRo ? "Document cheie" : "Key document",
        },
        {
          title: "Growth Strategy",
          description:
            "Three-horizon roadmap: H1 stabilise and monetise, H2 B2B white-label licensing to clinics and pharma divisions, H3 international expansion with clinical-grade integrations. Channel strategies for each horizon.",
          file: "Growth-Strategy.pdf",
        },
      ],
    },
    {
      id: "media",
      icon: PackageSearch,
      label: isRo ? "Kit Media" : "Media Kit",
      title: isRo ? "Kit Media" : "Media Kit",
      description: isRo
        ? "Patru documente care acoperă activele de brand, copii aprobate, scripturi video și ghiduri de branding — gata de utilizat pe Acquire.com, Empire Flippers, FE International sau în prezentări pentru investitori."
        : "Four documents covering brand assets, approved copy, video scripts, and branding guidelines — ready to use on Acquire.com, Empire Flippers, FE International, or in investor pitch decks.",
      docs: [
        {
          title: "Media Kit Report",
          description:
            "Logo variants, brand colour palette (#4CAF50 / #1A1A1A / #FFFFFF), product screenshot set, approved press copy, one-liner and elevator pitch variants, and social media card templates.",
          file: "Media-Kit-Report.pdf",
        },
        {
          title: "Demo Video Script",
          description:
            "Full narrated script for a 5–8 minute product demo video: scene-by-scene breakdown, on-screen actions, voiceover copy, and transition cues — ready for screen recording.",
          file: "Demo-Video-Script.pdf",
        },
        {
          title: "Short Video Script",
          description:
            "60-second pitch script for LinkedIn, X/Twitter, and marketplace listings. Hook, core value proposition, three differentiators, and CTA — optimised for silent autoplay.",
          file: "Short-Video-Script.pdf",
        },
        {
          title: "Branding Guidelines",
          description:
            "Complete brand standards: colour system, typography (Inter), logo usage rules, spacing, card component style, tone of voice, and do/don't examples for white-label buyers.",
          file: "Branding-Guidelines.pdf",
        },
      ],
    },
    {
      id: "legal",
      icon: Gavel,
      label: isRo ? "Pachet Legal" : "Legal Pack",
      title: isRo ? "Pachet Legal" : "Legal Pack",
      description: isRo
        ? "Cinci documente legale pentru o achiziție curată și fără fricțiuni. Redactate pentru jurisdicție UE, compatibile cu escrow și gata pentru revizuire juridică. Descărcați mai întâi NDA-ul înainte de a solicita pachetul complet."
        : "Five legal documents for a clean, low-friction acquisition. Drafted for EU jurisdiction, escrow-compatible, and ready for legal review. Download the NDA first before requesting the full pack.",
      docs: [
        {
          title: "NDA",
          description:
            "Mutual Non-Disclosure Agreement for pre-acquisition discussions. Covers all disclosed technical, financial, and commercial information. 2-year term, EU jurisdiction, standard escrow-compatible clauses.",
          file: "NDA.pdf",
          tag: isRo ? "Descărcați primul" : "Download first",
        },
        {
          title: "IP Transfer Agreement",
          description:
            "Full Intellectual Property Transfer Agreement: source code, database contents, domain names (nutriaid.eu + variants), brand assets, third-party accounts (Stripe, SMTP, hosting), and all associated IP.",
          file: "IP-Transfer-Agreement.pdf",
        },
        {
          title: "License Agreement",
          description:
            "Optional white-label license agreement template for buyers who prefer to license the platform to third parties rather than sell it. Covers usage rights, sublicensing, revenue sharing, and termination clauses.",
          file: "License-Agreement.pdf",
        },
        {
          title: "Terms of Sale",
          description:
            "Full Terms of Sale with escrow-compatible payment milestones (deposit / milestone / final), warranty period, handover obligations, non-compete clause, and governing law.",
          file: "Terms-of-Sale.pdf",
        },
        {
          title: "Liability Disclaimer",
          description:
            "Seller liability disclaimer covering platform as-is warranty, medical disclaimer (platform is not a medical device), data accuracy limitations, and post-sale support scope.",
          file: "Liability-Disclaimer.pdf",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-16">
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90">
              <Lock className="h-4 w-4" />
              {isRo ? "Cameră de Date Privată" : "Private Data Room"}
            </div>
            <GeoReadyBadge />
          </div>

          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            NutriAID
            <span className="block text-emerald-400">
              {isRo ? "SaaS nativ AI" : "AI-native SaaS"}
            </span>
          </h1>

          <p className="mb-3 text-xl font-semibold text-white/80">
            {isRo
              ? "Complet construit. Deploiat. Gata de achiziție."
              : "Fully built. Deployed. Ready to acquire."}
          </p>

          <p className="mb-10 max-w-2xl text-base text-white/65 leading-relaxed">
            {isRo
              ? "O platformă SaaS de management al intoleranțelor alimentare, alimentată de AI, cu orchestrator multi-agent, layer auto-reparare, consolă admin zero-cod, bilingv RO/EN, conform GDPR — deploy în mai puțin de o oră."
              : "An AI-powered food intolerance management SaaS with a multi-agent orchestrator, self-healing layer, zero-code admin console, bilingual RO/EN, GDPR-compliant — deploy in under one hour."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#docs"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 shadow-lg shadow-emerald-900/40"
            >
              {isRo ? "Explorează documentele" : "Browse Documents"}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {isRo ? "Contactează vânzătorul" : "Contact Seller"}
            </a>
          </div>
        </div>
      </section>

      {/* ── Deal stats ────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {DEAL_STATS.map((s) => (
              <DealStatCard key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform highlights ───────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600">
            {isRo ? "Ce este inclus" : "What's included"}
          </p>
          <h2 className="mb-10 text-3xl font-extrabold text-slate-900">
            {isRo ? "Capacități ale platformei" : "Platform capabilities"}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORM_HIGHLIGHTS.map((h) => (
              <HighlightCard
                key={h.title}
                icon={h.icon}
                title={h.title}
                description={h.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Documents ─────────────────────────────────────────────────────────── */}
      <section id="docs" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600">
            {isRo ? "Camera de date" : "Data Room"}
          </p>
          <h2 className="mb-4 text-3xl font-extrabold text-slate-900">
            {isRo ? "Documentație completă" : "Full documentation pack"}
          </h2>
          <p className="mb-12 max-w-2xl text-base text-slate-600">
            {isRo
              ? "Șase secțiuni, 30+ documente. Tot ce are nevoie un cumpărător calificat pentru due diligence tehnic, financiar și legal complet — incluzând documentație actualizată pentru modulul de rețete, TikTok Pixel, programul Early Adopter și schema DB cu 11 tabele."
              : "Six sections, 30+ documents. Everything a qualified buyer needs for complete technical, financial, and legal due diligence — including updated documentation for the recipes module, TikTok Pixel integration, Early Adopter programme, and 11-table database schema."}
          </p>

          {/* Section nav */}
          <div className="mb-10 flex flex-wrap gap-2">
            {DOC_SECTIONS.map((s) => {
              const SIcon = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
                >
                  <SIcon className="h-3.5 w-3.5" />
                  {s.label}
                </a>
              );
            })}
          </div>

          {/* Sections */}
          <div className="space-y-16">
            {DOC_SECTIONS.map((section) => {
              const SectionIcon = section.icon;
              return (
                <div key={section.id} id={section.id}>
                  <div className="mb-6 flex items-start gap-4">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <SectionIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>
                      <p className="mt-1 max-w-2xl text-sm text-slate-600">{section.description}</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {section.docs.map((doc) => (
                      <DocCard key={doc.file} doc={doc} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Technology stack ──────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-slate-400">
            {isRo ? "Stack Tehnologic" : "Technology Stack"}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Next.js 14 (Frontend)",
              "Next.js 15 (Admin Backend)",
              "PostgreSQL + Drizzle ORM",
              "Tailwind CSS",
              "TypeScript",
              "Docker + Traefik",
              "Stripe Billing",
              "OpenAI GPT-4o",
              "Gemini 1.5 Pro",
              "OpenAI-compatible API",
              "JWT HttpOnly Sessions",
              "TOTP 2FA",
              "Google reCAPTCHA v3",
              "Nodemailer SMTP",
              "Brevo Newsletter",
              "TikTok Pixel",
              "S3-compatible Backup",
              "PWA (Web App Manifest)",
              "i18n RO / EN",
              "PDF Export (Guidance + History)",
              "Early Adopter Programme",
              "Onboarding Modal",
              "GDPR Compliant",
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Acquire Now ───────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600">
            {isRo ? "Cazul de Investiție" : "The Investment Case"}
          </p>
          <h2 className="mb-10 text-3xl font-extrabold text-slate-900">
            {isRo ? "De ce să achiziționezi NutriAID acum" : "Why acquire NutriAID now"}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Rocket,
                title: isRo ? "12–18 luni de inginerie, livrată" : "12–18 months of engineering, delivered",
                body: isRo
                  ? "Platforma este complet construită, testată și deployată pe branch-ul de producție. Fără risc MVP. Fără funcționalități pe jumătate construite. Cumpărătorul achiziționează software finalizat și funcțional."
                  : "The platform is fully built, tested, and deployed on the production branch. No MVP risk. No half-built features. The buyer is acquiring finished, working software.",
              },
              {
                icon: TrendingUp,
                title: isRo ? "Venituri recurente, costuri minime" : "Recurring revenue, minimal overhead",
                body: isRo
                  ? "Trei niveluri de abonament (€9,99 / €14,99 / €35,99/lună). La 500 de abonați pe planuri mixte, MRR estimat este €7.500–€12.000. Costurile de infrastructură rămân sub €200/lună pentru primii 1.000 de utilizatori."
                  : "Three subscription tiers (€9.99 / €14.99 / €35.99/month). At 500 mixed-plan subscribers, estimated MRR is €7,500–€12,000. Infrastructure costs stay below €200/month for the first 1,000 users.",
              },
              {
                icon: Server,
                title: isRo ? "Autonom și auto-reparabil" : "Autonomous and self-healing",
                body: isRo
                  ? "Pipeline-ul AI se corectează singur. Dacă modelul primar eșuează, cel de rezervă preia. Dacă ambele eșuează, motorul bazat pe reguli oferă un răspuns valid. Platforma funcționează fără intervenție umană."
                  : "The AI pipeline corrects itself. If the primary model fails, the fallback model takes over. If both fail, the rule-based engine provides a valid response. The platform runs without human intervention.",
              },
              {
                icon: Users,
                title: isRo ? "Gata pentru white-label B2B" : "B2B white-label ready",
                body: isRo
                  ? "Platforma este arhitecturată pentru white-labelling. Clinici de nutriție, divizii wellness farma și asigurători de sănătate sunt ținta B2B imediată. Un singur codebase, multiple identități de brand."
                  : "The platform is architected for white-labelling. Nutrition clinics, pharma wellness divisions, and health insurers are the immediate B2B target. One codebase, multiple brand skins.",
              },
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-3"
                >
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ItemIcon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 leading-snug text-sm">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Contact & Acquisition ─────────────────────────────────────────────── */}
      <section
        id="contact"
        className="relative overflow-hidden bg-gradient-to-br from-emerald-700 to-emerald-900"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 mb-5">
            <Lock className="h-4 w-4" />
            {isRo ? "Cerere de Achiziție Confidențială" : "Confidential Acquisition Enquiry"}
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            {isRo ? "Pregătit să faci o ofertă?" : "Ready to make an offer?"}
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-white/85 leading-relaxed mb-10">
            {isRo
              ? "Toate cererile sunt gestionate sub NDA mutual. Trimite o scurtă introducere — background-ul tău, cazul de utilizare intenționat și calendarul propus — și vei primi un răspuns în 24 de ore. O sesiune demo live poate fi aranjată pentru cumpărători calificați."
              : "All enquiries are handled under mutual NDA. Send a brief introduction — your background, intended use case, and proposed timeline — and you will receive a response within 24 hours. A live demo session can be arranged for qualified buyers."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="mailto:acquire@nutriaid.eu?subject=NutriAID%20Acquisition%20Enquiry"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-emerald-700 transition hover:bg-emerald-50 shadow-sm"
            >
              <Mail className="h-5 w-5" />
              acquire@nutriaid.eu
            </a>
            <Link
              href={`${DOWNLOAD_BASE}NDA.pdf`}
              download
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-white/20"
            >
              <Download className="h-5 w-5" />
              {isRo ? "Descarcă NDA mai întâi" : "Download NDA First"}
            </Link>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3 text-left">
            {[
              {
                step: "01",
                title: isRo ? "Semnează NDA" : "Sign NDA",
                desc: isRo
                  ? "Descarcă NDA-ul mutual din Pachetul Legal, semnează și returnează."
                  : "Download the mutual NDA from the Legal Pack, sign, and return.",
              },
              {
                step: "02",
                title: isRo ? "Demo Live" : "Live Demo",
                desc: isRo
                  ? "Programăm un walkthrough live al platformei complete, inclusiv consola admin."
                  : "We schedule a live walkthrough of the full platform including the admin console.",
              },
              {
                step: "03",
                title: isRo ? "Ofertă & Escrow" : "Offer & Escrow",
                desc: isRo
                  ? "Stabilim prețul final și finalizăm transferul prin Escrow.com sau echivalent."
                  : "Agree on final price and complete the transfer via Escrow.com or equivalent.",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="rounded-xl border border-white/20 bg-white/10 p-5"
              >
                <p className="text-xs font-extrabold text-white/50 mb-1">
                  {isRo ? `Pasul ${step.step}` : `Step ${step.step}`}
                </p>
                <p className="font-bold text-white mb-1">{step.title}</p>
                <p className="text-sm text-white/75">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer note ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {isRo
              ? "Portal de Achiziție NutriAID · Privat & Confidențial · Iunie 2026"
              : "NutriAID Acquisition Portal · Private & Confidential · June 2026"}
          </p>
          <p className="text-sm text-slate-400">
            {isRo
              ? "Acest document și toate atașamentele sunt protejate sub NDA mutual. Distribuirea neautorizată este interzisă."
              : "This document and all attachments are protected under mutual NDA. Unauthorised distribution is prohibited."}
          </p>
        </div>
      </footer>
    </div>
  );
}
