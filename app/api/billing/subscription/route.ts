import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { getEffectivePlanTier } from "@/lib/billing/features";
import { getSubscriptionSnapshot } from "@/lib/server/subscriptionStore";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = authCookie ? await readSessionToken(authCookie) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const email = session.user.email.trim().toLowerCase();
  const [planTier, snapshot] = await Promise.all([
    getEffectivePlanTier(email),
    getSubscriptionSnapshot(email),
  ]);

  return NextResponse.json({
    planTier,
    subscription: snapshot ?? {
      email,
      planCode: null,
      status: "none",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      updatedAt: null,
    },
  });
}
