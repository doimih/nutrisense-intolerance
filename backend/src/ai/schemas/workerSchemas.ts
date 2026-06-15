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

  'medical-safety': {
    workerName: 'Medical Safety Worker',
    required: [...BASE_REQUIRED, 'data.safetyApproved'],
    fields: {
      ...BASE_FIELDS,
      'data.safetyApproved': { type: 'boolean' },
      'data.disclaimer': { type: 'string', optional: true },
      'data.risks': { type: 'array', optional: true },
    },
    requiresDisclaimer: true,
  },

  'nutrition-calculator': {
    workerName: 'Recommended Foods Generator Worker',
    required: [...BASE_REQUIRED],
    fields: {
      ...BASE_FIELDS,
      'data.recommendedFoods': { type: 'array', optional: true },
      'data.kcal': { type: 'number', optional: true },
      'data.proteinG': { type: 'number', optional: true },
      'data.carbsG': { type: 'number', optional: true },
      'data.fatG': { type: 'number', optional: true },
      'data.disclaimer': { type: 'string', optional: true },
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
      'data.substitutions': { type: 'array', optional: true },
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
};

/** Returns the schema for a worker by its id (kebab-case) or null if unknown. */
export function getWorkerSchema(workerId: string): WorkerSchema | null {
  const normalised = workerId.toLowerCase().replace(/\s+/g, '-');
  return WORKER_SCHEMAS[normalised] ?? null;
}
