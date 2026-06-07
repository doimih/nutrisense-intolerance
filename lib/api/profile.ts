import type { UserProfile, UpdateProfileRequest } from "@/types/profile";

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

function getStoredProfile(): UserProfile {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("ns_profile");
    if (stored) return JSON.parse(stored) as UserProfile;

    // Sync name/email from user
    const userStored = localStorage.getItem("ns_user");
    if (userStored) {
      const user = JSON.parse(userStored);
      return { ...MOCK_PROFILE, name: user.name, email: user.email };
    }
  }
  return MOCK_PROFILE;
}

export async function getProfile(): Promise<UserProfile> {
  await delay(400);
  return getStoredProfile();
}

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<UserProfile> {
  await delay(600);

  const current = getStoredProfile();
  const updated: UserProfile = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem("ns_profile", JSON.stringify(updated));

    // Also update user name
    const userStored = localStorage.getItem("ns_user");
    if (userStored && data.name) {
      const user = JSON.parse(userStored);
      user.name = data.name;
      localStorage.setItem("ns_user", JSON.stringify(user));
    }
  }

  return updated;
}
