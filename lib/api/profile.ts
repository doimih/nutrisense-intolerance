import type { UserProfile, UpdateProfileRequest } from "@/types/profile";
import { getSessionUser } from "@/lib/api/auth";

const MOCK_PROFILE: UserProfile = {
  userId: "usr_mock_001",
  name: "Ana Ionescu",
  email: "ana@example.com",
  dietaryPreference: "normal",
  intolerances: ["lactoza", "gluten"],
  updatedAt: "2024-06-01T12:00:00Z",
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getStoredProfile(): Promise<UserProfile> {
  if (typeof window === "undefined") {
    return MOCK_PROFILE;
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    const storedAnon = localStorage.getItem("ns_profile");
    return storedAnon ? (JSON.parse(storedAnon) as UserProfile) : MOCK_PROFILE;
  }

  const normalizedEmail = sessionUser.email.trim().toLowerCase();
  const scopedStorageKey = `ns_profile:${normalizedEmail}`;
  const stored = localStorage.getItem(scopedStorageKey);
  if (stored) {
    const parsed = JSON.parse(stored) as UserProfile;
    return {
      ...parsed,
      userId: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
    };
  }

  return {
    ...MOCK_PROFILE,
    userId: sessionUser.id,
    name: sessionUser.name,
    email: sessionUser.email,
  };
}

export async function getProfile(): Promise<UserProfile> {
  await delay(400);
  return await getStoredProfile();
}

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<UserProfile> {
  await delay(600);

  const current = await getStoredProfile();
  const updated: UserProfile = {
    ...current,
    ...data,
    email: current.email,
    userId: current.userId,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const scopedStorageKey = `ns_profile:${current.email.trim().toLowerCase()}`;
    localStorage.setItem(scopedStorageKey, JSON.stringify(updated));
  }

  return updated;
}
