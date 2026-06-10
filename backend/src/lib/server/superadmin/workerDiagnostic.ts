import 'server-only';
import type {
  DiagnosticReport,
  DiagnosticRequest,
  JsonObject,
  JsonValue,
  NutritionalGoals,
  ValidationResult,
} from '@/lib/server/superadmin/workerDiagnosticTypes';
import {
  COMMON_ALLERGENS,
  NUTRITION_BOUNDS,
  REQUIRED_OUTPUT_FIELDS,
  VALID_STATUS_VALUES,
} from '@/lib/server/superadmin/workerDiagnosticTypes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toLower(value: unknown): string {
  return String(value ?? '').toLowerCase();
}

function collectIngredients(output: JsonObject): string[] {
  const ingredients: string[] = [];

  function walk(node: unknown): void {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (isObject(node)) {
      for (const [key, value] of Object.entries(node)) {
        const lk = key.toLowerCase();
        if (lk === 'ingredients' || lk === 'ingredient') {
          if (Array.isArray(value)) {
            for (const item of value) ingredients.push(toLower(item));
          } else if (typeof value === 'string') {
            ingredients.push(toLower(value));
          }
        } else {
          walk(value);
        }
      }
    }
  }

  walk(output);
  return ingredients;
}

function collectFoodNames(output: JsonObject): string[] {
  const names: string[] = [];

  function walk(node: unknown): void {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (isObject(node)) {
      for (const [key, value] of Object.entries(node)) {
        const lk = key.toLowerCase();
        if (lk === 'name' || lk === 'food' || lk === 'meal' || lk === 'item') {
          if (typeof value === 'string') names.push(toLower(value));
        }
        walk(value);
      }
    }
  }

  walk(output);
  return names;
}

function detectRestrictedTerms(
  terms: string[],
  restrictions: string[],
  label: string,
  errors: string[],
): void {
  for (const restriction of restrictions) {
    const normalised = toLower(restriction);
    for (const term of terms) {
      if (term.includes(normalised)) {
        errors.push(`${label}: "${restriction}" detected in output ("${term}").`);
      }
    }
  }
}

// ─── A. Schema Validation ─────────────────────────────────────────────────────

export function validateSchema(
  output: JsonObject,
  expectedSchema: JsonObject,
): ValidationResult {
  const errors: string[] = [];

  // 1. Standard worker protocol fields
  for (const field of REQUIRED_OUTPUT_FIELDS) {
    if (!(field in output)) {
      errors.push(`Missing required field: "${field}".`);
    }
  }

  // 2. status value check
  const status = output['status'];
  if (status !== undefined && !VALID_STATUS_VALUES.includes(String(status))) {
    errors.push(
      `Invalid "status" value: "${status}". Expected: ${VALID_STATUS_VALUES.join(' | ')}.`,
    );
  }

  // 3. Custom schema fields check
  for (const [expectedKey, expectedType] of Object.entries(expectedSchema)) {
    if (!(expectedKey in output)) {
      errors.push(`Schema violation: missing field "${expectedKey}" (expected type: ${String(expectedType)}).`);
      continue;
    }

    const actualValue = output[expectedKey];
    const expectedTypeStr = String(expectedType).toLowerCase().replace('?', '');

    if (expectedTypeStr === 'number' && typeof actualValue !== 'number') {
      errors.push(`Field "${expectedKey}": expected number, got ${typeof actualValue}.`);
    } else if (expectedTypeStr === 'string' && typeof actualValue !== 'string') {
      errors.push(`Field "${expectedKey}": expected string, got ${typeof actualValue}.`);
    } else if (expectedTypeStr === 'boolean' && typeof actualValue !== 'boolean') {
      errors.push(`Field "${expectedKey}": expected boolean, got ${typeof actualValue}.`);
    } else if (expectedTypeStr === 'array' && !Array.isArray(actualValue)) {
      errors.push(`Field "${expectedKey}": expected array, got ${typeof actualValue}.`);
    } else if (expectedTypeStr === 'object' && !isObject(actualValue)) {
      errors.push(`Field "${expectedKey}": expected object, got ${typeof actualValue}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── B. Logical Validation ────────────────────────────────────────────────────

export function validateLogic(
  output: JsonObject,
  goals: NutritionalGoals | undefined,
  worker: string,
): ValidationResult {
  const errors: string[] = [];

  // Check that "data" field is a non-empty object when present
  const data = output['data'];
  if (data !== undefined && data !== null) {
    if (isObject(data) && Object.keys(data).length === 0) {
      errors.push('Logical error: "data" field is present but empty.');
    }
  }

  // Check "notes" is an array when present
  const notes = output['notes'];
  if (notes !== undefined && !Array.isArray(notes)) {
    errors.push('Logical error: "notes" field should be an array.');
  }

  // Nutritional consistency for workers that produce calorie data
  const nutritionWorkers = ['nutrition-calculator', 'meal-plan-generator', 'recipe-builder'];
  const isNutritionWorker = nutritionWorkers.some((id) =>
    worker.toLowerCase().replace(/\s+/g, '-').includes(id),
  );

  if (isNutritionWorker && isObject(data)) {
    const checkBound = (key: keyof typeof NUTRITION_BOUNDS, fieldPath: string) => {
      const value = data[key];
      if (value === undefined || value === null) return;
      const num = Number(value);
      if (Number.isNaN(num)) {
        errors.push(`Logical error: "${fieldPath}" is not a number (got "${String(value)}").`);
        return;
      }
      const { min, max } = NUTRITION_BOUNDS[key];
      if (num < min || num > max) {
        errors.push(
          `Logical error: "${fieldPath}" value ${num} is outside realistic bounds [${min}–${max}].`,
        );
      }
    };

    checkBound('kcal', 'data.kcal');
    checkBound('proteinG', 'data.proteinG');
    checkBound('carbsG', 'data.carbsG');
    checkBound('fatG', 'data.fatG');

    // Cross-check macro calories against total if all three macros are present
    const kcal = Number(data['kcal']);
    const protein = Number(data['proteinG'] ?? data['protein']);
    const carbs = Number(data['carbsG'] ?? data['carbs']);
    const fat = Number(data['fatG'] ?? data['fat']);

    if (!Number.isNaN(kcal) && !Number.isNaN(protein) && !Number.isNaN(carbs) && !Number.isNaN(fat)) {
      const estimated = protein * 4 + carbs * 4 + fat * 9;
      const tolerance = kcal * 0.15; // 15 % tolerance
      if (Math.abs(estimated - kcal) > tolerance) {
        errors.push(
          `Logical error: reported kcal (${kcal}) does not match macro calculation (${Math.round(estimated)} kcal from macros).`,
        );
      }
    }

    // Cross-check against user goals if provided
    if (goals?.kcal && !Number.isNaN(kcal)) {
      const goalKcal = goals.kcal;
      const deviation = Math.abs(kcal - goalKcal) / goalKcal;
      if (deviation > 0.3) {
        errors.push(
          `Logical error: calorie output (${kcal} kcal) deviates >30% from user goal (${goalKcal} kcal).`,
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── C. Safety Validation ─────────────────────────────────────────────────────

export function validateSafety(
  output: JsonObject,
  intolerances: string[],
  allergies: string[],
): ValidationResult {
  const errors: string[] = [];

  const ingredients = collectIngredients(output);
  const foodNames = collectFoodNames(output);
  const allTerms = [...ingredients, ...foodNames];

  // Check against known allergens
  const knownAllergenHits: string[] = [];
  detectRestrictedTerms(allTerms, [...COMMON_ALLERGENS], 'Common allergen', knownAllergenHits);
  // Only flag if user hasn't declared them (if no allergy list supplied, flag all)
  if (allergies.length === 0) {
    errors.push(...knownAllergenHits);
  }

  // Check against user-declared allergies (strict)
  detectRestrictedTerms(allTerms, allergies, 'Allergen violation', errors);

  // Check against user-declared intolerances (advisory)
  detectRestrictedTerms(allTerms, intolerances, 'Intolerance conflict', errors);

  // Check for medical-risk language: diagnosis, prescribe, cure, etc.
  const workerStr = JSON.stringify(output).toLowerCase();
  const medicalRiskTerms = ['diagnose', 'diagnoses', 'diagnosis', 'prescribe', 'prescription', 'cure', 'treatment'];
  for (const term of medicalRiskTerms) {
    if (workerStr.includes(term)) {
      errors.push(`Safety violation: output contains medical-risk language ("${term}").`);
    }
  }

  // Check for disclaimer presence on final output workers
  const workerOutputStr = JSON.stringify(output);
  const disclaimerRequired = ['medical-safety', 'nutrition-calculator', 'meal-plan-generator', 'supplement-advisor'];
  const isDisclaimerWorker = disclaimerRequired.some((id) =>
    output['worker'] && String(output['worker']).toLowerCase().replace(/\s+/g, '-').includes(id),
  );
  if (isDisclaimerWorker && !workerOutputStr.toLowerCase().includes('disclaimer')) {
    errors.push('Safety warning: output does not contain a medical disclaimer.');
  }

  return { valid: errors.length === 0, errors };
}

// ─── D. Auto-Correction ───────────────────────────────────────────────────────

export function autoCorrect(
  originalOutput: JsonObject,
  schemaResult: ValidationResult,
  logicalResult: ValidationResult,
  safetyResult: ValidationResult,
  worker: string,
  expectedSchema: JsonObject,
  intolerances: string[],
  allergies: string[],
): JsonObject {
  const corrected: JsonObject = { ...originalOutput };

  // Ensure required worker protocol fields exist
  if (!('worker' in corrected) || !corrected['worker']) {
    corrected['worker'] = worker as JsonValue;
  }

  if (!('status' in corrected) || !VALID_STATUS_VALUES.includes(String(corrected['status']))) {
    const hasErrors =
      !schemaResult.valid || !logicalResult.valid || !safetyResult.valid;
    corrected['status'] = (hasErrors ? 'error' : 'success') as JsonValue;
  }

  if (!('data' in corrected)) {
    corrected['data'] = {} as JsonValue;
  }

  if (!('notes' in corrected)) {
    corrected['notes'] = [] as JsonValue;
  } else if (!Array.isArray(corrected['notes'])) {
    corrected['notes'] = [corrected['notes']] as JsonValue;
  }

  // Add all schema-required missing fields with null defaults
  for (const [key, expectedType] of Object.entries(expectedSchema)) {
    if (!(key in corrected)) {
      const typeStr = String(expectedType).toLowerCase().replace('?', '');
      let defaultValue: JsonValue = null;
      if (typeStr === 'array') defaultValue = [];
      else if (typeStr === 'object') defaultValue = {};
      else if (typeStr === 'boolean') defaultValue = false;
      else if (typeStr === 'number') defaultValue = 0;
      else if (typeStr === 'string') defaultValue = '';
      corrected[key] = defaultValue;
    }
  }

  // Append correction notes
  const allErrors = [
    ...schemaResult.errors.map((e) => `[schema] ${e}`),
    ...logicalResult.errors.map((e) => `[logical] ${e}`),
    ...safetyResult.errors.map((e) => `[safety] ${e}`),
  ];

  if (allErrors.length > 0) {
    const existingNotes = Array.isArray(corrected['notes']) ? (corrected['notes'] as JsonValue[]) : [];
    corrected['notes'] = [
      ...existingNotes,
      `Auto-correction applied on ${new Date().toISOString()}`,
      ...allErrors,
    ] as JsonValue;

    corrected['status'] = 'warning' as JsonValue;
  }

  // Append disclaimer if missing on safety-critical workers
  const disclaimerRequired = ['medical-safety', 'nutrition-calculator', 'meal-plan-generator', 'supplement-advisor'];
  const isDisclaimerWorker = disclaimerRequired.some((id) =>
    worker.toLowerCase().replace(/\s+/g, '-').includes(id),
  );
  if (isDisclaimerWorker) {
    const dataField = corrected['data'];
    if (isObject(dataField)) {
      const mutableData = { ...dataField } as JsonObject;
      if (!JSON.stringify(mutableData).toLowerCase().includes('disclaimer')) {
        mutableData['disclaimer'] =
          'NutriAID provides general nutrition guidance. This is not medical advice. Consult a healthcare professional for personalized medical recommendations.' as JsonValue;
        corrected['data'] = mutableData as JsonValue;
      }
    }
  }

  // Remove restricted ingredients from ingredient lists
  const allRestrictions = [...intolerances, ...allergies].map((r) => r.toLowerCase());
  if (allRestrictions.length > 0) {
    function sanitiseNode(node: JsonValue): JsonValue {
      if (Array.isArray(node)) {
        return node
          .filter((item) => {
            if (typeof item !== 'string') return true;
            return !allRestrictions.some((r) => item.toLowerCase().includes(r));
          })
          .map((item) => sanitiseNode(item));
      }
      if (isObject(node)) {
        const cleaned: JsonObject = {};
        for (const [key, value] of Object.entries(node)) {
          if (key.toLowerCase() === 'ingredients' || key.toLowerCase() === 'ingredient') {
            cleaned[key] = sanitiseNode(value as JsonValue);
          } else {
            cleaned[key] = sanitiseNode(value as JsonValue);
          }
        }
        return cleaned as JsonValue;
      }
      return node;
    }

    const sanitised = sanitiseNode(corrected as JsonValue);
    if (isObject(sanitised)) {
      for (const [key, value] of Object.entries(sanitised)) {
        corrected[key] = value;
      }
    }
  }

  return corrected;
}

// ─── Main diagnostic entry point ──────────────────────────────────────────────

export function runDiagnostic(request: DiagnosticRequest): DiagnosticReport {
  const startedAt = Date.now();

  const schemaResult = validateSchema(request.output, request.expectedSchema);
  const logicalResult = validateLogic(
    request.output,
    request.nutritionalGoals,
    request.worker,
  );
  const safetyResult = validateSafety(
    request.output,
    request.intolerances ?? [],
    request.allergies ?? [],
  );

  const allErrors = [
    ...schemaResult.errors,
    ...logicalResult.errors,
    ...safetyResult.errors,
  ];

  const allValid = schemaResult.valid && logicalResult.valid && safetyResult.valid;

  const correctedOutput = autoCorrect(
    request.output,
    schemaResult,
    logicalResult,
    safetyResult,
    request.worker,
    request.expectedSchema,
    request.intolerances ?? [],
    request.allergies ?? [],
  );

  return {
    worker: request.worker,
    schema_valid: schemaResult.valid,
    logical_valid: logicalResult.valid,
    safety_valid: safetyResult.valid,
    errors: allErrors,
    corrected_output: correctedOutput,
    corrected: !allValid,
    diagnosticMs: Date.now() - startedAt,
  };
}
