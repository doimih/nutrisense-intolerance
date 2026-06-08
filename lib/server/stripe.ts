import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripeApiKey(): string {
  const raw = process.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_RESTRICTED_KEY;
  if (!raw) {
    throw new Error("Stripe API key is missing. Set STRIPE_RESTRICTED_KEY or STRIPE_SECRET_KEY.");
  }

  return raw.trim();
}

export function getStripeServerClient(): Stripe {
  if (stripeClient) return stripeClient;

  stripeClient = new Stripe(getStripeApiKey(), {
    apiVersion: "2026-05-27.dahlia",
  });

  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Stripe webhook secret is missing. Set STRIPE_WEBHOOK_SECRET.");
  }

  return webhookSecret.trim();
}
