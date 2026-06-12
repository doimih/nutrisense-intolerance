# NutriAID — Technical Documentation Pack
### Documentație tehnică completă pentru cumpărătorii tehnici

---

## 1. Arhitectura Completă

### Stack Tehnologic

| Layer | Tehnologie | Versiune | Rol |
|---|---|---|---|
| Frontend | Next.js | 14.2.35 | App Router, SSR, API routes |
| Backend Admin | Next.js | 15.5.18 | Admin console, AI orchestrator |
| Language | TypeScript | 5.4.5 | Type safety end-to-end |
| Database | PostgreSQL | 16 | Persistență date utilizatori |
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

## 2. Diagrama Arhitecturii

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

## 3. Documentația Orchestratorului

**Fișier:** `backend/src/ai/orchestrator.ts`

### Responsabilități
- Primește cererea utilizatorului + contextul (profil, intoleranțe, intrări monitorizare)
- Detectează intenția prin keyword matching
- Selectează și execută secvența de workeri corespunzătoare
- Returnează output-ul final asamblat

### Rutarea intenție → workeri

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

### Context injectat în fiecare worker
```typescript
type OrchestratorContext = {
  userMessage: string;           // cererea originală a utilizatorului
  userProfile: UserProfile;      // vârstă, înălțime, greutate, obiectiv, activitate
  intolerances: string[];        // intoleranțe declarate
  allergies: string[];           // alergii declarate
  monitoringEntries: Entry[];    // ultimele 30 intrări din jurnal
  previousWorkerOutputs: Map<WorkerId, WorkerOutput>; // output-uri anterioare
  lang: 'ro' | 'en';            // limba utilizatorului
  adminGlobalPrompt?: string;    // prompt global din admin
};
```

---

## 4. Documentația Workerilor

**Fișier:** `backend/src/ai/schemas/workerSchemas.ts`

### Schema generică worker output

```typescript
type WorkerOutput = {
  worker: string;          // ID-ul workerului
  status: 'ok' | 'partial' | 'error';
  data: JsonObject;        // payload specific per worker
  notes?: string;          // observații opționale
  requiresDisclaimer?: boolean; // true pentru medical-safety
};
```

### Schema per worker

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

## 5. Documentația AI Brain

**Fișier:** `backend/src/ai/realWorkerExecutor.ts`

### Configurare model AI

```typescript
type ModelConfig = {
  primaryModel: string;      // default: 'gpt-4o'
  fallbackModel: string;     // default: 'gemini-1.5-pro'
  apiKey: string | null;     // din DB sau env: AI_API_KEY
  temperature: number;       // 0–1, default: 0.4
  maxTokens: number;         // default: 1024
  orchestratorUrl?: string;  // endpoint custom (opțional)
};
```

### Rezolvare endpoint per model

```typescript
function resolveBaseUrl(model: string): string {
  if (model.startsWith('gemini'))  return 'https://generativelanguage.googleapis.com/v1beta/openai';
  if (model.startsWith('claude'))  return 'https://api.anthropic.com/v1';
  return 'https://api.openai.com/v1'; // OpenAI default
}
```

Suportă orice model compatibil OpenAI API (inclusiv local models via Ollama, LM Studio, vLLM).

### Modele testate și compatibile

| Provider | Model | Suport |
|---|---|---|
| OpenAI | gpt-4o, gpt-4-turbo, gpt-3.5-turbo | ✅ Primar |
| Google | gemini-1.5-pro, gemini-1.5-flash | ✅ Fallback |
| Anthropic | claude-3-opus, claude-3-sonnet, claude-3-haiku | ✅ Compatibil |
| Local (Ollama) | llama3, mistral, qwen2 | ✅ Via URL custom |

### Apelul API

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
      response_format: { type: 'json_object' }, // forțează JSON output
    }),
  });
  // parseaza content[0].message.content ca JSON
}
```

---

## 6. Documentația Self-Healing Layer

**Fișier:** `backend/src/ai/autoCorrector.ts`

### Pipeline corecție completă

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

Funcționează prin:
- Injectare câmpuri obligatorii lipsă cu valori default sigure
- Conversie tipuri: `"10"` → `10`, `"true"` → `true`
- Sanitizare text: elimină diagnostice, prescripții, limbaj absolut
- Normalizare array-uri: string CSV → `string[]`
- Dot-path injection: `{ "data.kcal": 200 }` → `{ data: { kcal: 200 } }`

---

## 7. Documentația Diagnostic Engine

**Fișier:** `lib/server/guidance/engine.ts`

### Algoritm de scoring aliment-simptom

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
  return scores; // sortat descrescător = trigger-ele probabile
}
```

### Detecție reacție întârziată

```typescript
// Intrările cu latență 30 min – 48h primesc scor separat
function detectDelayedReactions(entries: MonitoringEntry[]): string[] {
  return entries
    .filter(e => e.reactionLatencyMinutes >= 30 &&
                 e.reactionLatencyMinutes <= 2880 &&
                 e.symptomsIntensity >= 5)
    .flatMap(e => e.consumedFoods);
}
```

### Plan-based feature gates

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

## 8. Documentația Prompt Rewriter

**Configurabil din admin:** `Settings → AI Brain → Worker Prompts`

### Structura promptului per worker

```typescript
function buildWorkerSystemMessage(
  workerId: WorkerId,
  lang: 'ro' | 'en',
  adminGlobalPrompt: string | null,
  workerCustomPrompt: string | null
): string {
  const basePrompt = WORKER_DEFAULT_PROMPTS[workerId][lang];
  const parts = [basePrompt];
  if (adminGlobalPrompt) parts.push(`\n\nInstrucțiuni globale:\n${adminGlobalPrompt}`);
  if (workerCustomPrompt) parts.push(`\n\nInstrucțiuni specifice:\n${workerCustomPrompt}`);
  return parts.join('');
}
```

Prompturile implicite sunt bilingve (RO/EN) și descriu rolul exact al fiecărui worker, ce poate și ce nu poate face, și formatul JSON așteptat.

---

## 9. Documentația API

### Endpoint-uri Frontend (`/api/`)

#### Autentificare
| Endpoint | Metodă | Auth | Descriere |
|---|---|---|---|
| `/api/auth/register` | POST | — | Creare cont + token verificare |
| `/api/auth/login` | POST | — | Login + emitere cookie sesiune |
| `/api/auth/logout` | POST | Cookie | Ștergere sesiune |
| `/api/auth/session` | GET | Cookie | Info utilizator curent |
| `/api/auth/refresh` | POST | Cookie | Reînnoire sesiune |
| `/api/auth/verify-email` | GET | — | Activare cont prin token |
| `/api/auth/resend-verification` | POST | — | Retrimitere email verificare |
| `/api/auth/forgot-password` | POST | — | Inițiere resetare parolă |
| `/api/auth/reset-password` | POST | — | Setare parolă nouă prin token |
| `/api/auth/delete-account` | DELETE | Cookie | Ștergere cont + date GDPR |
| `/api/auth/export-data` | POST | Cookie | Export GDPR (JSON + PDF) |

#### Monitorizare
| Endpoint | Metodă | Auth | Descriere |
|---|---|---|---|
| `/api/monitoring` | GET | Cookie | Lista intrări utilizator |
| `/api/monitoring` | POST | Cookie | Adăugare intrare nouă |

#### Ghidaj AI
| Endpoint | Metodă | Auth | Descriere |
|---|---|---|---|
| `/api/guidance` | POST | Cookie | Cerere ghidaj AI |
| `/api/guidance/history` | GET | Cookie | Lista sesiuni anterioare |
| `/api/guidance/history/[id]` | GET | Cookie | Sesiune specifică |
| `/api/guidance/pdf` | POST | Cookie | Export PDF sesiune |
| `/api/guidance/export` | POST | Cookie | Export ZIP complet |

#### Profil
| Endpoint | Metodă | Auth | Descriere |
|---|---|---|---|
| `/api/profile` | GET | Cookie | Profil utilizator |
| `/api/profile` | PUT | Cookie | Actualizare profil |

#### Billing
| Endpoint | Metodă | Auth | Descriere |
|---|---|---|---|
| `/api/billing/subscription` | GET | Cookie | Status abonament curent |
| `/api/billing/checkout` | POST | Cookie | Creare sesiune Stripe Checkout |
| `/api/billing/portal` | POST | Cookie | Redirect Stripe Customer Portal |
| `/api/billing/cancel` | POST | Cookie | Anulare abonament |
| `/api/billing/webhook` | POST | HMAC | Webhook Stripe |

#### Altele
| Endpoint | Metodă | Auth | Descriere |
|---|---|---|---|
| `/api/contact` | POST | reCAPTCHA | Formular contact |
| `/api/runtime-settings` | GET | — | Config publică platformă |

### Endpoint-uri Backend Admin (`/api/superadmin/`)

Toate protejate cu JWT admin + opțional TOTP 2FA.

| Endpoint | Metodă | Descriere |
|---|---|---|
| `/api/superadmin/auth/login` | POST | Login admin |
| `/api/superadmin/auth/logout` | POST | Logout admin |
| `/api/superadmin/users` | GET | Lista utilizatori frontend |
| `/api/superadmin/settings` | GET/PUT | Citire/scriere setări |
| `/api/superadmin/ai/*` | GET/PUT | Config AI Brain |
| `/api/superadmin/stripe/*` | GET/PUT | Config Stripe |
| `/api/superadmin/subscriptions` | GET | Lista abonamente |
| `/api/superadmin/logs` | GET | Loguri orchestrator + sistem |
| `/api/superadmin/exports` | GET | Export arhivă platformă |
| `/api/superadmin/archive/generate-link` | POST | Generare link download arhivă |
| `/api/superadmin/visitor/sessions` | GET | Sesiuni visitor demo |
| `/api/superadmin/visitor/reset` | POST | Reset sesiune visitor per IP |
| `/api/public/guidance/orchestrate` | POST | Endpoint orchestrator (intern) |

---

## 10. Documentația Bazei de Date

### Conexiune și configurare

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

### Schema completă

#### Tabelul `users`
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
  plan TEXT,                             -- 'basic' | 'pro' | 'pro_plus'
  trial_ends_at TEXT,                    -- ISO8601
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

#### Tabelul `user_profiles`
```sql
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  dietary_preference TEXT,               -- 'normal'|'vegetarian'|'vegan'|...
  intolerances TEXT[],                   -- array intoleranțe
  age INTEGER,
  height_cm INTEGER,
  weight_kg INTEGER,
  activity_level TEXT,                   -- 'sedentary'|'light'|'moderate'|'active'|'very_active'
  updated_at TEXT NOT NULL
);
```

#### Tabelul `monitoring_entries`
```sql
CREATE TABLE monitoring_entries (
  id TEXT PRIMARY KEY,                   -- format: entry_<nanoid>
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  date TEXT NOT NULL,                    -- YYYY-MM-DD
  meal_time TEXT NOT NULL,              -- 'breakfast'|'lunch'|'dinner'|'snack'
  consumed_foods TEXT[],
  symptoms TEXT[],                       -- 11 tipuri de simptome
  symptoms_intensity INTEGER,           -- 1-10
  reaction_latency_minutes INTEGER,     -- delay reacție
  wellbeing INTEGER,                    -- 1-5
  notes TEXT,
  created_at TEXT NOT NULL
);
```

#### Tabelul `guidance_history`
```sql
CREATE TABLE guidance_history (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  source TEXT NOT NULL,                 -- 'ai' | 'fallback' | 'rule-based'
  request_fingerprint TEXT,            -- SHA-256 hash (deduplicare)
  prompt TEXT NOT NULL,
  monitoring_entries JSONB,
  result JSONB NOT NULL                -- GuidanceResult complet
);
```

#### Tabelul `subscriptions`
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

#### Tabele tokens
```sql
CREATE TABLE verification_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,          -- UUID v4
  email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,           -- +24h
  used_at TEXT                        -- NULL dacă nefolosit
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

### Migrări

```bash
# Generare migrare după modificare schema
npx drizzle-kit generate

# Aplicare migrări în producție
npx drizzle-kit migrate

# Vizualizare Drizzle Studio (UI pentru DB)
npx drizzle-kit studio
```

---

## 11. Securitate

### Autentificare utilizatori
- Parolă: hashed cu `scrypt` (Node.js native crypto), salt 64 bytes per user
- Sesiune: JWT semnat HMAC-SHA256 cu secret 32+ bytes
- Cookie: `HttpOnly; Secure; SameSite=Strict; Path=/`
- Token expiry: 7 zile (configurabil)

### Autentificare admin
- Sesiune separată cu secret diferit (`SUPERADMIN_SESSION_SECRETS`)
- Opțional: TOTP 2FA (Google Authenticator, Authy)
- 2FA forțat per admin din setări
- Visitor demo: sesiune 10 min, blocat per IP 24h

### Rate limiting
- `register`: 5 req/60s per IP
- `login`: 5 req/60s per IP
- `forgot-password`: 5 req/60s per IP
- `resend-verification`: 6 req/60s per IP

### Headers de securitate (via Next.js + Traefik)
```
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubdomains; preload
```

### Stripe webhook security
```typescript
// Verificare HMAC înainte de procesare
const event = stripe.webhooks.constructEvent(
  body,
  request.headers.get('stripe-signature')!,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

---

## 12. Testare și QA

### Unit Tests (Vitest)
```bash
npm run test:unit
# Acoperire: guidance engine, schema validators, i18n, utility functions
```

### E2E Tests
```bash
npm run test:e2e:user-ai        # Frontend: flux complet utilizator + AI
npm run test:superadmin-e2e     # Backend: flux admin complet
```

### Smoke Tests
```bash
npm run test:smoke
# Verifică: health endpoints, DB connectivity, API responses, auth flow
```

### Pipeline QA Complet
```bash
npm run qa
# Secvență: lint → type-check → build:all → test:unit → test:smoke
```

### TypeScript strict
Toate fișierele sunt type-checked cu `tsc --noEmit`. Zero erori TypeScript în producție.

---

*Document generat: Iunie 2026 | NutriAID Platform v1.0 — prod branch*
