import "server-only";
import type { BillingPlanCode } from "@/lib/billing/plans";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | "unpaid"
  | "none";

export type SubscriptionSnapshot = {
  email: string;
  planCode: BillingPlanCode | null;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  updatedAt: string;
};

const subscriptionByEmail = new Map<string, SubscriptionSnapshot>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function upsertSubscriptionSnapshot(
  email: string,
  payload: Omit<SubscriptionSnapshot, "email" | "updatedAt">
): SubscriptionSnapshot {
  const normalizedEmail = normalizeEmail(email);
  const next: SubscriptionSnapshot = {
    email: normalizedEmail,
    planCode: payload.planCode,
    status: payload.status,
    stripeCustomerId: payload.stripeCustomerId,
    stripeSubscriptionId: payload.stripeSubscriptionId,
    updatedAt: new Date().toISOString(),
  };

  subscriptionByEmail.set(normalizedEmail, next);
  return next;
}

export function getSubscriptionSnapshot(email: string): SubscriptionSnapshot | null {
  const normalizedEmail = normalizeEmail(email);
  return subscriptionByEmail.get(normalizedEmail) ?? null;
}
