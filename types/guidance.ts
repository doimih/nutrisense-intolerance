import type { Intolerance, DietaryPreference } from "./profile";

export type DetailLevel = "basic" | "detailed" | "comprehensive";

export interface MonitoringContextItem {
  date: string;
  hour: string;
  consumedFoods: string[];
  symptoms: string[];
  symptomsIntensity: number;
  reactionLatencyMinutes: number | null;
  wellbeing?: number;
  notes: string;
}

export interface GuidanceRequest {
  intolerances: Intolerance[];
  dietaryPreference: DietaryPreference;
  dietaryPreferences?: DietaryPreference[];
  detailLevel: DetailLevel;
  monitoringEntries?: MonitoringContextItem[];
  lang?: "ro" | "en";
  forceRegenerate?: boolean;
}

export interface MealExample {
  name: string;
  ingredients?: string[];
  notes?: string;
}

export interface GuidanceResult {
  id: string;
  generatedAt: string;
  intolerances: Intolerance[];
  dietaryPreference: DietaryPreference;
  detailLevel?: DetailLevel;
  recommendedFoods: string[];
  avoidFoods: string[];
  mealExamples: MealExample[];
  generalTips: string[];
  disclaimer: string;
  warnings?: string[];
  source?: "ai" | "fallback";
}

export interface GuidanceHistoryEntry {
  id: string;
  generatedAt: string;
  intolerances: Intolerance[];
  dietaryPreference: DietaryPreference;
  summary: string;
}
