export type BillingPlanCode = "basic" | "pro" | "pro_plus";

export type BillingPlanDefinition = {
  code: BillingPlanCode;
  label: string;
  priceEnvVar: string;
};

export const BILLING_PLAN_DEFINITIONS: BillingPlanDefinition[] = [
  {
    code: "basic",
    label: "Basic",
    priceEnvVar: "STRIPE_PRICE_BASIC_MONTHLY",
  },
  {
    code: "pro",
    label: "Pro",
    priceEnvVar: "STRIPE_PRICE_PRO_MONTHLY",
  },
  {
    code: "pro_plus",
    label: "Pro+",
    priceEnvVar: "STRIPE_PRICE_PRO_PLUS_MONTHLY",
  },
];

export function isBillingPlanCode(value: string): value is BillingPlanCode {
  return BILLING_PLAN_DEFINITIONS.some((plan) => plan.code === value);
}

export function getStripePriceIdForPlan(planCode: BillingPlanCode): string | null {
  const plan = BILLING_PLAN_DEFINITIONS.find((entry) => entry.code === planCode);
  if (!plan) return null;

  const envValue = process.env[plan.priceEnvVar];
  if (!envValue) return null;

  return envValue.trim();
}
