import { getStripeServerConfig } from '@/lib/server/stripeSettings';

export type BillingPlanCode = 'basic' | 'pro' | 'pro_plus';

export type BillingPlanDefinition = {
  code: BillingPlanCode;
  label: string;
};

export const BILLING_PLAN_DEFINITIONS: BillingPlanDefinition[] = [
  { code: 'basic', label: 'Basic' },
  { code: 'pro', label: 'Pro' },
  { code: 'pro_plus', label: 'Pro+' },
];

export function isBillingPlanCode(value: string): value is BillingPlanCode {
  return BILLING_PLAN_DEFINITIONS.some((plan) => plan.code === value);
}

export async function getStripePriceIdForPlan(planCode: BillingPlanCode): Promise<string | null> {
  const config = await getStripeServerConfig();
  const priceId = config.products[planCode]?.priceId;
  return priceId || null;
}
