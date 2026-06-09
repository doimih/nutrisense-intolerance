import 'server-only';
import Stripe from 'stripe';
import { getStripeServerConfig } from '@/lib/server/stripeSettings';

export async function getStripeServerClient(): Promise<Stripe> {
  const config = await getStripeServerConfig();
  if (!config.secretKey) {
    throw new Error('Stripe secret key is not configured. Set it in Admin → Settings → Stripe.');
  }
  return new Stripe(config.secretKey, { apiVersion: '2026-05-27.dahlia' });
}

export async function getStripeWebhookSecret(): Promise<string> {
  const config = await getStripeServerConfig();
  if (!config.webhookSecret) {
    throw new Error('Stripe webhook secret is not configured. Set it in Admin → Settings → Stripe.');
  }
  return config.webhookSecret;
}
