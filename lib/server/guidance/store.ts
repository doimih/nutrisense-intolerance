import "server-only";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { guidanceHistory } from "@/lib/db/schema";
import type { GuidanceDb, GuidanceHistoryRecord } from "@/lib/server/guidance/types";

void (null as unknown as GuidanceDb); // keep import for type compat

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function rowToRecord(row: typeof guidanceHistory.$inferSelect): GuidanceHistoryRecord {
  return {
    id: row.id,
    userEmail: row.userEmail,
    generatedAt: row.generatedAt,
    source: row.source as "ai" | "fallback",
    requestFingerprint: row.requestFingerprint,
    prompt: row.prompt,
    monitoringEntries: row.monitoringEntries as GuidanceHistoryRecord["monitoringEntries"],
    result: row.result as GuidanceHistoryRecord["result"],
  };
}

export async function appendGuidanceRecord(record: GuidanceHistoryRecord): Promise<void> {
  await db.insert(guidanceHistory).values({
    id: record.id,
    userEmail: normalizeEmail(record.userEmail),
    generatedAt: record.generatedAt,
    source: record.source,
    requestFingerprint: record.requestFingerprint,
    prompt: record.prompt,
    monitoringEntries: record.monitoringEntries as object[],
    result: record.result as object,
  });
}

export async function listGuidanceByUser(email: string): Promise<GuidanceHistoryRecord[]> {
  const normalized = normalizeEmail(email);
  const rows = await db.query.guidanceHistory.findMany({
    where: eq(guidanceHistory.userEmail, normalized),
    orderBy: [desc(guidanceHistory.generatedAt)],
  });
  return rows.map(rowToRecord);
}

export async function getGuidanceByIdForUser(email: string, id: string): Promise<GuidanceHistoryRecord | null> {
  const normalized = normalizeEmail(email);
  const rows = await db.query.guidanceHistory.findMany({
    where: eq(guidanceHistory.userEmail, normalized),
  });
  const match = rows.find(
    (row) => (row.id === id || (row.result as { id?: string })?.id === id)
  );
  return match ? rowToRecord(match) : null;
}

export async function deleteGuidanceByIdForUser(email: string, id: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const rows = await db.query.guidanceHistory.findMany({
    where: eq(guidanceHistory.userEmail, normalized),
  });
  const match = rows.find(
    (row) => (row.id === id || (row.result as { id?: string })?.id === id)
  );
  if (!match) return false;
  await db.delete(guidanceHistory).where(eq(guidanceHistory.id, match.id));
  return true;
}

export async function deleteAllGuidanceForUser(email: string): Promise<number> {
  const normalized = normalizeEmail(email);
  const result = await db.delete(guidanceHistory).where(eq(guidanceHistory.userEmail, normalized));
  return result.count;
}
