import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types/user";

type AuthApiResponse = {
  user?: User;
  error?: string;
  code?: string;
  email?: string;
  ok?: boolean;
  message?: string;
};

export class AuthApiError extends Error {
  code?: string;
  email?: string;

  constructor(message: string, code?: string, email?: string) {
    super(message);
    this.code = code;
    this.email = email;
  }
}

export type RegisterResult = {
  ok: boolean;
  message: string;
  email: string;
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
    throw new AuthApiError(
      payload.error ?? "Authentication request failed.",
      payload.code,
      payload.email
    );
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

export async function register(data: RegisterRequest): Promise<RegisterResult> {
  const payload = await postAuth("/api/auth/register", data);
  if (!payload.ok || !payload.email) {
    throw new Error("Invalid register response.");
  }

  return {
    ok: true,
    message: payload.message ?? "Account created. Please check your email to activate your account.",
    email: payload.email,
  };
}

export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  const payload = await postAuth("/api/auth/resend-verification", { email });
  return {
    message: payload.message ?? "Verification email sent. Please check your inbox.",
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
