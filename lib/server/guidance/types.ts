import type { DetailLevel, GuidanceResult, MonitoringContextItem } from "@/types/guidance";
import type { DietaryPreference, Intolerance } from "@/types/profile";

export type SubscriptionTier = "new" | "active" | "expired";

export type GuidanceGenerateInput = {
  intolerances: Intolerance[];
  dietaryPreference: DietaryPreference;
  detailLevel: DetailLevel;
  monitoringEntries: MonitoringContextItem[];
  userEmail: string;
  lang: "ro" | "en";
  subscriptionTier: SubscriptionTier;
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
