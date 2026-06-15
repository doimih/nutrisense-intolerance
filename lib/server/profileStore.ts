import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import type { ActivityLevel, DietaryPreference, Intolerance, UpdateProfileRequest, UserProfile } from "@/types/profile";

type SessionUser = {
  id: string;
  name: string;
  email: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const VALID_DIETARY: DietaryPreference[] = ["normal", "vegetarian", "vegan", "low-carb", "gluten-free", "dairy-free"];

function parseDietaryPreferences(raw: string): DietaryPreference[] {
  const parts = raw.split("|").map((s) => s.trim()).filter(Boolean) as DietaryPreference[];
  const valid = parts.filter((p) => VALID_DIETARY.includes(p));
  return valid.length > 0 ? valid : ["normal"];
}

function joinDietaryPreferences(prefs: DietaryPreference[]): string {
  const unique = Array.from(new Set(prefs.filter((p) => VALID_DIETARY.includes(p))));
  return unique.length > 0 ? unique.join("|") : "normal";
}

function rowToProfile(row: typeof userProfiles.$inferSelect): UserProfile {
  const dietaryPreferences = parseDietaryPreferences(row.dietaryPreference);
  return {
    userId: row.userId,
    name: row.name,
    email: row.email,
    dietaryPreference: dietaryPreferences[0],
    dietaryPreferences,
    intolerances: (row.intolerances as string[]) as Intolerance[],
    updatedAt: row.updatedAt,
    age: row.age ?? null,
    heightCm: row.heightCm ?? null,
    weightKg: row.weightKg ?? null,
    activityLevel: (row.activityLevel as ActivityLevel) ?? null,
    onboardingCompleted: row.onboardingCompleted ?? false,
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
      age: null,
      heightCm: null,
      weightKg: null,
      activityLevel: null,
    };
    await db.insert(userProfiles).values(newProfile);
    return rowToProfile({ ...newProfile, id: 0, onboardingCompleted: false });
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

  const nextDietaryPreferences: DietaryPreference[] = Array.isArray(input.dietaryPreferences) && input.dietaryPreferences.length > 0
    ? input.dietaryPreferences
    : input.dietaryPreference
    ? [input.dietaryPreference]
    : parseDietaryPreferences(base.dietaryPreference);
  const nextDietaryRaw = joinDietaryPreferences(nextDietaryPreferences);
  const nextDietary = nextDietaryRaw as DietaryPreference;
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
    age: "age" in input ? (input.age ?? null) : (existing?.age ?? null),
    heightCm: "heightCm" in input ? (input.heightCm ?? null) : (existing?.heightCm ?? null),
    weightKg: "weightKg" in input ? (input.weightKg ?? null) : (existing?.weightKg ?? null),
    activityLevel: "activityLevel" in input ? (input.activityLevel as string | null ?? null) : (existing?.activityLevel ?? null),
    onboardingCompleted: "onboardingCompleted" in input ? (input.onboardingCompleted ?? false) : (existing?.onboardingCompleted ?? false),
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
