import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { getRecipeById, recordRecipeUsage } from "@/lib/server/recipeStore";

export const runtime = "nodejs";

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

  void recordRecipeUsage(recipe.id, session.user.id, "cooking_mode").catch(() => {});

  return NextResponse.json({
    id: recipe.id,
    title: lang === "ro" ? recipe.titleRo : recipe.titleEn,
    steps: lang === "ro" ? recipe.instructionsRo : recipe.instructionsEn,
    ingredients: lang === "ro" ? recipe.ingredientsRo : recipe.ingredientsEn,
    substitutions: lang === "ro" ? recipe.substitutionsRo : recipe.substitutionsEn,
    cookingTips: lang === "ro" ? recipe.cookingTipsRo : recipe.cookingTipsEn,
    prepTimeMinutes: recipe.prepTimeMinutes,
    difficulty: recipe.difficulty,
    allergens: recipe.allergens,
  });
}
