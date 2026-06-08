import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { User } from "@/types/user";
import type { UserRole } from "@/types/user";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
};

const usersByEmail = new Map<string, StoredUser>();

const FRONTEND_SUPERADMIN_EMAIL =
  process.env.FRONTEND_SUPERADMIN_EMAIL?.trim().toLowerCase() || "design@doimih.net";
const FRONTEND_SUPERADMIN_PASSWORD =
  process.env.FRONTEND_SUPERADMIN_PASSWORD || "PassTemp123!";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicUser(stored: StoredUser): User {
  return {
    id: stored.id,
    name: stored.name,
    email: stored.email,
    role: stored.role,
    createdAt: stored.createdAt,
    updatedAt: stored.updatedAt,
  };
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function seedUser(input: {
  id: string;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}) {
  const email = normalizeEmail(input.email);
  if (usersByEmail.has(email)) return;

  const nowIso = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");
  const stored: StoredUser = {
    id: input.id,
    name: input.name.trim(),
    email,
    role: input.role ?? "user",
    passwordHash: hashPassword(input.password, salt),
    salt,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  usersByEmail.set(email, stored);
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
}): User {
  const email = normalizeEmail(input.email);
  if (usersByEmail.has(email)) {
    throw new Error("An account with this email already exists.");
  }

  const nowIso = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");

  const stored: StoredUser = {
    id: `usr_${Date.now()}_${randomBytes(4).toString("hex")}`,
    name: input.name.trim(),
    email,
    role: "user",
    passwordHash: hashPassword(input.password, salt),
    salt,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  usersByEmail.set(email, stored);
  return toPublicUser(stored);
}

export function authenticateUser(email: string, password: string): User | null {
  const normalizedEmail = normalizeEmail(email);
  const stored = usersByEmail.get(normalizedEmail);
  if (!stored) return null;

  const computed = Buffer.from(hashPassword(password, stored.salt), "hex");
  const expected = Buffer.from(stored.passwordHash, "hex");
  if (computed.length !== expected.length) return null;

  if (!timingSafeEqual(computed, expected)) return null;
  return toPublicUser(stored);
}

// Bootstrap a stable account for local sign-in on the frontend app.
seedUser({
  id: "usr_frontend_superadmin",
  name: "NutriSense Admin",
  email: FRONTEND_SUPERADMIN_EMAIL,
  password: FRONTEND_SUPERADMIN_PASSWORD,
  role: "superadmin",
});
