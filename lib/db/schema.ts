import { pgTable, text, boolean, integer, jsonb, serial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  role: text("role").notNull(),
  passwordHash: text("password_hash").notNull(),
  salt: text("salt").notNull(),
  isVerified: boolean("is_verified").notNull(),
  verifiedAt: text("verified_at"),
  plan: text("plan"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").unique().notNull(),
  email: text("email").notNull(),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at"),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  planCode: text("plan_code"),
  status: text("status").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  updatedAt: text("updated_at").notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email").unique().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  dietaryPreference: text("dietary_preference").notNull(),
  intolerances: text("intolerances").array().notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const monitoringEntries = pgTable("monitoring_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email").notNull(),
  date: text("date").notNull(),
  mealTime: text("meal_time"),
  consumedFoods: text("consumed_foods").array().notNull(),
  symptoms: text("symptoms").array().notNull(),
  symptomsIntensity: integer("symptoms_intensity").notNull(),
  reactionLatencyMinutes: integer("reaction_latency_minutes"),
  wellbeing: integer("wellbeing").notNull(),
  notes: text("notes").notNull(),
  createdAt: text("created_at").notNull(),
});

// Stores aggregated problem patterns for AI orchestrator cross-user pattern mining
export const userProblems = pgTable("user_problems", {
  id: text("id").primaryKey(),
  userEmail: text("user_email").notNull(),
  // Symptoms, triggers, and patterns extracted from monitoring history
  symptoms: jsonb("symptoms").notNull(),        // string[]
  triggers: jsonb("triggers").notNull(),         // string[]
  mealPatterns: jsonb("meal_patterns").notNull(),// {foods: string[], timeOfDay: string, dayOfWeek?: number}[]
  severity: integer("severity").notNull(),       // 1–10 average
  // Outcome data — what recommendations were actually helpful
  successfulAdjustments: jsonb("successful_adjustments").notNull(), // string[]
  improvementNotes: text("improvement_notes").notNull(),
  // Metadata
  source: text("source").notNull(),             // "manual" | "ai_derived"
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").unique().notNull(),
  email: text("email").notNull(),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at"),
});

export const guidanceHistory = pgTable("guidance_history", {
  id: text("id").primaryKey(),
  userEmail: text("user_email").notNull(),
  generatedAt: text("generated_at").notNull(),
  source: text("source").notNull(),
  requestFingerprint: text("request_fingerprint").notNull(),
  prompt: text("prompt").notNull(),
  monitoringEntries: jsonb("monitoring_entries").notNull(),
  result: jsonb("result").notNull(),
});
