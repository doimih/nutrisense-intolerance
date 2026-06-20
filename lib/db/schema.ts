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
  status: text("status").notNull().default("active"), // 'active' | 'suspended'
  plan: text("plan"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  // Newsletter consent (null = never asked, true = opted in, false = opted out)
  newsletterOptIn: boolean("newsletter_opt_in"),
  newsletterConsentAt: text("newsletter_consent_at"),
  newsletterConsentSource: text("newsletter_consent_source"), // "signup_popup" | "footer_form"
  language: text("language"), // "ro" | "en"
  // Early adopter promotion: first 100 real users get free PRO access
  earlyAdopter: boolean("early_adopter"),
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
  age: integer("age"),
  heightCm: integer("height_cm"),
  weightKg: integer("weight_kg"),
  activityLevel: text("activity_level"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
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

export const recipes = pgTable("recipes", {
  id: text("id").primaryKey(),
  titleRo: text("title_ro").notNull(),
  titleEn: text("title_en").notNull(),
  category: text("category").notNull(), // breakfast | lunch | dinner | snack
  ingredientsRo: jsonb("ingredients_ro").notNull(), // {name, quantity, unit}[]
  ingredientsEn: jsonb("ingredients_en").notNull(),
  instructionsRo: jsonb("instructions_ro").notNull(), // {step_index, text}[]
  instructionsEn: jsonb("instructions_en").notNull(),
  prepTimeMinutes: integer("prep_time_minutes").notNull(),
  difficulty: text("difficulty").notNull(), // easy | medium | hard
  calories: integer("calories"),
  macros: jsonb("macros"), // {protein, carbs, fats}
  cuisine: text("cuisine"),
  tagsRo: jsonb("tags_ro"), // string[]
  tagsEn: jsonb("tags_en"),
  allergens: jsonb("allergens"), // string[]
  substitutionsRo: jsonb("substitutions_ro"), // {for, substitute_with, note}[]
  substitutionsEn: jsonb("substitutions_en"),
  cookingTipsRo: jsonb("cooking_tips_ro"), // string[]
  cookingTipsEn: jsonb("cooking_tips_en"),
  imageUrl: text("image_url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const recipeBatches = pgTable("recipe_batches", {
  id: serial("id").primaryKey(),
  batchNumber: integer("batch_number").notNull(),
  targetCount: integer("target_count").notNull(),
  generatedCount: integer("generated_count").notNull().default(0),
  status: text("status").notNull().default("pending"), // pending | running | completed | failed
  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
});

export const recipeUsage = pgTable("recipe_usage", {
  id: serial("id").primaryKey(),
  recipeId: text("recipe_id").notNull(),
  userId: text("user_id").notNull(),
  usedAt: text("used_at").notNull(),
  context: text("context"), // "meal_plan" | "cooking_mode" | "browse"
});
