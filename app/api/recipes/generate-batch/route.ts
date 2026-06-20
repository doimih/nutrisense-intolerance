import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import {
  searchRecipes,
  insertRecipe,
  createBatch,
  updateBatch,
  countRecipes,
} from "@/lib/server/recipeStore";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";
import {
  buildBatchGeneratorPrompt,
  buildInstructionWorkerPrompt,
  parseBatchGeneratorResponse,
  parseInstructionWorkerResponse,
  validateRecipeItem,
} from "@/lib/server/recipes/workers";
import type { RecipeCategory, RecipeDifficulty } from "@/types/recipes";

export const runtime = "nodejs";
export const maxDuration = 300;

type RawRecipeItem = {
  title_en?: string;
  title_ro?: string;
  category?: string;
  ingredients_en?: { name: string; quantity: string; unit: string }[];
  ingredients_ro?: { name: string; quantity: string; unit: string }[];
  prep_time_minutes?: number;
  difficulty?: string;
  calories?: number;
  macros?: { protein: number; carbs: number; fats: number };
  cuisine?: string;
  tags_en?: string[];
  tags_ro?: string[];
  allergens?: string[];
  substitutions_en?: { for: string; substitute_with: string; note: string }[];
  substitutions_ro?: { for: string; substitute_with: string; note: string }[];
};

const VALID_CATEGORIES: RecipeCategory[] = ["breakfast", "lunch", "dinner", "snack"];
const VALID_DIFFICULTIES: RecipeDifficulty[] = ["easy", "medium", "hard"];

async function callOrchestratorForRecipes(
  prompt: string,
  backendUrl: string
): Promise<string | null> {
  const internalSecret = process.env.INTERNAL_SYNC_SECRET;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-nutriaid-source": "recipe-batch-worker",
  };
  if (internalSecret) headers["x-internal-secret"] = internalSecret;

  try {
    const response = await fetch(`${backendUrl}/api/public/guidance/orchestrate`, {
      method: "POST",
      cache: "no-store",
      headers,
      body: JSON.stringify({
        sessionId: `recipe_batch_${Date.now()}`,
        userMessage: prompt,
        lang: "en",
        intent: "recipe_generation",
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) return null;

    const payload = await response.json().catch(() => null);
    if (!payload) return null;

    // Extract the raw text content from orchestrator response
    const candidates = [
      payload?.result?.rawText,
      payload?.orchestrator?.finalResponse?.rawText,
      payload?.orchestrator?.finalResponse?.data,
      payload?.finalResponse?.rawText,
      JSON.stringify(payload?.result),
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim().length > 10) return candidate;
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = authCookie ? await readSessionToken(authCookie) : null;

  // Only superadmin or internal secret can trigger batch generation
  const internalSecret = request.headers.get("x-internal-secret");
  const validInternal = internalSecret && internalSecret === process.env.INTERNAL_SYNC_SECRET;
  const isSuperadmin = session?.user?.role === "superadmin";

  if (!validInternal && !isSuperadmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  let body: { batchSize?: number; cuisineHints?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    // default body
  }

  const batchSize = Math.min(Math.max(Number(body.batchSize ?? 10), 1), 50);
  const cuisineHints = Array.isArray(body.cuisineHints) ? body.cuisineHints : [];

  const settings = await getRuntimeSettings();
  const backendUrl = (
    process.env.BACKEND_INTERNAL_URL ||
    settings.backendUrl
  )?.replace(/\/$/, "");

  if (!backendUrl) {
    return NextResponse.json({ error: "Backend orchestrator not configured." }, { status: 503 });
  }

  // Fetch existing titles to avoid duplication
  const existing = await searchRecipes({ lang: "en", limit: 200 });
  const existingTitles = existing.map((r) => r.titleEn);

  const batchId = await createBatch(batchSize);
  let generatedCount = 0;

  const skippedCount: { title: string; reasons: string[] }[] = [];
  const MAX_RETRIES = 2;

  try {
    // Worker 1: RecipeBatchGeneratorWorker — generate recipe shells
    const batchPrompt = buildBatchGeneratorPrompt({
      batchSize,
      existingTitles,
      cuisineHints: cuisineHints.length > 0 ? cuisineHints : undefined,
    });

    const rawBatch = await callOrchestratorForRecipes(batchPrompt, backendUrl);
    const items = rawBatch ? parseBatchGeneratorResponse(rawBatch) : null;

    if (!items || items.length === 0) {
      await updateBatch(batchId, 0, "failed");
      return NextResponse.json({ error: "Batch generator returned no items.", batchId }, { status: 502 });
    }

    for (const rawItem of items) {
      const item = rawItem as RawRecipeItem;
      if (!item.title_en || !item.title_ro) continue;

      const category = VALID_CATEGORIES.includes(item.category as RecipeCategory)
        ? (item.category as RecipeCategory)
        : "lunch";
      const difficulty = VALID_DIFFICULTIES.includes(item.difficulty as RecipeDifficulty)
        ? (item.difficulty as RecipeDifficulty)
        : "easy";

      const ingredientsEn = Array.isArray(item.ingredients_en) ? item.ingredients_en : [];
      const ingredientsRo = Array.isArray(item.ingredients_ro) ? item.ingredients_ro : [];

      // Worker 2: RecipeInstructionWorker — generate step-by-step instructions (with retry)
      let instructionsEn: { step_index: number; text: string }[] = [];
      let instructionsRo: { step_index: number; text: string }[] = [];
      let substitutionsEn = item.substitutions_en ?? [];
      let substitutionsRo = item.substitutions_ro ?? [];
      let cookingTipsEn: string[] = [];
      let cookingTipsRo: string[] = [];

      let instrParsed = null;
      for (let attempt = 0; attempt < MAX_RETRIES && !instrParsed; attempt++) {
        const instrPrompt = buildInstructionWorkerPrompt({
          titleEn: item.title_en,
          titleRo: item.title_ro,
          ingredientsEn,
          ingredientsRo,
          prepTimeMinutes: item.prep_time_minutes ?? 20,
          difficulty,
        });
        const rawInstructions = await callOrchestratorForRecipes(instrPrompt, backendUrl);
        instrParsed = rawInstructions ? parseInstructionWorkerResponse(rawInstructions) : null;
      }

      if (instrParsed) {
        instructionsEn = instrParsed.instructions_en;
        instructionsRo = instrParsed.instructions_ro;
        substitutionsEn = instrParsed.substitutions_en.length > 0 ? instrParsed.substitutions_en : substitutionsEn;
        substitutionsRo = instrParsed.substitutions_ro.length > 0 ? instrParsed.substitutions_ro : substitutionsRo;
        cookingTipsEn = instrParsed.cooking_tips_en;
        cookingTipsRo = instrParsed.cooking_tips_ro;
      }

      // Worker 3: RecipeValidatorWorker — validate before saving
      const validation = validateRecipeItem({
        title_en: item.title_en,
        title_ro: item.title_ro,
        ingredients_en: ingredientsEn,
        ingredients_ro: ingredientsRo,
        instructions_en: instructionsEn,
        instructions_ro: instructionsRo,
        calories: item.calories,
        macros: item.macros,
        prep_time_minutes: item.prep_time_minutes,
      });

      if (!validation.valid) {
        skippedCount.push({ title: item.title_en, reasons: validation.reasons });
        continue;
      }

      await insertRecipe({
        id: `recipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        titleEn: item.title_en,
        titleRo: item.title_ro,
        category,
        ingredientsEn,
        ingredientsRo,
        instructionsEn,
        instructionsRo,
        prepTimeMinutes: item.prep_time_minutes ?? 20,
        difficulty,
        calories: item.calories ?? null,
        macros: item.macros ?? null,
        cuisine: item.cuisine ?? null,
        tagsEn: item.tags_en ?? null,
        tagsRo: item.tags_ro ?? null,
        allergens: item.allergens ?? null,
        substitutionsEn: substitutionsEn.length > 0 ? substitutionsEn : null,
        substitutionsRo: substitutionsRo.length > 0 ? substitutionsRo : null,
        cookingTipsEn: cookingTipsEn.length > 0 ? cookingTipsEn : null,
        cookingTipsRo: cookingTipsRo.length > 0 ? cookingTipsRo : null,
        imageUrl: null,
      });

      generatedCount += 1;
      await updateBatch(batchId, generatedCount, "running");
    }

    await updateBatch(batchId, generatedCount, "completed");

    const totalCount = await countRecipes();

    return NextResponse.json({
      batchId,
      generatedCount,
      skipped: skippedCount.length,
      skippedDetails: skippedCount,
      totalRecipes: totalCount,
      status: "completed",
    });
  } catch (err) {
    await updateBatch(batchId, generatedCount, "failed");
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg, batchId, generatedCount }, { status: 500 });
  }
}
