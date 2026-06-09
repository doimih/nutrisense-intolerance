import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { readDb } from '@/lib/server/superadmin/store';
import { createConnection } from 'node:net';

export const runtime = 'nodejs';

function testSmtpTcp(host: string, port: number, timeoutMs = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port });
    const timer = setTimeout(() => { socket.destroy(); resolve(false); }, timeoutMs);
    socket.once('connect', () => { clearTimeout(timer); socket.destroy(); resolve(true); });
    socket.once('error', () => { clearTimeout(timer); resolve(false); });
  });
}

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const db = readDb();
  const email = db.settings?.email;
  const hasToken = !!(db.settings?.internalEmailToken);

  const smtpConfigured = !!(email?.smtpHost && email?.smtpPass);
  let smtpReachable: boolean | null = null;

  if (email?.smtpHost) {
    const port = Number(email.smtpPort || 587);
    smtpReachable = await testSmtpTcp(email.smtpHost, port);
  }

  // Recent email-related logs
  const emailLogs = (db.logs ?? [])
    .filter((l) => l.message?.toLowerCase().includes('[email]') || (l.source as string) === 'frontend')
    .slice(0, 20)
    .map((l) => ({ id: l.id, level: l.level, message: l.message, createdAt: l.createdAt, metadata: l.metadata }));

  return NextResponse.json({
    smtpHost: email?.smtpHost || null,
    smtpPort: email?.smtpPort || '587',
    smtpUser: email?.smtpUser || null,
    fromEmail: email?.fromEmail || null,
    encryption: email?.encryption || 'tls',
    smtpConfigured,
    smtpPasswordSaved: !!(email?.smtpPass),
    smtpReachable,
    internalTokenExists: hasToken,
    recentEmailLogs: emailLogs,
  });
}
