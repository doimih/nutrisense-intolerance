# NutriAID — Product Overview

**FILE PATH:** NutriAID-Acquisition-Portal/Executive-and-Product-Reports/Product-Overview.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Product-Overview.pdf  
**Classification:** Confidential — Qualified Buyers Only

---

## Platform Description

NutriAID is a full-stack SaaS web application built on Next.js 14 (frontend) and Next.js 15 (backend admin console), with PostgreSQL as the primary database via Drizzle ORM. The platform is deployed in Docker with Traefik as the reverse proxy, supporting automatic HTTPS via Let's Encrypt.

Users log daily meals and symptoms. NutriAID's AI identifies patterns, correlates foods with symptoms, and generates personalised recommendations that respect declared intolerances, allergies, and dietary preferences.

---

## End-User Features

### Authentication & Account
| Feature | Detail |
|---|---|
| Registration | Email + password, 24h verification token |
| Login | JWT HttpOnly session, SameSite=Strict |
| Password reset | Secure 1h email token |
| 2FA | TOTP (Google Authenticator compatible) |
| Account deletion | Full GDPR deletion of all personal data |
| Data export | JSON + PDF on user request |
| Session management | Cookie-based, configurable expiry, session expiry modal |

### Free Trial
- 7 days of full Pro+ access on registration
- No credit card required
- On expiry: modal guides user to upgrade

### Daily Monitoring Journal
- Log meals per slot: breakfast, lunch, dinner, snack
- Record consumed foods (free text, multi-item)
- Record symptoms with intensity score (1–10)
- Record reaction latency (minutes after eating)
- Record wellbeing score (1–10)
- Add free-text notes
- History: searchable, filterable by date, food, or symptom

### AI Guidance (Orchestrated)
- User submits a natural language request in Romanian or English
- Orchestrator detects intent (7 types, bilingual keyword matching) and routes through worker chain
- GEO engine adapts food recommendations to the user's country/region from their browser locale
- Diversity engine prevents repeated food suggestions across workers in a single session
- Result returned in user's language (RO or EN)
- All outputs are behavioral and non-medical — no diagnoses, no calorie claims, no supplements
- Full orchestration trace logged per session
- Export guidance result as branded PDF

### Dashboard
- KPI bento grid: symptom trend, wellbeing trend, recent journal feed
- Intolerance badge strip (flagged foods highlighted)
- Symptom trend chart (time series)
- Quick actions: new journal entry, request guidance

### Profile
- Name, email, age, height, weight
- Dietary preference (omnivore, vegetarian, vegan, gluten-free, etc.)
- Declared food intolerances (multi-select)
- Activity level
- Nutritional goals (calorie target, macro splits)

### Knowledge Hub
- Curated articles on food intolerances, celiac disease, IBS, SIBO
- Internal search
- Category filtering

### PDF Export
- Full nutrition guidance report
- Symptom history timeline
- Branded with NutriAID design system
- Server-rendered, no third-party dependency

### Pricing & Billing
- Three subscription tiers via Stripe
- Checkout flow with Stripe Elements
- Customer billing portal (invoice history, payment method update, cancellation)
- Trial expiry modal with upgrade CTA
- Billing cancelled notice on pricing page

---

## Subscription Plans

| Feature | Basic (€9.99/mo) | Pro (€14.99/mo) | Pro+ (€35.99/mo) | Enterprise |
|---|---|---|---|---|
| Meal + symptom logging | ✅ | ✅ | ✅ | ✅ |
| Basic correlations | ✅ | ✅ | ✅ | ✅ |
| AI guidance (basic) | ❌ | ✅ | ✅ | ✅ |
| Advanced AI analysis | ❌ | ✅ | ✅ | ✅ |
| Comprehensive analysis | ❌ | ❌ | ✅ | ✅ |
| PDF export | ❌ | ✅ | ✅ | ✅ |
| Progress tracking | ❌ | ✅ | ✅ | ✅ |
| Priority support | ❌ | ❌ | ✅ | ✅ |
| Custom integrations | ❌ | ❌ | ❌ | ✅ |

---

## Admin Console Features

### Dashboard
- Live user count, active subscriptions, revenue metrics
- Recent system events log
- AI pipeline health status

### User Management
- Full user list with search and filter
- Subscription status per user
- Role management (user / admin / superadmin)
- Manual plan override
- User suspension / reactivation

### AI Brain Settings
- Select primary and fallback model (any OpenAI-compatible endpoint)
- Set temperature, max tokens
- Configure global system prompt
- Configure per-worker custom prompts
- Enable/disable individual workers
- Worker Diagnostic Panel (live test, supervision report)

### AI Test Lab
- Chat tab: test the AI pipeline with custom inputs
- Orchestrator tab: run full orchestration traces
- Workers tab: test individual workers in isolation
- Platform tab: health checks and connectivity tests

### Billing & Pricing
- Set plan prices, descriptions, and features from admin UI
- Configure Stripe keys (publishable, secret, webhook secret)
- Sync Stripe prices
- View all subscriptions and payment history
- Export payments CSV

### Email Configuration
- SMTP host, port, user, password, encryption
- From name and from email
- Send test email
- Email diagnostics endpoint
- 5 bilingual email templates (welcome, verify, reset, trial expiry, cancellation)

### Security
- 2FA enforcement (admin-only or all users)
- TOTP secret management
- reCAPTCHA v3 (site key, secret key, score threshold)
- IP-based visitor session management with expiry and block
- Security event log

### Backup
- Scheduled database backup (daily/weekly/monthly)
- Destination: local or S3-compatible (Hetzner Object Storage)
- Manual backup trigger
- Backup history log
- Connection test

### Archive
- Generate time-limited download links for platform archive
- Download complete code + data archive
- Link expiry and download tracking

### PWA
- Enable/disable progressive web app
- App name, short name, theme colour, background colour
- VAPID key for push notifications
- Notification type configuration (daily reminder, weekly report, guidance ready, system alerts)

### Visitor Demo Account
- Pre-configured visitor@nutriaid.eu account for demos
- Session duration control
- IP-based session reset
- Visitor session log

---

## Technical Stack Summary

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, App Router, TypeScript, Tailwind CSS |
| Backend | Next.js 15, App Router, TypeScript, Tailwind CSS |
| Database | PostgreSQL 16, Drizzle ORM |
| AI | OpenAI GPT-4o, Gemini 1.5 Pro, OpenAI-compatible API |
| Billing | Stripe Subscriptions, Webhooks, Customer Portal |
| Auth | JWT HttpOnly, SameSite=Strict, TOTP 2FA |
| Email | Nodemailer (SMTP), 5 bilingual templates |
| Storage | S3-compatible (Hetzner), Docker volumes |
| Deployment | Docker Compose, Traefik, Let's Encrypt |
| i18n | Romanian + English, all pages and emails |
| PWA | Web App Manifest, service worker, push notifications |

---

## GDPR Compliance

| Requirement | Implementation |
|---|---|
| Right to access | Full data export (JSON + PDF) on user request |
| Right to erasure | Complete account deletion including all journal entries |
| Consent | Cookie banner with granular preferences |
| Data retention | Configurable retention policy in admin settings |
| Processing logs | Audit trail in superadmin console |

---

*NutriAID Acquisition Portal — Confidential — June 2026*
