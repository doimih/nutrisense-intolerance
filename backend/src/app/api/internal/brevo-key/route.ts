import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

function verifyToken(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const expected = readDb().settings?.internalEmailToken;
  return !!expected && token === expected;
}

export async function GET(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { brevo } = readDb().settings;
  return NextResponse.json({
    apiKey: brevo?.apiKey ?? '',
    listIdUsers: brevo?.listIdUsers ?? '',
    listIdPublic: brevo?.listIdPublic ?? '',
    eventsKey: brevo?.eventsKey ?? '',
  });
}
