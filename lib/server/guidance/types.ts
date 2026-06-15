import type { DetailLevel, GuidanceResult, MonitoringContextItem } from "@/types/guidance";
import type { DietaryPreference, Intolerance } from "@/types/profile";

export type SubscriptionTier = "new" | "active" | "expired";

export type PlanTier = "none" | "basic" | "pro" | "pro_plus" | "enterprise";

export type PhysicalProfile = {
  age?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  activityLevel?: string | null;
};

export type PreviousGuidanceSummary = {
  generatedAt: string;
  recommendedFoods: string[];
  avoidFoods: string[];
};

export type PreviousMealExample = {
  name: string;
  ingredients: string[];
};

export type GuidanceGenerateInput = {
  intolerances: Intolerance[];
  dietaryPreference: DietaryPreference;
  dietaryPreferences: DietaryPreference[];
  detailLevel: DetailLevel;
  monitoringEntries: MonitoringContextItem[];
  userEmail: string;
  lang: "ro" | "en";
  subscriptionTier: SubscriptionTier;
  planTier: PlanTier;
  physicalProfile?: PhysicalProfile;
  previousGuidance?: PreviousGuidanceSummary[];
  previousMealExamples?: PreviousMealExample[];
};

export type GuidanceHistoryRecord = {
  id: string;
  userEmail: string;
  generatedAt: string;
  source: "ai" | "fallback";
  requestFingerprint: string;
  prompt: string;
  monitoringEntries: MonitoringContextItem[];
  result: GuidanceResult;
};

export type GuidanceDb = {
  history: GuidanceHistoryRecord[];
};
