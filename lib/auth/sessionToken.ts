import type { User } from "@/types/user";

export type AuthSession = {
  user: Pick<User, "id" | "name" | "email" | "role">;
  exp: number;
};

function getSessionSecret(): string {
  const configured = process.env.AUTH_SESSION_SECRET?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SESSION_SECRET is required in production.");
  }

  return "dev-insecure-change-me";
}

function toBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }

  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64url"));
  }

  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const normalized = `${padded}${"=".repeat((4 - (padded.length % 4)) % 4)}`;
  const binary = atob(normalized);
  const out = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    out[index] = binary.charCodeAt(index);
  }
  return out;
}

async function sign(rawPayload: string): Promise<string> {
  const secretBytes = new TextEncoder().encode(getSessionSecret());
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawPayload));
  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(
  user: Pick<User, "id" | "name" | "email" | "role">,
  maxAgeSeconds: number
): Promise<string> {
  const payload: AuthSession = {
    user,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };

  const serializedPayload = new TextEncoder().encode(JSON.stringify(payload));
  const payloadPart = toBase64Url(serializedPayload);
  const signaturePart = await sign(payloadPart);
  return `${payloadPart}.${signaturePart}`;
}

export async function readSessionToken(token: string): Promise<AuthSession | null> {
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return null;

  const expectedSignature = await sign(payloadPart);
  if (signaturePart !== expectedSignature) return null;

  try {
    const decoded = new TextDecoder().decode(fromBase64Url(payloadPart));
    const parsed = JSON.parse(decoded) as AuthSession;
    if (!parsed?.user?.id || !parsed?.user?.email || typeof parsed.exp !== "number") {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (parsed.exp <= now) return null;

    return parsed;
  } catch {
    return null;
  }
}
