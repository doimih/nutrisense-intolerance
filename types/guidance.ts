import type { Intolerance, DietaryPreference } from "./profile";

export type DetailLevel = "basic" | "detailed" | "comprehensive";

export interface GuidanceRequest {
  intolerances: Intolerance[];
  dietaryPreference: DietaryPreference;
  detailLevel: DetailLevel;
}

export interface MealExample {
  name: string;
  ingredients: string[];
  notes?: string;
}

export interface GuidanceResult {
  id: string;
  generatedAt: string;
  intolerances: Intolerance[];
  dietaryPreference: DietaryPreference;
  recommendedFoods: string[];
  avoidFoods: string[];
  mealExamples: MealExample[];
  generalTips: string[];
  disclaimer: string;
}

export interface GuidanceHistoryEntry {
  id: string;
  generatedAt: string;
  intolerances: Intolerance[];
  dietaryPreference: DietaryPreference;
  summary: string;
}
