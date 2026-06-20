export type RecipeCategory = "breakfast" | "lunch" | "dinner" | "snack";
export type RecipeDifficulty = "easy" | "medium" | "hard";

export type RecipeIngredient = {
  name: string;
  quantity: string;
  unit: string;
};

export type RecipeStep = {
  step_index: number;
  text: string;
};

export type RecipeSubstitution = {
  for: string;
  substitute_with: string;
  note: string;
};

export type RecipeMacros = {
  protein: number;
  carbs: number;
  fats: number;
};

export type Recipe = {
  id: string;
  titleRo: string;
  titleEn: string;
  category: RecipeCategory;
  ingredientsRo: RecipeIngredient[];
  ingredientsEn: RecipeIngredient[];
  instructionsRo: RecipeStep[];
  instructionsEn: RecipeStep[];
  prepTimeMinutes: number;
  difficulty: RecipeDifficulty;
  calories: number | null;
  macros: RecipeMacros | null;
  cuisine: string | null;
  tagsRo: string[] | null;
  tagsEn: string[] | null;
  allergens: string[] | null;
  substitutionsRo: RecipeSubstitution[] | null;
  substitutionsEn: RecipeSubstitution[] | null;
  cookingTipsRo: string[] | null;
  cookingTipsEn: string[] | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RecipeLocalized = {
  id: string;
  title: string;
  category: RecipeCategory;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  prepTimeMinutes: number;
  difficulty: RecipeDifficulty;
  calories: number | null;
  macros: RecipeMacros | null;
  cuisine: string | null;
  tags: string[] | null;
  allergens: string[] | null;
  substitutions: RecipeSubstitution[] | null;
  cookingTips: string[] | null;
  imageUrl: string | null;
};

export type RecipeBatch = {
  id: number;
  batchNumber: number;
  targetCount: number;
  generatedCount: number;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: string | null;
  finishedAt: string | null;
};

export type RecipeSearchParams = {
  lang: "ro" | "en";
  category?: RecipeCategory;
  difficulty?: RecipeDifficulty;
  tags?: string[];
  allergenFree?: string[];
  cuisine?: string;
  maxPrepTime?: number;
  query?: string;
  limit?: number;
  offset?: number;
};
