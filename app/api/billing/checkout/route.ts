import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';
import {
  getStripePriceIdForPlan,
  isBillingPlanCode,
  type BillingPlanCode,
} from '@/lib/billing/plans';
import { readSessionToken } from '@/lib/auth/sessionToken';
import { getStripeServerClient } from '@/lib/server/stripe';
import { getRuntimeSettings } from '@/lib/server/runtimeSettings';

type CheckoutBody = {
  planCode?: string;
};

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authSession = authCookie ? await readSessionToken(authCookie) : null;
  if (!authSession) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const planCodeRaw = body.planCode?.trim().toLowerCase();
  if (!planCodeRaw || !isBillingPlanCode(planCodeRaw)) {
    return NextResponse.json({ error: 'Invalid plan code.' }, { status: 400 });
  }

  const planCode = planCodeRaw as BillingPlanCode;

  let priceId: string | null;
  try {
    priceId = await getStripePriceIdForPlan(planCode);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not load Stripe settings.' },
      { status: 503 }
    );
  }

  if (!priceId) {
    return NextResponse.json(
      { error: `Price ID for plan "${planCode}" is not configured. Set it in Admin → Settings → Stripe.` },
      { status: 503 }
    );
  }

  let stripe;
  try {
    stripe = await getStripeServerClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Stripe is not configured.' },
      { status: 503 }
    );
  }

  const customerEmail = authSession.user.email.trim().toLowerCase();
  const settings = await getRuntimeSettings();
  const siteUrl = (settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const origin = siteUrl || request.nextUrl.origin;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { planCode, email: customerEmail },
    customer_email: customerEmail,
    success_url: `${origin}/dashboard?billing=success`,
    cancel_url: `${origin}/pricing?billing=cancelled`,
  });

  if (!checkoutSession.url) {
    return NextResponse.json({ error: 'Stripe session URL was not returned.' }, { status: 500 });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
