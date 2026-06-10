import 'server-only';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createPasswordHash } from '@/lib/server/superadmin/auth';
import type {
  AILogRecord,
  AIExecutionLog,
  AuditEvent,
  LogRecord,
  SecurityEvent,
  SubscriptionRecord,
  SuperadminDb,
  SuperadminUser,
} from '@/lib/server/superadmin/types';

const DB_PATH = join(process.cwd(), 'data', 'superadmin-db.json');

function nowIso(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateInternalToken(): string {
  return `iet_${Date.now()}_${Math.random().toString(36).slice(2, 14)}${Math.random().toString(36).slice(2, 14)}`;
}

function seedDb(): SuperadminDb {
  const email = (process.env.SUPERADMIN_EMAIL || 'design@doimih.net').trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD || 'PassTemp123!';
  const hash = createPasswordHash(password);
  const ts = nowIso();

  const superadmin: SuperadminUser = {
    id: 'adm_superadmin_001',
    email,
    name: 'Super Admin',
    role: 'superadmin',
    passwordHash: hash.hash,
    passwordSalt: hash.salt,
    mustChangePassword: false,
    twoFactorSecret: null,
    status: 'active',
    plan: 'pro_plus',
    sessionVersion: 1,
    sessionInvalidBefore: 0,
    createdAt: ts,
    updatedAt: ts,
    lastLoginAt: null,
  };

  const subscription: SubscriptionRecord = {
    id: id('sub'),
    userId: superadmin.id,
    userEmail: superadmin.email,
    plan: 'pro_plus',
    status: 'active',
    stripeSubscriptionId: 'sub_demo_superadmin',
    currentPeriodEnd: ts,
    updatedAt: ts,
  };

  return {
    users: [superadmin],
    subscriptions: [subscription],
    payments: [
      {
        id: id('pay'),
        userId: superadmin.id,
        userEmail: superadmin.email,
        amount: 99,
        currency: 'usd',
        status: 'paid',
        provider: 'stripe',
        stripePaymentIntentId: 'pi_demo_001',
        createdAt: ts,
      },
    ],
    logs: [
      {
        id: id('log'),
        source: 'server',
        level: 'info',
        message: 'Superadmin DB initialized',
        createdAt: ts,
      },
    ],
    auditEvents: [],
    securityEvents: [],
    aiLogs: [
      {
        id: id('ai'),
        userId: superadmin.id,
        userEmail: superadmin.email,
        status: 'success',
        latencyMs: 820,
        summary: 'Initial AI health check',
        createdAt: ts,
      },
    ],
    AI_Logs: [],
    settings: {
      app: {
        siteUrl: 'https://nutriaid.eu',
        backendUrl: 'https://backend.nutriaid.eu',
        adminConsoleUrl: 'https://backend.nutriaid.eu',
      },
      stripe: {
        publishableKeyMasked: 'pk_live_************',
        secretKeyMasked: 'sk_live_************',
        webhookSecretMasked: 'whsec_************',
        billingMode: 'subscription',
      },
      ai: {
        provider: 'OpenAI',
        apiKeyMasked: 'sk-************',
        model: 'gpt-4o-mini',
      },
      notifications: {
        criticalErrorsEmail: email,
        webhookUrl: 'https://example.com/hooks/critical',
      },
      twoFactor: {
        globalEnabled: false,
        enforceAdmin: true,
        enforceAll: false,
        methods: {
          totp: true,
          sms: false,
          email: false,
        },
      },
    },
  };
}

function ensureDbFile(): void {
  if (existsSync(DB_PATH)) return;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  writeFileSync(DB_PATH, JSON.stringify(seedDb(), null, 2), 'utf8');
}

export function readDb(): SuperadminDb {
  ensureDbFile();
  const raw = readFileSync(DB_PATH, 'utf8');
  const parsed = JSON.parse(raw) as SuperadminDb;
  const hadToken = !!parsed.settings?.internalEmailToken;
  parsed.users = parsed.users.map((user) => ({
    ...user,
    sessionVersion: user.sessionVersion || 1,
    sessionInvalidBefore: user.sessionInvalidBefore || 0,
    twoFactorSecret: user.twoFactorSecret || null,
  }));
  parsed.settings = {
    ...parsed.settings,
    app: {
      siteUrl: parsed.settings?.app?.siteUrl || 'https://nutriaid.eu',
      backendUrl: parsed.settings?.app?.backendUrl || 'https://backend.nutriaid.eu',
      adminConsoleUrl:
        parsed.settings?.app?.adminConsoleUrl || parsed.settings?.app?.backendUrl || 'https://backend.nutriaid.eu',
    },
    stripe: {
      publishableKeyMasked: parsed.settings?.stripe?.publishableKeyMasked ?? '',
      secretKeyMasked: parsed.settings?.stripe?.secretKeyMasked ?? '',
      webhookSecretMasked: parsed.settings?.stripe?.webhookSecretMasked ?? '',
      billingMode: parsed.settings?.stripe?.billingMode ?? 'subscription',
      currency: parsed.settings?.stripe?.currency ?? 'eur',
      trialDays: parsed.settings?.stripe?.trialDays ?? '14',
      products: parsed.settings?.stripe?.products ?? {
        basic: { productId: '', priceId: '' },
        pro: { productId: '', priceId: '' },
        pro_plus: { productId: '', priceId: '' },
      },
    },
    twoFactor: {
      globalEnabled: parsed.settings?.twoFactor?.globalEnabled || false,
      enforceAdmin: parsed.settings?.twoFactor?.enforceAdmin ?? true,
      enforceAll: parsed.settings?.twoFactor?.enforceAll || false,
      methods: {
        totp: parsed.settings?.twoFactor?.methods?.totp ?? true,
        sms: parsed.settings?.twoFactor?.methods?.sms || false,
        email: parsed.settings?.twoFactor?.methods?.email || false,
      },
    },
    email: parsed.settings?.email ?? {
      smtpHost: '',
      smtpPort: '587',
      smtpUser: '',
      smtpPass: '',
      fromEmail: '',
      fromName: 'NutriAID',
      encryption: 'tls',
    },
    internalEmailToken: parsed.settings?.internalEmailToken ?? generateInternalToken(),
    aiBrain: parsed.settings?.aiBrain ?? {
      defaultModel: process.env.AI_PRIMARY_MODEL || 'gpt-4o',
      fallbackModel: process.env.AI_FALLBACK_MODEL || 'gpt-4o-mini',
      temperature: process.env.AI_TEMPERATURE || '0.4',
      maxTokens: process.env.AI_MAX_TOKENS || '1024',
      orchestratorUrl: '',
      systemPrompt: '',
      enableStreaming: false,
      enableCache: true,
      workers: [],
    },
    pwa: parsed.settings?.pwa ?? {
      enabled: false,
      appName: 'NutriAID',
      appShortName: 'NutriAID',
      themeColor: '#16a34a',
      backgroundColor: '#f8faf8',
      vapidPublicKey: '',
      notifications: {
        dailyReminder: false,
        weeklyReport: false,
        guidanceReady: false,
        systemAlerts: false,
        reminderTime: '08:00',
      },
    },
    pricing: {
      basic: parsed.settings?.pricing?.basic ?? {
        name: 'Basic',
        description: 'Ideal pentru cei care vor sa inceapa.',
        amount: '9.99',
        currency: 'eur',
        interval: 'month',
        features: ['introducerea meselor', 'introducerea simptomelor', 'corelatii de baza', 'alimente suspecte', 'alimente sigure', 'evolutia simptomelor'],
      },
      pro: parsed.settings?.pricing?.pro ?? {
        name: 'Pro',
        description: 'Cel mai popular. Perfect pentru claritate rapida.',
        amount: '14.99',
        currency: 'eur',
        interval: 'month',
        features: ['tot din Basic', 'analiza AI avansata', 'detectarea combinatiilor problematice', 'recomandari personalizate', 'planuri alimentare adaptate', 'rapoarte zilnice', 'evolutie detaliata'],
      },
      pro_plus: parsed.settings?.pricing?.pro_plus ?? {
        name: 'Pro+',
        description: 'Pentru cei care vor maximul de precizie.',
        amount: '35.99',
        currency: 'eur',
        interval: 'month',
        features: ['tot din Pro', 'analiza AI extinsa', 'predictii avansate', 'detectarea reactiilor intarziate complexe', 'ghidare premium', 'suport prioritar', 'actualizari personalizate in timp real'],
      },
    },
    backup: {
      schedule: parsed.settings?.backup?.schedule ?? 'daily',
      retention: parsed.settings?.backup?.retention ?? '30',
      destination: parsed.settings?.backup?.destination ?? 'local',
      hetzner: parsed.settings?.backup?.hetzner ?? {
        region: 'eu-central',
        endpoint: '',
        bucket: '',
        accessKey: '',
        secretKey: '',
      },
    },
    recaptcha: parsed.settings?.recaptcha ?? {
      enabled: false,
      siteKey: '',
      secretKey: '',
      scoreThreshold: '0.5',
    },
  };
  if (!Array.isArray(parsed.AI_Logs)) {
    parsed.AI_Logs = [];
  }
  if (!hadToken) {
    writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf8');
  }
  return parsed;
}

export function writeDb(next: SuperadminDb): void {
  ensureDbFile();
  writeFileSync(DB_PATH, JSON.stringify(next, null, 2), 'utf8');
}

export function mutateDb<T>(updater: (db: SuperadminDb) => T): T {
  const db = readDb();
  const result = updater(db);
  writeDb(db);
  return result;
}

export function appendAuditEvent(event: Omit<AuditEvent, 'id' | 'createdAt'>): void {
  mutateDb((db) => {
    db.auditEvents.unshift({ ...event, id: id('audit'), createdAt: nowIso() });
    db.logs.unshift({
      id: id('log'),
      source: 'audit',
      level: 'info',
      message: `${event.action} on ${event.resource}`,
      metadata: { actorEmail: event.actorEmail, resourceId: event.resourceId },
      createdAt: nowIso(),
    });
    db.auditEvents = db.auditEvents.slice(0, 1000);
    db.logs = db.logs.slice(0, 2000);
  });
}

export function appendSecurityEvent(event: Omit<SecurityEvent, 'id' | 'createdAt'>): void {
  mutateDb((db) => {
    db.securityEvents.unshift({ ...event, id: id('sec'), createdAt: nowIso() });
    db.logs.unshift({
      id: id('log'),
      source: 'security',
      level: event.type === 'login_failed' ? 'warn' : 'info',
      message: event.message,
      metadata: { ip: event.ip, email: event.email },
      createdAt: nowIso(),
    });
    db.securityEvents = db.securityEvents.slice(0, 1500);
    db.logs = db.logs.slice(0, 2000);
  });
}

export function appendLog(log: Omit<LogRecord, 'id' | 'createdAt'>): void {
  mutateDb((db) => {
    db.logs.unshift({ ...log, id: id('log'), createdAt: nowIso() });
    db.logs = db.logs.slice(0, 2000);
  });
}

export function appendAiLog(log: Omit<AIExecutionLog, 'id' | 'createdAt'>): void {
  mutateDb((db) => {
    db.aiLogs.unshift({ ...log, id: id('ai'), createdAt: nowIso() });
    db.aiLogs = db.aiLogs.slice(0, 1000);
  });
}

export function appendAISystemLog(log: AILogRecord): void {
  mutateDb((db) => {
    db.AI_Logs.unshift(log);
    db.AI_Logs = db.AI_Logs.slice(0, 10000);
  });
}
