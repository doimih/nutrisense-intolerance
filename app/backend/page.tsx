import { redirect } from "next/navigation";

const ALLOWED_BACKEND_HOSTS = new Set([
  "localhost",
  "backend.nutrisense-i.eu",
]);

export default function BackendRedirectPage() {
  const fallback =
    process.env.NODE_ENV === "production"
      ? "https://backend.nutrisense-i.eu"
      : "http://localhost:4028";
  const candidate = process.env.BACKEND_URL || fallback;

  let safeUrl = fallback;

  try {
    const parsed = new URL(candidate);
    if (ALLOWED_BACKEND_HOSTS.has(parsed.hostname)) {
      safeUrl = parsed.toString();
    }
  } catch {
    safeUrl = fallback;
  }

  redirect(safeUrl);
}
