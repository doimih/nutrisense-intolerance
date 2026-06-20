import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { getRecipeById, recordRecipeUsage } from "@/lib/server/recipeStore";
import type { RecipeLocalized } from "@/types/recipes";
import type { Recipe } from "@/types/recipes";

export const runtime = "nodejs";

function localizeRecipe(recipe: Recipe, lang: "ro" | "en"): RecipeLocalized {
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = authCookie ? await readSessionToken(authCookie) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const lang = (request.nextUrl.searchParams.get("lang") === "en" ? "en" : "ro") as "ro" | "en";
  const recipe = await getRecipeById(params.id);

  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  }

  void recordRecipeUsage(recipe.id, session.user.id, "browse").catch(() => {});

  return NextResponse.json({ recipe: localizeRecipe(recipe, lang) });
}
