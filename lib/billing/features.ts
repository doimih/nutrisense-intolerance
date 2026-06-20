import "server-only";
import { getUserPlan, getUserRole, getUserTrialEndsAt, getUserEarlyAdopterStatus } from "@/lib/server/authStore";
import { getSubscriptionSnapshot } from "@/lib/server/subscriptionStore";

export type PlanTier = "none" | "basic" | "pro" | "pro_plus" | "enterprise";

const TIER_ORDER: PlanTier[] = ["none", "basic", "pro", "pro_plus", "enterprise"];

export function tierAllows(userTier: PlanTier, required: PlanTier): boolean {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(required);
}

export function cappedDetailLevel(
  tier: PlanTier,
  requested: "basic" | "detailed" | "comprehensive"
): "basic" | "detailed" | "comprehensive" {
  const maxByTier = (tier === "pro_plus" || tier === "enterprise") ? "comprehensive" : tier === "pro" ? "detailed" : "basic";
  const order = ["basic", "detailed", "comprehensive"];
  return order.indexOf(requested) > order.indexOf(maxByTier)
    ? (maxByTier as "basic" | "detailed" | "comprehensive")
    : requested;
}

// Superadmin accounts get enterprise tier — matches backend DB plan.
export async function getEffectivePlanTier(email: string): Promise<PlanTier> {
  const role = await getUserRole(email);
  if (role === "superadmin") return "enterprise";

  const snapshot = await getSubscriptionSnapshot(email);
  if (snapshot && (snapshot.status === "active" || snapshot.status === "trialing") && snapshot.planCode) {
    return snapshot.planCode as PlanTier;
  }
  const authPlan = await getUserPlan(email);
  if (authPlan) return authPlan as PlanTier;
  // Early adopters (first 100 users) get free pro access without Stripe
  const isEarlyAdopter = await getUserEarlyAdopterStatus(email);
  if (isEarlyAdopter) return "pro";
  const trialEndsAt = await getUserTrialEndsAt(email);
  if (trialEndsAt && new Date(trialEndsAt).getTime() > Date.now()) {
    return "pro_plus";
  }
  return "none";
}
