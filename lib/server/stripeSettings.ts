import 'server-only';
import { getRuntimeSettings } from '@/lib/server/runtimeSettings';

export type StripeServerConfig = {
  secretKey: string | null;
  webhookSecret: string | null;
  publishableKey: string | null;
  products: {
    basic: { productId: string; priceId: string };
    pro: { productId: string; priceId: string };
    pro_plus: { productId: string; priceId: string };
  };
};

const EMPTY_CONFIG: StripeServerConfig = {
  secretKey: null,
  webhookSecret: null,
  publishableKey: null,
  products: {
    basic: { productId: '', priceId: '' },
    pro: { productId: '', priceId: '' },
    pro_plus: { productId: '', priceId: '' },
  },
};

function getBackendStripeConfigUrl(): string {
  const base =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.BACKEND_URL ||
    'https://backend.nutrisense-i.eu';
  return `${base.replace(/\/$/, '')}/api/internal/stripe-config`;
}

let _cache: { config: StripeServerConfig; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getStripeServerConfig(): Promise<StripeServerConfig> {
  const now = Date.now();
  if (_cache && now - _cache.fetchedAt < CACHE_TTL_MS) return _cache.config;

  const settings = await getRuntimeSettings();
  const token = settings.internalEmailToken;
  if (!token) return EMPTY_CONFIG;

  const res = await fetch(getBackendStripeConfigUrl(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) return EMPTY_CONFIG;

  const config = (await res.json().catch(() => null)) as StripeServerConfig | null;
  if (!config) return EMPTY_CONFIG;

  _cache = { config, fetchedAt: now };
  return config;
}
