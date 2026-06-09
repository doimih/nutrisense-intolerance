import type { UpdateProfileRequest, UserProfile } from "@/types/profile";

type ProfileResponse = {
  profile?: UserProfile;
  error?: string;
};

async function parseProfileResponse(response: Response): Promise<UserProfile> {
  const payload = (await response.json()) as ProfileResponse;
  if (!response.ok || !payload.profile) {
    throw new Error(payload.error ?? "Profile request failed.");
  }
  return payload.profile;
}

export async function getProfile(): Promise<UserProfile> {
  const response = await fetch("/api/profile", { method: "GET" });
  return parseProfileResponse(response);
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const response = await fetch("/api/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseProfileResponse(response);
}
