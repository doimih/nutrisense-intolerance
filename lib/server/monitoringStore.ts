import "server-only";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { monitoringEntries } from "@/lib/db/schema";
import type { CreateMonitoringEntryRequest, MonitoringEntry } from "@/types/monitoring";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function rowToEntry(row: typeof monitoringEntries.$inferSelect): MonitoringEntry {
  return {
    id: row.id,
    userId: row.userId,
    date: row.date,
    mealTime: row.mealTime ?? undefined,
    consumedFoods: row.consumedFoods as string[],
    symptoms: row.symptoms as MonitoringEntry["symptoms"],
    symptomsIntensity: row.symptomsIntensity,
    reactionLatencyMinutes: row.reactionLatencyMinutes ?? null,
    wellbeing: row.wellbeing as 1 | 2 | 3 | 4 | 5,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}

export async function listMonitoringEntriesByUser(email: string): Promise<MonitoringEntry[]> {
  const normalized = normalizeEmail(email);
  const rows = await db.query.monitoringEntries.findMany({
    where: eq(monitoringEntries.userEmail, normalized),
    orderBy: [desc(monitoringEntries.createdAt)],
  });
  return rows.map(rowToEntry);
}

export async function addMonitoringEntryForUser(
  user: { id: string; email: string },
  payload: CreateMonitoringEntryRequest
): Promise<MonitoringEntry> {
  const now = new Date().toISOString();
  const id = `mon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const row = {
    id,
    userId: user.id,
    userEmail: normalizeEmail(user.email),
    date: payload.date,
    mealTime: payload.mealTime ?? null,
    consumedFoods: payload.consumedFoods,
    symptoms: payload.symptoms,
    symptomsIntensity: payload.symptomsIntensity,
    reactionLatencyMinutes: payload.reactionLatencyMinutes ?? null,
    wellbeing: payload.wellbeing,
    notes: payload.notes,
    createdAt: now,
  };

  await db.insert(monitoringEntries).values(row);
  return rowToEntry(row);
}

export async function deleteMonitoringEntriesByUser(email: string): Promise<number> {
  const normalized = normalizeEmail(email);
  const result = await db.delete(monitoringEntries).where(eq(monitoringEntries.userEmail, normalized));
  return result.count;
}
