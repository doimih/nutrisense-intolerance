import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function upsertSubscriptionSnapshot(
  email: string,
  payload: Omit<SubscriptionSnapshot, "email" | "updatedAt">
): Promise<SubscriptionSnapshot> {
  const normalizedEmail = normalizeEmail(email);
  const updatedAt = new Date().toISOString();

  await db
    .insert(subscriptions)
    .values({
      email: normalizedEmail,
      planCode: payload.planCode,
      status: payload.status,
      stripeCustomerId: payload.stripeCustomerId,
      stripeSubscriptionId: payload.stripeSubscriptionId,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: subscriptions.email,
      set: {
        planCode: payload.planCode,
        status: payload.status,
        stripeCustomerId: payload.stripeCustomerId,
        stripeSubscriptionId: payload.stripeSubscriptionId,
        updatedAt,
      },
    });

  return {
    email: normalizedEmail,
    planCode: payload.planCode,
    status: payload.status,
    stripeCustomerId: payload.stripeCustomerId,
    stripeSubscriptionId: payload.stripeSubscriptionId,
    updatedAt,
  };
}

export async function getSubscriptionSnapshot(email: string): Promise<SubscriptionSnapshot | null> {
  const normalizedEmail = normalizeEmail(email);
  const row = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.email, normalizedEmail),
  });
  if (!row) return null;
  return {
    email: row.email,
    planCode: row.planCode as BillingPlanCode | null,
    status: row.status as SubscriptionStatus,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    updatedAt: row.updatedAt,
  };
}
