# NutriAID — Technical Documentation Pack
### Complete Technical Documentation for Technical Buyers

---

## 1. Complete Architecture

### Technology Stack

| Layer | Technology | Version | Role |
|---|---|---|---|
| Frontend | Next.js | 14.2.35 | App Router, SSR, API routes |
| Backend Admin | Next.js | 15.5.18 | Admin console, AI orchestrator |
| Language | TypeScript | 5.4.5 | End-to-end type safety |
| Database | PostgreSQL | 16 | User data persistence |
| ORM | Drizzle ORM | 0.45.2 | Schema, migrations, queries |
| DB Driver | postgres.js | 3.4.9 | Native PostgreSQL driver |
| Styling | Tailwind CSS | 3.4.1 | Utility-first CSS |
| Billing | Stripe | 22.2.0 | Checkout, webhooks, portals |
| Email | Nodemailer | 6.10.1 | SMTP send |
| PDF | pdfkit | 0.19.0 | Server-side PDF generation |
| Reverse Proxy | Traefik | v2/v3 | TLS, routing, headers |
| Container | Docker | 24+ | Deployment, isolation |
| Auth (frontend) | JWT (custom) | — | HttpOnly cookie sessions |
| Auth (backend) | JWT (custom) | — | Admin sessions + TOTP 2FA |
| Testing | Vitest | 4.1.8 | Unit tests |

---

## 2. Architecture Diagram

```
                        INTERNET
                           │
                    ┌──────▼──────┐
                    │   Traefik   │  TLS termination, routing,
                    │  (Reverse   │  HSTS, security headers,
                    │   Proxy)    │  Let's Encrypt auto-cert
                    └──────┬──────┘
               ┌───────────┴───────────┐
               │                       │
        ┌──────▼──────┐         ┌──────▼──────┐
        │  Frontend   │         │   Backend   │
        │  Next.js 14 │         │  Next.js 15 │
        │  port 3000  │         │  port 4028  │
        │             │         │             │
        │ • Auth      │ ──────► │ • Admin UI  │
        │ • Dashboard │ (API)   │ • AI Orch.  │
        │ • Billing   │ ◄────── │ • Settings  │
        │ • Public    │         │ • Logs      │
        │ • i18n      │         │ • Users     │
        └──────┬──────┘         └──────┬──────┘
               │                       │
               │              ┌────────▼────────┐
               │              │  superadmin-db  │
               │              │   (JSON file)   │
               │              │ • Settings      │
               │              │ • Audit log     │
               │              │ • AI config     │
               │              │ • Admin users   │
               │              └─────────────────┘
               │
        ┌──────▼──────┐
        │  PostgreSQL │
        │    v16      │
        │             │
        │ • users     │
        │ • profiles  │
        │ • monitoring│
        │ • guidance  │
        │ • subscript │
        │ • tokens    │
        └─────────────┘


AI ORCHESTRATION FLOW (inside Backend):

User Request
    │
    ▼
Intent Detection
(keyword routing)
    │
    ▼
Worker Chain (3-6 workers)
    │
    ├─► profile-analyzer ──────────────────────────────┐
    │       │                                          │
    ├─► intolerance-checker                            │
    │       │                                          │
    ├─► allergy-checker                                │
    │       │                                          │
    ├─► [task-specific worker]                         │
    │   (meal-plan-generator / recipe-builder /        │
    │    nutrition-calculator / supplement-advisor /   │
    │    progress-tracker / shopping-list-generator)   │
    │       │                                          │
    └─► medical-safety ◄───────────────────────────────┘
            │
            ▼
    Worker Supervisor (per worker)
    ┌─────────────────────────────────────┐
    │ 1. Schema Validation                │
    │ 2. Semantic Validation              │
    │ 3. Auto-Correct (if invalid)        │
    │    ├─ GPT-4o correction prompt      │
    │    ├─ Gemini fallback               │
    │    └─ Rule-based fallback           │
    │ 4. Re-validate                      │
    │ 5. Log execution                    │
    └─────────────────────────────────────┘
            │
            ▼
    Frontend Guidance Engine
    (plan limits, sanitization, storage)
            │
            ▼
    User Response (JSON + PDF available)
```

---

## 3. Orchestrator Documentation

**File:** `backend/src/ai/orchestrator.ts`

### Responsibilities
- Receives the user's request + context (profile, intolerances, monitoring entries)
- Detects intent via keyword matching
- Selects and executes the appropriate worker sequence
- Returns the final assembled output

### Intent → Worker Routing

```typescript
type WorkerIntent =
  | 'meal-plan'
  | 'recipe'
  | 'shopping-list'
  | 'supplement-advice'
  | 'nutritional-analysis'
  | 'progress-tracking'
  | 'general-nutrition'
  | 'unknown';

const WORKER_CHAINS: Record<WorkerIntent, WorkerId[]> = {
  'meal-plan':           ['profile-analyzer', 'intolerance-checker', 'allergy-checker',
                          'meal-plan-generator', 'nutrition-calculator', 'medical-safety'],
  'recipe':              ['profile-analyzer', 'intolerance-checker', 'allergy-checker',
                          'recipe-builder', 'nutrition-calculator'],
  'supplement-advice':   ['profile-analyzer', 'intolerance-checker', 'allergy-checker',
                          'supplement-advisor', 'medical-safety'],
  'nutritional-analysis':['profile-analyzer', 'nutrition-calculator', 'medical-safety'],
  'progress-tracking':   ['profile-analyzer', 'progress-tracking'],
  'shopping-list':       ['profile-analyzer', 'intolerance-checker',
                          'meal-plan-generator', 'shopping-list'],
  'general-nutrition':   ['profile-analyzer', 'intolerance-checker',
                          'allergy-checker', 'medical-safety'],
  'unknown':             ['profile-analyzer', 'medical-safety'],
};
```

### Context Injected into Each Worker
```typescript
type OrchestratorContext = {
  userMessage: string;           // user's original request
  userProfile: UserProfile;      // age, height, weight, goal, activity
  intolerances: string[];        // declared intolerances
  allergies: string[];           // declared allergies
  monitoringEntries: Entry[];    // last 30 journal entries
  previousWorkerOutputs: Map<WorkerId, WorkerOutput>; // previous outputs
  lang: 'ro' | 'en';            // user's language
  adminGlobalPrompt?: string;    // global prompt from admin
};
```

---

## 4. Worker Documentation

**File:** `backend/src/ai/schemas/workerSchemas.ts`

### Generic Worker Output Schema

```typescript
type WorkerOutput = {
  worker: string;          // worker ID
  status: 'ok' | 'partial' | 'error';
  data: JsonObject;        // worker-specific payload
  notes?: string;          // optional observations
  requiresDisclaimer?: boolean; // true for medical-safety
};
```

### Per-Worker Schema

**profile-analyzer:**
```typescript
data: {
  age?: number;
  sex?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  dietaryGoal?: string;
  dietType?: string;
  activityLevel?: string;
  missingFields: string[];
}
```

**intolerance-checker:**
```typescript
data: {
  flaggedIngredients: string[];
  safeIngredients: string[];
  conflicts: string[];
}
```

**meal-plan-generator:**
```typescript
data: {
  meals: Array<{
    name: string;
    ingredients: string[];
    kcal?: number;
    alternatives?: string[];
  }>;
  totalKcal?: number;
}
```

**nutrition-calculator:**
```typescript
data: {
  kcal: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}
```

**medical-safety:**
```typescript
data: {
  safetyApproved: boolean;
  disclaimer?: string;
  risks: string[];
}
requiresDisclaimer: true;
```

---

## 5. AI Brain Documentation

**File:** `backend/src/ai/realWorkerExecutor.ts`

### AI Model Configuration

```typescript
type ModelConfig = {
  primaryModel: string;      // default: 'gpt-4o'
  fallbackModel: string;     // default: 'gemini-1.5-pro'
  apiKey: string | null;     // from DB or env: AI_API_KEY
  temperature: number;       // 0–1, default: 0.4
  maxTokens: number;         // default: 1024
  orchestratorUrl?: string;  // custom endpoint (optional)
};
```

### Endpoint Resolution per Model

```typescript
function resolveBaseUrl(model: string): string {
  if (model.startsWith('gemini'))  return 'https://generativelanguage.googleapis.com/v1beta/openai';
  if (model.startsWith('claude'))  return 'https://api.anthropic.com/v1';
  return 'https://api.openai.com/v1'; // OpenAI default
}
```

Supports any OpenAI API-compatible model (including local models via Ollama, LM Studio, vLLM).

### Tested and Compatible Models

| Provider | Model | Support |
|---|---|---|
| OpenAI | gpt-4o, gpt-4-turbo, gpt-3.5-turbo | ✅ Primary |
| Google | gemini-1.5-pro, gemini-1.5-flash | ✅ Fallback |
| Anthropic | claude-3-opus, claude-3-sonnet, claude-3-haiku | ✅ Compatible |
| Local (Ollama) | llama3, mistral, qwen2 | ✅ Via custom URL |

### API Call

```typescript
async function callModel(config, messages): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.primaryModel,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      response_format: { type: 'json_object' }, // forces JSON output
    }),
  });
  // parses content[0].message.content as JSON
}
```

---

## 6. Self-Healing Layer Documentation

**File:** `backend/src/ai/autoCorrector.ts`

### Complete Correction Pipeline

```
Invalid Worker Output
        │
        ▼
Generate Correction Prompt
(include: raw output, schema errors, specific violations)
        │
        ▼
Call Primary Model (GPT-4o)
        │
      [success?]
      ├─ YES → validate corrected output → return
      └─ NO
          │
          ▼
    Call Fallback Model (Gemini)
          │
        [success?]
        ├─ YES → validate corrected output → return
        └─ NO
            │
            ▼
    Rule-Based Corrector
    (regex patterns, field normalization, type coercion)
            │
            ▼
    Mark correctionIncomplete = true
    (output used with warning flag)
```

### Rule-Based Corrector

Operates by:
- Injecting missing required fields with safe default values
- Type conversion: `"10"` → `10`, `"true"` → `true`
- Text sanitisation: removes diagnoses, prescriptions, absolute language
- Array normalisation: CSV string → `string[]`
- Dot-path injection: `{ "data.kcal": 200 }` → `{ data: { kcal: 200 } }`

---

## 7. Diagnostic Engine Documentation

**File:** `lib/server/guidance/engine.ts`

### Food-Symptom Scoring Algorithm

```typescript
function calculateFoodScores(entries: MonitoringEntry[]): Map<string, number> {
  const scores = new Map<string, number>();
  for (const entry of entries) {
    if (entry.symptoms.length === 0) continue;
    const weight = entry.symptomsIntensity; // 1-10
    for (const food of entry.consumedFoods) {
      scores.set(food, (scores.get(food) ?? 0) + weight);
    }
  }
  return scores; // sorted descending = likely triggers
}
```

### Delayed Reaction Detection

```typescript
// Entries with latency 30 min – 48h receive a separate score
function detectDelayedReactions(entries: MonitoringEntry[]): string[] {
  return entries
    .filter(e => e.reactionLatencyMinutes >= 30 &&
                 e.reactionLatencyMinutes <= 2880 &&
                 e.symptomsIntensity >= 5)
    .flatMap(e => e.consumedFoods);
}
```

### Plan-Based Feature Gates

```typescript
const PLAN_LIMITS = {
  basic: {
    maxRecommendedFoods: 8,
    maxAvoidFoods: 6,
    maxMealExamples: 2,
    maxTips: 2,
    combinationAnalysis: false,
    advancedPredictions: false,
    delayedReactionDetection: false,
  },
  pro: {
    maxRecommendedFoods: 12,
    maxAvoidFoods: 10,
    maxMealExamples: 3,
    maxTips: 3,
    combinationAnalysis: true,
    advancedPredictions: false,
    delayedReactionDetection: false,
  },
  pro_plus: {
    maxRecommendedFoods: 15,
    maxAvoidFoods: 12,
    maxMealExamples: 4,
    maxTips: 5,
    combinationAnalysis: true,
    advancedPredictions: true,
    delayedReactionDetection: true,
  },
};
```

---

## 8. Prompt Rewriter Documentation

**Configurable from admin:** `Settings → AI Brain → Worker Prompts`

### Per-Worker Prompt Structure

```typescript
function buildWorkerSystemMessage(
  workerId: WorkerId,
  lang: 'ro' | 'en',
  adminGlobalPrompt: string | null,
  workerCustomPrompt: string | null
): string {
  const basePrompt = WORKER_DEFAULT_PROMPTS[workerId][lang];
  const parts = [basePrompt];
  if (adminGlobalPrompt) parts.push(`\n\nGlobal instructions:\n${adminGlobalPrompt}`);
  if (workerCustomPrompt) parts.push(`\n\nSpecific instructions:\n${workerCustomPrompt}`);
  return parts.join('');
}
```

Default prompts are bilingual (RO/EN) and describe each worker's exact role, what it can and cannot do, and the expected JSON format.

---

## 9. API Documentation

### Frontend Endpoints (`/api/`)

#### Authentication
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | POST | — | Create account + verification token |
| `/api/auth/login` | POST | — | Login + issue session cookie |
| `/api/auth/logout` | POST | Cookie | Delete session |
| `/api/auth/session` | GET | Cookie | Current user info |
| `/api/auth/refresh` | POST | Cookie | Session renewal |
| `/api/auth/verify-email` | GET | — | Account activation via token |
| `/api/auth/resend-verification` | POST | — | Resend verification email |
| `/api/auth/forgot-password` | POST | — | Initiate password reset |
| `/api/auth/reset-password` | POST | — | Set new password via token |
| `/api/auth/delete-account` | DELETE | Cookie | Delete account + GDPR data |
| `/api/auth/export-data` | POST | Cookie | GDPR export (JSON + PDF) |

#### Monitoring
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/monitoring` | GET | Cookie | List user entries |
| `/api/monitoring` | POST | Cookie | Add new entry |

#### AI Guidance
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/guidance` | POST | Cookie | AI guidance request |
| `/api/guidance/history` | GET | Cookie | List previous sessions |
| `/api/guidance/history/[id]` | GET | Cookie | Specific session |
| `/api/guidance/pdf` | POST | Cookie | PDF export of session |
| `/api/guidance/export` | POST | Cookie | Complete ZIP export |

#### Profile
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/profile` | GET | Cookie | User profile |
| `/api/profile` | PUT | Cookie | Update profile |

#### Billing
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/billing/subscription` | GET | Cookie | Current subscription status |
| `/api/billing/checkout` | POST | Cookie | Create Stripe Checkout session |
| `/api/billing/portal` | POST | Cookie | Redirect to Stripe Customer Portal |
| `/api/billing/cancel` | POST | Cookie | Cancel subscription |
| `/api/billing/webhook` | POST | HMAC | Stripe webhook |

#### Recipes
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/recipes/from-meal` | POST | Cookie | AI recipe generation from meal name + GEO context |
| `/api/recipes/generate-batch` | POST | Cookie | Batch recipe generation |
| `/api/recipes/cleanup` | POST | Cookie | Remove invalid recipes |
| `/api/recipes/[id]` | GET | Cookie | Specific recipe details |

#### Newsletter
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/newsletter/accept` | POST | Cookie | Newsletter opt-in (authenticated user) |
| `/api/newsletter/decline` | POST | Cookie | Newsletter opt-out |
| `/api/newsletter/status` | GET | Cookie | Newsletter consent status |
| `/api/newsletter/subscribe-public` | POST | — | Public subscription (footer form) |

#### Early Adopter
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/early-adopter` | GET/POST | Cookie | Status and Early Adopter activation |
| `/api/early-adopter/slots` | GET | — | Remaining slot counter (public) |

#### Tracking & Other
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/tiktok/event` | POST | — | TikTok Pixel server-side event relay |
| `/api/contact` | POST | reCAPTCHA | Contact form |
| `/api/runtime-settings` | GET | — | Public platform config |
| `/api/acquisition/download` | POST | — | Download acquisition package |

### Backend Admin Endpoints (`/api/superadmin/`)

All protected with admin JWT + optional TOTP 2FA.

| Endpoint | Method | Description |
|---|---|---|
| `/api/superadmin/auth/login` | POST | Admin login |
| `/api/superadmin/auth/logout` | POST | Admin logout |
| `/api/superadmin/users` | GET | Frontend user list |
| `/api/superadmin/settings` | GET/PUT | Read/write settings |
| `/api/superadmin/ai/*` | GET/PUT | AI Brain config |
| `/api/superadmin/stripe/*` | GET/PUT | Stripe config |
| `/api/superadmin/subscriptions` | GET | Subscription list |
| `/api/superadmin/logs` | GET | Orchestrator + system logs |
| `/api/superadmin/exports` | GET | Platform archive export |
| `/api/superadmin/archive/generate-link` | POST | Generate archive download link |
| `/api/superadmin/visitor/sessions` | GET | Demo visitor sessions |
| `/api/superadmin/visitor/reset` | POST | Reset visitor session by IP |
| `/api/public/guidance/orchestrate` | POST | Orchestrator endpoint (internal) |

---

## 10. Database Documentation

### Connection and Configuration

```typescript
// lib/db/index.ts
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const client = postgres(process.env.DATABASE_URL!, {
  max: 10,          // connection pool
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
```

### Complete Schema

#### Table `users`
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                    -- format: usr_<nanoid>
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',      -- 'user' | 'superadmin'
  password_hash TEXT NOT NULL,           -- scrypt output
  salt TEXT NOT NULL,                    -- 64 bytes hex
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'suspended'
  plan TEXT,                             -- 'basic' | 'pro' | 'pro_plus'
  trial_ends_at TEXT,                    -- ISO8601
  newsletter_opt_in BOOLEAN,             -- NULL=never asked, TRUE=opted in, FALSE=opted out
  newsletter_consent_at TEXT,            -- ISO8601 timestamp
  newsletter_consent_source TEXT,        -- 'signup_popup' | 'footer_form'
  language TEXT,                         -- 'ro' | 'en' — stored language preference
  early_adopter BOOLEAN,                 -- TRUE = first 100 users, free Pro access
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

#### Table `user_profiles`
```sql
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  dietary_preference TEXT,               -- 'normal'|'vegetarian'|'vegan'|...
  intolerances TEXT[],                   -- intolerances array
  age INTEGER,
  height_cm INTEGER,
  weight_kg INTEGER,
  activity_level TEXT,                   -- 'sedentary'|'light'|'moderate'|'active'|'very_active'
  updated_at TEXT NOT NULL
);
```

#### Table `monitoring_entries`
```sql
CREATE TABLE monitoring_entries (
  id TEXT PRIMARY KEY,                   -- format: entry_<nanoid>
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  date TEXT NOT NULL,                    -- YYYY-MM-DD
  meal_time TEXT NOT NULL,              -- 'breakfast'|'lunch'|'dinner'|'snack'
  consumed_foods TEXT[],
  symptoms TEXT[],                       -- 11 symptom types
  symptoms_intensity INTEGER,           -- 1-10
  reaction_latency_minutes INTEGER,     -- reaction delay
  wellbeing INTEGER,                    -- 1-5
  notes TEXT,
  created_at TEXT NOT NULL
);
```

#### Table `guidance_history`
```sql
CREATE TABLE guidance_history (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  source TEXT NOT NULL,                 -- 'ai' | 'fallback' | 'rule-based'
  request_fingerprint TEXT,            -- SHA-256 hash (deduplication)
  prompt TEXT NOT NULL,
  monitoring_entries JSONB,
  result JSONB NOT NULL                -- complete GuidanceResult
);
```

#### Table `recipes`
```sql
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  title_ro TEXT NOT NULL,
  title_en TEXT NOT NULL,
  category TEXT NOT NULL,              -- 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ingredients_ro JSONB NOT NULL,       -- {name, quantity, unit}[]
  ingredients_en JSONB NOT NULL,
  instructions_ro JSONB NOT NULL,      -- {step_index, text}[]
  instructions_en JSONB NOT NULL,
  prep_time_minutes INTEGER NOT NULL,
  difficulty TEXT NOT NULL,            -- 'easy' | 'medium' | 'hard'
  calories INTEGER,
  macros JSONB,                        -- {protein, carbs, fats}
  cuisine TEXT,
  tags_ro JSONB,                       -- string[]
  tags_en JSONB,
  allergens JSONB,                     -- string[]
  substitutions_ro JSONB,              -- {for, substitute_with, note}[]
  substitutions_en JSONB,
  cooking_tips_ro JSONB,               -- string[]
  cooking_tips_en JSONB,
  image_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

#### Tables `recipe_batches` and `recipe_usage`
```sql
CREATE TABLE recipe_batches (
  id SERIAL PRIMARY KEY,
  batch_number INTEGER NOT NULL,
  target_count INTEGER NOT NULL,
  generated_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending'|'running'|'completed'|'failed'
  started_at TEXT,
  finished_at TEXT
);

CREATE TABLE recipe_usage (
  id SERIAL PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  used_at TEXT NOT NULL,
  context TEXT                         -- 'meal_plan' | 'cooking_mode' | 'browse'
);
```

#### Table `subscriptions`
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  plan_code TEXT NOT NULL,             -- 'basic'|'pro'|'pro_plus'
  status TEXT NOT NULL,               -- 'active'|'trialing'|'paused'|'canceled'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  updated_at TEXT NOT NULL
);
```

#### Token Tables
```sql
CREATE TABLE verification_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,          -- UUID v4
  email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,           -- +24h
  used_at TEXT                        -- NULL if unused
);

CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,           -- +1h
  used_at TEXT
);
```

### Migrations

```bash
# Generate migration after schema change
npx drizzle-kit generate

# Apply migrations in production
npx drizzle-kit migrate

# Visualise with Drizzle Studio (DB UI)
npx drizzle-kit studio
```

---

## 11. Security

### User Authentication
- Password: hashed with `scrypt` (Node.js native crypto), 64-byte salt per user
- Session: JWT signed HMAC-SHA256 with 32+ byte secret
- Cookie: `HttpOnly; Secure; SameSite=Strict; Path=/`
- Token expiry: 7 days (configurable)

### Admin Authentication
- Separate session with different secret (`SUPERADMIN_SESSION_SECRETS`)
- Optional: TOTP 2FA (Google Authenticator, Authy)
- 2FA enforced per admin from settings
- Visitor demo: 10-min session, IP-blocked for 24h

### Rate Limiting
- `register`: 5 req/60s per IP
- `login`: 5 req/60s per IP
- `forgot-password`: 5 req/60s per IP
- `resend-verification`: 6 req/60s per IP

### Security Headers (via Next.js + Traefik)
```
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubdomains; preload
```

### Stripe Webhook Security
```typescript
// HMAC verification before processing
const event = stripe.webhooks.constructEvent(
  body,
  request.headers.get('stripe-signature')!,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

---

## 12. Testing and QA

### Unit Tests (Vitest)
```bash
npm run test:unit
# Coverage: guidance engine, schema validators, i18n, utility functions
```

### E2E Tests
```bash
npm run test:e2e:user-ai        # Frontend: full user + AI flow
npm run test:superadmin-e2e     # Backend: full admin flow
```

### Smoke Tests
```bash
npm run test:smoke
# Checks: health endpoints, DB connectivity, API responses, auth flow
```

### Complete QA Pipeline
```bash
npm run qa
# Sequence: lint → type-check → build:all → test:unit → test:smoke
```

### TypeScript Strict
All files are type-checked with `tsc --noEmit`. Zero TypeScript errors in production.

---

*Document generated: June 2026 | NutriAID Platform v1.0 — prod branch*
