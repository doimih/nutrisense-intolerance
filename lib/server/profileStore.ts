import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import type { DietaryPreference, Intolerance, UpdateProfileRequest, UserProfile } from "@/types/profile";

type SessionUser = {
  id: string;
  name: string;
  email: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function rowToProfile(row: typeof userProfiles.$inferSelect): UserProfile {
  return {
    userId: row.userId,
    name: row.name,
    email: row.email,
    dietaryPreference: row.dietaryPreference as DietaryPreference,
    intolerances: (row.intolerances as string[]) as Intolerance[],
    updatedAt: row.updatedAt,
  };
}

export async function getProfileForUser(user: SessionUser): Promise<UserProfile> {
  const email = normalizeEmail(user.email);
  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userEmail, email),
  });

  if (!existing) {
    const now = new Date().toISOString();
    const newProfile = {
      userId: user.id,
      userEmail: email,
      name: user.name,
      email: user.email,
      dietaryPreference: "normal",
      intolerances: [] as string[],
      updatedAt: now,
    };
    await db.insert(userProfiles).values(newProfile);
    return rowToProfile({ ...newProfile, id: 0 });
  }

  // Sync session identity if needed
  const needsUpdate = existing.userId !== user.id || existing.email !== user.email;
  if (needsUpdate) {
    await db.update(userProfiles)
      .set({ userId: user.id, email: user.email })
      .where(eq(userProfiles.userEmail, email));
    return rowToProfile({ ...existing, userId: user.id, email: user.email });
  }

  return rowToProfile(existing);
}

export async function updateProfileForUser(user: SessionUser, input: UpdateProfileRequest): Promise<UserProfile> {
  const email = normalizeEmail(user.email);
  const now = new Date().toISOString();

  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userEmail, email),
  });

  const base = existing ?? {
    userId: user.id,
    userEmail: email,
    name: user.name,
    email: user.email,
    dietaryPreference: "normal",
    intolerances: [] as string[],
    updatedAt: now,
  };

  const nextDietary = (input.dietaryPreference ?? base.dietaryPreference) as DietaryPreference;
  const nextIntolerances = Array.isArray(input.intolerances)
    ? Array.from(new Set(input.intolerances)) as Intolerance[]
    : (base.intolerances as Intolerance[]);
  const nextName = input.name?.trim() ? input.name.trim() : base.name;

  const updated = {
    userId: user.id,
    userEmail: email,
    name: nextName,
    email: user.email,
    dietaryPreference: nextDietary,
    intolerances: nextIntolerances as string[],
    updatedAt: now,
  };

  if (existing) {
    await db.update(userProfiles).set(updated).where(eq(userProfiles.userEmail, email));
  } else {
    await db.insert(userProfiles).values(updated);
  }

  return rowToProfile({ ...updated, id: 0 });
}

export async function deleteProfileForUser(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  await db.delete(userProfiles).where(eq(userProfiles.userEmail, normalized));
}
