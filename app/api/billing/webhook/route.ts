import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { isBillingPlanCode, type BillingPlanCode } from "@/lib/billing/plans";
import { getStripeServerClient, getStripeWebhookSecret } from "@/lib/server/stripe";
import {
  type SubscriptionStatus,
  upsertSubscriptionSnapshot,
} from "@/lib/server/subscriptionStore";
import { setUserPlan, removeUserPlan } from "@/lib/server/authStore";
import { brevoEvents } from "@/lib/server/brevoEventService";

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
    const stripe = await getStripeServerClient();
    const webhookSecret = await getStripeWebhookSecret();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
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
      const email = session.customer_details?.email ?? (session.metadata?.email as string | undefined);
      const planCode = extractPlanCode(session.metadata?.planCode);

      if (email) {
        await upsertSubscriptionSnapshot(email, {
          planCode,
          status: "active",
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : null,
        });
        if (planCode) {
          await setUserPlan(email, planCode);
          void brevoEvents.subscriptionStarted(email, { plan: planCode, provider: 'stripe' }).catch(() => {});
        }
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const metadataEmail = subscription.metadata?.email as string | undefined;
      const planCode = extractPlanCode(subscription.metadata?.planCode);
      const subscriptionStatus = toSubscriptionStatus(subscription.status);

      if (metadataEmail) {
        const previousPlanCode = extractPlanCode(
          (event.data.previous_attributes as Record<string, unknown> | undefined)?.['metadata']
        );

        await upsertSubscriptionSnapshot(metadataEmail, {
          planCode,
          status: subscriptionStatus,
          stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : null,
          stripeSubscriptionId: subscription.id,
        });
        if (planCode && (subscriptionStatus === "active" || subscriptionStatus === "trialing")) {
          await setUserPlan(metadataEmail, planCode);
          if (previousPlanCode && previousPlanCode !== planCode) {
            const planRank: Record<string, number> = { basic: 1, pro: 2, pro_plus: 3 };
            const prev = planRank[previousPlanCode] ?? 0;
            const next = planRank[planCode] ?? 0;
            if (next > prev) {
              void brevoEvents.subscriptionUpgraded(metadataEmail, { fromPlan: previousPlanCode, toPlan: planCode }).catch(() => {});
            } else {
              void brevoEvents.subscriptionDowngraded(metadataEmail, { fromPlan: previousPlanCode, toPlan: planCode }).catch(() => {});
            }
          }
        } else if (
          subscriptionStatus === "canceled" ||
          subscriptionStatus === "incomplete_expired" ||
          subscriptionStatus === "unpaid"
        ) {
          await removeUserPlan(metadataEmail);
          void brevoEvents.subscriptionCanceled(metadataEmail, { plan: planCode ?? 'unknown' }).catch(() => {});
        }
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
