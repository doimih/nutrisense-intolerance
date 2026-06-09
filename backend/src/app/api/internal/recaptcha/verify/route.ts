import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

function verifyInternalToken(request: NextRequest): boolean {
  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return false;
  const stored = readDb().settings?.internalEmailToken;
  return !!(stored && token === stored);
}

type SiteverifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
};

export async function POST(request: NextRequest) {
  if (!verifyInternalToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { token?: string };
  const token = body.token?.trim() ?? '';
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Missing token.' }, { status: 400 });
  }

  const settings = readDb().settings;
  const secretKey = settings.recaptcha?.secretKey ?? '';
  const scoreThreshold = parseFloat(settings.recaptcha?.scoreThreshold ?? '0.5') || 0.5;
  const enabled = settings.recaptcha?.enabled ?? false;

  if (!enabled) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (!secretKey) {
    return NextResponse.json({ ok: false, error: 'reCAPTCHA secret key not configured.' }, { status: 503 });
  }

  const params = new URLSearchParams({ secret: secretKey, response: token });
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ ok: false, error: 'Could not reach Google reCAPTCHA API.' }, { status: 502 });
  }

  const result = (await res.json()) as SiteverifyResponse;

  if (!result.success) {
    return NextResponse.json({
      ok: false,
      error: 'reCAPTCHA verification failed.',
      errorCodes: result['error-codes'] ?? [],
    });
  }

  const score = result.score ?? 0;
  if (score < scoreThreshold) {
    return NextResponse.json({
      ok: false,
      error: `Score too low (${score.toFixed(2)} < ${scoreThreshold.toFixed(2)}).`,
      score,
    });
  }

  return NextResponse.json({ ok: true, score, action: result.action, hostname: result.hostname });
}
