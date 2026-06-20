/**
 * Worker Schema Definitions
 * Each schema describes required fields, their JS types, and whether nullable.
 * Used by schemaValidator.ts for structural validation of every worker output.
 */

export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export type FieldDefinition = {
  type: FieldType;
  nullable?: boolean;
  /** When true the field is optional (warn but do not fail) */
  optional?: boolean;
};

export type WorkerSchema = {
  workerName: string;
  /** Fields that MUST exist on the top-level output */
  required: readonly string[];
  /** Detailed field definitions for additional type checking */
  fields: Record<string, FieldDefinition>;
  /** Workers that perform safety-sensitive output must include a disclaimer */
  requiresDisclaimer: boolean;
};

// ─── Base protocol every worker must satisfy ──────────────────────────────────

const BASE_FIELDS: WorkerSchema['fields'] = {
  worker: { type: 'string' },
  status: { type: 'string' },
  data: { type: 'object' },
  notes: { type: 'array' },
};

const BASE_REQUIRED: readonly string[] = ['worker', 'status', 'data', 'notes'];

// ─── Per-worker schemas ───────────────────────────────────────────────────────

export const WORKER_SCHEMAS: Record<string, WorkerSchema> = {
  'profile-analyzer': {
    workerName: 'Profile Analyzer Worker',
    required: [...BASE_REQUIRED],
    fields: {
      ...BASE_FIELDS,
      'data.age': { type: 'number', nullable: true, optional: true },
      'data.sex': { type: 'string', nullable: true, optional: true },
      'data.heightCm': { type: 'number', nullable: true, optional: true },
      'data.weightKg': { type: 'number', nullable: true, optional: true },
      'data.goal': { type: 'string', nullable: true, optional: true },
      'data.dietType': { type: 'string', nullable: true, optional: true },
      'data.intolerances': { type: 'array', optional: true },
      'data.allergies': { type: 'array', optional: true },
      'data.activityLevel': { type: 'string', nullable: true, optional: true },
      'data.missingFields': { type: 'array', optional: true },
    },
    requiresDisclaimer: false,
  },

  'intolerance-checker': {
    workerName: 'Intolerance Checker Worker',
    required: [...BASE_REQUIRED],
    fields: {
      ...BASE_FIELDS,
      'data.flaggedIngredients': { type: 'array', optional: true },
      'data.possibleTriggers': { type: 'array', optional: true },
      'data.safeIngredients': { type: 'array', optional: true },
      'data.conflicts': { type: 'array', optional: true },
    },
    requiresDisclaimer: false,
  },

  'allergy-checker': {
    workerName: 'Reaction Pattern Analyzer Worker',
    required: [...BASE_REQUIRED],
    fields: {
      ...BASE_FIELDS,
      'data.reactionPatterns': { type: 'array', optional: true },
      'data.associatedFoods': { type: 'array', optional: true },
      'data.allergenHits': { type: 'array', optional: true },
      'data.safe': { type: 'boolean', optional: true },
      'data.rejectedMeals': { type: 'array', optional: true },
    },
    requiresDisclaimer: false,
  },

  'meal-plan-generator': {
    workerName: 'Meal Plan Generator Worker',
    required: [...BASE_REQUIRED],
    fields: {
      ...BASE_FIELDS,
      'data.meals': { type: 'array', optional: true },
      'data.breakfast': { type: 'array', optional: true },
      'data.lunch': { type: 'array', optional: true },
      'data.dinner': { type: 'array', optional: true },
      'data.totalKcal': { type: 'number', optional: true },
      'data.alternatives': { type: 'array', optional: true },
      'data.disclaimer': { type: 'string', optional: true },
    },
    requiresDisclaimer: true,
  },

  'recipe-builder': {
    workerName: 'Recipe Builder Worker',
    required: [...BASE_REQUIRED, 'data.recipeName', 'data.ingredients', 'data.steps'],
    fields: {
      ...BASE_FIELDS,
      'data.recipeName': { type: 'string' },
      'data.ingredients': { type: 'array' },
      'data.steps': { type: 'array' },
      'data.servings': { type: 'number', optional: true },
      'data.kcalPerServing': { type: 'number', optional: true },
      'data.macros': { type: 'object', optional: true },
      'data.cuisine': { type: 'string', optional: true },
      'data.prepTimeMinutes': { type: 'number', optional: true },
      'data.difficulty': { type: 'string', optional: true },
      'data.allergens': { type: 'array', optional: true },
      'data.substitutions': { type: 'array', optional: true },
      'data.cookingTips': { type: 'array', optional: true },
    },
    requiresDisclaimer: false,
  },

  'recipe-validator': {
    workerName: 'Recipe Validator Worker',
    required: [...BASE_REQUIRED, 'data.valid'],
    fields: {
      ...BASE_FIELDS,
      'data.valid': { type: 'boolean' },
      'data.reasons': { type: 'array', optional: true },
      'data.ingredientCoverage': { type: 'boolean', optional: true },
      'data.titleIngredientMatch': { type: 'boolean', optional: true },
      'data.stepCoverage': { type: 'boolean', optional: true },
      'data.caloriesRealistic': { type: 'boolean', optional: true },
      'data.bilingualComplete': { type: 'boolean', optional: true },
      'data.noGenericContent': { type: 'boolean', optional: true },
    },
    requiresDisclaimer: false,
  },

  'shopping-list': {
    workerName: 'Shopping List Worker',
    required: [...BASE_REQUIRED, 'data.items'],
    fields: {
      ...BASE_FIELDS,
      'data.items': { type: 'array' },
      'data.groupedByCategory': { type: 'object', optional: true },
    },
    requiresDisclaimer: false,
  },

  'supplement-advisor': {
    workerName: 'Lifestyle Tips Worker',
    required: [...BASE_REQUIRED],
    fields: {
      ...BASE_FIELDS,
      'data.lifestyleTips': { type: 'array', optional: true },
      'data.routineSuggestions': { type: 'array', optional: true },
      'data.comfortHabits': { type: 'array', optional: true },
      'data.supplements': { type: 'array', optional: true },
      'data.disclaimer': { type: 'string', optional: true },
    },
    requiresDisclaimer: false,
  },

  'progress-tracking': {
    workerName: 'Progress Tracking Worker',
    required: [...BASE_REQUIRED, 'data.summary'],
    fields: {
      ...BASE_FIELDS,
      'data.summary': { type: 'string' },
      'data.trendKcal': { type: 'number', nullable: true, optional: true },
      'data.trendWeight': { type: 'number', nullable: true, optional: true },
      'data.weeklyReport': { type: 'object', optional: true },
    },
    requiresDisclaimer: false,
  },

  'recipe-batch-generator': {
    workerName: 'Recipe Batch Generator Worker',
    required: [...BASE_REQUIRED, 'data.recipes'],
    fields: {
      ...BASE_FIELDS,
      'data.recipes': { type: 'array' },
      'data.batchSize': { type: 'number', optional: true },
      'data.cuisines': { type: 'array', optional: true },
      'data.validationErrors': { type: 'array', optional: true },
    },
    requiresDisclaimer: false,
  },

  'recipe-instruction': {
    workerName: 'Recipe Instruction Worker',
    required: [...BASE_REQUIRED, 'data.instructions_en', 'data.instructions_ro', 'data.cooking_tips_en', 'data.cooking_tips_ro'],
    fields: {
      ...BASE_FIELDS,
      'data.instructions_en': { type: 'array' },
      'data.instructions_ro': { type: 'array' },
      'data.substitutions_en': { type: 'array', optional: true },
      'data.substitutions_ro': { type: 'array', optional: true },
      'data.cooking_tips_en': { type: 'array' },
      'data.cooking_tips_ro': { type: 'array' },
    },
    requiresDisclaimer: false,
  },
};

/** Returns the schema for a worker by its id (kebab-case) or null if unknown. */
export function getWorkerSchema(workerId: string): WorkerSchema | null {
  const normalised = workerId.toLowerCase().replace(/\s+/g, '-');
  return WORKER_SCHEMAS[normalised] ?? null;
}
