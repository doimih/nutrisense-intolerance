/**
 * Unit Tests: Worker Supervisor & Validation Layers
 * Uses Node.js built-in test runner (node:test + node:assert).
 * Run with: node --experimental-vm-modules --test tests/ai/supervisor/supervisor.test.mjs
 * Or add to package.json scripts: "test:supervisor": "node --test tests/ai/supervisor/supervisor.test.ts"
 *
 * Note: Because these modules import `server-only`, they must be run in a Node.js
 * environment (not in a browser). The server-only package resolves to a no-op in
 * direct Node test execution when next.js module resolution is bypassed.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ─── We test the pure validator functions directly ────────────────────────────
// Imports use relative paths to avoid tsconfig path aliases in plain node runs.
import { validateWorkerSchema } from '../../../src/ai/validators/schemaValidator.js';
import { validateSemantics } from '../../../src/ai/validators/semanticValidator.js';
import { buildCorrectionPrompt } from '../../../src/ai/prompts/correctionPrompt.js';
import { detectIntent } from '../../../src/ai/orchestrator.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VALID_BASE_OUTPUT = {
  worker: 'nutrition-calculator',
  status: 'success',
  data: {
    kcal: 2000,
    proteinG: 100,
    carbsG: 250,
    fatG: 67,
    disclaimer: 'NutriAID provides general nutrition guidance. This is not medical advice.',
  },
  notes: [],
};

const INVALID_MISSING_FIELDS = {
  status: 'success',
  data: {},
  // missing: worker, notes
};

const INVALID_BAD_STATUS = {
  worker: 'profile-analyzer',
  status: 'unknown_value',
  data: {},
  notes: [],
};

const ALLERGEN_OUTPUT = {
  worker: 'meal-plan-generator',
  status: 'success',
  data: {
    meals: [
      { name: 'Pasta with shrimp', ingredients: ['pasta', 'shrimp', 'garlic', 'olive oil'] },
    ],
  },
  notes: [],
};

const CONTRADICTION_OUTPUT = {
  worker: 'medical-safety',
  status: 'success',
  data: { safetyApproved: false },
  notes: [],
};

const MEDICAL_LANG_OUTPUT = {
  worker: 'supplement-advisor',
  status: 'success',
  data: { supplements: ['Vitamin D'], recommendation: 'This will cure your condition.' },
  notes: [],
};

const MACRO_INCONSISTENT_OUTPUT = {
  worker: 'nutrition-calculator',
  status: 'success',
  data: {
    kcal: 3000,   // reported
    proteinG: 50, // 50*4=200
    carbsG: 100,  // 100*4=400
    fatG: 30,     // 30*9=270  → estimated=870, vs 3000 → large discrepancy
    disclaimer: 'Not medical advice.',
  },
  notes: [],
};

// ─── 1. Schema Validation ─────────────────────────────────────────────────────

describe('Schema Validation', () => {
  it('passes valid nutrition-calculator output', () => {
    const result = validateWorkerSchema('nutrition-calculator', VALID_BASE_OUTPUT);
    assert.equal(result.valid, true, `Expected valid but got errors: ${result.errors.join(', ')}`);
    assert.equal(result.errors.length, 0);
  });

  it('fails when required protocol fields are missing', () => {
    const result = validateWorkerSchema('nutrition-calculator', INVALID_MISSING_FIELDS);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('"worker"')), 'Expected missing worker error');
    assert.ok(result.errors.some((e) => e.includes('"notes"')), 'Expected missing notes error');
  });

  it('fails on invalid status value', () => {
    const result = validateWorkerSchema('profile-analyzer', INVALID_BAD_STATUS);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('status')));
  });

  it('warns on unknown worker id but still validates protocol', () => {
    const result = validateWorkerSchema('nonexistent-worker', VALID_BASE_OUTPUT);
    assert.equal(result.valid, true, 'Protocol fields are fine');
    assert.ok(result.warnings.some((w) => w.includes('No registered schema')));
  });
});

// ─── 2. Semantic Validation ───────────────────────────────────────────────────

describe('Semantic Validation', () => {
  it('passes consistent nutrition output', () => {
    const result = validateSemantics('nutrition-calculator', VALID_BASE_OUTPUT, [], []);
    assert.equal(result.valid, true, result.allErrors.join(', '));
  });

  it('detects allergen conflict', () => {
    const result = validateSemantics(
      'meal-plan-generator',
      ALLERGEN_OUTPUT,
      [],
      ['shrimp'],
    );
    assert.equal(result.valid, false);
    assert.ok(result.allergenErrors.some((e) => e.toLowerCase().includes('shrimp')));
  });

  it('detects intolerance conflict', () => {
    const result = validateSemantics(
      'meal-plan-generator',
      ALLERGEN_OUTPUT,
      ['shellfish'],
      [],
    );
    assert.equal(result.valid, false);
    assert.ok(result.allergenErrors.some((e) => e.toLowerCase().includes('shellfish')));
  });

  it('detects contradiction: safetyApproved=false with status=success', () => {
    const result = validateSemantics('medical-safety', CONTRADICTION_OUTPUT, [], []);
    assert.ok(result.contradictions.length > 0, 'Expected contradiction');
  });

  it('detects medical-risk language', () => {
    const result = validateSemantics('supplement-advisor', MEDICAL_LANG_OUTPUT, [], []);
    assert.ok(result.safetyErrors.some((e) => e.includes('cure')));
  });

  it('detects macro/calorie inconsistency', () => {
    const result = validateSemantics('nutrition-calculator', MACRO_INCONSISTENT_OUTPUT, [], []);
    assert.ok(result.nutritionErrors.some((e) => e.includes('macro calculation')));
  });

  it('detects calorie deviation from user goal', () => {
    const result = validateSemantics(
      'nutrition-calculator',
      VALID_BASE_OUTPUT,
      [],
      [],
      { kcal: 1200 }, // 2000 vs 1200 = 67% deviation
    );
    assert.ok(result.nutritionErrors.some((e) => e.includes('goal')));
  });
});

// ─── 3. Safety Validation (via semanticValidator) ─────────────────────────────

describe('Safety Validation', () => {
  it('flags missing disclaimer on supplement-advisor output', () => {
    const outputNoDisclaimer = {
      worker: 'supplement-advisor',
      status: 'success',
      data: { supplements: ['Iron'] },
      notes: [],
    };
    const result = validateSemantics('supplement-advisor', outputNoDisclaimer, [], []);
    assert.ok(result.safetyErrors.some((e) => e.includes('disclaimer')));
  });

  it('does not flag disclaimer on non-critical workers', () => {
    const output = {
      worker: 'shopping-list',
      status: 'success',
      data: { items: ['oats', 'banana'] },
      notes: [],
    };
    const result = validateSemantics('shopping-list', output, [], []);
    assert.equal(result.safetyErrors.length, 0, result.safetyErrors.join(', '));
  });
});

// ─── 4. Auto-correction (rule-based, no API key) ──────────────────────────────

describe('Auto-Correction', () => {
  it('adds missing required fields', async () => {
    const { autoCorrect } = await import('../../../src/ai/autoCorrector.js');
    const result = await autoCorrect(
      {
        workerId: 'profile-analyzer',
        workerName: 'Profile Analyzer Worker',
        input: {},
        output: { status: 'success', data: {}, notes: [] }, // missing worker
        expectedSchema: { worker: 'string' },
        errors: ['Missing required protocol field: "worker".'],
        intolerances: [],
        allergies: [],
      },
      { primaryModel: 'gpt-4o', fallbackModel: 'gemini-1.5-pro', apiKey: null, temperature: 0.3, maxTokens: 512 },
    );

    assert.equal(result.usedRuleBased, true, 'Should use rule-based when no API key');
    assert.equal(result.correctedOutput['worker'], 'Profile Analyzer Worker');
  });

  it('marks output as warning after correction', async () => {
    const { autoCorrect } = await import('../../../src/ai/autoCorrector.js');
    const result = await autoCorrect(
      {
        workerId: 'nutrition-calculator',
        workerName: 'Nutrition Calculator Worker',
        input: {},
        output: MACRO_INCONSISTENT_OUTPUT,
        expectedSchema: {},
        errors: ['Nutritional inconsistency detected.'],
        intolerances: [],
        allergies: [],
      },
      { primaryModel: 'gpt-4o', fallbackModel: 'gemini-1.5-pro', apiKey: null, temperature: 0.3, maxTokens: 512 },
    );

    assert.equal(result.usedRuleBased, true);
    assert.equal(result.correctedOutput['status'], 'warning');
    assert.ok(Array.isArray(result.correctedOutput['notes']), 'notes should be array');
  });

  it('removes allergen ingredients during rule-based correction', async () => {
    const { autoCorrect } = await import('../../../src/ai/autoCorrector.js');
    const result = await autoCorrect(
      {
        workerId: 'meal-plan-generator',
        workerName: 'Meal Plan Generator Worker',
        input: {},
        output: ALLERGEN_OUTPUT,
        expectedSchema: {},
        errors: ['Allergen violation: "shrimp" detected.'],
        intolerances: [],
        allergies: ['shrimp'],
      },
      { primaryModel: 'gpt-4o', fallbackModel: 'gemini-1.5-pro', apiKey: null, temperature: 0.3, maxTokens: 512 },
    );

    const outputStr = JSON.stringify(result.correctedOutput).toLowerCase();
    assert.equal(outputStr.includes('shrimp'), false, 'shrimp should be removed from corrected output');
  });
});

// ─── 5. Auto-Correction Failure ───────────────────────────────────────────────

describe('Auto-Correction Failure', () => {
  it('uses rule-based corrector when primary AI model fails (no key)', async () => {
    const { autoCorrect } = await import('../../../src/ai/autoCorrector.js');
    const result = await autoCorrect(
      {
        workerId: 'profile-analyzer',
        workerName: 'Profile Analyzer Worker',
        input: {},
        output: { status: 'error', data: {}, notes: [] },
        expectedSchema: {},
        errors: ['missing worker field'],
        intolerances: [],
        allergies: [],
      },
      { primaryModel: 'gpt-4o', fallbackModel: 'gemini-1.5-pro', apiKey: null, temperature: 0.3, maxTokens: 512 },
    );

    assert.equal(result.model, 'rule-based');
    assert.equal(result.usedRuleBased, true);
  });
});

// ─── 6. Fallback Model Logic ──────────────────────────────────────────────────

describe('Fallback Model Logic', () => {
  it('returns model=rule-based when apiKey is null', async () => {
    const { autoCorrect } = await import('../../../src/ai/autoCorrector.js');
    const result = await autoCorrect(
      {
        workerId: 'progress-tracking',
        workerName: 'Progress Tracking Worker',
        input: {},
        output: { worker: 'progress-tracking', status: 'error', data: {}, notes: [] },
        expectedSchema: {},
        errors: [],
        intolerances: [],
        allergies: [],
      },
      {
        primaryModel: 'gpt-4o',
        fallbackModel: 'gemini-1.5-pro',
        apiKey: null,
        temperature: 0.3,
        maxTokens: 512,
      },
    );
    assert.equal(result.model, 'rule-based');
    assert.equal(result.usedFallback, false);
    assert.equal(result.usedRuleBased, true);
  });
});

// ─── 7. Intent Detection ──────────────────────────────────────────────────────

describe('Intent Detection (Orchestrator)', () => {
  const cases: Array<[string, string]> = [
    ['Create a weekly meal plan for me', 'meal-plan'],
    ['Give me a recipe for chicken soup', 'recipe'],
    ['Generate my shopping list for the week', 'shopping-list'],
    ['Should I take vitamin D supplements?', 'supplement-advice'],
    ['How many calories does this meal have?', 'nutritional-analysis'],
    ['Show me my weight progress', 'progress-tracking'],
    ['I have a lactose intolerance', 'general-nutrition'],
    ['Hello there', 'unknown'],
  ];

  for (const [message, expectedIntent] of cases) {
    it(`detects intent "${expectedIntent}" for: "${message}"`, () => {
      const result = detectIntent(message);
      assert.equal(result, expectedIntent);
    });
  }
});

// ─── 8. Correction Prompt ─────────────────────────────────────────────────────

describe('Correction Prompt Builder', () => {
  it('includes all variables in rendered prompt', () => {
    const prompt = buildCorrectionPrompt({
      workerName: 'Nutrition Calculator Worker',
      errors: ['Missing kcal field', 'Invalid status value'],
      input: { meals: ['oats'] },
      originalOutput: { status: 'bad', data: {}, notes: [] },
      userContext: { intolerances: ['gluten'], allergies: [] },
    });

    assert.ok(prompt.includes('Nutrition Calculator Worker'), 'worker name missing');
    assert.ok(prompt.includes('Missing kcal field'), 'error 1 missing');
    assert.ok(prompt.includes('Invalid status value'), 'error 2 missing');
    assert.ok(prompt.includes('gluten'), 'user context missing');
    assert.ok(prompt.includes('"meals"'), 'input missing');
  });

  it('numbers errors in the prompt', () => {
    const prompt = buildCorrectionPrompt({
      workerName: 'TestWorker',
      errors: ['Error A', 'Error B', 'Error C'],
      input: {},
      originalOutput: {},
    });

    assert.ok(prompt.includes('1. Error A'));
    assert.ok(prompt.includes('2. Error B'));
    assert.ok(prompt.includes('3. Error C'));
  });
});
