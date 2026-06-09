import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { createConnection } from 'node:net';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

type TestBody = {
  smtpHost?: unknown;
  smtpPort?: unknown;
  smtpUser?: unknown;
  fromEmail?: unknown;
  encryption?: unknown;
};

function testSmtpConnection(host: string, port: number, timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Connection timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    socket.once('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve();
    });

    socket.once('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as TestBody;

  // Use values from request body, fall back to saved settings
  const saved = readDb().settings?.email;
  const smtpHost =
    typeof body.smtpHost === 'string' && body.smtpHost.trim()
      ? body.smtpHost.trim()
      : (saved?.smtpHost ?? '');
  const smtpPortRaw =
    typeof body.smtpPort === 'string' && body.smtpPort.trim()
      ? body.smtpPort.trim()
      : (saved?.smtpPort ?? '587');
  const smtpPort = parseInt(smtpPortRaw, 10);

  if (!smtpHost) {
    return NextResponse.json(
      { ok: false, message: 'SMTP Host is required to send a test email.' },
      { status: 400 },
    );
  }

  if (isNaN(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    return NextResponse.json(
      { ok: false, message: `Invalid SMTP port: "${smtpPortRaw}". Must be a number between 1 and 65535.` },
      { status: 400 },
    );
  }

  try {
    await testSmtpConnection(smtpHost, smtpPort);
    return NextResponse.json({
      ok: true,
      message: `✓ SMTP connection successful — ${smtpHost}:${smtpPort} is reachable.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: false,
      message: `✗ SMTP connection failed — ${smtpHost}:${smtpPort}: ${message.slice(0, 150)}`,
    });
  }
}
