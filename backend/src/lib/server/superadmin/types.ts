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
  plan: 'free' | 'basic' | 'pro' | 'pro_plus';
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
  isVisitor?: boolean;
};

export type VisitorIpSession = {
  id: string;
  system: 'backend' | 'frontend';
  ip: string;
  sessionStartsAt: string;
  sessionExpiresAt: string;
  blockUntil: string;
  resetBy: string | null;
  resetAt: string | null;
};

export type SubscriptionRecord = {
  id: string;
  userId: string;
  userEmail: string;
  plan: 'free' | 'basic' | 'pro' | 'pro_plus';
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

export type LogSource = 'server' | 'api' | 'stripe-webhook' | 'ai' | 'error' | 'security' | 'audit' | 'frontend';

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

export type AILogSource = 'frontend' | 'orchestrator' | 'worker' | 'ai' | 'system';
export type AILogLevel = 'info' | 'warning' | 'error';

export type AILogRecord = {
  id: string;
  timestamp: string;
  sessionId: string;
  userId: string | null;
  source: AILogSource;
  level: AILogLevel;
  intent: string | null;
  worker: string | null;
  model: string | null;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
};

export type PlanContent = {
  name: string;
  description: string;
  features: string[];
};

export type PlanPricing = {
  amount: string;
  currency: string;
  interval: 'month' | 'year';
  ro: PlanContent;
  en: PlanContent;
};

export type PlatformSettings = {
  app: {
    siteUrl: string;
    backendUrl: string;
    adminConsoleUrl: string;
  };
  stripe: {
    publishableKeyMasked: string;
    secretKeyMasked: string;
    webhookSecretMasked: string;
    billingMode: 'subscription' | 'one-time' | 'usage';
    currency?: string;
    trialDays?: string;
    products?: {
      basic?: { productId: string; priceId: string };
      pro?: { productId: string; priceId: string };
      pro_plus?: { productId: string; priceId: string };
    };
  };
  pricing?: {
    basic?: PlanPricing;
    pro?: PlanPricing;
    pro_plus?: PlanPricing;
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
  email?: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    fromName: string;
    encryption: 'tls' | 'ssl' | 'none';
  };
  internalEmailToken?: string;
  aiBrain?: {
    defaultModel: string;
    fallbackModel: string;
    temperature: string;
    maxTokens: string;
    orchestratorUrl: string;
    systemPrompt: string;
    enableStreaming: boolean;
    enableCache: boolean;
    workers?: Array<{
      id: string;
      name: string;
      description: string;
      prompt: string;
      inputSchema: string;
      outputSchema: string;
      enabled: boolean;
    }>;
  };
  pwa?: {
    enabled: boolean;
    appName: string;
    appShortName: string;
    themeColor: string;
    backgroundColor: string;
    vapidPublicKey: string;
    notifications: {
      dailyReminder: boolean;
      weeklyReport: boolean;
      guidanceReady: boolean;
      systemAlerts: boolean;
      reminderTime: string;
    };
  };
  backup?: {
    schedule: string;
    retention: string;
    destination: string;
    hetzner?: {
      region: string;
      endpoint: string;
      bucket: string;
      accessKey: string;
      secretKey: string;
    };
  };
  recaptcha?: {
    enabled: boolean;
    siteKey: string;
    secretKey: string;
    scoreThreshold: string;
  };
  analytics?: {
    enabled: boolean;
    measurementId: string;
  };
  tiktok?: {
    enabled: boolean;
    pixelId: string;
    accessToken: string;
    testEventCode: string;
  };
  brevo?: {
    apiKey: string;
    listIdUsers: string;
    listIdPublic: string;
    eventsKey: string;
  };
};

export type ArchiveLink = {
  id: string;
  token: string;
  sentToEmail: string;
  generatedBy: string;
  expiresAt: string;
  downloadedAt: string | null;
  createdAt: string;
};

export type AcquisitionDownloadRecord = {
  id: string;
  timestamp: string;
  ip: string;
  country: string | null;
  userAgent: string;
  file: string;
  subfolder: string;
};

export type SuperadminDb = {
  users: SuperadminUser[];
  subscriptions: SubscriptionRecord[];
  payments: PaymentRecord[];
  logs: LogRecord[];
  auditEvents: AuditEvent[];
  securityEvents: SecurityEvent[];
  aiLogs: AIExecutionLog[];
  AI_Logs: AILogRecord[];
  archiveLinks: ArchiveLink[];
  visitorSessions: VisitorIpSession[];
  acquisitionDownloads: AcquisitionDownloadRecord[];
  settings: PlatformSettings;
};
