import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const SESSION_FILE = join(process.cwd(), "data", "visitor-sessions.json");

const VISITOR_SESSION_SECONDS = 15 * 60;    // 15 minutes
const VISITOR_BLOCK_SECONDS   = 24 * 60 * 60; // 24 hours block after session expires

export type FrontendVisitorSession = {
  id: string;
  ip: string;
  sessionStartsAt: string;
  sessionExpiresAt: string;
  blockUntil: string;
  resetBy: string | null;
  resetAt: string | null;
};

function readSessions(): FrontendVisitorSession[] {
  if (!existsSync(SESSION_FILE)) return [];
  try {
    return JSON.parse(readFileSync(SESSION_FILE, "utf8")) as FrontendVisitorSession[];
  } catch {
    return [];
  }
}

function writeSessions(sessions: FrontendVisitorSession[]): void {
  mkdirSync(dirname(SESSION_FILE), { recursive: true });
  writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2), "utf8");
}

function genId(): string {
  return `fvis_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export type VisitorAccessResult =
  | { allowed: true; sessionExpiresAt: string; maxAgeSeconds: number }
  | { allowed: false; reason: "already_active" | "blocked" | "expired_locked"; blockRemainingMinutes?: number };

export function checkAndCreateVisitorSession(ip: string): VisitorAccessResult {
  const sessions = readSessions();
  const existing = sessions.find((s) => s.ip === ip);

  if (existing) {
    const now = Date.now();
    const sessionExpiresAt = new Date(existing.sessionExpiresAt).getTime();
    const blockUntil = new Date(existing.blockUntil).getTime();

    if (now < sessionExpiresAt) {
      return { allowed: false, reason: "already_active" };
    }
    if (now < blockUntil) {
      const blockRemainingMinutes = Math.ceil((blockUntil - now) / 60000);
      return { allowed: false, reason: "blocked", blockRemainingMinutes };
    }
    // Block expired but still locked — needs superadmin reset
    return { allowed: false, reason: "expired_locked" };
  }

  // New IP — create session
  const nowIso = new Date().toISOString();
  const sessionExpiresAt = new Date(Date.now() + VISITOR_SESSION_SECONDS * 1000).toISOString();
  const blockUntil = new Date(
    Date.now() + (VISITOR_SESSION_SECONDS + VISITOR_BLOCK_SECONDS) * 1000,
  ).toISOString();

  const newSession: FrontendVisitorSession = {
    id: genId(),
    ip,
    sessionStartsAt: nowIso,
    sessionExpiresAt,
    blockUntil,
    resetBy: null,
    resetAt: null,
  };

  writeSessions([...sessions, newSession]);

  return { allowed: true, sessionExpiresAt, maxAgeSeconds: VISITOR_SESSION_SECONDS };
}

export function listFrontendVisitorSessions(): Array<
  FrontendVisitorSession & { status: "active" | "blocked" | "expired"; blockRemainingMinutes: number }
> {
  const sessions = readSessions();
  const now = Date.now();
  return sessions.map((s) => {
    const sessionExpiresAt = new Date(s.sessionExpiresAt).getTime();
    const blockUntil = new Date(s.blockUntil).getTime();
    let status: "active" | "blocked" | "expired";
    if (now < sessionExpiresAt) status = "active";
    else if (now < blockUntil) status = "blocked";
    else status = "expired";
    return {
      ...s,
      status,
      blockRemainingMinutes: status === "blocked" ? Math.ceil((blockUntil - now) / 60000) : 0,
    };
  });
}

export function resetFrontendVisitorSessionByIp(ip: string): boolean {
  const sessions = readSessions();
  const filtered = sessions.filter((s) => s.ip !== ip);
  if (filtered.length === sessions.length) return false;
  writeSessions(filtered);
  return true;
}

export function resetFrontendVisitorSessionById(id: string): boolean {
  const sessions = readSessions();
  const filtered = sessions.filter((s) => s.id !== id);
  if (filtered.length === sessions.length) return false;
  writeSessions(filtered);
  return true;
}
