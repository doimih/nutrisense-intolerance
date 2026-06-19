import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { eq, and, ne, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens, passwordResetTokens } from "@/lib/db/schema";
import type { User } from "@/types/user";
import type { UserRole } from "@/types/user";

export type AuthPlanCode = "basic" | "pro" | "pro_plus";

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const EARLY_ADOPTER_LIMIT = 50;
// Pre-seed offset — testimonials on homepage represent existing users
const EARLY_ADOPTER_SEED = 12;

const FRONTEND_SUPERADMIN_EMAIL = (
  process.env.FRONTEND_SUPERADMIN_EMAIL || "design@doimih.net"
).trim().toLowerCase();
const FRONTEND_SUPERADMIN_PASSWORD =
  process.env.FRONTEND_SUPERADMIN_PASSWORD || "PassTemp123!";

export const FRONTEND_VISITOR_EMAIL = "visitor@nutriaid.eu";
export const FRONTEND_VISITOR_ID = "usr_frontend_visitor";
const FRONTEND_VISITOR_PASSWORD = "NutriDemo@2025!";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function toPublicUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    isVerified: row.isVerified,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function ensureSeededSuperadmin(): Promise<void> {
  const email = FRONTEND_SUPERADMIN_EMAIL;
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return;

  const nowIso = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");
  await db.insert(users).values({
    id: "usr_frontend_superadmin",
    name: "NutriAID Admin",
    email,
    role: "superadmin",
    passwordHash: hashPassword(FRONTEND_SUPERADMIN_PASSWORD, salt),
    salt,
    isVerified: true,
    verifiedAt: nowIso,
    plan: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  });
}

export async function ensureSeededVisitor(): Promise<void> {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, FRONTEND_VISITOR_EMAIL),
  });

  if (existing) {
    // Ensure visitor never accidentally has superadmin role
    if (existing.role === "superadmin") {
      await db
        .update(users)
        .set({ role: "user", updatedAt: new Date().toISOString() })
        .where(eq(users.email, FRONTEND_VISITOR_EMAIL));
    }
    return;
  }

  const nowIso = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");
  await db.insert(users).values({
    id: FRONTEND_VISITOR_ID,
    name: "Visitor Demo",
    email: FRONTEND_VISITOR_EMAIL,
    role: "user",
    passwordHash: hashPassword(FRONTEND_VISITOR_PASSWORD, salt),
    salt,
    isVerified: true,
    verifiedAt: nowIso,
    plan: "pro_plus",
    createdAt: nowIso,
    updatedAt: nowIso,
  });
}

export async function findUserByEmail(email: string): Promise<User | null> {
  await ensureSeededSuperadmin();
  const normalized = normalizeEmail(email);
  const row = await db.query.users.findFirst({ where: eq(users.email, normalized) });
  return row ? toPublicUser(row) : null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: User; verificationToken: string; verificationExpiresAt: string; earlyAdopter: boolean }> {
  await ensureSeededSuperadmin();
  const email = normalizeEmail(input.email);

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) throw new Error("An account with this email already exists.");

  // Count existing real users (excludes superadmin role and visitor demo account)
  const [{ value: realUserCount }] = await db
    .select({ value: count() })
    .from(users)
    .where(and(eq(users.role, "user"), ne(users.id, FRONTEND_VISITOR_ID)));

  const isEarlyAdopter = (realUserCount + EARLY_ADOPTER_SEED) < EARLY_ADOPTER_LIMIT;

  const nowIso = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");
  const id = `usr_${Date.now()}_${randomBytes(4).toString("hex")}`;

  await db.insert(users).values({
    id,
    name: input.name.trim(),
    email,
    role: "user",
    passwordHash: hashPassword(input.password, salt),
    salt,
    isVerified: false,
    verifiedAt: null,
    plan: isEarlyAdopter ? "pro" : null,
    earlyAdopter: isEarlyAdopter ? true : null,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  const now = new Date();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(now.getTime() + VERIFY_TOKEN_TTL_MS).toISOString();

  // Remove any pending tokens for this email
  await db.delete(verificationTokens).where(eq(verificationTokens.email, email));
  await db.insert(verificationTokens).values({
    token,
    email,
    createdAt: nowIso,
    expiresAt,
    usedAt: null,
  });

  const user: User = { id, name: input.name.trim(), email, role: "user", isVerified: false, createdAt: nowIso, updatedAt: nowIso };
  return { user, verificationToken: token, verificationExpiresAt: expiresAt, earlyAdopter: isEarlyAdopter };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<
  | { status: "ok"; user: User }
  | { status: "invalid_credentials" }
  | { status: "email_not_verified"; user: User }
> {
  await ensureSeededSuperadmin();
  const normalized = normalizeEmail(email);
  const row = await db.query.users.findFirst({ where: eq(users.email, normalized) });
  if (!row) return { status: "invalid_credentials" };

  const computed = Buffer.from(hashPassword(password, row.salt), "hex");
  const expected = Buffer.from(row.passwordHash, "hex");
  if (computed.length !== expected.length || !timingSafeEqual(computed, expected)) {
    return { status: "invalid_credentials" };
  }
  if (!row.isVerified) return { status: "email_not_verified", user: toPublicUser(row) };
  return { status: "ok", user: toPublicUser(row) };
}

export async function createVerificationForEmail(
  email: string
): Promise<
  | { status: "created"; user: User; verificationToken: string; verificationExpiresAt: string }
  | { status: "not_found" }
  | { status: "already_verified"; user: User }
> {
  await ensureSeededSuperadmin();
  const normalized = normalizeEmail(email);
  const row = await db.query.users.findFirst({ where: eq(users.email, normalized) });
  if (!row) return { status: "not_found" };
  if (row.isVerified) return { status: "already_verified", user: toPublicUser(row) };

  const now = new Date();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(now.getTime() + VERIFY_TOKEN_TTL_MS).toISOString();

  await db.delete(verificationTokens).where(eq(verificationTokens.email, normalized));
  await db.insert(verificationTokens).values({
    token,
    email: normalized,
    createdAt: now.toISOString(),
    expiresAt,
    usedAt: null,
  });

  return { status: "created", user: toPublicUser(row), verificationToken: token, verificationExpiresAt: expiresAt };
}

export async function verifyEmailByToken(
  token: string
): Promise<
  | { status: "verified"; user: User }
  | { status: "invalid" }
  | { status: "expired"; email: string }
  | { status: "used"; email: string }
> {
  await ensureSeededSuperadmin();

  const record = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.token, token),
  });
  if (!record) return { status: "invalid" };
  if (record.usedAt) return { status: "used", email: record.email };

  const expiresAt = new Date(record.expiresAt).getTime();
  if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
    return { status: "expired", email: record.email };
  }

  const row = await db.query.users.findFirst({ where: eq(users.email, record.email) });
  if (!row) return { status: "invalid" };

  const nowIso = new Date().toISOString();
  await db.update(users)
    .set({ isVerified: true, verifiedAt: nowIso, updatedAt: nowIso })
    .where(eq(users.email, record.email));
  await db.update(verificationTokens)
    .set({ usedAt: nowIso })
    .where(eq(verificationTokens.token, token));

  return { status: "verified", user: { ...toPublicUser(row), isVerified: true } };
}

export async function deleteUserByEmail(
  email: string
): Promise<{ status: "deleted" } | { status: "not_found" } | { status: "forbidden" }> {
  await ensureSeededSuperadmin();
  const normalized = normalizeEmail(email);
  const row = await db.query.users.findFirst({ where: eq(users.email, normalized) });
  if (!row) return { status: "not_found" };
  if (row.role === "superadmin") return { status: "forbidden" };

  await db.delete(verificationTokens).where(eq(verificationTokens.email, normalized));
  await db.delete(users).where(eq(users.email, normalized));
  return { status: "deleted" };
}

export async function getUserPlan(email: string): Promise<AuthPlanCode | null> {
  const normalized = normalizeEmail(email);
  const row = await db.query.users.findFirst({ where: eq(users.email, normalized) });
  return (row?.plan as AuthPlanCode | null | undefined) ?? null;
}

export async function setUserPlan(email: string, plan: AuthPlanCode): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const result = await db.update(users)
    .set({ plan, updatedAt: new Date().toISOString() })
    .where(eq(users.email, normalized));
  return result.count > 0;
}

export async function removeUserPlan(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const result = await db.update(users)
    .set({ plan: null, updatedAt: new Date().toISOString() })
    .where(eq(users.email, normalized));
  return result.count > 0;
}

export async function getUserTrialEndsAt(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  const row = await db.query.users.findFirst({ where: eq(users.email, normalized) });
  if (!row) return null;
  return new Date(new Date(row.createdAt).getTime() + TRIAL_DURATION_MS).toISOString();
}

export async function getUserRole(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  const row = await db.query.users.findFirst({ where: eq(users.email, normalized) });
  return row?.role ?? null;
}

// ── Admin functions (used by platform-users route) ──────────────────────────

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan: AuthPlanCode | null;
};

export async function listAllUsers(): Promise<AdminUser[]> {
  await ensureSeededSuperadmin();
  const rows = await db.query.users.findMany();
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isVerified: row.isVerified,
    verifiedAt: row.verifiedAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    plan: (row.plan as AuthPlanCode | null | undefined) ?? null,
  }));
}

export async function getUserById(id: string): Promise<AdminUser | null> {
  await ensureSeededSuperadmin();
  const row = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isVerified: row.isVerified,
    verifiedAt: row.verifiedAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    plan: (row.plan as AuthPlanCode | null | undefined) ?? null,
  };
}

export async function getUserByEmail(email: string): Promise<AdminUser | null> {
  const normalized = normalizeEmail(email);
  const row = await db.query.users.findFirst({ where: eq(users.email, normalized) });
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isVerified: row.isVerified,
    verifiedAt: row.verifiedAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    plan: (row.plan as AuthPlanCode | null | undefined) ?? null,
  };
}

export async function activateUserById(id: string): Promise<boolean> {
  const nowIso = new Date().toISOString();
  const result = await db.update(users)
    .set({ isVerified: true, verifiedAt: nowIso, updatedAt: nowIso })
    .where(eq(users.id, id));
  return result.count > 0;
}

export async function deactivateUserById(id: string): Promise<boolean> {
  const nowIso = new Date().toISOString();
  const result = await db.update(users)
    .set({ isVerified: false, verifiedAt: null, updatedAt: nowIso })
    .where(eq(users.id, id));
  return result.count > 0;
}

export async function editUserById(
  id: string,
  data: { name: string; email: string }
): Promise<{ status: "ok" } | { status: "duplicate_email" } | { status: "not_found" }> {
  const nextEmail = normalizeEmail(data.email);
  const existing = await db.query.users.findFirst({ where: eq(users.email, nextEmail) });
  if (existing && existing.id !== id) return { status: "duplicate_email" };

  const row = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!row) return { status: "not_found" };

  const oldEmail = row.email;
  const nowIso = new Date().toISOString();
  await db.update(users)
    .set({ name: data.name.trim(), email: nextEmail, updatedAt: nowIso })
    .where(eq(users.id, id));

  // Update verification tokens to new email
  if (oldEmail !== nextEmail) {
    await db.update(verificationTokens)
      .set({ email: nextEmail })
      .where(eq(verificationTokens.email, oldEmail));
  }

  return { status: "ok" };
}

export async function setPasswordById(id: string, newPassword: string): Promise<boolean> {
  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(newPassword, salt);
  const result = await db.update(users)
    .set({ passwordHash, salt, updatedAt: new Date().toISOString() })
    .where(eq(users.id, id));
  return result.count > 0;
}

export async function setUserPlanById(id: string, plan: AuthPlanCode): Promise<boolean> {
  const result = await db.update(users)
    .set({ plan, updatedAt: new Date().toISOString() })
    .where(eq(users.id, id));
  return result.count > 0;
}

export async function createPasswordResetToken(
  email: string
): Promise<{ token: string; name: string } | null> {
  const normalized = normalizeEmail(email);
  const row = await db.query.users.findFirst({ where: eq(users.email, normalized) });
  if (!row || !row.isVerified) return null;

  const now = new Date();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS).toISOString();

  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.email, normalized));
  await db.insert(passwordResetTokens).values({
    token,
    email: normalized,
    createdAt: now.toISOString(),
    expiresAt,
    usedAt: null,
  });

  return { token, name: row.name };
}

export async function consumePasswordResetToken(
  token: string,
  newPassword: string
): Promise<
  | { status: "ok"; email: string }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "used" }
> {
  const record = await db.query.passwordResetTokens.findFirst({
    where: eq(passwordResetTokens.token, token),
  });
  if (!record) return { status: "invalid" };
  if (record.usedAt) return { status: "used" };
  if (new Date(record.expiresAt).getTime() <= Date.now()) return { status: "expired" };

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(newPassword, salt);
  const nowIso = new Date().toISOString();

  await db.update(users)
    .set({ passwordHash, salt, updatedAt: nowIso })
    .where(eq(users.email, record.email));

  await db.update(passwordResetTokens)
    .set({ usedAt: nowIso })
    .where(eq(passwordResetTokens.token, token));

  return { status: "ok", email: record.email };
}

export async function deleteUserById(
  id: string
): Promise<{ status: "deleted"; email: string } | { status: "not_found" } | { status: "forbidden" }> {
  const row = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!row) return { status: "not_found" };
  if (row.role === "superadmin") return { status: "forbidden" };

  await db.delete(verificationTokens).where(eq(verificationTokens.email, row.email));
  await db.delete(users).where(eq(users.id, id));
  return { status: "deleted", email: row.email };
}

// ─── Early adopter ──────────────────────────────────────────────────────────

export async function getRemainingEarlyAdopterSlots(): Promise<number> {
  const [{ value: adoptedCount }] = await db
    .select({ value: count() })
    .from(users)
    .where(eq(users.earlyAdopter, true));
  return Math.max(0, EARLY_ADOPTER_LIMIT - (Number(adoptedCount) + EARLY_ADOPTER_SEED));
}

export async function getUserEarlyAdopterStatus(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const row = await db.query.users.findFirst({ where: eq(users.email, normalized) });
  return row?.earlyAdopter === true;
}

// ─── Newsletter consent ──────────────────────────────────────────────────────

export type NewsletterConsentSource = "signup_popup" | "footer_form";

export async function getNewsletterStatus(email: string): Promise<{
  newsletterOptIn: boolean | null;
  language: string | null;
  name: string;
}> {
  const normalized = normalizeEmail(email);
  const row = await db.query.users.findFirst({ where: eq(users.email, normalized) });
  return {
    newsletterOptIn: row?.newsletterOptIn ?? null,
    language: row?.language ?? null,
    name: row?.name ?? "",
  };
}

export async function setNewsletterOptIn(
  email: string,
  optIn: boolean,
  source: NewsletterConsentSource,
): Promise<void> {
  const normalized = normalizeEmail(email);
  await db
    .update(users)
    .set({
      newsletterOptIn: optIn,
      newsletterConsentAt: optIn ? new Date().toISOString() : null,
      newsletterConsentSource: optIn ? source : null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.email, normalized));
}

export async function setNewsletterOptOut(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  await db
    .update(users)
    .set({ newsletterOptIn: false, updatedAt: new Date().toISOString() })
    .where(eq(users.email, normalized));
}

export async function setUserLanguage(email: string, language: "ro" | "en"): Promise<void> {
  const normalized = normalizeEmail(email);
  await db
    .update(users)
    .set({ language, updatedAt: new Date().toISOString() })
    .where(eq(users.email, normalized));
}
