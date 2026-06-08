import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/superadmin/store';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const log = readDb().AI_Logs.find((entry) => entry.id === id);

  if (!log) {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 });
  }

  return NextResponse.json({ log });
}
