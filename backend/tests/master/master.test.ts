/**
 * master.test.ts
 * NutriAID Master Automated Test Suite — 20 Real-World Scenarios
 *
 * Run with:
 *   cd backend
 *   node --experimental-transform-types --test tests/master/master.test.ts
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

// ─── Utilities ────────────────────────────────────────────────────────────────
import type { ScenarioFixture } from './utils/runScenario';
import { runScenario } from './utils/runScenario';
import {
  assertIntent,
  assertWorkerChain,
  assertFinalOutputKeys,
  assertPerformance,
} from './utils/validateWorkerChain';
import {
  expectWorkerOutputShape,
  expectValidStatus,
  expectNonEmptyArray,
} from './utils/expectSchema';
import { getMockLogs, resetMockLogs } from './utils/mockLogger';

// ─── Mocks ────────────────────────────────────────────────────────────────────
import {
  mappedExecutor,
  uniformExecutor,
  VALID_BASE_OUTPUT,
  VALID_MEAL_PLAN,
  VALID_RECIPE,
  ALLERGEN_RECIPE,
  ALLERGEN_OUTPUT,
  MISSING_FIELDS_RECIPE,
  MACRO_INCONSISTENT_OUTPUT,
  MISSING_WORKER_FIELD,
  SAFETY_APPROVED_OUTPUT,
  SUCCESS_NUTRITION,
  SUPPLEMENT_OUTPUT,
  PROGRESS_OUTPUT,
  SHOPPING_LIST_OUTPUT,
} from './mocks/mockAI';

// ─── Fixtures ─────────────────────────────────────────────────────────────────
import s1 from './fixtures/scenario1.json';
import s2 from './fixtures/scenario2.json';
import s3 from './fixtures/scenario3.json';
import s4 from './fixtures/scenario4.json';
import s5 from './fixtures/scenario5.json';
import s6 from './fixtures/scenario6.json';
import s7 from './fixtures/scenario7.json';
import s8 from './fixtures/scenario8.json';
import s9 from './fixtures/scenario9.json';
import s10 from './fixtures/scenario10.json';
import s11 from './fixtures/scenario11.json';
import s12 from './fixtures/scenario12.json';
import s13 from './fixtures/scenario13.json';
import s14 from './fixtures/scenario14.json';
import s15 from './fixtures/scenario15.json';
import s16 from './fixtures/scenario16.json';
import s17 from './fixtures/scenario17.json';
import s18 from './fixtures/scenario18.json';
import s19 from './fixtures/scenario19.json';
import s20 from './fixtures/scenario20.json';

// ─── NO_API model config (forces rule-based correction) ───────────────────────
const NO_API_CONFIG = {
  primaryModel: 'gpt-4o',
  fallbackModel: 'gemini-1.5-pro',
  apiKey: null,
  temperature: 0.3,
  maxTokens: 512,
};

before(() => {
  resetMockLogs();
});

// ═══════════════════════════════════════════════════════════════════════════════
// A. PROFILE & INPUT SCENARIOS (1–5)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Scenario 1: Missing user profile fields', () => {
  it('executes meal-plan pipeline and flags missing fields in profile-analyzer', async () => {
    const fixture = s1 as ScenarioFixture;
    const executor = mappedExecutor({
      'profile-analyzer': (id) => ({
        worker: id,
        status: 'success',
        data: { missingFields: ['age', 'sex', 'weightKg', 'goal'] },
        notes: ['Profile incomplete — 4 fields missing.'],
      }),
      'meal-plan-generator': VALID_MEAL_PLAN,
      'nutrition-calculator': SUCCESS_NUTRITION,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult, logs } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'meal-plan');
    assertWorkerChain(orchestratorResult, fixture.expected.workerChain);
    assertFinalOutputKeys(orchestratorResult, ['worker', 'status', 'data', 'notes']);
    expectWorkerOutputShape(orchestratorResult.finalResponse);
    assertPerformance(orchestratorResult, 5000);

    const profileReport = orchestratorResult.workerResults.find(r => r.workerId === 'profile-analyzer');
    assert.ok(profileReport, 'profile-analyzer report must exist');
    const notes = profileReport!.supervisionReport.finalOutput['notes'] as unknown[];
    assert.ok(Array.isArray(notes));
  });
});

describe('Scenario 2: User with multiple intolerances', () => {
  it('executes full meal-plan pipeline respecting gluten, lactose, fructose', async () => {
    const fixture = s2 as ScenarioFixture;
    const executor = mappedExecutor({
      'intolerance-checker': (id) => ({
        worker: id,
        status: 'success',
        data: {
          flaggedIngredients: [],
          safeIngredients: ['oats', 'rice', 'chicken'],
          conflicts: ['gluten', 'lactose', 'fructose'],
        },
        notes: [],
      }),
      'meal-plan-generator': VALID_MEAL_PLAN,
      'nutrition-calculator': SUCCESS_NUTRITION,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'meal-plan');
    assertWorkerChain(orchestratorResult, fixture.expected.workerChain);
    assertFinalOutputKeys(orchestratorResult, ['worker', 'status', 'data', 'notes']);
    expectWorkerOutputShape(orchestratorResult.finalResponse);
    assert.equal(orchestratorResult.hasErrors, false);
  });
});

describe('Scenario 3: User with severe allergies', () => {
  it('allergy-checker rejects meals containing peanuts, shellfish, tree nuts', async () => {
    const fixture = s3 as ScenarioFixture;
    const executor = mappedExecutor({
      'allergy-checker': (id) => ({
        worker: id,
        status: 'success',
        data: {
          allergenHits: [],
          safe: true,
          rejectedMeals: ['Peanut stir-fry', 'Shrimp pasta', 'Almond cake'],
        },
        notes: ['3 meals removed due to declared allergies.'],
      }),
      'meal-plan-generator': VALID_MEAL_PLAN,
      'nutrition-calculator': SUCCESS_NUTRITION,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'meal-plan');
    assertWorkerChain(orchestratorResult, fixture.expected.workerChain);

    const allergyReport = orchestratorResult.workerResults.find(r => r.workerId === 'allergy-checker');
    assert.ok(allergyReport);
    const rejectedMeals = (allergyReport!.supervisionReport.finalOutput['data'] as Record<string, unknown>)['rejectedMeals'];
    expectNonEmptyArray(rejectedMeals, 'data.rejectedMeals');
  });
});

describe('Scenario 4: User with conflicting goals (sedentary + 3500 kcal)', () => {
  it('pipeline completes and medical-safety validates safety', async () => {
    const fixture = s4 as ScenarioFixture;
    const executor = mappedExecutor({
      'meal-plan-generator': VALID_MEAL_PLAN,
      'nutrition-calculator': SUCCESS_NUTRITION,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'meal-plan');
    assertWorkerChain(orchestratorResult, fixture.expected.workerChain);
    assertFinalOutputKeys(orchestratorResult, ['worker', 'status', 'data', 'notes']);
  });
});

describe('Scenario 5: Unrealistic calorie target (300 kcal/day)', () => {
  it('pipeline completes; nutrition-calculator gets corrected for extreme value', async () => {
    const fixture = s5 as ScenarioFixture;
    const executor = mappedExecutor({
      'meal-plan-generator': VALID_MEAL_PLAN,
      'nutrition-calculator': (id) => ({
        worker: id,
        status: 'success',
        data: {
          kcal: 300,
          proteinG: 20,
          carbsG: 30,
          fatG: 8,
          disclaimer: 'NutriAID provides general nutrition guidance. This is not medical advice.',
        },
        notes: [],
      }),
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'meal-plan');
    const nutritionReport = orchestratorResult.workerResults.find(r => r.workerId === 'nutrition-calculator');
    assert.ok(nutritionReport);
    // 300 kcal is out of bounds → should be corrected
    assert.equal(nutritionReport!.supervisionReport.corrected, true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// B. MEAL PLAN SCENARIOS (6–10)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Scenario 6: Generate 1-day meal plan', () => {
  it('produces a valid meal plan with disclaimer in nutrition output', async () => {
    const fixture = s6 as ScenarioFixture;
    const executor = mappedExecutor({
      'meal-plan-generator': VALID_MEAL_PLAN,
      'nutrition-calculator': SUCCESS_NUTRITION,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'meal-plan');
    assertWorkerChain(orchestratorResult, fixture.expected.workerChain);
    expectWorkerOutputShape(orchestratorResult.finalResponse);
    assertFinalOutputKeys(orchestratorResult, ['worker', 'status', 'data', 'notes']);
    assertPerformance(orchestratorResult, 4000);

    const nutritionReport = orchestratorResult.workerResults.find(r => r.workerId === 'nutrition-calculator');
    assert.ok(nutritionReport);
    assert.equal(nutritionReport!.supervisionReport.schemaValid, true);
  });
});

describe('Scenario 7: Generate 7-day meal plan', () => {
  it('full week pipeline runs all 6 workers and produces valid final output', async () => {
    const fixture = s7 as ScenarioFixture;
    const executor = mappedExecutor({
      'meal-plan-generator': (id) => ({
        worker: id,
        status: 'success',
        data: {
          meals: Array.from({ length: 21 }, (_, i) => ({
            name: `Meal ${i + 1}`,
            ingredients: ['chicken', 'broccoli', 'rice'],
          })),
          totalKcal: 12600,
          disclaimer: 'NutriAID provides general nutrition guidance. This is not medical advice.',
        },
        notes: [],
      }),
      'nutrition-calculator': SUCCESS_NUTRITION,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertWorkerChain(orchestratorResult, fixture.expected.workerChain);
    assert.equal(orchestratorResult.workerResults.length, 6);
    assertFinalOutputKeys(orchestratorResult, ['worker', 'status', 'data', 'notes']);
  });
});

describe('Scenario 8: Meal plan with intolerances (gluten + dairy)', () => {
  it('intolerance-checker flags conflicts; final plan does not contain flagged items', async () => {
    const fixture = s8 as ScenarioFixture;
    const executor = mappedExecutor({
      'intolerance-checker': (id) => ({
        worker: id,
        status: 'success',
        data: {
          flaggedIngredients: ['bread', 'milk', 'cheese'],
          safeIngredients: ['rice', 'oats', 'chicken'],
          conflicts: ['gluten', 'dairy'],
        },
        notes: ['Gluten and dairy removed from suggestions.'],
      }),
      'meal-plan-generator': VALID_MEAL_PLAN,
      'nutrition-calculator': SUCCESS_NUTRITION,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'meal-plan');
    const intoleranceReport = orchestratorResult.workerResults.find(r => r.workerId === 'intolerance-checker');
    assert.ok(intoleranceReport);
    const conflicts = (intoleranceReport!.supervisionReport.finalOutput['data'] as Record<string, unknown>)['conflicts'];
    expectNonEmptyArray(conflicts, 'data.conflicts');
  });
});

describe('Scenario 9: Meal plan with allergies (egg + soy)', () => {
  it('allergy-checker confirms safe=true and rejectedMeals listed', async () => {
    const fixture = s9 as ScenarioFixture;
    const executor = mappedExecutor({
      'allergy-checker': (id) => ({
        worker: id,
        status: 'success',
        data: {
          allergenHits: [],
          safe: true,
          rejectedMeals: ['Scrambled eggs', 'Tofu stir-fry'],
        },
        notes: [],
      }),
      'meal-plan-generator': VALID_MEAL_PLAN,
      'nutrition-calculator': SUCCESS_NUTRITION,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'meal-plan');
    const allergyReport = orchestratorResult.workerResults.find(r => r.workerId === 'allergy-checker');
    const data = allergyReport!.supervisionReport.finalOutput['data'] as Record<string, unknown>;
    assert.equal(data['safe'], true);
  });
});

describe('Scenario 10: Meal plan with strict calorie constraints', () => {
  it('nutrition-calculator produces output within 15% of 1400 kcal goal', async () => {
    const fixture = s10 as ScenarioFixture;
    const executor = mappedExecutor({
      'meal-plan-generator': VALID_MEAL_PLAN,
      'nutrition-calculator': (id) => ({
        worker: id,
        status: 'success',
        data: {
          kcal: 1380,
          proteinG: 92,
          carbsG: 145,
          fatG: 48,
          disclaimer: 'NutriAID provides general nutrition guidance. This is not medical advice.',
        },
        notes: [],
      }),
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'meal-plan');
    const nutritionReport = orchestratorResult.workerResults.find(r => r.workerId === 'nutrition-calculator');
    const data = nutritionReport!.supervisionReport.finalOutput['data'] as Record<string, unknown>;
    const kcal = Number(data['kcal']);
    assert.ok(kcal >= 1190 && kcal <= 1610, `kcal ${kcal} outside ±30% of 1400`);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// C. RECIPE SCENARIOS (11–13)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Scenario 11: Generate recipe with substitutions', () => {
  it('recipe-builder returns substitutions for gluten restriction', async () => {
    const fixture = s11 as ScenarioFixture;
    const executor = mappedExecutor({
      'recipe-builder': (id) => ({
        ...VALID_RECIPE(id),
        data: {
          ...(VALID_RECIPE(id)['data'] as Record<string, unknown>),
          substitutions: [{ ingredient: 'soy sauce', substitute: 'coconut aminos (gluten-free)' }],
        },
      }),
      'nutrition-calculator': SUCCESS_NUTRITION,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'recipe');
    assertWorkerChain(orchestratorResult, fixture.expected.workerChain);

    const recipeReport = orchestratorResult.workerResults.find(r => r.workerId === 'recipe-builder');
    const data = recipeReport!.supervisionReport.finalOutput['data'] as Record<string, unknown>;
    expectNonEmptyArray(data['substitutions'], 'data.substitutions');
  });
});

describe('Scenario 12: Recipe containing allergen peanuts → auto-correction', () => {
  it('supervisor corrects recipe-builder output by removing peanuts', async () => {
    const fixture = s12 as ScenarioFixture;
    const executor = mappedExecutor({
      'recipe-builder': ALLERGEN_RECIPE,
      'nutrition-calculator': SUCCESS_NUTRITION,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'recipe');
    const recipeReport = orchestratorResult.workerResults.find(r => r.workerId === 'recipe-builder');
    assert.ok(recipeReport);
    assert.equal(recipeReport!.supervisionReport.corrected, true);

    const correctedStr = JSON.stringify(recipeReport!.supervisionReport.finalOutput).toLowerCase();
    assert.equal(correctedStr.includes('peanut'), false, 'Peanuts must be removed after correction');
  });
});

describe('Scenario 13: Recipe with missing schema fields', () => {
  it('supervisor adds missing worker field and notes via schema correction', async () => {
    const fixture = s13 as ScenarioFixture;
    const executor = mappedExecutor({
      'recipe-builder': MISSING_FIELDS_RECIPE,
      'nutrition-calculator': SUCCESS_NUTRITION,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'recipe');
    const recipeReport = orchestratorResult.workerResults.find(r => r.workerId === 'recipe-builder');
    assert.ok(recipeReport);
    assert.equal(recipeReport!.supervisionReport.corrected, true);

    // After correction, protocol fields must exist
    expectWorkerOutputShape(recipeReport!.supervisionReport.finalOutput);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// D. WORKER ERROR SCENARIOS (14–17)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Scenario 14: Worker returns invalid schema', () => {
  it('meal-plan-generator is corrected; log contains worker_validation and worker_auto_correction', async () => {
    const fixture = s14 as ScenarioFixture;
    const executor = mappedExecutor({
      'meal-plan-generator': MISSING_WORKER_FIELD,
      'nutrition-calculator': SUCCESS_NUTRITION,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult, logs } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'meal-plan');

    const mealPlanReport = orchestratorResult.workerResults.find(r => r.workerId === 'meal-plan-generator');
    assert.ok(mealPlanReport);
    assert.equal(mealPlanReport!.supervisionReport.corrected, true);

    assert.ok(
      logs.some(l => l.event === 'worker_validation'),
      'worker_validation log expected',
    );
    assert.ok(
      logs.some(l => l.event === 'worker_auto_correction'),
      'worker_auto_correction log expected',
    );
  });
});

describe('Scenario 15: Worker returns invalid logic (macro mismatch)', () => {
  it('nutrition-calculator is corrected; log contains worker_auto_correction', async () => {
    const fixture = s15 as ScenarioFixture;
    const executor = mappedExecutor({
      'nutrition-calculator': MACRO_INCONSISTENT_OUTPUT,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult, logs } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'nutritional-analysis');

    const nutritionReport = orchestratorResult.workerResults.find(r => r.workerId === 'nutrition-calculator');
    assert.ok(nutritionReport);
    assert.equal(nutritionReport!.supervisionReport.corrected, true);

    assert.ok(
      logs.some(l => l.event === 'worker_auto_correction' && l.worker === 'Nutrition Calculator Worker'),
      'Expected auto-correction log for Nutrition Calculator Worker',
    );
  });
});

describe('Scenario 16: Worker returns unsafe ingredient (shrimp allergen)', () => {
  it('meal-plan-generator output is corrected; shrimp removed', async () => {
    const fixture = s16 as ScenarioFixture;
    const executor = mappedExecutor({
      'meal-plan-generator': ALLERGEN_OUTPUT,
      'nutrition-calculator': SUCCESS_NUTRITION,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'meal-plan');
    const mealPlanReport = orchestratorResult.workerResults.find(r => r.workerId === 'meal-plan-generator');
    assert.ok(mealPlanReport);
    assert.equal(mealPlanReport!.supervisionReport.corrected, true);

    const finalStr = JSON.stringify(mealPlanReport!.supervisionReport.finalOutput).toLowerCase();
    assert.equal(finalStr.includes('shrimp'), false, 'shrimp must be absent after correction');
  });
});

describe('Scenario 17: Worker fails → rule-based corrector used (no API key)', () => {
  it('nutrition-calculator with invalid output is rule-corrected without AI call', async () => {
    const fixture = s17 as ScenarioFixture;
    const executor = mappedExecutor({
      'meal-plan-generator': VALID_MEAL_PLAN,
      'nutrition-calculator': MACRO_INCONSISTENT_OUTPUT,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    const nutritionReport = orchestratorResult.workerResults.find(r => r.workerId === 'nutrition-calculator');
    assert.ok(nutritionReport);
    assert.equal(nutritionReport!.supervisionReport.corrected, true);
    // Rule-based model does not set correctionModel to a real AI model name
    assert.equal(nutritionReport!.supervisionReport.correctionModel, 'rule-based');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// E. ORCHESTRATOR SCENARIOS (18–20)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Scenario 18: Missing intent → auto-detect routes to profile-analyzer + medical-safety', () => {
  it('detects "unknown" intent and uses the fallback route', async () => {
    const fixture = s18 as ScenarioFixture;
    const executor = uniformExecutor(VALID_BASE_OUTPUT);

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'unknown');
    assertWorkerChain(orchestratorResult, ['profile-analyzer', 'medical-safety']);
    assertFinalOutputKeys(orchestratorResult, ['worker', 'status', 'data', 'notes']);
  });
});

describe('Scenario 19: Full pipeline — profile → meal plan → safety', () => {
  it('all 6 workers run; orchestrator meta is present; no incomplete corrections', async () => {
    const fixture = s19 as ScenarioFixture;
    const executor = mappedExecutor({
      'intolerance-checker': (id) => ({
        worker: id,
        status: 'success',
        data: { flaggedIngredients: ['milk'], safeIngredients: ['rice', 'chicken'], conflicts: ['lactose'] },
        notes: [],
      }),
      'allergy-checker': (id) => ({
        worker: id,
        status: 'success',
        data: { allergenHits: [], safe: true, rejectedMeals: ['Egg omelette'] },
        notes: [],
      }),
      'meal-plan-generator': VALID_MEAL_PLAN,
      'nutrition-calculator': SUCCESS_NUTRITION,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    const { orchestratorResult, logs } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'meal-plan');
    assertWorkerChain(orchestratorResult, fixture.expected.workerChain);
    assertFinalOutputKeys(orchestratorResult, ['worker', 'status', 'data', 'notes', '_orchestratorMeta']);
    assertPerformance(orchestratorResult, 6000);

    // No incomplete corrections
    for (const { supervisionReport: report } of orchestratorResult.workerResults) {
      assert.equal(
        report.correctionIncomplete,
        false,
        `Worker "${report.worker}" has incomplete correction`,
      );
    }

    assert.ok(logs.some(l => l.event === 'worker_validation'), 'worker_validation log expected');
    assert.ok(logs.some(l => l.event === 'orchestrator_routing'), 'orchestrator_routing log expected');
  });
});

describe('Scenario 20: Shopping list generation', () => {
  it('detects shopping-list intent and runs correct worker chain', async () => {
    const fixture = s20 as ScenarioFixture;
    const executor = mappedExecutor({
      'meal-plan-generator': VALID_MEAL_PLAN,
      'shopping-list': SHOPPING_LIST_OUTPUT,
    });

    const { orchestratorResult } = await runScenario(fixture, executor);

    assertIntent(orchestratorResult, 'shopping-list');
    assertWorkerChain(orchestratorResult, ['profile-analyzer', 'intolerance-checker', 'meal-plan-generator', 'shopping-list']);

    const shoppingReport = orchestratorResult.workerResults.find(r => r.workerId === 'shopping-list');
    assert.ok(shoppingReport);
    const data = shoppingReport!.supervisionReport.finalOutput['data'] as Record<string, unknown>;
    expectNonEmptyArray(data['items'], 'data.items');
    assert.equal(orchestratorResult.hasErrors, false);

    expectValidStatus(orchestratorResult.finalResponse as Record<string, unknown>);
    assertPerformance(orchestratorResult, 5000);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// F. CROSS-CUTTING: LOGGING VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Logging: every pipeline run emits worker_validation logs', () => {
  it('full meal-plan pipeline emits worker_validation for each worker', async () => {
    resetMockLogs();
    const executor = mappedExecutor({
      'meal-plan-generator': VALID_MEAL_PLAN,
      'nutrition-calculator': SUCCESS_NUTRITION,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    await runScenario(s6 as ScenarioFixture, executor);
    const logs = getMockLogs();

    const validationLogs = logs.filter(l => l.event === 'worker_validation');
    assert.ok(validationLogs.length >= 3, `Expected ≥3 worker_validation logs, got ${validationLogs.length}`);
  });
});

describe('Logging: auto-correction emits worker_auto_correction event', () => {
  it('worker_auto_correction log is emitted when a worker output has schema errors', async () => {
    resetMockLogs();
    const executor = mappedExecutor({
      'meal-plan-generator': MISSING_WORKER_FIELD,
      'nutrition-calculator': SUCCESS_NUTRITION,
      'medical-safety': SAFETY_APPROVED_OUTPUT,
    });

    await runScenario(s14 as ScenarioFixture, executor);
    const logs = getMockLogs();

    assert.ok(
      logs.some(l => l.event === 'worker_auto_correction'),
      `Expected worker_auto_correction log. Got events: ${logs.map(l => l.event).join(', ')}`,
    );
  });
});

describe('Logging: orchestrator emits orchestrator_routing log', () => {
  it('orchestrator_routing log is emitted with correct intent and worker sequence', async () => {
    resetMockLogs();
    const executor = uniformExecutor(VALID_BASE_OUTPUT);

    await runScenario(s18 as ScenarioFixture, executor);
    const logs = getMockLogs();

    const routingLog = logs.find(l => l.event === 'orchestrator_routing');
    assert.ok(routingLog, 'orchestrator_routing log expected');
    const meta = routingLog!.metadata as Record<string, unknown>;
    assert.equal(meta['intent'], 'unknown');
    assert.deepEqual(meta['workerSequence'], ['profile-analyzer', 'medical-safety']);
  });
});
