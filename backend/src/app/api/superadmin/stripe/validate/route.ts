import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

type ProductValidation = {
  plan: string;
  productId: string;
  priceId: string;
  productOk: boolean;
  priceOk: boolean;
  productName?: string;
  priceName?: string;
  priceAmount?: number;
  priceCurrency?: string;
  error?: string;
};

type ValidationResult = {
  connectionOk: boolean;
  accountId?: string;
  accountEmail?: string;
  livemode?: boolean;
  products: ProductValidation[];
  error?: string;
};

async function stripeGet(path: string, secretKey: string): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  try {
    const res = await fetch(`https://api.stripe.com/v1${path}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      signal: AbortSignal.timeout(10_000),
    });
    const body = await res.json() as { error?: { message?: string }; [key: string]: unknown };
    if (!res.ok) {
      return { ok: false, error: body?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, data: body };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const db = readDb();
  const secretKey = db.settings?.stripe?.secretKeyMasked ?? '';

  if (!secretKey || secretKey === 'sk_live_************' || secretKey === 'sk_test_************') {
    return NextResponse.json<ValidationResult>({
      connectionOk: false,
      products: [],
      error: 'No Stripe Secret Key configured. Save a valid key first.',
    });
  }

  // 1. Test connection — fetch account info
  const accountResult = await stripeGet('/account', secretKey);
  if (!accountResult.ok) {
    return NextResponse.json<ValidationResult>({
      connectionOk: false,
      products: [],
      error: `Stripe connection failed: ${accountResult.error}`,
    });
  }

  const account = accountResult.data as { id?: string; email?: string; livemode?: boolean };

  // 2. Validate each product/price
  const stripeProducts = db.settings?.stripe?.products ?? {};
  const entries = [
    { plan: 'Basic', key: 'basic', ...stripeProducts.basic },
    { plan: 'Pro', key: 'pro', ...stripeProducts.pro },
    { plan: 'Pro+', key: 'pro_plus', ...stripeProducts.pro_plus },
  ] as Array<{ plan: string; key: string; productId?: string; priceId?: string }>;

  const products: ProductValidation[] = [];

  for (const entry of entries) {
    const pv: ProductValidation = {
      plan: entry.plan,
      productId: entry.productId ?? '',
      priceId: entry.priceId ?? '',
      productOk: false,
      priceOk: false,
    };

    if (!entry.productId && !entry.priceId) {
      pv.error = 'Not configured';
      products.push(pv);
      continue;
    }

    // Validate product
    if (entry.productId) {
      const prodResult = await stripeGet(`/products/${entry.productId}`, secretKey);
      if (prodResult.ok) {
        pv.productOk = true;
        const prod = prodResult.data as { name?: string };
        pv.productName = prod.name;
      } else {
        pv.error = `Product: ${prodResult.error}`;
      }
    }

    // Validate price
    if (entry.priceId) {
      const priceResult = await stripeGet(`/prices/${entry.priceId}`, secretKey);
      if (priceResult.ok) {
        pv.priceOk = true;
        const price = priceResult.data as { nickname?: string; unit_amount?: number; currency?: string };
        pv.priceName = price.nickname ?? undefined;
        pv.priceAmount = price.unit_amount ?? undefined;
        pv.priceCurrency = price.currency ?? undefined;
      } else {
        const priceErr = `Price: ${priceResult.error}`;
        pv.error = pv.error ? `${pv.error} | ${priceErr}` : priceErr;
      }
    }

    products.push(pv);
  }

  return NextResponse.json<ValidationResult>({
    connectionOk: true,
    accountId: account.id,
    accountEmail: account.email,
    livemode: account.livemode,
    products,
  });
}
