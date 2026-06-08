import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { GuidanceDb, GuidanceHistoryRecord } from "@/lib/server/guidance/types";

const DB_PATH = join(process.cwd(), "data", "guidance-db.json");

function seedDb(): GuidanceDb {
  return { history: [] };
}

function ensureDb(): void {
  if (existsSync(DB_PATH)) return;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  writeFileSync(DB_PATH, JSON.stringify(seedDb(), null, 2), "utf8");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readDb(): GuidanceDb {
  ensureDb();
  return JSON.parse(readFileSync(DB_PATH, "utf8")) as GuidanceDb;
}

function writeDb(next: GuidanceDb): void {
  ensureDb();
  writeFileSync(DB_PATH, JSON.stringify(next, null, 2), "utf8");
}

export function appendGuidanceRecord(record: GuidanceHistoryRecord): void {
  const db = readDb();
  db.history.unshift(record);
  db.history = db.history.slice(0, 5000);
  writeDb(db);
}

export function listGuidanceByUser(email: string): GuidanceHistoryRecord[] {
  const normalized = normalizeEmail(email);
  return readDb().history.filter((item) => normalizeEmail(item.userEmail) === normalized);
}

export function getGuidanceByIdForUser(email: string, id: string): GuidanceHistoryRecord | null {
  const normalized = normalizeEmail(email);
  return (
    readDb().history.find(
      (item) =>
        (item.id === id || item.result.id === id) &&
        normalizeEmail(item.userEmail) === normalized
    ) || null
  );
}

export function deleteGuidanceByIdForUser(email: string, id: string): boolean {
  const normalized = normalizeEmail(email);
  const db = readDb();
  const before = db.history.length;
  db.history = db.history.filter(
    (item) =>
      !(
        (item.id === id || item.result.id === id) &&
        normalizeEmail(item.userEmail) === normalized
      )
  );
  writeDb(db);
  return db.history.length < before;
}

export function deleteAllGuidanceForUser(email: string): number {
  const normalized = normalizeEmail(email);
  const db = readDb();
  const before = db.history.length;
  db.history = db.history.filter((item) => normalizeEmail(item.userEmail) !== normalized);
  writeDb(db);
  return before - db.history.length;
}
