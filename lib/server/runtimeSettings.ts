import 'server-only';

type PlanContent = {
  name: string;
  description: string;
  features: string[];
};

type PlanPricing = {
  amount: string;
  currency: string;
  interval: string;
  ro: PlanContent;
  en: PlanContent;
};

type PWASettings = {
  enabled: boolean;
  appName: string;
  appShortName: string;
  themeColor: string;
  backgroundColor: string;
  vapidPublicKey: string;
};

type AnalyticsSettings = {
  enabled: boolean;
  measurementId: string;
};

type TikTokSettings = {
  enabled: boolean;
  pixelId: string;
  testEventCode: string;
};

type RuntimeSettings = {
  siteUrl: string;
  backendUrl: string;
  adminConsoleUrl: string;
  internalEmailToken: string | null;
  recaptcha: {
    enabled: boolean;
    siteKey: string;
    scoreThreshold: string;
  };
  analytics: AnalyticsSettings;
  tiktok: TikTokSettings;
  pricing: {
    basic: PlanPricing;
    pro: PlanPricing;
    pro_plus: PlanPricing;
  };
  pwa: PWASettings;
};

const EMPTY_PLAN_CONTENT: PlanContent = { name: '', description: '', features: [] };

const DEFAULT_PLAN: PlanPricing = { amount: '', currency: 'eur', interval: 'month', ro: EMPTY_PLAN_CONTENT, en: EMPTY_PLAN_CONTENT };

const DEFAULT_PWA: PWASettings = {
  enabled: false,
  appName: 'NutriAID',
  appShortName: 'NutriAID',
  themeColor: '#16a34a',
  backgroundColor: '#f8faf8',
  vapidPublicKey: '',
};

const FALLBACK_SETTINGS: RuntimeSettings = {
  siteUrl: 'https://nutriaid.eu',
  backendUrl: 'https://backend.nutriaid.eu',
  adminConsoleUrl: 'https://backend.nutriaid.eu',
  internalEmailToken: null,
  recaptcha: { enabled: false, siteKey: '', scoreThreshold: '0.5' },
  analytics: { enabled: false, measurementId: '' },
  tiktok: { enabled: false, pixelId: '', testEventCode: '' },
  pricing: {
    basic: { ...DEFAULT_PLAN, amount: '9.99' },
    pro: { ...DEFAULT_PLAN, amount: '14.99' },
    pro_plus: { ...DEFAULT_PLAN, amount: '35.99' },
  },
  pwa: { ...DEFAULT_PWA },
};

function getBackendSettingsUrl(): string {
  const backendUrl =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.BACKEND_URL ||
    'https://backend.nutriaid.eu';
  return `${backendUrl.replace(/\/$/, '')}/api/public/settings`;
}

export async function getRuntimeSettings(): Promise<RuntimeSettings> {
  try {
    const response = await fetch(getBackendSettingsUrl(), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      return FALLBACK_SETTINGS;
    }

    const payload = (await response.json()) as {
      settings?: {
        app?: { siteUrl?: string; backendUrl?: string; adminConsoleUrl?: string };
        internalEmailToken?: string | null;
        recaptcha?: { enabled?: boolean; siteKey?: string; scoreThreshold?: string };
        analytics?: Partial<AnalyticsSettings>;
        tiktok?: { enabled?: boolean; pixelId?: string; testEventCode?: string };
        pricing?: {
          basic?: Partial<PlanPricing>;
          pro?: Partial<PlanPricing>;
          pro_plus?: Partial<PlanPricing>;
        };
        pwa?: Partial<PWASettings>;
      };
    };

    const appSettings = payload?.settings?.app;
    const rc = payload?.settings?.recaptcha;
    const an = payload?.settings?.analytics;
    const tt = payload?.settings?.tiktok;
    const p = payload?.settings?.pricing;
    const pw = payload?.settings?.pwa;
    return {
      siteUrl: appSettings?.siteUrl || FALLBACK_SETTINGS.siteUrl,
      backendUrl: appSettings?.backendUrl || FALLBACK_SETTINGS.backendUrl,
      adminConsoleUrl: appSettings?.adminConsoleUrl || appSettings?.backendUrl || FALLBACK_SETTINGS.adminConsoleUrl,
      internalEmailToken: payload?.settings?.internalEmailToken ?? null,
      recaptcha: {
        enabled: rc?.enabled ?? false,
        siteKey: rc?.siteKey ?? '',
        scoreThreshold: rc?.scoreThreshold ?? '0.5',
      },
      analytics: {
        enabled: an?.enabled ?? false,
        measurementId: an?.measurementId ?? '',
      },
      tiktok: {
        enabled: tt?.enabled ?? false,
        pixelId: tt?.pixelId ?? '',
        testEventCode: tt?.testEventCode ?? '',
      },
      pricing: {
        basic: { ...FALLBACK_SETTINGS.pricing.basic, ...p?.basic },
        pro: { ...FALLBACK_SETTINGS.pricing.pro, ...p?.pro },
        pro_plus: { ...FALLBACK_SETTINGS.pricing.pro_plus, ...p?.pro_plus },
      },
      pwa: {
        enabled: pw?.enabled ?? DEFAULT_PWA.enabled,
        appName: pw?.appName || DEFAULT_PWA.appName,
        appShortName: pw?.appShortName || DEFAULT_PWA.appShortName,
        themeColor: pw?.themeColor || DEFAULT_PWA.themeColor,
        backgroundColor: pw?.backgroundColor || DEFAULT_PWA.backgroundColor,
        vapidPublicKey: pw?.vapidPublicKey ?? DEFAULT_PWA.vapidPublicKey,
      },
    };
  } catch {
    return FALLBACK_SETTINGS;
  }
}
