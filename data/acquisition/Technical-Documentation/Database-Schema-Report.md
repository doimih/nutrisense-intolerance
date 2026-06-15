# NutriAID — Database Schema Report

**FILE PATH:** NutriAID-Acquisition-Portal/Technical-Documentation/Database-Schema-Report.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Database-Schema-Report.pdf  
**Classification:** Confidential — Engineering Due Diligence

---

## Overview

NutriAID uses a dual-database architecture:

| Database | Role | Technology |
|---|---|---|
| PostgreSQL | All production user data | Drizzle ORM (frontend service) |
| JSON file store | Admin configuration and platform state | `data/superadmin-db.json` (backend service) |

Both databases are isolated to their respective Docker services with separate named volumes. There is no shared database connection.

---

## PostgreSQL Schema (Frontend Service)

### Table: `users`

```sql
CREATE TABLE users (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   TEXT        NOT NULL,
  role       VARCHAR(50) DEFAULT 'user',
  plan       VARCHAR(50) DEFAULT 'free',
  verified   BOOLEAN     DEFAULT FALSE,
  blocked    BOOLEAN     DEFAULT FALSE,
  created_at TIMESTAMP   DEFAULT NOW(),
  updated_at TIMESTAMP   DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
```

---

### Table: `profiles`

One-to-one with `users`. Stores the full nutritional profile.

```sql
CREATE TABLE profiles (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  age              INTEGER,
  sex              VARCHAR(50),
  height_cm        DECIMAL(5,1),
  weight_kg        DECIMAL(5,1),
  diet_type        VARCHAR(100),
  activity_level   VARCHAR(100),
  intolerances     TEXT[]      DEFAULT '{}',
  allergies        TEXT[]      DEFAULT '{}',
  medical_notes    TEXT,
  target_kcal      INTEGER,
  target_protein_g INTEGER,
  created_at       TIMESTAMP   DEFAULT NOW(),
  updated_at       TIMESTAMP   DEFAULT NOW()
);
```

---

### Table: `monitoring_entries`

User's daily food and symptom journal.

```sql
CREATE TABLE monitoring_entries (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID      REFERENCES users(id) ON DELETE CASCADE,
  date       DATE      NOT NULL,
  foods      TEXT[]    DEFAULT '{}',
  kcal       INTEGER,
  symptoms   TEXT[]    DEFAULT '{}',
  wellbeing  SMALLINT  CHECK (wellbeing BETWEEN 1 AND 10),
  notes      TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_monitoring_user_date ON monitoring_entries(user_id, date DESC);
```

---

### Table: `sessions`

```sql
CREATE TABLE sessions (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID      REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT      UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip         VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

Expired sessions are purged automatically on each new login attempt.

---

### Table: `subscriptions`

```sql
CREATE TABLE subscriptions (
  id                     UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID      REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  plan                   VARCHAR(50) NOT NULL,
  status                 VARCHAR(50) NOT NULL,
  current_period_start   TIMESTAMP,
  current_period_end     TIMESTAMP,
  cancel_at_period_end   BOOLEAN   DEFAULT FALSE,
  created_at             TIMESTAMP DEFAULT NOW(),
  updated_at             TIMESTAMP DEFAULT NOW()
);
```

---

### Table: `totp_configs`

```sql
CREATE TABLE totp_configs (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID      UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  secret     TEXT      NOT NULL,
  enabled    BOOLEAN   DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

TOTP secrets are AES-encrypted at rest using `TOTP_ENCRYPTION_KEY`.

---

### Table: `email_tokens`

Covers verification, password-reset, and magic-link flows.

```sql
CREATE TABLE email_tokens (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID      REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT      UNIQUE NOT NULL,
  type       VARCHAR(50) NOT NULL, -- 'verification' | 'password-reset'
  expires_at TIMESTAMP NOT NULL,
  used       BOOLEAN   DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Table: `visitor_sessions`

Tracks anonymous demo/visitor sessions (no account required).

```sql
CREATE TABLE visitor_sessions (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT      UNIQUE NOT NULL,
  ip         VARCHAR(45),
  user_agent TEXT,
  country    VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  last_seen  TIMESTAMP DEFAULT NOW()
);
```

---

### Entity Relationship Summary

```
users ─────────┬──── profiles          (1:1)
               ├──── sessions          (1:N)
               ├──── subscriptions     (1:N)
               ├──── monitoring_entries(1:N)
               ├──── email_tokens      (1:N)
               └──── totp_configs      (1:1)

visitor_sessions  (standalone — no user FK)
```

---

## JSON Store Schema (Backend Service)

The backend admin service uses a portable JSON file (`data/superadmin-db.json`) with typed interfaces defined in `types.ts`.

### Top-Level Structure

```typescript
type SuperadminDb = {
  superadmin:           SuperadminUser;
  users:                UserRecord[];
  settings:             PlatformSettings;
  securityEvents:       SecurityEvent[];
  auditEvents:          AuditEvent[];
  aiLogs:               AILogRecord[];
  acquisitionDownloads: AcquisitionDownloadRecord[];
}
```

---

### `SuperadminUser`

```typescript
type SuperadminUser = {
  id:          string;
  email:       string;
  passwordHash:string;
  totpEnabled: boolean;
  totpSecret?: string;
  lastLogin?:  string;
}
```

---

### `PlatformSettings`

```typescript
type PlatformSettings = {
  platform: {
    name:               string;
    primaryColor:       string;
    maintenanceMode:    boolean;
    allowRegistrations: boolean;
  };
  email: {
    provider:    'sendgrid' | 'ses' | 'smtp';
    fromAddress: string;
    fromName:    string;
  };
  aiBrain: {
    primaryModel:    string;
    fallbackModel:   string;
    apiKey?:         string;
    temperature:     number;
    maxTokens:       number;
    orchestratorUrl?:string;
    systemPrompt?:   string;
    workers: Array<{ id: string; enabled: boolean; prompt?: string }>;
  };
  recaptcha: {
    enabled:   boolean;
    siteKey:   string;
    secretKey: string;
    minScore:  number;
  };
  stripe: {
    publicKey:     string;
    secretKey:     string;
    webhookSecret: string;
    plans: Record<string, { priceId: string; name: string }>;
  };
}
```

---

### `AILogRecord`

```typescript
type AILogRecord = {
  id:        string;
  timestamp: string;
  sessionId: string;
  userId:    string | null;
  source:    'frontend' | 'orchestrator' | 'worker' | 'ai' | 'system';
  level:     'info' | 'warning' | 'error';
  intent:    string | null;
  worker:    string | null;
  model:     string | null;
  input:     Record<string, unknown>;
  output:    Record<string, unknown>;
  error:     Record<string, unknown> | null;
  metadata:  Record<string, unknown>;
}
```

Retention: capped at 10,000 records; oldest pruned automatically on write.

---

### `AcquisitionDownloadRecord`

```typescript
type AcquisitionDownloadRecord = {
  id:        string;
  timestamp: string;
  ip:        string;
  country:   string | null;
  userAgent: string;
  file:      string;
  subfolder: string;
}
```

Stored in `data/acquisition-downloads.json` (frontend). Accessible to the admin panel via the internal API proxy.

---

### `SecurityEvent`

```typescript
type SecurityEvent = {
  id:        string;
  timestamp: string;
  type:      'failed_login' | 'totp_failed' | 'session_expired' | 'account_locked';
  ip:        string | null;
  userAgent: string | null;
  details:   Record<string, unknown>;
}
```

---

### `AuditEvent`

```typescript
type AuditEvent = {
  id:        string;
  timestamp: string;
  adminId:   string;
  action:    string; // e.g. 'user.blocked', 'settings.updated', 'worker.prompt_changed'
  target:    string | null;
  before:    Record<string, unknown> | null;
  after:     Record<string, unknown> | null;
}
```

---

## Migration Strategy

### PostgreSQL

Managed via Drizzle Kit:

```bash
npm run db:generate  # Generate SQL migration from schema diff
npm run db:migrate   # Apply pending migrations
npm run db:studio    # Open Drizzle Studio (development only)
```

### JSON Store

No migration tooling required. Uses defensive initialisation at read time:

```typescript
// readDb() — executed on every read
if (!Array.isArray(parsed.acquisitionDownloads)) {
  parsed.acquisitionDownloads = [];
}
if (!parsed.settings?.aiBrain?.workers) {
  parsed.settings.aiBrain.workers = DEFAULT_WORKERS;
}
```

New fields are initialised with safe defaults on first read — no deployment steps needed.

---

*NutriAID Acquisition Portal — Confidential — June 2026*
