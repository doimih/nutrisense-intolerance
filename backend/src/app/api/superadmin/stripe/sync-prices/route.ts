import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { mutateDb, readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

type PlanKey = 'basic' | 'pro' | 'pro_plus';

type SyncResult = {
  plan: string;
  key: PlanKey;
  status: 'synced' | 'skipped' | 'error';
  newPriceId?: string;
  amount?: number;
  currency?: string;
  reason?: string;
};

async function stripePost(path: string, params: Record<string, string>, secretKey: string): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const body = new URLSearchParams(params).toString();
  try {
    const res = await fetch(`https://api.stripe.com/v1${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      signal: AbortSignal.timeout(12_000),
    });
    const data = await res.json() as { error?: { message?: string }; [key: string]: unknown };
    if (!res.ok) return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

async function stripeGet(path: string, secretKey: string): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  try {
    const res = await fetch(`https://api.stripe.com/v1${path}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${secretKey}` },
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json() as { error?: { message?: string }; [key: string]: unknown };
    if (!res.ok) return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    return { ok: true, data };
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
    return NextResponse.json({ ok: false, error: 'No Stripe Secret Key configured.' }, { status: 400 });
  }

  const pricing = db.settings?.pricing ?? {};
  const stripeProducts = db.settings?.stripe?.products ?? {};

  const plans: Array<{ key: PlanKey; label: string }> = [
    { key: 'basic', label: 'Basic' },
    { key: 'pro', label: 'Pro' },
    { key: 'pro_plus', label: 'Pro+' },
  ];

  const results: SyncResult[] = [];
  const newPriceIds: Partial<Record<PlanKey, string>> = {};

  for (const { key, label } of plans) {
    const plan = pricing[key];
    const product = stripeProducts[key];

    if (!plan?.amount || !plan?.currency) {
      results.push({ plan: label, key, status: 'skipped', reason: 'No price configured in Pricing tab.' });
      continue;
    }

    if (!product?.productId) {
      results.push({ plan: label, key, status: 'skipped', reason: 'No Product ID configured in Stripe tab. Add it first.' });
      continue;
    }

    // Validate product exists on Stripe
    const prodCheck = await stripeGet(`/products/${product.productId}`, secretKey);
    if (!prodCheck.ok) {
      results.push({ plan: label, key, status: 'error', reason: `Product ${product.productId}: ${prodCheck.error}` });
      continue;
    }

    const amountCents = Math.round(parseFloat(plan.amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      results.push({ plan: label, key, status: 'error', reason: `Invalid amount: ${plan.amount}` });
      continue;
    }

    // Check if existing price already matches — skip to avoid duplicates
    if (product.priceId) {
      const existingPrice = await stripeGet(`/prices/${product.priceId}`, secretKey);
      if (existingPrice.ok) {
        const existing = existingPrice.data as { unit_amount?: number; currency?: string; active?: boolean };
        if (
          existing.active !== false &&
          existing.unit_amount === amountCents &&
          existing.currency?.toLowerCase() === plan.currency.toLowerCase()
        ) {
          results.push({
            plan: label, key, status: 'skipped',
            reason: 'Price already matches. No change needed.',
            newPriceId: product.priceId,
            amount: amountCents,
            currency: plan.currency,
          });
          continue;
        }
        // Archive old price
        await stripePost(`/prices/${product.priceId}`, { active: 'false' }, secretKey);
      }
    }

    // Create new price
    const createParams: Record<string, string> = {
      product: product.productId,
      unit_amount: String(amountCents),
      currency: plan.currency.toLowerCase(),
      'recurring[interval]': plan.interval ?? 'month',
      nickname: `${label} ${plan.interval ?? 'month'}ly`,
      'metadata[plan_key]': key,
    };

    const createResult = await stripePost('/prices', createParams, secretKey);
    if (!createResult.ok) {
      results.push({ plan: label, key, status: 'error', reason: `Failed to create price: ${createResult.error}` });
      continue;
    }

    const created = createResult.data as { id?: string };
    const newPriceId = created.id ?? '';
    newPriceIds[key] = newPriceId;

    results.push({
      plan: label, key, status: 'synced',
      newPriceId,
      amount: amountCents,
      currency: plan.currency,
    });
  }

  // Persist new price IDs to stripe.products in DB
  if (Object.keys(newPriceIds).length > 0) {
    mutateDb((db) => {
      if (!db.settings.stripe.products) {
        db.settings.stripe.products = {};
      }
      for (const [key, priceId] of Object.entries(newPriceIds)) {
        const k = key as PlanKey;
        if (!db.settings.stripe.products![k]) {
          db.settings.stripe.products![k] = { productId: '', priceId };
        } else {
          db.settings.stripe.products![k]!.priceId = priceId;
        }
      }
      return db.settings;
    });
  }

  return NextResponse.json({ ok: true, results });
}
