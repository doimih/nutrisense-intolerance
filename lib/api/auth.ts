import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types/user";

type AuthApiResponse = {
  user?: User;
  error?: string;
};

async function postAuth<TBody>(url: string, body: TBody): Promise<AuthApiResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as AuthApiResponse;
  if (!response.ok) {
    throw new Error(payload.error ?? "Authentication request failed.");
  }

  return payload;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const payload = await postAuth("/api/auth/login", data);
  if (!payload.user) {
    throw new Error("Missing user in login response.");
  }

  return {
    user: payload.user,
    tokens: {
      accessToken: "",
      refreshToken: "",
      expiresIn: 60 * 60,
    },
  };
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const payload = await postAuth("/api/auth/register", data);
  if (!payload.user) {
    throw new Error("Missing user in register response.");
  }

  return {
    user: payload.user,
    tokens: {
      accessToken: "",
      refreshToken: "",
      expiresIn: 60 * 60,
    },
  };
}

export async function me(): Promise<User> {
  const response = await fetch("/api/auth/session", { method: "GET" });
  const payload = (await response.json()) as AuthApiResponse;

  if (!response.ok || !payload.user) {
    throw new Error(payload.error ?? "You are not authenticated.");
  }

  return payload.user;
}

export async function getSessionUser(): Promise<User | null> {
  try {
    return await me();
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    throw new Error("Logout failed.");
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getSessionUser();
  return !!user;
}
