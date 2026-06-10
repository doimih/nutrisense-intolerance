# NutriAID Intolerances

**AI-powered food intolerance identification platform.** Users log meals and symptoms daily; the AI engine correlates patterns, detects delayed reactions, and delivers personalised guidance — things no manual approach can reliably do.

Built as a white-label SaaS product ready for deployment, resale, or rebranding.

---

## Table of Contents

- [Product Overview](#product-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Feature Map](#feature-map)
- [Subscription Plans](#subscription-plans)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment with Traefik](#production-deployment-with-traefik)
- [Environment Variables](#environment-variables)
- [Admin Console](#admin-console)
- [AI Engine](#ai-engine)
- [Database](#database)
- [Email](#email)
- [Stripe Billing](#stripe-billing)
- [PWA](#pwa)
- [i18n](#i18n)
- [Security](#security)
- [Scripts & QA](#scripts--qa)

---

## Product Overview

NutriAID Intolerances solves the core problem of food intolerance identification: the symptoms are delayed (sometimes 24–48 h), combination-triggered, and highly individual. A doctor's diary approach misses most patterns. The AI doesn't.

**Core user journey:**

1. User registers and gets a 7-day free trial (Pro+ tier)
2. Logs meals and symptoms daily in the monitoring journal
3. The AI engine analyses correlations, delayed reactions, and problematic combinations
4. User receives a personalised guidance report — suspected foods, safe foods, meal recommendations
5. Reports are available in-app and as downloadable PDFs
6. When the trial ends, the user picks a subscription plan

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 3, lucide-react icons |
| Database ORM | Drizzle ORM |
| Database | PostgreSQL 16 |
| AI — primary | GPT-4o (OpenAI) |
| AI — fallback | Gemini 1.5 Pro |
| Payments | Stripe (Subscriptions API) |
| Email | Nodemailer / SMTP |
| Admin console | Next.js 14 (standalone service, port 4028) |
| PDF generation | PDFKit |
| Authentication | JWT-based signed cookies (custom, no NextAuth) |
| Containerisation | Docker, Docker Compose |
| Reverse proxy | Traefik (optional, production) |
| Package manager | npm |
| Testing | Vitest (unit), custom smoke/E2E scripts |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Traefik (TLS)                        │
│           nutriaid.eu  ·  backend.nutriaid.eu            │
└────────────────┬──────────────────────┬─────────────────┘
                 │                      │
        ┌────────▼──────┐      ┌────────▼──────┐
        │   Frontend    │      │    Backend    │
        │  Next.js 14   │      │  Next.js 14   │
        │   port 3000   │      │   port 4028   │
        │               │      │               │
        │  User-facing  │      │  Admin panel  │
        │  API routes   │◄────►│  AI workers   │
        │  AI guidance  │      │  Superadmin   │
        └───────┬───────┘      └───────────────┘
                │
        ┌───────▼───────┐
        │  PostgreSQL   │
        │   port 5432   │
        └───────────────┘
```

The **frontend** handles all end-user flows: authentication, journal, AI guidance requests, billing, and public pages. It talks to PostgreSQL directly and calls the backend's internal API for Stripe config and AI orchestration.

The **backend** (admin console) is a completely separate Next.js app. It manages platform settings (Stripe, AI keys, email, 2FA, pricing, backups, PWA), user management, audit logs, and AI worker orchestration. It persists its own data in a JSON file (`/app/data/superadmin-db.json`) — no database dependency.

---

## Feature Map

### End-user application (`localhost:3000`)

| Area | Features |
|---|---|
| **Auth** | Register, email verification, login, logout, forgot/reset password, account deletion, GDPR data export |
| **Dashboard** | Monitoring journal, AI guidance, history, profile |
| **Monitoring journal** | Log meals + symptoms per day, wellbeing score, reaction latency, notes |
| **AI Guidance** | On-demand analysis: suspected foods, safe foods, meal recommendations, daily plan — gated by plan tier |
| **History** | Timeline of past guidance sessions |
| **PDF reports** | Download any guidance session as a PDF (Pro/Pro+) |
| **Profile** | Edit name/email, dietary preferences, known intolerances, billing section |
| **Billing** | Trial status, active plan display, upgrade/cancel/billing portal (Stripe) |
| **Pricing page** | Dynamic plan cards (prices from admin), direct Stripe checkout for logged-in users |
| **Knowledge Hub** | 9 informational articles (symptoms, AI analysis, meal plans, GDPR, PDF reports) |
| **Public pages** | Home, About, Why AI, FAQ, Contact, Trust |
| **Legal** | Privacy policy, Terms, Cookies policy, Data retention, Security policy, Medical disclaimer |
| **PWA** | Installable app, configurable name/colours/icons from admin |

### Admin console (`localhost:4028`)

| Area | Features |
|---|---|
| **Dashboard** | Platform overview, user count, subscription stats, recent activity |
| **User management** | List all platform users, activate/deactivate, edit, assign plan, view subscription |
| **Settings — Email** | SMTP configuration, test email, email diagnostics |
| **Settings — Stripe** | Secret key, webhook secret, publishable key, product/price IDs per plan, billing mode, currency, trial days, validation tool |
| **Settings — Pricing** | Display amounts, currencies, intervals and feature lists per plan (fed to the frontend dynamically) |
| **Settings — AI Keys** | API key, primary/fallback model selection |
| **Settings — AI Brain** | Orchestrator URL, system prompt, per-worker prompts, streaming/cache flags, temperature, max tokens |
| **Settings — 2FA** | Enable/enforce TOTP for admins and/or all users |
| **Settings — PWA** | App name, short name, theme/background colour, VAPID key, notification preferences |
| **Settings — Backup** | Schedule, retention, destination (local / Hetzner Object Storage) |
| **Settings — reCAPTCHA** | Site key, secret key, score threshold |
| **AI Test Lab** | Run and inspect AI worker chains live from the admin panel |
| **Logs** | Full orchestrator and system log viewer |
| **Audit trail** | Every admin action is recorded with actor, IP, and timestamp |
| **Exports** | Export user and subscription data |
| **Payments** | Payment history view |
| **Subscriptions** | Subscription records view |
| **Security events** | Security log viewer |
| **Stripe tools** | Validate connection + product/price IDs, sync prices from Stripe |

---

## Subscription Plans

Three recurring subscription tiers, all with a **7-day free trial** (no card required at signup):

| Plan | Features |
|---|---|
| **Basic** | Meal logging, symptom logging, basic correlations, suspected/safe foods, symptom evolution |
| **Pro** | Everything in Basic + advanced AI analysis, problematic combination detection, personalised recommendations, meal plans, daily reports, detailed evolution |
| **Pro+** | Everything in Pro + extended AI analysis, advanced predictions, complex delayed-reaction detection, premium guidance, priority support |

Prices are configurable at any time from the admin console without redeployment. Stripe handles recurring billing, cancellation, and the customer portal.

---

## Project Structure

```
/
├── app/                        # Next.js App Router — all user-facing pages
│   ├── api/                    # API route handlers
│   │   ├── auth/               # register, login, logout, verify-email, forgot/reset-password
│   │   ├── billing/            # checkout, webhook, subscription, cancel, portal
│   │   ├── guidance/           # AI guidance orchestration, history, PDF export
│   │   ├── monitoring/         # journal entries CRUD
│   │   ├── profile/            # user profile
│   │   ├── contact/            # contact form
│   │   └── internal/           # internal service-to-service routes
│   ├── auth/                   # login, register, verify, forgot/reset pages
│   ├── dashboard/              # protected area: monitoring, guidance, history, profile
│   ├── pricing/                # pricing page + PlanCheckoutButton component
│   ├── knowledge-hub/          # 9 informational articles
│   ├── legal/                  # privacy, terms, cookies, data retention, security, medical disclaimer
│   └── [public pages]/         # home, about, why-ai, faq, contact, trust
│
├── backend/                    # Standalone admin console (Next.js 14, port 4028)
│   └── src/
│       ├── app/
│       │   ├── admin/          # admin panel pages (dashboard, settings, logs, AI test lab)
│       │   └── api/            # superadmin API routes
│       ├── ai/                 # AI orchestrator, workers, supervisor, auto-corrector
│       └── lib/server/
│           └── superadmin/     # store (JSON), auth, RBAC, audit logging, types
│
├── components/                 # Shared React components (Navbar, Footer, DashboardShell, etc.)
├── lib/
│   ├── auth/                   # session token creation/validation
│   ├── billing/                # plan definitions, Stripe price ID resolution
│   ├── db/                     # Drizzle client + schema
│   ├── i18n/                   # RO/EN translations, server/client helpers
│   └── server/                 # authStore, subscriptionStore, email, runtimeSettings, stripe, guidance engine
├── types/                      # TypeScript type definitions
├── public/                     # Static assets (PWA icons)
├── Dockerfile                  # Frontend container (multi-stage, Node 20 Alpine)
├── docker-compose.yml          # Local/production compose (frontend + backend + postgres)
├── docker-compose.traefik.yml  # Traefik-integrated compose for production
└── docker.env.example          # Environment variable template
```

---

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)
- npm

### Setup

```bash
# 1. Clone and install
git clone <repo-url> nutriaid-intolerances
cd nutriaid-intolerances
npm install
npm --prefix backend install

# 2. Configure environment
cp docker.env.example .env
# Edit .env — set DATABASE_URL and other required vars

# 3. Push database schema
npx drizzle-kit push

# 4. Start both services together
npm run dev:all
```

Services:
- Frontend: http://localhost:3000
- Admin console: http://localhost:4028
- Admin redirect shortcut: http://localhost:3000/backend

### Individual services

```bash
npm run dev:frontend   # frontend only (port 3000)
npm run dev:backend    # admin console only (port 4028)
```

---

## Docker Deployment

### Quick start (local / staging)

```bash
# 1. Prepare environment
cp docker.env.example .env
# Edit .env with real values (see Environment Variables section)

# 2. Build images
docker compose build

# 3. Start stack
docker compose up -d

# 4. Check status
docker compose ps
docker compose logs -f frontend
```

Services exposed:
- `http://localhost:3000` — user application
- `http://localhost:4028` — admin console

### Rebuild after code changes

```bash
docker compose up -d --build
```

### Stop / teardown

```bash
docker compose down          # stop and remove containers
docker compose down -v       # also remove volumes (deletes database data)
```

---

## Production Deployment with Traefik

The `docker-compose.traefik.yml` file is designed for servers already running a Traefik reverse proxy. It does not publish host ports — Traefik routes by hostname with automatic Let's Encrypt TLS.

### Prerequisites

- A running Traefik instance on the same server
- DNS A records pointing your domains to the server
- Traefik configured with entrypoints `web` (:80) and `websecure` (:443) and a certresolver named `letsencrypt`

### Deploy

```bash
# 1. Configure .env
cp docker.env.example .env

# Required for Traefik deployment:
TRAEFIK_HOST=nutriaid.eu
TRAEFIK_HOST_ALT=               # optional alternate domain
TRAEFIK_NETWORK=traefik_public  # must match your Traefik network
TRAEFIK_CERTRESOLVER=letsencrypt
TRAEFIK_ENTRYPOINT_HTTP=web
TRAEFIK_ENTRYPOINT_HTTPS=websecure
BACKEND_HOST=backend.nutriaid.eu

# 2. Start with Traefik compose
docker compose -f docker-compose.traefik.yml up -d --build

# 3. Verify TLS
curl -I https://nutriaid.eu
curl -I https://backend.nutriaid.eu
```

The stack handles:
- HTTP → HTTPS redirect
- www → apex redirect
- HSTS with preload
- Security headers (X-Frame-Options, X-Content-Type-Options, CSP)

---

## Environment Variables

Copy `docker.env.example` to `.env` and fill in all values.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | Public URL of the frontend (e.g. `https://nutriaid.eu`) |
| `BACKEND_URL` | Yes | Public URL of the admin console |
| `NEXT_PUBLIC_ADMIN_CONSOLE_URL` | Yes | Same as `BACKEND_URL` |
| `BACKEND_HOST` | Yes | Hostname only, used by Traefik routing |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SESSION_SECRET` | Yes | 32+ byte hex secret for signing user session JWTs |
| `FRONTEND_SUPERADMIN_EMAIL` | Yes | Email of the frontend superadmin account |
| `FRONTEND_SUPERADMIN_PASSWORD` | Yes | Password for the frontend superadmin account |
| `SUPERADMIN_SESSION_SECRETS` | Yes | Signing secret for admin console sessions |
| `SUPERADMIN_EMAIL` | Yes | Default admin console superadmin email |
| `SUPERADMIN_PASSWORD` | Yes | Default admin console superadmin password |
| `SUPERADMIN_TOTP_ISSUER` | No | Issuer name shown in TOTP apps (default: `NutriSense Admin`) |
| `AI_PRIMARY_MODEL` | No | Primary AI model (default: `gpt-4o`) |
| `AI_FALLBACK_MODEL` | No | Fallback AI model (default: `gemini-1.5-pro`) |
| `AI_API_KEY` | No | OpenAI/compatible API key — without it, rule-based guidance is used |
| `SMTP_PASS` | No | SMTP password — configured fully via admin console |
| `TRAEFIK_HOST` | Traefik only | Primary domain |
| `TRAEFIK_NETWORK` | Traefik only | Docker network shared with Traefik |
| `TRAEFIK_CERTRESOLVER` | Traefik only | Traefik cert resolver name |
| `TRAEFIK_ENTRYPOINT_HTTP` | Traefik only | HTTP entrypoint name |
| `TRAEFIK_ENTRYPOINT_HTTPS` | Traefik only | HTTPS entrypoint name |

**Stripe, SMTP, and AI settings are configured through the admin console UI** and stored in the backend's data volume — no environment variables needed after initial deploy.

---

## Admin Console

Access: `https://backend.nutriaid.eu` (or `http://localhost:4028`)

Default credentials are set via `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` environment variables. Change them immediately after first login.

### First-time setup checklist

1. **Email** — configure SMTP and send a test email
2. **Stripe** — enter secret key, webhook secret, publishable key; add product/price IDs for Basic, Pro, Pro+; run Validate
3. **Pricing** — set display amounts and feature lists (these feed the frontend pricing page dynamically)
4. **AI Keys** — enter your OpenAI API key; select primary and fallback models
5. **AI Brain** — review system prompt and per-worker configurations
6. **2FA** — optionally enforce TOTP for admin accounts
7. **reCAPTCHA** — optionally enable for the contact and registration forms
8. **PWA** — customise app name, icons, and notification settings

The admin console persists all settings to `/app/data/superadmin-db.json` inside the backend container, mounted as a named volume (`backend_data`). **Back up this volume** — it contains all platform configuration and admin user data.

---

## AI Engine

The AI engine operates on two levels:

### Frontend guidance engine (`lib/server/guidance/engine.ts`)

A deterministic, rule-based analyser that runs on every platform tier. It processes monitoring entries to compute:
- **Symptom-weighted food scoring** — foods that consistently co-occur with high-intensity symptoms
- **Delayed-reaction detection** — foods eaten 30 min–48 h before symptom onset
- **Combination analysis** — pairs of foods appearing together only in bad entries
- **Safe food identification** — foods appearing exclusively in low-symptom entries

This engine produces results with zero API cost and zero latency, and serves as the fallback when no AI API key is configured.

### Backend AI orchestrator (`backend/src/ai/`)

A multi-worker pipeline that routes user intent through specialised AI worker chains:

| Worker | Role |
|---|---|
| `profile-analyzer` | Extracts nutritional profile, gaps, and constraints |
| `intolerance-checker` | Flags foods incompatible with declared intolerances |
| `allergy-checker` | Identifies allergens in the proposed meal context |
| `meal-plan-generator` | Builds personalised meal plans avoiding all flagged foods |
| `recipe-builder` | Generates detailed recipes with substitution notes |
| `nutrition-calculator` | Estimates macros and calories for generated plans |
| `medical-safety` | Final review — removes diagnoses, treatment language, and absolute claims; adds mandatory medical disclaimer |
| `supplement-advisor` | Supplement and micronutrient recommendations |
| `shopping-list-generator` | Builds shopping lists from meal plans |
| `progress-tracker` | Weekly trend analysis and symptom history |

Each worker execution passes through a **WorkerSupervisor** pipeline:
1. Run the worker with the configured model
2. Validate the output schema
3. Validate semantics (no disallowed medical language)
4. Auto-correct if needed
5. Log the execution

Primary model: GPT-4o. Automatic fallback to Gemini 1.5 Pro on failure.

---

## Database

PostgreSQL 16. Schema managed with Drizzle ORM.

### Tables

| Table | Purpose |
|---|---|
| `users` | User accounts, plan assignment, verification state |
| `verification_tokens` | Email verification tokens (24 h TTL) |
| `password_reset_tokens` | Password reset tokens (1 h TTL) |
| `subscriptions` | Stripe subscription snapshots per user (status, IDs, plan code) |
| `user_profiles` | Dietary preferences and declared intolerances per user |
| `monitoring_entries` | Daily meal and symptom journal entries |
| `user_problems` | Aggregated problem patterns for AI cross-user mining |
| `guidance_history` | Full AI guidance session records with prompts and results |

### Push schema changes

```bash
npx drizzle-kit push
```

---

## Email

Email is sent via SMTP using Nodemailer. Configure the SMTP server, credentials, and sender address in the admin console under **Settings → Email**.

Supported email types:
- Email address verification
- Welcome message
- Password reset link
- Account deletion confirmation
- Deletion feedback

**Fallback outbox:** if the SMTP server is unreachable, emails are queued to `data/email-outbox.json` and can be retried. The admin console shows queue status and diagnostics.

---

## Stripe Billing

### Setup

1. Create a Stripe account (test mode for sandbox)
2. Create three products in Stripe: Basic, Pro, Pro+ — each with a monthly recurring price
3. In the admin console → Settings → Stripe:
   - Enter your **Secret key** (`sk_test_...` for sandbox, `sk_live_...` for production)
   - Enter your **Webhook secret** (`whsec_...`)
   - Enter your **Publishable key** (`pk_...`)
   - Add the **Product ID** and **Price ID** for each plan
   - Click **Validate** to confirm connectivity

4. Register a webhook endpoint in your Stripe dashboard pointing to:
   ```
   https://nutriaid.eu/api/billing/webhook
   ```
   Subscribe to these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Webhook behaviour

| Event | Effect |
|---|---|
| `checkout.session.completed` | Sets `users.plan`, creates subscription snapshot with `status: active` |
| `customer.subscription.updated` | Updates subscription snapshot; activates or clears plan based on new status |
| `customer.subscription.deleted` | Sets subscription snapshot to `canceled`; **clears `users.plan`** so access is revoked |

### Trial

Every new user gets a 7-day Pro+ trial from the moment they register. No card required. After expiry, `getEffectivePlanTier` returns `none` and the upgrade prompt is shown.

---

## PWA

NutriAID Intolerances is a Progressive Web App — it can be installed on mobile and desktop.

Configure in the admin console → Settings → PWA:
- App name and short name
- Theme colour and background colour
- VAPID public key (for push notifications)
- Notification types: daily reminder, weekly report, guidance ready, system alerts

The web manifest is generated dynamically (`/manifest.webmanifest`) from the admin settings at request time.

---

## i18n

The platform supports Romanian (`ro`) and English (`en`). Romanian is the default and currently the production language — all copy, metadata, legal text, and AI prompts are bilingual.

Language is determined server-side via a cookie (`lang`) and applied through:
- `lib/i18n/server.ts` — `getServerLanguage()` for server components
- `lib/i18n/ui.ts` — translation maps for client components

To force English: set the `lang` cookie to `en`.

---

## Security

- **Sessions:** HMAC-signed JWTs stored in `HttpOnly; Secure; SameSite=Strict` cookies. Separate session secrets for frontend users and admin console.
- **Passwords:** scrypt with per-user salt (64-byte output).
- **Rate limiting:** applied to auth endpoints (register, login, password reset, verification resend).
- **CSP:** strict Content Security Policy applied via `next.config.mjs` headers.
- **HSTS:** max-age 31536000 with `includeSubDomains` and `preload` (Traefik production config).
- **Frame protection:** `X-Frame-Options: DENY` + `frame-ancestors 'none'` in CSP.
- **Stripe webhooks:** all webhook events are verified with HMAC-SHA256 before processing.
- **Internal APIs:** service-to-service calls between frontend and backend are authenticated with a rotating `internalEmailToken` generated automatically at first run.
- **2FA:** optional TOTP enforced for admin console users via admin settings.
- **RBAC:** admin console enforces role-based access for all superadmin routes.

---

## Scripts & QA

```bash
# Full QA pipeline (lint + type-check + build + unit tests + smoke tests)
npm run qa

# Individual steps
npm run lint
npm run type-check
npm run build:all

# Unit tests
npm run test:unit

# Smoke tests (requires running stack)
npm run test:smoke

# E2E user/AI flow test
npm run test:e2e:user-ai
```

---

## License

Proprietary. All rights reserved.

---

*Built with Next.js 14 · Drizzle ORM · PostgreSQL · Stripe · OpenAI GPT-4o*
