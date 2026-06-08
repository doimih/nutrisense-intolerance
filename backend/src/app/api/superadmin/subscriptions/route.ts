import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/superadmin/store';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const status = request.nextUrl.searchParams.get('status');
  const subscriptions = readDb().subscriptions.filter((s) => !status || s.status === status);
  return NextResponse.json({ subscriptions });
}
