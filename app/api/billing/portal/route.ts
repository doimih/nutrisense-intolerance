import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';
import { readSessionToken } from '@/lib/auth/sessionToken';
import { getStripeServerClient } from '@/lib/server/stripe';
import { getSubscriptionSnapshot } from '@/lib/server/subscriptionStore';
import { getRuntimeSettings } from '@/lib/server/runtimeSettings';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = authCookie ? await readSessionToken(authCookie) : null;
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const email = session.user.email.trim().toLowerCase();
  const snapshot = await getSubscriptionSnapshot(email);

  if (!snapshot?.stripeCustomerId) {
    return NextResponse.json({ error: 'No active subscription found.' }, { status: 400 });
  }

  const stripe = await getStripeServerClient();
  const { siteUrl } = await getRuntimeSettings();
  const returnUrl = `${siteUrl.replace(/\/$/, '')}/dashboard/profile`;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: snapshot.stripeCustomerId,
    return_url: returnUrl,
  });

  return NextResponse.json({ url: portalSession.url });
}
