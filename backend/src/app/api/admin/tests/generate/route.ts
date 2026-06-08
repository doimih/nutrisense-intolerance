import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { buildCorrectionPrompt } from '@/ai/prompts/correctionPrompt';
import { logInfo } from '@/lib/server/superadmin/aiLogging';

export const runtime = 'nodejs';

function sid(req: NextRequest): string {
  return req.headers.get('x-nutriaid-session-id') || req.cookies.get('na_sid')?.value || 'test-lab-gen';
}

// ─── Template generators ───────────────────────────────────────────────────────

function generateWorkerTest(workerId: string, description: string): string {
  return `// Auto-generated Worker Test
// Worker: ${workerId}
// Description: ${description}
import assert from 'node:assert/strict';
import { validateWorkerSchema } from '../../src/ai/validators/schemaValidator';
import { validateSemantics } from '../../src/ai/validators/semanticValidator';

const output = {
  worker: '${workerId}',
  status: 'success',
  data: {},
  notes: [],
};

// Schema validation
const schemaResult = validateWorkerSchema('${workerId}', output);
assert.equal(schemaResult.valid, true, 'Schema must be valid');

// Semantic validation
const semanticResult = validateSemantics('${workerId}', output, [], []);
console.log('Schema valid:', schemaResult.valid);
console.log('Semantic valid:', semanticResult.valid);
console.log('Errors:', [...schemaResult.errors, ...semanticResult.allErrors]);
`;
}

function generateOrchestratorTest(userMessage: string, expectedIntent: string): string {
  return `// Auto-generated Orchestrator Test
// Message: "${userMessage}"
// Expected intent: ${expectedIntent}
import assert from 'node:assert/strict';
import { detectIntent, runOrchestrator } from '../../src/ai/orchestrator';

// Intent detection
const intent = detectIntent('${userMessage}');
assert.equal(intent, '${expectedIntent}', \`Expected intent "${expectedIntent}", got "\${intent}"\`);

// Full run (stub executor)
const result = await runOrchestrator({
  sessionId: 'gen-test-session',
  userMessage: '${userMessage}',
  intolerances: [],
  allergies: [],
});

assert.equal(result.intent, '${expectedIntent}');
assert.ok(result.workerResults.length > 0, 'At least one worker must run');
console.log('Intent:', result.intent);
console.log('Workers ran:', result.workerSequence.join(' → '));
`;
}

function generatePlatformTest(userMessage: string, intolerances: string[], allergies: string[]): string {
  const intolerancesStr = JSON.stringify(intolerances);
  const allergiesStr = JSON.stringify(allergies);
  return `// Auto-generated Platform End-to-End Test
// Message: "${userMessage}"
import assert from 'node:assert/strict';
import { runOrchestrator } from '../../src/ai/orchestrator';

const result = await runOrchestrator({
  sessionId: 'platform-gen-test',
  userMessage: '${userMessage}',
  intolerances: ${intolerancesStr},
  allergies: ${allergiesStr},
});

assert.ok(result.finalResponse, 'Final response must exist');
assert.ok(['worker', 'status', 'data', 'notes'].every(k => k in result.finalResponse), 'Final response must have protocol fields');
assert.equal(result.hasErrors, false, 'No uncorrectable errors expected');

console.log('Final intent:', result.intent);
console.log('Worker chain:', result.workerSequence.join(' → '));
console.log('Has errors:', result.hasErrors);
console.log('Total ms:', result.totalMs);
`;
}

function generateAutoCorrectionTest(workerId: string): string {
  return `// Auto-generated Auto-Correction Test
// Worker: ${workerId}
import assert from 'node:assert/strict';
import { autoCorrect } from '../../src/ai/autoCorrector';

const brokenOutput = {
  // Missing 'worker' field — triggers schema correction
  status: 'success',
  data: {},
  notes: [],
};

const result = await autoCorrect({
  workerId: '${workerId}',
  workerName: '${workerId}',
  input: {},
  output: brokenOutput,
  expectedSchema: { worker: 'string' },
  errors: ['Missing required protocol field: "worker".'],
  intolerances: [],
  allergies: [],
}, { primaryModel: 'gpt-4o', fallbackModel: 'gemini-1.5-pro', apiKey: null, temperature: 0.3, maxTokens: 512 });

assert.equal(result.usedRuleBased, true, 'Rule-based corrector should be used without API key');
assert.ok('worker' in result.correctedOutput, 'worker field must be added by corrector');
console.log('Corrected model:', result.model);
console.log('Corrected output:', JSON.stringify(result.correctedOutput, null, 2));
`;
}

function generateFixture(description: string, userMessage: string, expectedIntent: string): string {
  return JSON.stringify({
    scenarioId: `gen-${Date.now()}`,
    description,
    userMessage,
    sessionId: `gen-session-${Date.now()}`,
    userProfile: {},
    intolerances: [],
    allergies: [],
    expected: {
      intent: expectedIntent,
      workerChain: [],
      hasErrors: false,
      finalOutputKeys: ['worker', 'status', 'data', 'notes'],
    },
  }, null, 2);
}

// ─── Intent inference from prompt ─────────────────────────────────────────────

function inferIntentFromPrompt(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('meal plan') || lower.includes('weekly') || lower.includes('daily plan')) return 'meal-plan';
  if (lower.includes('recipe') || lower.includes('cook') || lower.includes('prepare')) return 'recipe';
  if (lower.includes('shopping') || lower.includes('grocery')) return 'shopping-list';
  if (lower.includes('supplement') || lower.includes('vitamin')) return 'supplement-advice';
  if (lower.includes('calories') || lower.includes('macro') || lower.includes('nutrition')) return 'nutritional-analysis';
  if (lower.includes('progress') || lower.includes('weight') || lower.includes('track')) return 'progress-tracking';
  if (lower.includes('worker')) return 'worker';
  if (lower.includes('orchestrator')) return 'orchestrator';
  if (lower.includes('correction') || lower.includes('auto-correct')) return 'auto-correction';
  return 'general-nutrition';
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const prompt = typeof raw['prompt'] === 'string' ? raw['prompt'].trim() : '';
  if (!prompt) return NextResponse.json({ error: '"prompt" is required.' }, { status: 400 });

  const sessionId = sid(request);
  logInfo({
    sessionId,
    userId: auth.session.userId,
    source: 'system',
    metadata: { event: 'test_generation_requested', prompt: prompt.slice(0, 200) },
  });

  const inferredType = inferIntentFromPrompt(prompt);
  const workerId = typeof raw['workerId'] === 'string' ? raw['workerId'] : 'meal-plan-generator';
  const userMessage = typeof raw['userMessage'] === 'string' ? raw['userMessage'] : 'Create a meal plan for me';

  let testCode = '';
  let fixture = '';
  const scenario = { prompt, inferredType, workerId, userMessage };

  if (inferredType === 'worker' || raw['testType'] === 'worker') {
    testCode = generateWorkerTest(workerId, prompt);
    fixture = generateFixture(prompt, userMessage, 'meal-plan');
  } else if (inferredType === 'auto-correction' || raw['testType'] === 'auto-correction') {
    testCode = generateAutoCorrectionTest(workerId);
    fixture = generateFixture(prompt, userMessage, 'meal-plan');
  } else if (inferredType === 'orchestrator' || raw['testType'] === 'orchestrator') {
    testCode = generateOrchestratorTest(userMessage, inferredType === 'orchestrator' ? 'meal-plan' : inferredType);
    fixture = generateFixture(prompt, userMessage, 'meal-plan');
  } else {
    testCode = generatePlatformTest(
      userMessage,
      Array.isArray(raw['intolerances']) ? raw['intolerances'] as string[] : [],
      Array.isArray(raw['allergies']) ? raw['allergies'] as string[] : [],
    );
    fixture = generateFixture(prompt, userMessage, inferredType);
  }

  const correctionPromptPreview = buildCorrectionPrompt({
    workerName: workerId,
    errors: ['Example: missing required field "worker"'],
    input: {},
    originalOutput: { status: 'success', data: {}, notes: [] },
  });

  return NextResponse.json({
    testCode,
    fixture,
    scenario,
    correctionPromptPreview: correctionPromptPreview.slice(0, 800),
    mocks: `// Mock executor for generated test\nexport const mockExecutor = async (workerId) => ({\n  worker: workerId,\n  status: 'success',\n  data: {},\n  notes: [],\n});\n`,
  });
}
