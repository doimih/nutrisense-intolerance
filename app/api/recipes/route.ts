import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { searchRecipes } from "@/lib/server/recipeStore";
import type { RecipeCategory, RecipeDifficulty, RecipeLocalized } from "@/types/recipes";

export const runtime = "nodejs";

function localizeRecipe(recipe: Awaited<ReturnType<typeof searchRecipes>>[number], lang: "ro" | "en"): RecipeLocalized {
  return {
    id: recipe.id,
    title: lang === "ro" ? recipe.titleRo : recipe.titleEn,
    category: recipe.category,
    ingredients: lang === "ro" ? recipe.ingredientsRo : recipe.ingredientsEn,
    instructions: lang === "ro" ? recipe.instructionsRo : recipe.instructionsEn,
    prepTimeMinutes: recipe.prepTimeMinutes,
    difficulty: recipe.difficulty,
    calories: recipe.calories,
    macros: recipe.macros,
    cuisine: recipe.cuisine,
    tags: lang === "ro" ? recipe.tagsRo : recipe.tagsEn,
    allergens: recipe.allergens,
    substitutions: lang === "ro" ? recipe.substitutionsRo : recipe.substitutionsEn,
    cookingTips: lang === "ro" ? recipe.cookingTipsRo : recipe.cookingTipsEn,
    imageUrl: recipe.imageUrl,
  };
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = authCookie ? await readSessionToken(authCookie) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const lang = (searchParams.get("lang") === "en" ? "en" : "ro") as "ro" | "en";
  const category = searchParams.get("category") as RecipeCategory | null;
  const difficulty = searchParams.get("difficulty") as RecipeDifficulty | null;
  const cuisine = searchParams.get("cuisine") ?? undefined;
  const query = searchParams.get("q") ?? undefined;
  const maxPrepTime = searchParams.get("maxPrepTime") ? Number(searchParams.get("maxPrepTime")) : undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 100);
  const offset = Number(searchParams.get("offset") ?? "0");
  const allergenFreeRaw = searchParams.get("allergenFree");
  const allergenFree = allergenFreeRaw ? allergenFreeRaw.split(",").filter(Boolean) : undefined;

  const results = await searchRecipes({
    lang,
    category: category ?? undefined,
    difficulty: difficulty ?? undefined,
    cuisine,
    query,
    maxPrepTime,
    allergenFree,
    limit,
    offset,
  });

  return NextResponse.json({
    recipes: results.map((r) => localizeRecipe(r, lang)),
    count: results.length,
    offset,
  });
}
