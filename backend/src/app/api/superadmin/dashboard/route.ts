import { NextRequest, NextResponse } from 'next/server';
import { getDashboardSnapshot } from '@/lib/server/superadmin/dashboard';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;
  return NextResponse.json(getDashboardSnapshot());
}
