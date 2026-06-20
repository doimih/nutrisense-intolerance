import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { getSubscriptionSnapshot, upsertSubscriptionSnapshot } from "@/lib/server/subscriptionStore";
import { removeUserPlan, getUserPlan } from "@/lib/server/authStore";
import { getStripeServerClient } from "@/lib/server/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = authCookie ? await readSessionToken(authCookie) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const email = session.user.email.trim().toLowerCase();
  const snapshot = await getSubscriptionSnapshot(email);

  // If no snapshot but user has a plan set directly (e.g. manually granted), allow removal
  if (!snapshot) {
    const currentPlan = await getUserPlan(email);
    if (!currentPlan) {
      return NextResponse.json({ error: "No active subscription to cancel." }, { status: 400 });
    }
    await removeUserPlan(email);
    return NextResponse.json({ ok: true, message: "Subscription cancelled." });
  }

  if (snapshot.status !== "active" && snapshot.status !== "trialing") {
    return NextResponse.json({ error: "No active subscription to cancel." }, { status: 400 });
  }

  if (snapshot.stripeSubscriptionId) {
    let stripe;
    try {
      stripe = await getStripeServerClient();
    } catch {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
    }

    try {
      await stripe.subscriptions.update(snapshot.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Could not cancel subscription." },
        { status: 500 }
      );
    }

    await upsertSubscriptionSnapshot(email, {
      ...snapshot,
      status: "canceled",
    });
  } else {
    await removeUserPlan(email);
    await upsertSubscriptionSnapshot(email, {
      ...snapshot,
      planCode: null,
      status: "canceled",
    });
  }

  return NextResponse.json({ ok: true, message: "Subscription cancelled." });
}
