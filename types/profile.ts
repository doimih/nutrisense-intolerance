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

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  dietaryPreference: DietaryPreference;
  intolerances: Intolerance[];
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  dietaryPreference?: DietaryPreference;
  intolerances?: Intolerance[];
}

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
