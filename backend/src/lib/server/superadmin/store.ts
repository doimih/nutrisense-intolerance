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
    plan: 'enterprise',
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
    plan: 'enterprise',
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
  parsed.users = parsed.users.map((user) => ({
    ...user,
    sessionVersion: user.sessionVersion || 1,
    sessionInvalidBefore: user.sessionInvalidBefore || 0,
    twoFactorSecret: user.twoFactorSecret || null,
  }));
  parsed.settings = {
    ...parsed.settings,
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
  };
  if (!Array.isArray(parsed.AI_Logs)) {
    parsed.AI_Logs = [];
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
