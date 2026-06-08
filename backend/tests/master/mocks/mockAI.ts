/**
 * mockAI.ts
 * Provides configurable worker executor factories for tests.
 * Each factory returns a WorkerExecutor that produces a specific output
 * (valid, invalid schema, invalid logic, unsafe, etc.) for the given worker id.
 */

import type { JsonObject } from '../../src/lib/server/superadmin/workerDiagnosticTypes';
import type { WorkerExecutor, OrchestratorContext } from '../../src/ai/orchestrator';

export type WorkerOutputOverride = JsonObject | ((workerId: string) => JsonObject);

// ─── Preset outputs ───────────────────────────────────────────────────────────

export const VALID_BASE_OUTPUT = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'success',
  data: {},
  notes: [],
});

export const MISSING_WORKER_FIELD = (_workerId: string): JsonObject => ({
  status: 'success',
  data: {},
  notes: [],
  // missing: worker
});

export const INVALID_STATUS = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'INVALID_STATUS_VALUE',
  data: {},
  notes: [],
});

export const EMPTY_DATA = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'success',
  data: {},
  notes: [],
});

export const ALLERGEN_OUTPUT = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'success',
  data: {
    meals: [
      {
        name: 'Shrimp pasta',
        ingredients: ['pasta', 'shrimp', 'garlic', 'olive oil'],
      },
    ],
  },
  notes: [],
});

export const MEDICAL_LANG_OUTPUT = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'success',
  data: {
    recommendation: 'This will cure your digestive issues.',
    disclaimer: '',
  },
  notes: [],
});

export const MACRO_INCONSISTENT_OUTPUT = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'success',
  data: {
    kcal: 3500,
    proteinG: 50,
    carbsG: 80,
    fatG: 20,
    disclaimer: 'Not medical advice.',
  },
  notes: [],
});

export const SUCCESS_NUTRITION = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'success',
  data: {
    kcal: 2000,
    proteinG: 100,
    carbsG: 250,
    fatG: 67,
    disclaimer: 'NutriAID provides general nutrition guidance. This is not medical advice.',
  },
  notes: [],
});

export const VALID_MEAL_PLAN = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'success',
  data: {
    meals: [
      { name: 'Breakfast: oat porridge', ingredients: ['oats', 'banana', 'almond milk'] },
      { name: 'Lunch: grilled chicken salad', ingredients: ['chicken', 'lettuce', 'tomato', 'olive oil'] },
      { name: 'Dinner: baked salmon', ingredients: ['salmon', 'broccoli', 'quinoa'] },
    ],
    totalKcal: 1850,
    disclaimer: 'NutriAID provides general nutrition guidance. This is not medical advice.',
  },
  notes: [],
});

export const VALID_RECIPE = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'success',
  data: {
    recipeName: 'Chicken and Vegetable Stir-Fry',
    ingredients: ['chicken breast', 'bell pepper', 'broccoli', 'soy sauce', 'ginger'],
    steps: ['Dice chicken.', 'Stir-fry vegetables.', 'Add chicken and sauce.', 'Serve hot.'],
    servings: 2,
    kcalPerServing: 380,
    substitutions: [{ ingredient: 'soy sauce', substitute: 'coconut aminos' }],
  },
  notes: [],
});

export const ALLERGEN_RECIPE = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'success',
  data: {
    recipeName: 'Peanut noodle bowl',
    ingredients: ['noodles', 'peanut butter', 'soy sauce', 'spring onion'],
    steps: ['Cook noodles.', 'Mix peanut butter with soy sauce.', 'Combine and serve.'],
    servings: 1,
    kcalPerServing: 520,
  },
  notes: [],
});

export const MISSING_FIELDS_RECIPE = (_workerId: string): JsonObject => ({
  // Missing: worker, notes, data.recipeName, data.steps
  status: 'success',
  data: {
    ingredients: ['pasta', 'tomato', 'basil'],
  },
});

export const SAFETY_APPROVED_OUTPUT = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'success',
  data: {
    safetyApproved: true,
    disclaimer: 'NutriAID provides general nutrition guidance. This is not medical advice.',
  },
  notes: [],
});

export const SAFETY_REJECTED_OUTPUT = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'error',
  data: {
    safetyApproved: false,
    risks: ['extreme calorie restriction detected'],
    disclaimer: 'NutriAID provides general nutrition guidance. This is not medical advice.',
  },
  notes: ['Safety check failed: extreme diet detected.'],
});

export const SUPPLEMENT_OUTPUT = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'success',
  data: {
    supplements: ['Vitamin D3 1000 IU', 'Omega-3 1g', 'Magnesium 200mg'],
    contraindications: [],
    disclaimer: 'NutriAID provides general nutrition guidance. This is not medical advice.',
  },
  notes: [],
});

export const PROGRESS_OUTPUT = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'success',
  data: {
    summary: 'Weight stable over 7 days. Calorie intake within 10% of goal.',
    trendKcal: 1950,
    trendWeight: -0.3,
    weeklyReport: { days: 7, avgKcal: 1950, adherence: '87%' },
  },
  notes: [],
});

export const SHOPPING_LIST_OUTPUT = (workerId: string): JsonObject => ({
  worker: workerId,
  status: 'success',
  data: {
    items: [
      { name: 'oats', qty: '500g', category: 'grains' },
      { name: 'banana', qty: '6 pieces', category: 'fruits' },
      { name: 'chicken breast', qty: '1kg', category: 'proteins' },
    ],
    groupedByCategory: {
      grains: ['oats'],
      fruits: ['banana'],
      proteins: ['chicken breast'],
    },
  },
  notes: [],
});

// ─── Executor factories ───────────────────────────────────────────────────────

/**
 * Returns a WorkerExecutor that produces `preset` output for ALL workers.
 */
export function uniformExecutor(preset: WorkerOutputOverride): WorkerExecutor {
  return async (workerId: string): Promise<JsonObject> => {
    return typeof preset === 'function' ? preset(workerId) : { ...preset };
  };
}

/**
 * Returns a WorkerExecutor that routes each workerId to a specific override,
 * falling back to VALID_BASE_OUTPUT for any worker not in the map.
 */
export function mappedExecutor(
  overrides: Partial<Record<string, WorkerOutputOverride>>,
  fallback: WorkerOutputOverride = VALID_BASE_OUTPUT,
): WorkerExecutor {
  return async (workerId: string): Promise<JsonObject> => {
    const override = overrides[workerId] ?? fallback;
    return typeof override === 'function' ? override(workerId) : { ...override };
  };
}

/**
 * Executor that simulates an AI model call failing and falling back to
 * a valid rule-based corrected output.
 */
export function fallbackModelExecutor(failingWorkerId: string): WorkerExecutor {
  return mappedExecutor({
    [failingWorkerId]: MISSING_WORKER_FIELD,
  });
}
