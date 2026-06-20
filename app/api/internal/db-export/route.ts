import { NextRequest, NextResponse } from "next/server";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const runtime = "nodejs";

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return false;
  try {
    const settings = await getRuntimeSettings();
    return !!(settings.internalEmailToken && token === settings.internalEmailToken);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      users,
      userProfiles,
      monitoringEntries,
      guidanceHistory,
      subscriptions,
      userProblems,
      recipes,
      recipeBatches,
      recipeUsage,
    ] = await Promise.all([
      db.select().from(schema.users),
      db.select().from(schema.userProfiles),
      db.select().from(schema.monitoringEntries),
      db.select().from(schema.guidanceHistory),
      db.select().from(schema.subscriptions),
      db.select().from(schema.userProblems),
      db.select().from(schema.recipes),
      db.select().from(schema.recipeBatches),
      db.select().from(schema.recipeUsage),
    ]);

    const dump = {
      exportedAt: new Date().toISOString(),
      tables: {
        users: users.map((u) => ({ ...u, passwordHash: "[REDACTED]", salt: "[REDACTED]" })),
        user_profiles: userProfiles,
        monitoring_entries: monitoringEntries,
        guidance_history: guidanceHistory,
        subscriptions,
        user_problems: userProblems,
        recipes,
        recipe_batches: recipeBatches,
        recipe_usage: recipeUsage,
      },
      rowCounts: {
        users: users.length,
        user_profiles: userProfiles.length,
        monitoring_entries: monitoringEntries.length,
        guidance_history: guidanceHistory.length,
        subscriptions: subscriptions.length,
        user_problems: userProblems.length,
        recipes: recipes.length,
        recipe_batches: recipeBatches.length,
        recipe_usage: recipeUsage.length,
      },
    };

    return NextResponse.json(dump);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `DB export failed: ${message}` }, { status: 500 });
  }
}
