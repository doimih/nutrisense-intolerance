import type { Metadata } from "next";
import Link from "next/link";
import GeoReadyBadge from "./GeoReadyBadge";
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

export const metadata: Metadata = {
  title: "Acquisition Portal — NutriAID",
  description:
    "Private data room for qualified buyers. NutriAID is an AI-native nutrition SaaS platform available for acquisition at €50,000–€120,000.",
  robots: { index: false, follow: false },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEAL_STATS = [
  { label: "Asking Price", value: "€50k–€120k" },
  { label: "Rebuild Cost", value: "€108,000+" },
  { label: "Monthly Infra", value: "<€200" },
  { label: "AI Workers", value: "10 Specialists" },
  { label: "Subscription Plans", value: "3 Tiers" },
  { label: "Deploy Time", value: "<1 Hour" },
];

const PLATFORM_HIGHLIGHTS = [
  {
    icon: Brain,
    title: "AI Brain — Orchestrator",
    description:
      "Intent detection routes every user request through an ordered worker chain. Fully bilingual (RO/EN) — the orchestrator detects language and propagates it to every worker. Supports GPT-4o, Gemini, Claude, or any OpenAI-compatible endpoint — configurable at runtime without code changes.",
  },
  {
    icon: ShieldCheck,
    title: "Self-Healing Layer",
    description:
      "Every worker output passes schema validation, semantic validation, and safety checks. On failure, the Worker Supervisor triggers auto-correction via the primary model, falls back to the secondary, then to a rule-based engine — zero human intervention required.",
  },
  {
    icon: FlaskConical,
    title: "Diagnostic Engine",
    description:
      "Admin-facing AI Test Lab lets operators run live orchestrator tests, inspect worker sequences, trace correction events, and review per-worker supervision reports in real time.",
  },
  {
    icon: Cpu,
    title: "Worker Orchestration",
    description:
      "10 specialised workers — Profile Analyzer, Intolerance Checker, Allergy Checker, Meal Plan Generator, Recipe Builder, Nutrition Calculator, Medical Safety, Supplement Advisor, Progress Tracker, Shopping List — each with strict typed schemas and admin-configurable prompts that override built-in roles without redeployment.",
  },
  {
    icon: TrendingUp,
    title: "Multi-Series Generation",
    description:
      "Users can regenerate a completely new set of recommendations at any time via the dedicated Regenerate button. Each set is independently produced by the full orchestrator pipeline — no cache reuse — ensuring fresh, varied output on every request.",
  },
  {
    icon: FileText,
    title: "PDF Generation",
    description:
      "Users can export their full nutrition report, symptom history, and AI-generated guidance as a branded PDF — one click, server-rendered, no third-party dependency.",
  },
  {
    icon: Settings2,
    title: "Zero-Code Admin Console",
    description:
      "Prices, AI model config, SMTP, Stripe keys, reCAPTCHA, 2FA, worker prompts, PWA settings — every operational parameter is configurable from the superadmin panel with no deployments required.",
  },
];

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

const DOC_SECTIONS: DocSection[] = [
  {
    id: "executive",
    icon: BookOpen,
    label: "Executive & Product",
    title: "Executive & Product Reports",
    description:
      "Start here. Four documents covering the problem, the solution, what makes NutriAID uniquely defensible, and a walkthrough of every feature a buyer would demo. Suitable for investors, acquirers, and strategic partners.",
    docs: [
      {
        title: "Executive Summary",
        description:
          "A concise, high-conviction overview of NutriAID: the problem, the solution, the market opportunity, the revenue model, and the key arguments for acquisition at the stated price.",
        file: "Executive-Summary.pdf",
        tag: "Start here",
      },
      {
        title: "Product Overview",
        description:
          "Full product specification: every end-user feature, every admin capability, the billing tiers (Basic / Pro / Pro+), GDPR posture, i18n, PWA, 2FA, and the complete feature-to-plan mapping.",
        file: "Product-Overview.pdf",
      },
      {
        title: "Unique Selling Points",
        description:
          "A structured comparison of the 12 capabilities that no competing nutrition app ships: AI orchestration, self-healing output validation, celiac-grade intolerance detection, zero-code admin, multi-model support, and more.",
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
    label: "Technical",
    title: "Technical Documentation",
    description:
      "Eight documents covering the full engineering stack — from system architecture to individual AI subsystems, API surface, and database schema. Written for senior engineers conducting technical due diligence.",
    docs: [
      {
        title: "Architecture Report",
        description:
          "Full system topology: Next.js 14 frontend, Next.js 15 admin backend, PostgreSQL + Drizzle ORM, Docker + Traefik, inter-service communication, API endpoint map, and data flow diagrams.",
        file: "Architecture-Report.pdf",
        tag: "Engineering DD",
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
          "Complete specification of all 10 AI workers: Profile Analyzer, Intolerance Checker, Allergy Checker, Meal Plan Generator, Recipe Builder, Nutrition Calculator, Medical Safety, Supplement Advisor, Progress Tracker, Shopping List — schemas, validation rules, and routing logic.",
        file: "Worker-Orchestration.pdf",
      },
      {
        title: "API Documentation",
        description:
          "Full API reference for all public, internal, and superadmin endpoints. Covers authentication headers, request/response schemas, error codes, and rate-limit behaviour.",
        file: "API-Documentation.pdf",
      },
      {
        title: "Database Schema Report",
        description:
          "PostgreSQL schema documentation: all 8 tables (users, userProfiles, monitoringEntries, userProblems, subscriptions, guidanceHistory, verificationTokens, passwordResetTokens) with column types, constraints, and index strategy.",
        file: "Database-Schema-Report.pdf",
      },
    ],
  },
  {
    id: "deployment",
    icon: Server,
    label: "Deployment",
    title: "Installation & Deployment",
    description:
      "Three guides covering local setup, production deployment, and horizontal scaling — everything a technical buyer needs to stand up the platform in a new environment within one hour.",
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
    label: "Business & Valuation",
    title: "Business & Valuation",
    description:
      "Seven documents covering the full commercial picture — market size, target audience, competitive moat, monetisation models, cost structure, four-method valuation, and growth roadmap.",
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
        tag: "Key document",
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
    label: "Media Kit",
    title: "Media Kit",
    description:
      "Four documents covering brand assets, approved copy, video scripts, and branding guidelines — ready to use on Acquire.com, Empire Flippers, FE International, or in investor pitch decks.",
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
    label: "Legal Pack",
    title: "Legal Pack",
    description:
      "Five legal documents for a clean, low-friction acquisition. Drafted for EU jurisdiction, escrow-compatible, and ready for legal review. Download the NDA first before requesting the full pack.",
    docs: [
      {
        title: "NDA",
        description:
          "Mutual Non-Disclosure Agreement for pre-acquisition discussions. Covers all disclosed technical, financial, and commercial information. 2-year term, EU jurisdiction, standard escrow-compatible clauses.",
        file: "NDA.pdf",
        tag: "Download first",
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
          <h4 className="font-bold text-slate-900 leading-snug">{doc.title}</h4>
        </div>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed flex-1">{doc.description}</p>
      <a
        href={`${DOWNLOAD_BASE}${doc.file}`}
        className="inline-flex items-center gap-2 self-start rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 group-hover:shadow-sm"
      >
        <Download className="h-4 w-4" />
        Download PDF
      </a>
    </div>
  );
}

function SectionAnchorTag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
      {label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AcquirePage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-slate-100/80 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
              <Lock className="h-3.5 w-3.5" />
              Private · Confidential · NDA-Protected
            </div>
            <GeoReadyBadge />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-none tracking-tight text-slate-900 max-w-4xl">
            NutriAID
            <span className="block text-emerald-600">Acquisition Portal</span>
          </h1>

          <p className="mt-6 max-w-2xl text-xl text-slate-600 leading-relaxed">
            A production-ready, AI-native SaaS platform for nutrition personalisation and food intolerance intelligence.
            Built to enterprise standards. Available for acquisition at{" "}
            <strong className="text-slate-900">€50,000–€120,000</strong>.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#executive"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
            >
              Browse Documents
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700"
            >
              <Mail className="h-4 w-4" />
              Contact the Seller
            </a>
          </div>

          {/* Nav anchors */}
          <nav className="mt-12 flex flex-wrap gap-2" aria-label="Section navigation">
            {DOC_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* ── Deal Snapshot ─────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Deal Snapshot
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {DEAL_STATS.map((stat) => (
              <DealStatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Highlights ───────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600">
                Platform Architecture
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900">
                What makes NutriAID enterprise-grade
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Six proprietary systems that no off-the-shelf nutrition app ships. Each one is
                documented, tested, and transferable on day one.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORM_HIGHLIGHTS.map((h) => (
              <HighlightCard key={h.title} {...h} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Document Sections ─────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {DOC_SECTIONS.map((section, idx) => {
          const Icon = section.icon;
          const isOdd = idx % 2 === 0;
          return (
            <section
              key={section.id}
              id={section.id}
              className={`border-b border-slate-200 py-16 ${isOdd ? "" : ""}`}
            >
              {/* Section header */}
              <div className="mb-8">
                <div className="mb-3 flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <SectionAnchorTag label={section.label} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  {section.title}
                </h2>
                <p className="mt-3 max-w-3xl text-slate-600 leading-relaxed">
                  {section.description}
                </p>
              </div>

              {/* Doc cards */}
              <div
                className={`grid gap-4 ${
                  section.docs.length === 1
                    ? "grid-cols-1 lg:grid-cols-2"
                    : section.docs.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {section.docs.map((doc) => (
                  <DocCard key={doc.title} doc={doc} />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* ── Platform Tech Stack ───────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Technology Stack
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
              "S3-compatible Backup",
              "PWA (Web App Manifest)",
              "i18n RO / EN",
              "PDF Export",
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

      {/* ── Why Acquire Now ───────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600">
            The Investment Case
          </p>
          <h2 className="mb-10 text-3xl font-extrabold text-slate-900">
            Why acquire NutriAID now
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Rocket,
                title: "12–18 months of engineering, delivered",
                body:
                  "The platform is fully built, tested, and deployed on the production branch. No MVP risk. No half-built features. The buyer is acquiring finished, working software.",
              },
              {
                icon: TrendingUp,
                title: "Recurring revenue, minimal overhead",
                body:
                  "Three subscription tiers (€9.99 / €14.99 / €35.99/month). At 500 mixed-plan subscribers, estimated MRR is €7,500–€12,000. Infrastructure costs stay below €200/month for the first 1,000 users.",
              },
              {
                icon: Server,
                title: "Autonomous and self-healing",
                body:
                  "The AI pipeline corrects itself. If the primary model fails, the fallback model takes over. If both fail, the rule-based engine provides a valid response. The platform runs without human intervention.",
              },
              {
                icon: Users,
                title: "B2B white-label ready",
                body:
                  "The platform is architected for white-labelling. Nutrition clinics, pharma wellness divisions, and health insurers are the immediate B2B target. One codebase, multiple brand skins.",
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

      {/* ── Contact & Acquisition ─────────────────────────────────────────── */}
      <section
        id="contact"
        className="relative overflow-hidden bg-gradient-to-br from-emerald-700 to-emerald-900"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 mb-5">
            <Lock className="h-4 w-4" />
            Confidential Acquisition Enquiry
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            Ready to make an offer?
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-white/85 leading-relaxed mb-10">
            All enquiries are handled under mutual NDA. Send a brief introduction — your background,
            intended use case, and proposed timeline — and you will receive a response within 24
            hours. A live demo session can be arranged for qualified buyers.
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
              Download NDA First
            </Link>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3 text-left">
            {[
              {
                step: "01",
                title: "Sign NDA",
                desc: "Download the mutual NDA from the Legal Pack, sign, and return.",
              },
              {
                step: "02",
                title: "Live Demo",
                desc: "We schedule a live walkthrough of the full platform including the admin console.",
              },
              {
                step: "03",
                title: "Offer & Escrow",
                desc: "Agree on final price and complete the transfer via Escrow.com or equivalent.",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="rounded-xl border border-white/20 bg-white/10 p-5"
              >
                <p className="text-xs font-extrabold text-white/50 mb-1">Step {step.step}</p>
                <p className="font-bold text-white mb-1">{step.title}</p>
                <p className="text-sm text-white/75">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer note ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            NutriAID Acquisition Portal · Private & Confidential · June 2026
          </p>
          <p className="text-sm text-slate-400">
            This document and all attachments are protected under mutual NDA. Unauthorised
            distribution is prohibited.
          </p>
        </div>
      </footer>
    </div>
  );
}
