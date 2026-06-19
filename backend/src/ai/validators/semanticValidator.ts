/**
 * Semantic Validator
 * Validates worker output for:
 * - allergen / intolerance conflicts
 * - nutritional logic and calorie constraints
 * - contradictions and unrealistic values
 * - medical-risk language
 *
 * Builds on existing constants from workerDiagnosticTypes without duplicating them.
 */

import type { JsonObject, NutritionalGoals } from '@/lib/server/superadmin/workerDiagnosticTypes';
import { COMMON_ALLERGENS, NUTRITION_BOUNDS } from '@/lib/server/superadmin/workerDiagnosticTypes';

export type SemanticValidationResult = {
  valid: boolean;
  allergenErrors: string[];
  nutritionErrors: string[];
  safetyErrors: string[];
  contradictions: string[];
  allErrors: string[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function lower(v: unknown): string {
  return String(v ?? '').toLowerCase();
}

function flatten(node: unknown, acc: string[]): void {
  if (typeof node === 'string') { acc.push(lower(node)); return; }
  if (Array.isArray(node)) { node.forEach((item) => flatten(item, acc)); return; }
  if (isObject(node)) { Object.values(node).forEach((v) => flatten(v, acc)); }
}

/** Collects all string values under keys matching the predicate. */
function collectByKey(obj: JsonObject, keyTest: (k: string) => boolean): string[] {
  const result: string[] = [];
  function walk(node: unknown): void {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (isObject(node)) {
      for (const [k, v] of Object.entries(node)) {
        if (keyTest(k.toLowerCase())) {
          if (typeof v === 'string') result.push(lower(v));
          else if (Array.isArray(v)) v.forEach((i) => { if (typeof i === 'string') result.push(lower(i)); });
        }
        walk(v);
      }
    }
  }
  walk(obj);
  return result;
}

const INGREDIENT_KEYS = new Set(['ingredient', 'ingredients', 'food', 'foods', 'item', 'items']);
const NAME_KEYS = new Set(['name', 'meal', 'recipename', 'title']);

function gatherFoodTerms(output: JsonObject): string[] {
  const ingredients = collectByKey(output, (k) => INGREDIENT_KEYS.has(k));
  const names = collectByKey(output, (k) => NAME_KEYS.has(k));
  return [...ingredients, ...names];
}

// ─── A. Allergen / Intolerance Validation ────────────────────────────────────

function validateAllergens(
  output: JsonObject,
  allergies: string[],
  intolerances: string[],
): { allergenErrors: string[] } {
  const terms = gatherFoodTerms(output);
  const errors: string[] = [];

  const strictCheck = (restrictions: string[], label: string) => {
    for (const restriction of restrictions) {
      const norm = lower(restriction);
      for (const term of terms) {
        if (term.includes(norm)) {
          errors.push(`${label}: "${restriction}" found in output term "${term}".`);
        }
      }
    }
  };

  // Strict: declared allergies always block
  strictCheck(allergies, 'Allergen violation');

  // Advisory: declared intolerances flag
  strictCheck(intolerances, 'Intolerance conflict');

  // If no allergies declared, warn on known common allergens
  if (allergies.length === 0) {
    for (const allergen of COMMON_ALLERGENS) {
      const norm = lower(allergen);
      for (const term of terms) {
        if (term.includes(norm)) {
          errors.push(`Common allergen detected: "${allergen}" in output term "${term}". Verify with user profile.`);
        }
      }
    }
  }

  return { allergenErrors: errors };
}

// ─── B. Nutritional Logic Validation ─────────────────────────────────────────

const NUTRITION_WORKERS = [
  'meal-plan-generator',
  'recipe-builder',
  'mealPlanGenerator',
  'recipeBuilder',
];

function isNutritionWorker(workerId: string): boolean {
  const norm = workerId.toLowerCase().replace(/[\s_]/g, '-');
  return NUTRITION_WORKERS.some((w) => norm.includes(w.toLowerCase()));
}

function validateNutrition(
  output: JsonObject,
  workerId: string,
  goals: NutritionalGoals | undefined,
): { nutritionErrors: string[] } {
  const errors: string[] = [];

  if (!isNutritionWorker(workerId)) return { nutritionErrors: [] };

  const data = output['data'];
  if (!isObject(data)) return { nutritionErrors: [] };

  const readNum = (keys: string[]): number | null => {
    for (const k of keys) {
      const v = Number(data[k]);
      if (!Number.isNaN(v)) return v;
    }
    return null;
  };

  const kcal = readNum(['kcal', 'calories', 'totalKcal']);
  const protein = readNum(['proteinG', 'protein', 'proteinGrams']);
  const carbs = readNum(['carbsG', 'carbs', 'carbohydrates', 'carbsGrams']);
  const fat = readNum(['fatG', 'fat', 'fatGrams']);

  // Bound checks
  const boundCheck = (value: number | null, key: keyof typeof NUTRITION_BOUNDS, label: string) => {
    if (value === null) return;
    const { min, max } = NUTRITION_BOUNDS[key];
    if (value < min || value > max) {
      errors.push(`Nutritional error: "${label}" (${value}) outside realistic bounds [${min}–${max}].`);
    }
  };

  boundCheck(kcal, 'kcal', 'kcal');
  boundCheck(protein, 'proteinG', 'proteinG');
  boundCheck(carbs, 'carbsG', 'carbsG');
  boundCheck(fat, 'fatG', 'fatG');

  // Macro → calorie cross-check (15 % tolerance)
  if (kcal !== null && protein !== null && carbs !== null && fat !== null) {
    const estimated = protein * 4 + carbs * 4 + fat * 9;
    const tolerance = Math.max(kcal, estimated) * 0.15;
    if (Math.abs(estimated - kcal) > tolerance) {
      errors.push(
        `Nutritional inconsistency: reported kcal ${kcal} does not match macro calculation ${Math.round(estimated)} kcal (protein×4 + carbs×4 + fat×9).`,
      );
    }
  }

  // Deviation from user goals (> 30 %)
  if (goals?.kcal && kcal !== null) {
    const deviation = Math.abs(kcal - goals.kcal) / goals.kcal;
    if (deviation > 0.3) {
      errors.push(
        `Calorie goal mismatch: output ${kcal} kcal deviates ${Math.round(deviation * 100)}% from user goal ${goals.kcal} kcal.`,
      );
    }
  }

  return { nutritionErrors: errors };
}

// ─── C. Safety / Medical Language Validation ─────────────────────────────────

const MEDICAL_RISK_TERMS = [
  'diagnose', 'diagnoses', 'diagnosis', 'diagnosed',
  'prescribe', 'prescription', 'prescribed',
  'cure', 'cures', 'cured',
  'treatment', 'treat', 'treating',
  'medication', 'medicate',
];

function validateSafety(output: JsonObject): { safetyErrors: string[] } {
  const errors: string[] = [];
  const blob = JSON.stringify(output).toLowerCase();

  for (const term of MEDICAL_RISK_TERMS) {
    if (blob.includes(term)) {
      errors.push(`Safety violation: medical-risk language "${term}" found in output.`);
    }
  }

  return { safetyErrors: errors };
}

// ─── D. Contradiction Detection ───────────────────────────────────────────────

function detectContradictions(output: JsonObject): { contradictions: string[] } {
  const contradictions: string[] = [];

  const data = output['data'];
  const status = String(output['status'] ?? '');

  // Error status but data appears populated with a non-error result
  if (status === 'error' && isObject(data) && Object.keys(data).length > 3) {
    contradictions.push(
      'Contradiction: status is "error" but data contains a detailed non-empty response.',
    );
  }

  // Success status but data is empty
  if (status === 'success' && isObject(data) && Object.keys(data).length === 0) {
    contradictions.push('Contradiction: status is "success" but data is empty.');
  }

  // Notes contain "error" keyword while status is "success"
  if (status === 'success' && Array.isArray(output['notes'])) {
    const notes: string[] = [];
    flatten(output['notes'], notes);
    const hasErrorNote = notes.some((n) => n.includes('error') || n.includes('failed'));
    if (hasErrorNote) {
      contradictions.push('Contradiction: status is "success" but notes mention errors/failures.');
    }
  }

  // safetyApproved false with status success
  if (isObject(data)) {
    const safetyApproved = data['safetyApproved'];
    if (safetyApproved === false && status === 'success') {
      contradictions.push(
        'Contradiction: data.safetyApproved is false but status is "success".',
      );
    }
  }

  return { contradictions };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function validateSemantics(
  workerId: string,
  output: JsonObject,
  intolerances: string[],
  allergies: string[],
  goals?: NutritionalGoals,
): SemanticValidationResult {
  const { allergenErrors } = validateAllergens(output, allergies, intolerances);
  const { nutritionErrors } = validateNutrition(output, workerId, goals);
  const { safetyErrors } = validateSafety(output);
  const { contradictions } = detectContradictions(output);

  const allErrors = [...allergenErrors, ...nutritionErrors, ...safetyErrors, ...contradictions];

  return {
    valid: allErrors.length === 0,
    allergenErrors,
    nutritionErrors,
    safetyErrors,
    contradictions,
    allErrors,
  };
}
