import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = request.headers.get('Authorization');
  const expectedToken = readDb().settings.internalEmailToken;

  if (!expectedToken || auth !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = readDb().settings;
  return NextResponse.json({
    accessToken: settings.tiktok?.accessToken ?? '',
  });
}
