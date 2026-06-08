export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = Record<string, JsonValue>;

// ─── Input to the diagnostic engine ───────────────────────────────────────────

export type UserProfile = {
  age?: number | null;
  sex?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  goal?: string | null;
  dietType?: string | null;
  activityLevel?: string | null;
};

export type NutritionalGoals = {
  kcal?: number | null;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
};

export type DiagnosticRequest = {
  worker: string;
  input: JsonObject;
  output: JsonObject;
  /** JSON-Schema-lite: plain object describing expected keys and their types. */
  expectedSchema: JsonObject;
  userProfile?: UserProfile;
  intolerances?: string[];
  allergies?: string[];
  nutritionalGoals?: NutritionalGoals;
};

// ─── Intermediate validation results ──────────────────────────────────────────

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

// ─── Final diagnostic report ──────────────────────────────────────────────────

export type DiagnosticReport = {
  worker: string;
  schema_valid: boolean;
  logical_valid: boolean;
  safety_valid: boolean;
  errors: string[];
  corrected_output: JsonObject;
  /** true when at least one layer failed and auto-correction was applied */
  corrected: boolean;
  /** milliseconds taken by the diagnostic engine */
  diagnosticMs: number;
};

// ─── Known allergens and intolerances ─────────────────────────────────────────

export const COMMON_ALLERGENS: readonly string[] = [
  'milk',
  'lactose',
  'dairy',
  'egg',
  'eggs',
  'fish',
  'shellfish',
  'shrimp',
  'crab',
  'lobster',
  'wheat',
  'gluten',
  'soy',
  'soya',
  'peanut',
  'peanuts',
  'tree nut',
  'tree nuts',
  'almond',
  'almonds',
  'cashew',
  'cashews',
  'walnut',
  'walnuts',
  'sesame',
  'mustard',
  'celery',
  'lupin',
  'molluscs',
  'sulphur dioxide',
  'sulphites',
  'corn',
  'fructose',
  'histamine',
  'sorbitol',
  'sugar',
  'caffeine',
] as const;

/** Fields every worker output MUST have according to the standard worker protocol. */
export const REQUIRED_OUTPUT_FIELDS: readonly string[] = ['worker', 'status', 'data', 'notes'] as const;

export const VALID_STATUS_VALUES: readonly string[] = ['success', 'warning', 'error'] as const;

/** Nutritional boundaries outside which a value is treated as unrealistic. */
export const NUTRITION_BOUNDS = {
  kcal: { min: 500, max: 6000 },
  proteinG: { min: 10, max: 500 },
  carbsG: { min: 0, max: 1000 },
  fatG: { min: 5, max: 300 },
} as const;
