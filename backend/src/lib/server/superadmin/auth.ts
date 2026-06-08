import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import type { SuperadminSession } from '@/lib/server/superadmin/types';

export const SUPERADMIN_COOKIE_NAME = 'ns_superadmin_session';
export const SUPERADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;

function getSessionSecrets(): string[] {
  const configuredList = process.env.SUPERADMIN_SESSION_SECRETS?.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (configuredList?.length) return configuredList;

  const legacySingle = process.env.SUPERADMIN_SESSION_SECRET?.trim();
  if (legacySingle) return [legacySingle];

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SUPERADMIN_SESSION_SECRETS (or legacy SUPERADMIN_SESSION_SECRET) is required in production.'
    );
  }

  return ['dev-superadmin-secret-change-me'];
}

export function createPasswordHash(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = Buffer.from(scryptSync(password, salt, 64).toString('hex'), 'hex');
  const expected = Buffer.from(hash, 'hex');
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSessionToken(session: SuperadminSession): string {
  const payload = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
  const [activeSecret] = getSessionSecrets();
  return `${payload}.${sign(payload, activeSecret)}`;
}

export function readSessionToken(token: string): SuperadminSession | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const isSignedByKnownSecret = getSessionSecrets().some(
    (secret) => sign(payload, secret) === signature
  );
  if (!isSignedByKnownSecret) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    ) as SuperadminSession;
    if (
      !parsed?.userId ||
      !parsed?.email ||
      !parsed?.role ||
      !parsed?.exp ||
      !parsed?.sessionVersion
    ) {
      return null;
    }
    const now = Math.floor(Date.now() / 1000);
    if (parsed.exp <= now) return null;
    return parsed;
  } catch {
    return null;
  }
}
