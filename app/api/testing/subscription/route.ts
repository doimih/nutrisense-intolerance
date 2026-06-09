import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import {
  upsertSubscriptionSnapshot,
  type SubscriptionStatus,
} from "@/lib/server/subscriptionStore";
import { isBillingPlanCode, type BillingPlanCode } from "@/lib/billing/plans";

export const runtime = "nodejs";

const ALLOWED_STATUSES = new Set([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "paused",
  "unpaid",
  "none",
]);

function isSubscriptionStatus(value: string): value is SubscriptionStatus {
  return ALLOWED_STATUSES.has(value);
}

export async function PATCH(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production." }, { status: 404 });
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    status?: string;
    planCode?: string | null;
  };

  const status = body.status || "none";
  if (!isSubscriptionStatus(status)) {
    return NextResponse.json({ error: "Invalid subscription status." }, { status: 400 });
  }

  let planCode: BillingPlanCode | null = null;
  if (typeof body.planCode === "string" && body.planCode.trim() !== "") {
    const normalized = body.planCode.trim().toLowerCase();
    if (!isBillingPlanCode(normalized)) {
      return NextResponse.json({ error: "Invalid planCode." }, { status: 400 });
    }
    planCode = normalized;
  }

  const snapshot =
    status === "none"
      ? {
          email: session.user.email.trim().toLowerCase(),
          planCode: null,
          status: "none" as const,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          updatedAt: new Date().toISOString(),
        }
      : await upsertSubscriptionSnapshot(session.user.email, {
          planCode,
          status,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        });

  return NextResponse.json({ subscription: snapshot });
}
