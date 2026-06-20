import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { getAllRecipesForValidation, deleteRecipeById } from "@/lib/server/recipeStore";
import { validateRecipeItem } from "@/lib/server/recipes/workers";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = authCookie ? await readSessionToken(authCookie) : null;

  const internalSecret = request.headers.get("x-internal-secret");
  const validInternal = internalSecret && internalSecret === process.env.INTERNAL_SYNC_SECRET;
  const isSuperadmin = session?.user?.role === "superadmin";

  if (!validInternal && !isSuperadmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({})) as { dryRun?: boolean };
  const dryRun = body.dryRun !== false; // default: dry run (safe)

  const allRecipes = await getAllRecipesForValidation();
  const invalid: { id: string; titleEn: string; reasons: string[] }[] = [];

  for (const recipe of allRecipes) {
    const result = validateRecipeItem({
      title_en: recipe.titleEn,
      title_ro: recipe.titleRo,
      ingredients_en: recipe.ingredientsEn,
      ingredients_ro: recipe.ingredientsRo,
      instructions_en: recipe.instructionsEn,
      instructions_ro: recipe.instructionsRo,
      calories: recipe.calories ?? undefined,
      macros: recipe.macros ?? undefined,
      prep_time_minutes: recipe.prepTimeMinutes,
    });

    if (!result.valid) {
      invalid.push({ id: recipe.id, titleEn: recipe.titleEn, reasons: result.reasons });
    }
  }

  if (!dryRun) {
    for (const r of invalid) {
      await deleteRecipeById(r.id).catch(() => undefined);
    }
  }

  return NextResponse.json({
    total: allRecipes.length,
    invalidCount: invalid.length,
    validCount: allRecipes.length - invalid.length,
    dryRun,
    deleted: dryRun ? 0 : invalid.length,
    invalid: invalid.slice(0, 50),
  });
}
