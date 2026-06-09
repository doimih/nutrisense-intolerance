import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const settings = readDb().settings;
  const secretKey = settings.recaptcha?.secretKey;

  if (!secretKey) {
    return NextResponse.json({ ok: false, error: 'Secret key not configured.' }, { status: 400 });
  }

  // Use a test token if none provided — Google's always-pass token for testing
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  const token = body.token?.trim() || '03AGdBq26test_token';

  const params = new URLSearchParams({ secret: secretKey, response: token });
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ ok: false, error: 'Could not reach Google reCAPTCHA API.' }, { status: 502 });
  }

  type SiteverifyResponse = {
    success: boolean;
    score?: number;
    action?: string;
    challenge_ts?: string;
    hostname?: string;
    'error-codes'?: string[];
  };

  const result = (await res.json()) as SiteverifyResponse;

  return NextResponse.json({
    ok: result.success,
    score: result.score,
    action: result.action,
    hostname: result.hostname,
    errorCodes: result['error-codes'] ?? [],
  });
}
