import "server-only";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function nowMs(): number {
  return Date.now();
}

function pruneExpired(): void {
  const now = nowMs();
  const entries = Array.from(buckets.entries());
  for (let index = 0; index < entries.length; index += 1) {
    const [key, bucket] = entries[index];
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const candidate = forwardedFor.split(",")[0]?.trim();
    if (candidate) return candidate;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

export function checkRateLimit(input: {
  key: string;
  maxRequests: number;
  windowMs: number;
}): { ok: boolean; retryAfterSeconds: number } {
  pruneExpired();

  const timestamp = nowMs();
  const existing = buckets.get(input.key);

  if (!existing || existing.resetAt <= timestamp) {
    buckets.set(input.key, {
      count: 1,
      resetAt: timestamp + input.windowMs,
    });
    return { ok: true, retryAfterSeconds: Math.ceil(input.windowMs / 1000) };
  }

  existing.count += 1;
  if (existing.count <= input.maxRequests) {
    return { ok: true, retryAfterSeconds: Math.ceil((existing.resetAt - timestamp) / 1000) };
  }

  return {
    ok: false,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - timestamp) / 1000)),
  };
}
