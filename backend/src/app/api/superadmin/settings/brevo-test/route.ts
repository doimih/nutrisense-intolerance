import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const apiKey = readDb().settings?.brevo?.apiKey;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'Brevo API key not configured.' }, { status: 400 });
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/account', {
      headers: { 'api-key': apiKey, accept: 'application/json' },
    });

    if (!res.ok) {
      const body = (await res.json()) as { message?: string };
      const msg = body.message ?? `HTTP ${res.status}`;

      // Brevo blocks calls from non-whitelisted IPs with a specific message
      const ipMatch = msg.match(/unrecognised IP address\s+([\d.]+)/i);
      if (ipMatch) {
        return NextResponse.json({
          ok: false,
          ipRestricted: true,
          serverIp: ipMatch[1],
          error: msg,
        });
      }

      return NextResponse.json({ ok: false, error: msg });
    }

    const account = (await res.json()) as { email?: string; companyName?: string };
    return NextResponse.json({ ok: true, email: account.email, company: account.companyName });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
