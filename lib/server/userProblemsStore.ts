import "server-only";
import { eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { userProblems } from "@/lib/db/schema";

export type UserProblem = {
  id: string;
  userEmail: string;
  symptoms: string[];
  triggers: string[];
  mealPatterns: MealPattern[];
  severity: number;
  successfulAdjustments: string[];
  improvementNotes: string;
  source: "manual" | "ai_derived";
  createdAt: string;
  updatedAt: string;
};

export type MealPattern = {
  foods: string[];
  timeOfDay: string;
  dayOfWeek?: number;
};

export type DatabasePatterns = {
  similarCases: SimilarCase[];
  commonTriggers: string[];
  commonIngredients: string[];
  successfulAdjustments: string[];
  improvementPatterns: string[];
};

export type SimilarCase = {
  symptoms: string[];
  triggers: string[];
  successfulAdjustments: string[];
  severity: number;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function rowToProblem(row: typeof userProblems.$inferSelect): UserProblem {
  return {
    id: row.id,
    userEmail: row.userEmail,
    symptoms: row.symptoms as string[],
    triggers: row.triggers as string[],
    mealPatterns: row.mealPatterns as MealPattern[],
    severity: row.severity,
    successfulAdjustments: row.successfulAdjustments as string[],
    improvementNotes: row.improvementNotes,
    source: row.source as "manual" | "ai_derived",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function countOccurrences(items: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  return counts;
}

function topN(counts: Map<string, number>, n = 10): string[] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([item]) => item);
}

export async function getUserProblem(email: string): Promise<UserProblem | null> {
  const normalized = normalizeEmail(email);
  const row = await db.query.userProblems.findFirst({
    where: eq(userProblems.userEmail, normalized),
  });
  return row ? rowToProblem(row) : null;
}

export async function upsertUserProblem(problem: Omit<UserProblem, "id" | "createdAt" | "updatedAt">): Promise<UserProblem> {
  const normalized = normalizeEmail(problem.userEmail);
  const now = new Date().toISOString();
  const existing = await db.query.userProblems.findFirst({
    where: eq(userProblems.userEmail, normalized),
  });

  const id = existing?.id ?? `prob_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const data = {
    id,
    userEmail: normalized,
    symptoms: problem.symptoms as unknown as object[],
    triggers: problem.triggers as unknown as object[],
    mealPatterns: problem.mealPatterns as unknown as object[],
    severity: problem.severity,
    successfulAdjustments: problem.successfulAdjustments as unknown as object[],
    improvementNotes: problem.improvementNotes,
    source: problem.source,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) {
    await db.update(userProblems).set(data).where(eq(userProblems.userEmail, normalized));
  } else {
    await db.insert(userProblems).values(data);
  }

  return { ...problem, id, createdAt: data.createdAt, updatedAt: now };
}

// Mine patterns from all OTHER users' problems to enhance AI orchestrator context
export async function mineSimilarPatterns(
  userEmail: string,
  symptoms: string[],
  foods: string[]
): Promise<DatabasePatterns> {
  const normalized = normalizeEmail(userEmail);

  // Get all problems EXCEPT the current user's (cross-user pattern mining)
  const rows = await db.query.userProblems.findMany({
    where: ne(userProblems.userEmail, normalized),
  });

  if (rows.length === 0) {
    return {
      similarCases: [],
      commonTriggers: [],
      commonIngredients: [],
      successfulAdjustments: [],
      improvementPatterns: [],
    };
  }

  const allProblems = rows.map(rowToProblem);

  // Find similar cases: problems with overlapping symptoms
  const similarCases: SimilarCase[] = allProblems
    .filter((p) => p.symptoms.some((s) => symptoms.includes(s)))
    .slice(0, 20)
    .map((p) => ({
      symptoms: p.symptoms,
      triggers: p.triggers,
      successfulAdjustments: p.successfulAdjustments,
      severity: p.severity,
    }));

  // Aggregate common triggers across all similar cases
  const triggerCounts = countOccurrences(
    similarCases.flatMap((c) => c.triggers)
  );

  // Find common ingredients that appear as triggers
  const allFoodsFromPatterns = allProblems.flatMap((p) =>
    p.mealPatterns.flatMap((m) => m.foods)
  );
  const ingredientCounts = countOccurrences(
    allFoodsFromPatterns.filter((f) =>
      foods.some((uf) => f.toLowerCase().includes(uf.toLowerCase()) || uf.toLowerCase().includes(f.toLowerCase()))
    )
  );

  // Aggregate successful adjustments from similar cases
  const adjustmentCounts = countOccurrences(
    similarCases.flatMap((c) => c.successfulAdjustments)
  );

  // Improvement patterns from all problems with improvement notes
  const improvementPatterns = allProblems
    .filter((p) => p.improvementNotes.trim().length > 10)
    .slice(0, 5)
    .map((p) => p.improvementNotes);

  return {
    similarCases: similarCases.slice(0, 10),
    commonTriggers: topN(triggerCounts, 8),
    commonIngredients: topN(ingredientCounts, 8),
    successfulAdjustments: topN(adjustmentCounts, 8),
    improvementPatterns,
  };
}

export async function deleteUserProblem(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  await db.delete(userProblems).where(eq(userProblems.userEmail, normalized));
}

// Derive and auto-save a user's problem profile from their monitoring entries
export async function deriveUserProblemFromMonitoring(
  userEmail: string,
  monitoringEntries: Array<{
    symptoms: string[];
    consumedFoods: string[];
    symptomsIntensity: number;
    mealTime?: string | null;
  }>
): Promise<void> {
  if (monitoringEntries.length < 3) return; // Need at least 3 entries for a meaningful pattern

  const allSymptoms = monitoringEntries.flatMap((e) => e.symptoms);
  const allFoods = monitoringEntries.flatMap((e) => e.consumedFoods);

  const symptomCounts = countOccurrences(allSymptoms);
  const foodCounts = countOccurrences(allFoods);

  // Recurring symptoms (appear in >30% of entries)
  const threshold = Math.max(1, Math.floor(monitoringEntries.length * 0.3));
  const recurringSymptoms = Array.from(symptomCounts.entries())
    .filter(([, count]) => count >= threshold)
    .map(([symptom]) => symptom);

  // Potential trigger foods (foods that appear with symptoms)
  const symptomatic = monitoringEntries.filter((e) => e.symptoms.length > 0);
  const triggerFoodCounts = countOccurrences(symptomatic.flatMap((e) => e.consumedFoods));
  const triggerFoods = topN(triggerFoodCounts, 5);

  const avgSeverity = monitoringEntries.reduce((sum, e) => sum + e.symptomsIntensity, 0) / monitoringEntries.length;

  // Meal pattern extraction
  const mealPatterns: MealPattern[] = [
    {
      foods: topN(foodCounts, 10),
      timeOfDay: "varied",
    },
  ];

  await upsertUserProblem({
    userEmail,
    symptoms: recurringSymptoms,
    triggers: triggerFoods,
    mealPatterns,
    severity: Math.round(avgSeverity),
    successfulAdjustments: [],
    improvementNotes: "",
    source: "ai_derived",
  });
}
