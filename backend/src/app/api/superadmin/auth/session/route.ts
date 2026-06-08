import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  return NextResponse.json({
    user: {
      id: auth.session.userId,
      email: auth.session.email,
      name: auth.session.name,
      role: auth.session.role,
    },
  });
}
