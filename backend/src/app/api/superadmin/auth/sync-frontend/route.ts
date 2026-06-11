import { NextRequest, NextResponse } from 'next/server';
import { appendLog, readDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { verifyPassword } from '@/lib/server/superadmin/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const ip = getClientIp(request);
  const body = (await request.json().catch(() => ({}))) as { currentPassword?: string };
  const currentPassword = body.currentPassword || '';

  if (!currentPassword) {
    return NextResponse.json({ error: 'currentPassword is required.' }, { status: 400 });
  }

  const db = readDb();
  const user = db.users.find((u) => u.id === auth.session.userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (!verifyPassword(currentPassword, user.passwordHash, user.passwordSalt)) {
    appendLog({
      source: 'server',
      level: 'warn',
      message: `sync-frontend rejected: invalid current password provided by ${auth.session.email} from ${ip}`,
    });
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
  }

  const frontendUrl = process.env.FRONTEND_INTERNAL_URL || 'http://localhost:3000';
  const syncSecret = process.env.INTERNAL_SYNC_SECRET;

  if (!syncSecret) {
    appendLog({
      source: 'server',
      level: 'warn',
      message: 'sync-frontend: INTERNAL_SYNC_SECRET not set in environment',
    });
    return NextResponse.json(
      { error: 'INTERNAL_SYNC_SECRET is not configured on the backend.' },
      { status: 503 }
    );
  }

  try {
    const syncRes = await fetch(`${frontendUrl}/api/internal/sync-superadmin-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${syncSecret}`,
      },
      body: JSON.stringify({ newPassword: currentPassword }),
    });

    if (!syncRes.ok) {
      const errBody = (await syncRes.json().catch(() => ({}))) as { error?: string };
      const errMsg = errBody.error ?? 'unknown error';
      appendLog({
        source: 'server',
        level: 'warn',
        message: `sync-frontend: frontend returned ${syncRes.status} — ${errMsg}`,
      });
      return NextResponse.json(
        { error: `Frontend sync failed: ${errMsg}` },
        { status: 502 }
      );
    }

    appendLog({
      source: 'server',
      level: 'info',
      message: `sync-frontend: password synced to frontend successfully by ${auth.session.email}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    appendLog({
      source: 'server',
      level: 'warn',
      message: `sync-frontend: fetch failed — ${msg}`,
    });
    return NextResponse.json(
      { error: `Could not reach frontend: ${msg}` },
      { status: 502 }
    );
  }
}
