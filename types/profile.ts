export type DietaryPreference =
  | "normal"
  | "vegetarian"
  | "vegan"
  | "low-carb"
  | "gluten-free"
  | "dairy-free";

export type Intolerance =
  | "lactoza"
  | "gluten"
  | "nuci"
  | "histamina"
  | "fodmap"
  | "fructoza"
  | "sorbitol"
  | "sulfiti"
  | "ou"
  | "soia"
  | "peste"
  | "crustacee";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  dietaryPreference: DietaryPreference;
  intolerances: Intolerance[];
  updatedAt: string;
  age?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  activityLevel?: ActivityLevel | null;
}

export interface UpdateProfileRequest {
  name?: string;
  dietaryPreference?: DietaryPreference;
  intolerances?: Intolerance[];
  age?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  activityLevel?: ActivityLevel | null;
}

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentar (fără activitate fizică)",
  light: "Ușor activ (sport 1-2 zile/săpt.)",
  moderate: "Moderat activ (sport 3-4 zile/săpt.)",
  active: "Activ (sport 5+ zile/săpt.)",
  very_active: "Foarte activ (sport zilnic intens)",
};


export const INTOLERANCE_LABELS: Record<Intolerance, string> = {
  lactoza: "Lactoză",
  gluten: "Gluten",
  nuci: "Nuci",
  histamina: "Histamină",
  fodmap: "FODMAP",
  fructoza: "Fructoză",
  sorbitol: "Sorbitol",
  sulfiti: "Sulfiți",
  ou: "Ouă",
  soia: "Soia",
  peste: "Pește",
  crustacee: "Crustacee",
};

export const DIETARY_PREFERENCE_LABELS: Record<DietaryPreference, string> = {
  normal: "Normal / Omnivor",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "low-carb": "Low-Carb / Keto",
  "gluten-free": "Fără Gluten",
  "dairy-free": "Fără Lactate",
};
