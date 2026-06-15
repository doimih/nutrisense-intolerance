import 'server-only';
/**
 * AI Orchestrator
 * Routes user intent to the correct worker sequence.
 * Wraps every worker execution with the WorkerSupervisor pipeline:
 *   run → validate schema → validate semantics → auto-correct if needed → log
 */

import type { JsonObject, NutritionalGoals, UserProfile } from '@/lib/server/superadmin/workerDiagnosticTypes';
import { superviseWorkerExecution } from '@/ai/supervisor/WorkerSupervisor';
import type { SupervisionContext, SupervisionReport } from '@/ai/supervisor/WorkerSupervisor';
import { logOrchestratorEvent } from '@/lib/server/superadmin/aiLogging';
import { getDefaultModelConfig } from '@/ai/autoCorrector';
import { createRealWorkerExecutor } from '@/ai/realWorkerExecutor';

// ─── Intent detection ─────────────────────────────────────────────────────────

export type DetectedIntent =
  | 'meal-plan'
  | 'recipe'
  | 'shopping-list'
  | 'supplement-advice'
  | 'nutritional-analysis'
  | 'progress-tracking'
  | 'general-nutrition'
  | 'unknown';

const INTENT_KEYWORDS: Record<DetectedIntent, readonly string[]> = {
  'meal-plan': [
    // EN
    'meal plan', 'weekly plan', 'daily plan', 'eating plan', 'diet plan',
    'generate meals', 'plan meals', 'meal schedule',
    // RO
    'plan alimentar', 'plan saptamanal', 'plan zilnic', 'meniu saptamanal',
    'meniu zilnic', 'planifica mese', 'genereaza mese',
  ],
  recipe: [
    // EN
    'recipe', 'how to cook', 'how to prepare', 'ingredients for', 'cook a',
    // RO
    'reteta', 'cum se prepara', 'cum gatesc', 'ingrediente pentru', 'cum fac',
  ],
  'shopping-list': [
    // EN
    'shopping list', 'grocery list', 'buy list', 'what to buy', 'grocery',
    // RO
    'lista cumparaturi', 'cumparaturi', 'ce sa cumpar', 'lista de alimente',
    'lista de cumparaturi',
  ],
  'supplement-advice': [
    // EN — lifestyle tips and wellness routines
    'supplement', 'vitamin', 'mineral', 'probiotic', 'protein powder',
    'lifestyle', 'routine', 'wellness', 'habit', 'comfort tip',
    // RO
    'supliment', 'vitamina', 'vitamine', 'mineral', 'minerale', 'probiotic',
    'suplimentare', 'rutina', 'obicei', 'stil de viata', 'sfat de confort',
  ],
  'nutritional-analysis': [
    // EN — now routes to food recommendations (not calorie analysis)
    'calories', 'macros', 'nutritional value', 'analyse food', 'food values',
    'nutrient content', 'food recommendations', 'what foods',
    // RO
    'calorii', 'macronutrienti', 'valori nutritionale', 'analiza alimentara',
    'continut nutritiv', 'macronutriente', 'recomandari alimente', 'ce alimente',
  ],
  'progress-tracking': [
    // EN
    'progress', 'weight trend', 'weekly report', 'track', 'symptom history',
    'monitoring report', 'journal analysis',
    // RO
    'progres', 'tendinta', 'raport saptamanal', 'urmarire', 'istoric simptome',
    'raport jurnal', 'analiza jurnal',
  ],
  'general-nutrition': [
    // EN
    'intolerance', 'allergy', 'what can i eat', 'food reaction', 'symptom',
    'food sensitivity', 'safe foods', 'avoid foods', 'guidance', 'recommend',
    // RO
    'intoleranta', 'intolerante', 'alergie', 'alergii', 'ce pot manca',
    'reactie alimentara', 'simptom', 'simptome', 'recomandari', 'ghidare',
    'alimentatie', 'aliment', 'alimente sigure', 'alimente de evitat',
    'sensibilitate alimentara', 'personalizat',
  ],
  unknown: [],
};

export function detectIntent(userMessage: string): DetectedIntent {
  const lower = userMessage.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (intent === 'unknown') continue;
    if ((keywords as readonly string[]).some((kw) => lower.includes(kw))) {
      return intent as DetectedIntent;
    }
  }
  return 'unknown';
}

// ─── Worker routing table ─────────────────────────────────────────────────────

const INTENT_WORKER_ROUTES: Record<DetectedIntent, readonly string[]> = {
  'meal-plan': [
    'profile-analyzer',
    'intolerance-checker',
    'allergy-checker',
    'meal-plan-generator',
    'nutrition-calculator',
    'medical-safety',
  ],
  recipe: [
    'profile-analyzer',
    'intolerance-checker',
    'allergy-checker',
    'recipe-builder',
    'nutrition-calculator',
  ],
  'shopping-list': [
    'profile-analyzer',
    'intolerance-checker',
    'meal-plan-generator',
    'shopping-list',
  ],
  'supplement-advice': [
    'profile-analyzer',
    'intolerance-checker',
    'allergy-checker',
    'supplement-advisor',
    'medical-safety',
  ],
  'nutritional-analysis': [
    'profile-analyzer',
    'intolerance-checker',
    'nutrition-calculator',
    'medical-safety',
  ],
  'progress-tracking': [
    'profile-analyzer',
    'progress-tracking',
  ],
  'general-nutrition': [
    'profile-analyzer',
    'intolerance-checker',
    'allergy-checker',
    'medical-safety',
  ],
  unknown: [
    'profile-analyzer',
    'medical-safety',
  ],
};

// ─── Worker executor stub ─────────────────────────────────────────────────────

export type WorkerExecutor = (
  workerId: string,
  input: JsonObject,
  context: OrchestratorContext,
) => Promise<JsonObject>;

export const defaultWorkerExecutor: WorkerExecutor = async (workerId, input) => {
  return {
    worker: workerId,
    status: 'success',
    data: { ...input },
    notes: [],
  };
};

// ─── Orchestrator types ───────────────────────────────────────────────────────

export type OrchestratorContext = {
  sessionId: string;
  userId?: string | null;
  userMessage: string;
  userProfile?: UserProfile;
  intolerances?: string[];
  allergies?: string[];
  nutritionalGoals?: NutritionalGoals;
  lang?: 'ro' | 'en';
  country?: string;
  region?: string;
  culturalCuisine?: string;
};

export type WorkerExecutionRecord = {
  workerId: string;
  supervisionReport: SupervisionReport;
  totalMs: number;
};

export type OrchestratorResult = {
  sessionId: string;
  intent: DetectedIntent;
  workerSequence: string[];
  workerResults: WorkerExecutionRecord[];
  finalResponse: JsonObject;
  totalMs: number;
  hasErrors: boolean;
};

// ─── Final response aggregator ────────────────────────────────────────────────

function getWorkerData(results: WorkerExecutionRecord[], workerId: string): JsonObject | null {
  const record = results.find((r) => r.workerId === workerId);
  if (!record) return null;
  const data = record.supervisionReport.finalOutput.data;
  return data && typeof data === 'object' && !Array.isArray(data) ? (data as JsonObject) : null;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string');
}

/**
 * Builds a structured final response by aggregating outputs from all workers.
 * Each worker's data is available under its own key AND key fields are promoted
 * to top-level for downstream consumers (e.g. extractGuidanceFromOrchestrator).
 */
function buildFinalResponse(
  intent: DetectedIntent,
  workerResults: WorkerExecutionRecord[],
  lang: 'ro' | 'en',
): JsonObject {
  const agg: JsonObject = { intent, lang };

  // Per-worker data blocks (keyed by workerId for transparency)
  for (const { workerId, supervisionReport } of workerResults) {
    const data = supervisionReport.finalOutput.data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      agg[workerId] = data as JsonObject;
    }
  }

  // ── Profile analysis ──────────────────────────────────────────────────────
  const profileData = getWorkerData(workerResults, 'profile-analyzer');
  if (profileData) {
    agg.userContext = profileData;
  }

  // ── Discomfort triggers (intolerance-checker + allergy-checker) → avoidFoods ─
  const intolData = getWorkerData(workerResults, 'intolerance-checker');
  const allergyData = getWorkerData(workerResults, 'allergy-checker');

  // intolerance-checker: possibleTriggers (new) or flaggedIngredients (legacy)
  const flagged = asStringArray(intolData?.possibleTriggers ?? intolData?.flaggedIngredients);
  // allergy-checker: reactionPatterns / associatedFoods (new) or allergenHits (legacy)
  const reactionFoods = asStringArray(
    allergyData?.reactionPatterns ?? allergyData?.associatedFoods ?? allergyData?.allergenHits,
  );
  const combined = Array.from(new Set([...flagged, ...reactionFoods]));
  if (combined.length > 0) {
    agg.avoidFoods = combined;
    agg.discomfortTriggers = flagged;
    agg.reactionFoods = reactionFoods;
    if (intolData?.conflicts) agg.conflicts = asStringArray(intolData.conflicts);
  }

  // ── Meal plan ─────────────────────────────────────────────────────────────
  const mealData = getWorkerData(workerResults, 'meal-plan-generator');
  if (mealData) {
    // Support both meals[] and breakfast/lunch/dinner formats
    const meals = Array.isArray(mealData.meals) ? mealData.meals : [];
    const breakfast = Array.isArray(mealData.breakfast) ? mealData.breakfast : [];
    const lunch = Array.isArray(mealData.lunch) ? mealData.lunch : [];
    const dinner = Array.isArray(mealData.dinner) ? mealData.dinner : [];
    const alternatives = asStringArray(mealData.alternatives);

    agg.meals = meals;
    agg.mealExamples = meals;
    if (breakfast.length) agg.breakfast = breakfast;
    if (lunch.length) agg.lunch = lunch;
    if (dinner.length) agg.dinner = dinner;
    if (alternatives.length) agg.alternatives = alternatives;
    if (typeof mealData.totalKcal === 'number') agg.totalKcal = mealData.totalKcal;
    if (typeof mealData.disclaimer === 'string') agg.disclaimer = mealData.disclaimer;
  }

  // ── Recipe ────────────────────────────────────────────────────────────────
  const recipeData = getWorkerData(workerResults, 'recipe-builder');
  if (recipeData) {
    agg.recipe = recipeData;
    if (typeof recipeData.recipeName === 'string') agg.recipeName = recipeData.recipeName;
    if (Array.isArray(recipeData.ingredients)) agg.ingredients = recipeData.ingredients;
    if (Array.isArray(recipeData.steps)) agg.steps = recipeData.steps;
  }

  // ── Recommended foods / GEO-adapted foods (from nutrition-calculator worker) ──
  const nutritionData = getWorkerData(workerResults, 'nutrition-calculator');
  if (nutritionData) {
    agg.nutrition = nutritionData;
    // Primary output is now recommendedFoods (behavioral/GEO-adapted)
    if (Array.isArray(nutritionData.recommendedFoods)) agg.recommendedFoods = nutritionData.recommendedFoods;
    // Legacy numeric fields kept for backward compatibility if AI still returns them
    if (typeof nutritionData.kcal === 'number') agg.kcal = nutritionData.kcal;
    if (typeof nutritionData.proteinG === 'number') agg.proteinG = nutritionData.proteinG;
    if (typeof nutritionData.carbsG === 'number') agg.carbsG = nutritionData.carbsG;
    if (typeof nutritionData.fatG === 'number') agg.fatG = nutritionData.fatG;
  }

  // ── Lifestyle tips (formerly supplement-advisor) ───────────────────────────
  const suppData = getWorkerData(workerResults, 'supplement-advisor');
  if (suppData) {
    if (Array.isArray(suppData.lifestyleTips)) agg.lifestyleTips = suppData.lifestyleTips;
    if (Array.isArray(suppData.routineSuggestions)) agg.routineSuggestions = suppData.routineSuggestions;
    if (Array.isArray(suppData.comfortHabits)) agg.comfortHabits = suppData.comfortHabits;
    // Legacy field kept for backward compatibility
    if (Array.isArray(suppData.supplements)) agg.supplements = suppData.supplements;
  }

  // ── Progress tracking ─────────────────────────────────────────────────────
  const progressData = getWorkerData(workerResults, 'progress-tracking');
  if (progressData) {
    agg.progressSummary = progressData.summary ?? '';
    agg.progressData = progressData;
  }

  // ── Shopping list ─────────────────────────────────────────────────────────
  const shopData = getWorkerData(workerResults, 'shopping-list');
  if (shopData) {
    agg.shoppingItems = shopData.items ?? [];
    if (shopData.groupedByCategory) agg.groupedByCategory = shopData.groupedByCategory;
  }

  // ── Medical safety (disclaimer + risks — always last) ─────────────────────
  const safetyData = getWorkerData(workerResults, 'medical-safety');
  if (safetyData) {
    agg.safetyApproved = safetyData.safetyApproved ?? true;
    if (typeof safetyData.disclaimer === 'string') agg.disclaimer = safetyData.disclaimer;
    if (Array.isArray(safetyData.risks) && (safetyData.risks as unknown[]).length > 0) {
      agg.warnings = safetyData.risks;
    }
  }

  // Fallback disclaimer
  if (!agg.disclaimer) {
    agg.disclaimer = lang === 'ro'
      ? 'Aceste informatii sunt orientative si nu reprezinta sfat medical.'
      : 'This information is indicative and does not constitute medical advice.';
  }

  return agg;
}

// ─── Diversity engine ─────────────────────────────────────────────────────────

function extractMentionedItems(output: JsonObject): string[] {
  const items: string[] = [];
  function scan(obj: unknown): void {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === 'string' && item.length > 2 && item.length < 60) {
          items.push(item);
        } else {
          scan(item);
        }
      }
    } else if (obj && typeof obj === 'object') {
      for (const value of Object.values(obj as Record<string, unknown>)) {
        scan(value);
      }
    }
  }
  const data = output.data;
  if (data && typeof data === 'object') scan(data);
  return [...new Set(items)].slice(0, 80);
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export async function runOrchestrator(
  ctx: OrchestratorContext,
  executor?: WorkerExecutor,
): Promise<OrchestratorResult> {
  const started = Date.now();
  const intent = detectIntent(ctx.userMessage);
  const workerSequence = [...INTENT_WORKER_ROUTES[intent]];
  const lang = ctx.lang ?? 'ro';

  const modelConfig = getDefaultModelConfig();

  const resolvedExecutor: WorkerExecutor =
    executor ?? (modelConfig.apiKey ? createRealWorkerExecutor(modelConfig, lang) : defaultWorkerExecutor);

  const supervisionCtx: SupervisionContext = {
    sessionId: ctx.sessionId,
    userId: ctx.userId ?? undefined,
    intent,
    intolerances: ctx.intolerances ?? [],
    allergies: ctx.allergies ?? [],
    userProfile: ctx.userProfile,
    nutritionalGoals: ctx.nutritionalGoals,
    modelConfig,
  };

  const workerResults: WorkerExecutionRecord[] = [];
  let diversityBlacklist: string[] = [];

  const geoBlock: JsonObject = {};
  if (ctx.country) geoBlock.country = ctx.country;
  if (ctx.region) geoBlock.region = ctx.region;
  if (ctx.culturalCuisine) geoBlock.cuisine = ctx.culturalCuisine;

  let accumulatedContext: JsonObject = {
    sessionId: ctx.sessionId,
    intent,
    lang,
    profile: (ctx.userProfile ?? {}) as JsonObject,
    intolerances: ctx.intolerances ?? [],
    allergies: ctx.allergies ?? [],
    ...(Object.keys(geoBlock).length > 0 ? { geoContext: geoBlock } : {}),
  };

  let hasErrors = false;

  for (const workerId of workerSequence) {
    const workerStart = Date.now();

    const contextWithDiversity: JsonObject = {
      ...accumulatedContext,
      _diversityBlacklist: diversityBlacklist.length > 0 ? diversityBlacklist : [],
    };

    const rawOutput = await resolvedExecutor(workerId, contextWithDiversity, ctx);

    const report = await superviseWorkerExecution(
      workerId,
      contextWithDiversity,
      rawOutput,
      supervisionCtx,
    );

    const totalMs = Date.now() - workerStart;

    workerResults.push({ workerId, supervisionReport: report, totalMs });

    if (report.correctionIncomplete) hasErrors = true;

    // Collect new items for diversity blacklist
    const newItems = extractMentionedItems(report.finalOutput);
    diversityBlacklist = [...new Set([...diversityBlacklist, ...newItems])].slice(0, 150);

    accumulatedContext = {
      ...accumulatedContext,
      [`${workerId}_output`]: report.finalOutput,
    };
  }

  // Build aggregated final response from ALL workers (not just the last one)
  const finalResponse: JsonObject = {
    ...buildFinalResponse(intent, workerResults, lang),
    _orchestratorMeta: {
      intent,
      workerSequence,
      correctedWorkers: workerResults
        .filter((r) => r.supervisionReport.corrected)
        .map((r) => r.workerId),
      totalMs: Date.now() - started,
    },
  };

  logOrchestratorEvent({
    sessionId: ctx.sessionId,
    userId: ctx.userId ?? null,
    intent,
    workerSequence,
    finalResponse,
    executionMs: Date.now() - started,
    error: hasErrors ? { message: 'One or more workers failed validation after correction.' } : null,
  });

  return {
    sessionId: ctx.sessionId,
    intent,
    workerSequence,
    workerResults,
    finalResponse,
    totalMs: Date.now() - started,
    hasErrors,
  };
}
