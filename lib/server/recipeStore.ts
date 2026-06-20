import "server-only";
import { db } from "@/lib/db";
import { recipes, recipeBatches, recipeUsage } from "@/lib/db/schema";
import { eq, sql, and, ilike, or } from "drizzle-orm";
import type { Recipe, RecipeCategory, RecipeDifficulty, RecipeSearchParams } from "@/types/recipes";

function rowToRecipe(row: typeof recipes.$inferSelect): Recipe {
  return {
    id: row.id,
    titleRo: row.titleRo,
    titleEn: row.titleEn,
    category: row.category as RecipeCategory,
    ingredientsRo: (row.ingredientsRo as Recipe["ingredientsRo"]) ?? [],
    ingredientsEn: (row.ingredientsEn as Recipe["ingredientsEn"]) ?? [],
    instructionsRo: (row.instructionsRo as Recipe["instructionsRo"]) ?? [],
    instructionsEn: (row.instructionsEn as Recipe["instructionsEn"]) ?? [],
    prepTimeMinutes: row.prepTimeMinutes,
    difficulty: row.difficulty as RecipeDifficulty,
    calories: row.calories ?? null,
    macros: (row.macros as Recipe["macros"]) ?? null,
    cuisine: row.cuisine ?? null,
    tagsRo: (row.tagsRo as string[] | null) ?? null,
    tagsEn: (row.tagsEn as string[] | null) ?? null,
    allergens: (row.allergens as string[] | null) ?? null,
    substitutionsRo: (row.substitutionsRo as Recipe["substitutionsRo"]) ?? null,
    substitutionsEn: (row.substitutionsEn as Recipe["substitutionsEn"]) ?? null,
    cookingTipsRo: (row.cookingTipsRo as string[] | null) ?? null,
    cookingTipsEn: (row.cookingTipsEn as string[] | null) ?? null,
    imageUrl: row.imageUrl ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const rows = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1);
  return rows[0] ? rowToRecipe(rows[0]) : null;
}

export async function searchRecipes(params: RecipeSearchParams): Promise<Recipe[]> {
  const limit = Math.min(params.limit ?? 20, 100);
  const offset = params.offset ?? 0;

  const conditions = [];

  if (params.category) {
    conditions.push(eq(recipes.category, params.category));
  }

  if (params.difficulty) {
    conditions.push(eq(recipes.difficulty, params.difficulty));
  }

  if (params.maxPrepTime) {
    conditions.push(sql`${recipes.prepTimeMinutes} <= ${params.maxPrepTime}`);
  }

  if (params.cuisine) {
    conditions.push(ilike(recipes.cuisine, `%${params.cuisine}%`));
  }

  if (params.query) {
    const q = `%${params.query}%`;
    if (params.lang === "ro") {
      conditions.push(ilike(recipes.titleRo, q));
    } else {
      conditions.push(ilike(recipes.titleEn, q));
    }
  }

  if (params.allergenFree && params.allergenFree.length > 0) {
    for (const allergen of params.allergenFree) {
      conditions.push(
        sql`NOT (${recipes.allergens}::jsonb @> ${JSON.stringify([allergen])}::jsonb)`
      );
    }
  }

  const rows = await db
    .select()
    .from(recipes)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(recipes.createdAt);

  return rows.map(rowToRecipe);
}

export async function insertRecipe(recipe: Omit<Recipe, "createdAt" | "updatedAt">): Promise<Recipe> {
  const now = new Date().toISOString();
  const rows = await db
    .insert(recipes)
    .values({
      id: recipe.id,
      titleRo: recipe.titleRo,
      titleEn: recipe.titleEn,
      category: recipe.category,
      ingredientsRo: recipe.ingredientsRo,
      ingredientsEn: recipe.ingredientsEn,
      instructionsRo: recipe.instructionsRo,
      instructionsEn: recipe.instructionsEn,
      prepTimeMinutes: recipe.prepTimeMinutes,
      difficulty: recipe.difficulty,
      calories: recipe.calories,
      macros: recipe.macros,
      cuisine: recipe.cuisine,
      tagsRo: recipe.tagsRo,
      tagsEn: recipe.tagsEn,
      allergens: recipe.allergens,
      substitutionsRo: recipe.substitutionsRo,
      substitutionsEn: recipe.substitutionsEn,
      cookingTipsRo: recipe.cookingTipsRo,
      cookingTipsEn: recipe.cookingTipsEn,
      imageUrl: recipe.imageUrl,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return rowToRecipe(rows[0]);
}

export async function countRecipes(): Promise<number> {
  const result = await db.select({ count: sql<number>`count(*)` }).from(recipes);
  return Number(result[0]?.count ?? 0);
}

export async function deleteRecipeById(id: string): Promise<void> {
  await db.delete(recipes).where(eq(recipes.id, id));
}

export async function getAllRecipesForValidation(): Promise<Recipe[]> {
  const rows = await db.select().from(recipes).orderBy(recipes.createdAt);
  return rows.map(rowToRecipe);
}

export async function createBatch(targetCount: number): Promise<number> {
  const existing = await db
    .select({ count: sql<number>`count(*)` })
    .from(recipeBatches);
  const batchNumber = Number(existing[0]?.count ?? 0) + 1;
  const now = new Date().toISOString();

  const rows = await db
    .insert(recipeBatches)
    .values({
      batchNumber,
      targetCount,
      generatedCount: 0,
      status: "running",
      startedAt: now,
      finishedAt: null,
    })
    .returning();

  return rows[0].id;
}

export async function updateBatch(
  id: number,
  generatedCount: number,
  status: "running" | "completed" | "failed"
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .update(recipeBatches)
    .set({
      generatedCount,
      status,
      finishedAt: status !== "running" ? now : null,
    })
    .where(eq(recipeBatches.id, id));
}

export async function recordRecipeUsage(
  recipeId: string,
  userId: string,
  context: string
): Promise<void> {
  await db.insert(recipeUsage).values({
    recipeId,
    userId,
    usedAt: new Date().toISOString(),
    context,
  });
}

export async function getRandomRecipes(
  category: RecipeCategory,
  allergenFree: string[],
  limit: number
): Promise<Recipe[]> {
  const conditions = [eq(recipes.category, category)];

  for (const allergen of allergenFree) {
    conditions.push(
      sql`NOT (${recipes.allergens}::jsonb @> ${JSON.stringify([allergen])}::jsonb)`
    );
  }

  const rows = await db
    .select()
    .from(recipes)
    .where(and(...conditions))
    .orderBy(sql`RANDOM()`)
    .limit(limit);

  return rows.map(rowToRecipe);
}
