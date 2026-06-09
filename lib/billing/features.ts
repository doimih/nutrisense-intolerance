import "server-only";
import { getUserPlan, getUserRole, getUserTrialEndsAt } from "@/lib/server/authStore";
import { getSubscriptionSnapshot } from "@/lib/server/subscriptionStore";

export type PlanTier = "none" | "basic" | "pro" | "pro_plus";

const TIER_ORDER: PlanTier[] = ["none", "basic", "pro", "pro_plus"];

export function tierAllows(userTier: PlanTier, required: PlanTier): boolean {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(required);
}

export function cappedDetailLevel(
  tier: PlanTier,
  requested: "basic" | "detailed" | "comprehensive"
): "basic" | "detailed" | "comprehensive" {
  const maxByTier = tier === "pro_plus" ? "comprehensive" : tier === "pro" ? "detailed" : "basic";
  const order = ["basic", "detailed", "comprehensive"];
  return order.indexOf(requested) > order.indexOf(maxByTier)
    ? (maxByTier as "basic" | "detailed" | "comprehensive")
    : requested;
}

// Superadmin accounts are exempt from all plan restrictions — they always get pro_plus.
export async function getEffectivePlanTier(email: string): Promise<PlanTier> {
  const role = await getUserRole(email);
  if (role === "superadmin") return "pro_plus";

  const snapshot = await getSubscriptionSnapshot(email);
  if (snapshot && (snapshot.status === "active" || snapshot.status === "trialing") && snapshot.planCode) {
    return snapshot.planCode as PlanTier;
  }
  const authPlan = await getUserPlan(email);
  if (authPlan) return authPlan as PlanTier;
  const trialEndsAt = await getUserTrialEndsAt(email);
  if (trialEndsAt && new Date(trialEndsAt).getTime() > Date.now()) {
    return "pro_plus";
  }
  return "none";
}
