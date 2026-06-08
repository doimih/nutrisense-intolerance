import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { isBillingPlanCode, type BillingPlanCode } from "@/lib/billing/plans";
import { getStripeServerClient, getStripeWebhookSecret } from "@/lib/server/stripe";
import {
  type SubscriptionStatus,
  upsertSubscriptionSnapshot,
} from "@/lib/server/subscriptionStore";

export const runtime = "nodejs";

function extractPlanCode(candidate: unknown): BillingPlanCode | null {
  if (typeof candidate !== "string") return null;
  const normalized = candidate.trim().toLowerCase();
  return isBillingPlanCode(normalized) ? normalized : null;
}

function toSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "trialing":
    case "active":
    case "past_due":
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
    case "unpaid":
      return status;
    default:
      return "none";
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeServerClient();
    event = stripe.webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Invalid Stripe signature: ${error.message}`
            : "Invalid Stripe signature.",
      },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;
      const planCode = extractPlanCode(session.metadata?.planCode);

      if (email) {
        upsertSubscriptionSnapshot(email, {
          planCode,
          status: "active",
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : null,
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const metadataEmail = subscription.metadata?.email;
      const planCode = extractPlanCode(subscription.metadata?.planCode);

      if (metadataEmail) {
        upsertSubscriptionSnapshot(metadataEmail, {
          planCode,
          status: toSubscriptionStatus(subscription.status),
          stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : null,
          stripeSubscriptionId: subscription.id,
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
