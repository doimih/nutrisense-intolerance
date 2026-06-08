export type AdminRole = 'superadmin' | 'admin' | 'user';

export type UserStatus = 'active' | 'suspended';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trialing';
export type PaymentStatus = 'paid' | 'failed' | 'pending';

export type SuperadminUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  passwordHash: string;
  passwordSalt: string;
  mustChangePassword: boolean;
  twoFactorSecret: string | null;
  status: UserStatus;
  plan: 'free' | 'pro' | 'enterprise';
  sessionVersion: number;
  sessionInvalidBefore: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export type SuperadminSession = {
  userId: string;
  email: string;
  name: string;
  role: AdminRole;
  sessionVersion: number;
  ip: string;
  issuedAt: number;
  exp: number;
};

export type SubscriptionRecord = {
  id: string;
  userId: string;
  userEmail: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: 'stripe';
  stripePaymentIntentId: string | null;
  createdAt: string;
};

export type LogSource = 'server' | 'api' | 'stripe-webhook' | 'ai' | 'error' | 'security' | 'audit';

export type LogRecord = {
  id: string;
  source: LogSource;
  level: 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  actorUserId: string | null;
  actorEmail: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ip: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type SecurityEvent = {
  id: string;
  type: 'login_failed' | 'login_success' | 'suspicious_ip' | 'session_invalid';
  ip: string;
  email: string | null;
  userId: string | null;
  message: string;
  createdAt: string;
};

export type AIExecutionLog = {
  id: string;
  userId: string;
  userEmail: string;
  status: 'success' | 'error';
  latencyMs: number;
  summary: string;
  createdAt: string;
};

export type PlatformSettings = {
  stripe: {
    publishableKeyMasked: string;
    secretKeyMasked: string;
    webhookSecretMasked: string;
    billingMode: 'subscription' | 'one-time' | 'usage';
  };
  ai: {
    provider: string;
    apiKeyMasked: string;
    model: string;
  };
  notifications: {
    criticalErrorsEmail: string;
    webhookUrl: string;
  };
  twoFactor: {
    globalEnabled: boolean;
    enforceAdmin: boolean;
    enforceAll: boolean;
    methods: {
      totp: boolean;
      sms: boolean;
      email: boolean;
    };
  };
};

export type SuperadminDb = {
  users: SuperadminUser[];
  subscriptions: SubscriptionRecord[];
  payments: PaymentRecord[];
  logs: LogRecord[];
  auditEvents: AuditEvent[];
  securityEvents: SecurityEvent[];
  aiLogs: AIExecutionLog[];
  settings: PlatformSettings;
};
