# NutriAID — Architecture Report

**FILE PATH:** NutriAID-Acquisition-Portal/Technical-Documentation/Architecture-Report.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Architecture-Report.pdf  
**Classification:** Confidential — Engineering Due Diligence

---

## System Overview

NutriAID is a two-application monorepo:

| Application | Framework | Port | Role |
|---|---|---|---|
| Frontend | Next.js 14 (App Router) | 3000 | User-facing SaaS app |
| Backend | Next.js 15 (App Router) | 4028 | Admin console + AI pipeline |
| PostgreSQL | Postgres 16 | 5432 | Relational database |
| Traefik | v3 | 80/443 | Reverse proxy, SSL termination |

---

## Deployment Topology

```
Internet
    │
    ▼
Traefik (reverse proxy)
    ├── nutriaid.eu        → Frontend (port 3000)
    └── backend.nutriaid.eu → Backend (port 4028)
            │
            ├── Frontend internal API (http://frontend:3000/api/internal/*)
            │   └── Protected by INTERNAL_SYNC_SECRET
            └── PostgreSQL (postgres:5432)
                    │
                    └── Drizzle ORM migrations
```

All services run in Docker Compose. Traefik handles Let's Encrypt TLS automatically.

---

## Frontend Architecture

**Framework:** Next.js 14, App Router, TypeScript, Tailwind CSS

### Route Structure

```
app/
├── page.tsx                   # Landing page
├── login/                     # Authentication
├── register/                  # Registration + email verification
├── dashboard/                 # User dashboard (KPI grid, journal feed)
├── guidance/                  # AI guidance request + results
├── monitoring-journal/        # Daily food + symptom journal
├── history/                   # Past guidance results
├── profile/                   # User profile management
├── knowledge-hub/             # Curated intolerance articles
├── pricing/                   # Subscription plans + checkout
├── acquire/                   # Acquisition portal (this document)
├── daily-plan/                # Daily meal plan view
├── faq/                       # Frequently asked questions
├── about/, contact/, trust/   # Static pages
├── why-ai/                    # AI explanation page
├── superadmin/                # Superadmin redirect
└── api/
    ├── auth/                  # Login, register, verify, reset, session
    ├── billing/               # Checkout, portal, webhook, subscription
    ├── guidance/              # AI guidance + history + PDF export
    ├── monitoring/            # Journal CRUD
    ├── profile/               # Profile CRUD
    ├── contact/               # Contact form
    ├── acquisition/download/  # PDF download tracking endpoint
    └── internal/              # Internal endpoints for backend ↔ frontend
```

### Middleware

`middleware.ts` handles:
- Session cookie validation on all protected routes
- i18n language detection (browser locale → cookie)
- Redirect unauthenticated users to `/login`
- Redirect authenticated users away from auth pages

### Session Model

```typescript
type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  exp: number;
}
// Signed JWT, stored in HttpOnly SameSite=Strict cookie
// Secret: AUTH_SESSION_SECRET environment variable
```

---

## Backend Architecture

**Framework:** Next.js 15, App Router, TypeScript, Tailwind CSS

### Route Structure

```
backend/src/app/
├── dashboard/                 # Admin dashboard
├── guidance/                  # Guidance viewer
├── history/                   # History viewer
├── monitoring-journal/        # Journal viewer
├── admin/
│   ├── ai-test-lab/           # AI Test Lab (Chat, Orchestrator, Workers, Platform)
│   ├── logs/                  # System + AI log viewer
│   └── settings/              # Full settings console (14 tabs)
└── api/
    ├── admin/                 # Test endpoints, worker diagnostics
    ├── public/guidance/       # Public orchestration endpoint
    ├── superadmin/            # All admin API routes
    └── internal/              # Internal email, log, recaptcha
```

### Data Store

The backend uses a **JSON file store** (`data/superadmin-db.json`) for all admin state. This is intentional — it makes the platform portable, zero-configuration for the database layer, and trivially backupable.

```typescript
type SuperadminDb = {
  users: SuperadminUser[];          // Admin accounts
  subscriptions: SubscriptionRecord[];
  payments: PaymentRecord[];
  logs: LogRecord[];                // System logs (max 2000)
  auditEvents: AuditEvent[];       // Audit trail (max 1000)
  securityEvents: SecurityEvent[]; // Login/session events (max 1500)
  aiLogs: AIExecutionLog[];        // AI summary logs (max 1000)
  AI_Logs: AILogRecord[];          // Full AI trace logs (max 10000)
  archiveLinks: ArchiveLink[];     // Download link tokens
  visitorSessions: VisitorIpSession[];
  acquisitionDownloads: AcquisitionDownloadRecord[]; // Download tracking
  settings: PlatformSettings;      // All operational configuration
};
```

### Internal Communication

Backend → Frontend calls use `FRONTEND_INTERNAL_URL` + `INTERNAL_SYNC_SECRET`:

```
Backend endpoint calls:
  http://frontend:3000/api/internal/sync-superadmin-password
  http://frontend:3000/api/internal/platform-users
  http://frontend:3000/api/internal/acquisition/downloads
```

Frontend → Backend calls use `BACKEND_INTERNAL_URL`:
```
  http://backend:4028/api/internal/email
  http://backend:4028/api/internal/log
  http://backend:4028/api/public/guidance/orchestrate
```

---

## Database Architecture

**Database:** PostgreSQL 16, Drizzle ORM

### Tables

| Table | Primary Key | Records |
|---|---|---|
| `users` | `id` (text UUID) | Auth accounts |
| `userProfiles` | `id` (serial) | Profile data |
| `monitoringEntries` | `id` (text UUID) | Journal entries |
| `userProblems` | `id` (text UUID) | AI-derived patterns |
| `subscriptions` | `id` (serial) | Stripe subscriptions |
| `guidanceHistory` | `id` (text UUID) | AI guidance results |
| `verificationTokens` | `id` (serial) | Email verification |
| `passwordResetTokens` | `id` (serial) | Password reset |

### Key Indexes

- `users.email` — UNIQUE (authentication lookup)
- `userProfiles.userEmail` — UNIQUE (one profile per user)
- `subscriptions.email` — UNIQUE (one subscription per user)
- `monitoringEntries.userId` — non-unique (feed queries)
- `guidanceHistory.userEmail` — non-unique (history queries)

---

## AI Pipeline Architecture

```
User request (natural language)
        │
        ▼
Intent Detection
  Keywords matched against 7 intent categories:
  meal-plan | recipe | shopping-list | supplement-advice
  | nutritional-analysis | progress-tracking | general-nutrition

        │
        ▼
Worker Routing Table
  Intent → ordered list of worker IDs

        │
        ▼
For each worker in sequence:
  1. realWorkerExecutor.callModel()
     → GPT-4o (primary) or gpt-4o-mini (fallback)
     → Reads per-worker prompt from DB (or built-in role)
     → Passes accumulated context from previous workers

  2. WorkerSupervisor.superviseWorkerExecution()
     → validateWorkerSchema() — required fields, types
     → validateSemantics() — intolerance/allergy compliance
     → If PASS → return output
     → If FAIL → autoCorrect()
       → callAI(primaryModel)
       → If fail → callAI(fallbackModel)
       → If fail → ruleBasedCorrect()
     → Re-validate corrected output
     → Log correction event

  3. Accumulate output into context for next worker

        │
        ▼
Final response assembled from last worker output
+ orchestrator metadata (_orchestratorMeta)

        │
        ▼
logOrchestratorEvent() → AI_Logs in backend DB
```

---

## Environment Variables

### Frontend

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SESSION_SECRET` | JWT signing secret |
| `BACKEND_INTERNAL_URL` | Internal backend URL |
| `BACKEND_URL` | Public backend URL |
| `INTERNAL_SYNC_SECRET` | Backend ↔ Frontend authentication |
| `NEXT_PUBLIC_SITE_URL` | Public site URL |
| `NEXT_PUBLIC_ADMIN_CONSOLE_URL` | Public admin console URL |
| `FRONTEND_SUPERADMIN_EMAIL` | Frontend superadmin account |
| `FRONTEND_SUPERADMIN_PASSWORD` | Frontend superadmin password |
| `SMTP_PASS` | SMTP password override |

### Backend

| Variable | Purpose |
|---|---|
| `SUPERADMIN_EMAIL` | Initial superadmin account |
| `SUPERADMIN_PASSWORD` | Initial superadmin password |
| `SUPERADMIN_SESSION_SECRETS` | JWT signing secret for admin sessions |
| `INTERNAL_SYNC_SECRET` | Frontend ↔ Backend authentication |
| `FRONTEND_INTERNAL_URL` | Internal frontend URL |
| `AI_PRIMARY_MODEL` | Default primary AI model |
| `AI_FALLBACK_MODEL` | Default fallback AI model |
| `AI_API_KEY` | OpenAI or compatible API key |
| `AI_TEMPERATURE` | Model temperature (0–1) |
| `AI_MAX_TOKENS` | Max tokens per request |

---

## Security Architecture

| Layer | Implementation |
|---|---|
| Transport | TLS 1.3 via Let's Encrypt (Traefik) |
| Session | HttpOnly, SameSite=Strict, signed JWT |
| CSRF | SameSite=Strict cookie policy |
| Auth rate limiting | reCAPTCHA v3 on auth endpoints |
| Admin auth | Separate JWT, TOTP 2FA, session version |
| Internal APIs | Shared secret (INTERNAL_SYNC_SECRET) |
| Password storage | bcrypt hash + per-user salt |
| Input validation | Zod schemas on all API routes |
| SQL injection | Drizzle ORM parameterised queries |
| XSS | Next.js default HTML escaping |

---

*NutriAID Acquisition Portal — Confidential — June 2026*
