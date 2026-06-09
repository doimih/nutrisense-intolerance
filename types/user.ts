export type UserRole = "user" | "superadmin";
export type UserPlan = "basic" | "pro" | "pro_plus";

export interface User {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  plan?: UserPlan | null;
  isVerified?: boolean;
  trialEndsAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
