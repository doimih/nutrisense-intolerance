import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

type SendEmailBody = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

function verifyToken(request: NextRequest): boolean {
  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return false;
  const stored = readDb().settings?.internalEmailToken;
  return !!(stored && token === stored);
}

export async function POST(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as SendEmailBody | null;
  if (!body?.to || !body.subject) {
    return NextResponse.json({ error: 'Missing required fields: to, subject' }, { status: 400 });
  }

  const emailSettings = readDb().settings?.email;
  if (!emailSettings?.smtpHost || !emailSettings.smtpPass) {
    return NextResponse.json(
      { error: 'SMTP not configured. Set smtpHost and smtpPass in Settings → Email.' },
      { status: 503 },
    );
  }

  const transport = nodemailer.createTransport({
    host: emailSettings.smtpHost,
    port: Number(emailSettings.smtpPort || 587),
    secure: emailSettings.encryption === 'ssl',
    requireTLS: emailSettings.encryption === 'tls',
    auth: {
      user: emailSettings.smtpUser,
      pass: emailSettings.smtpPass,
    },
  });

  const from = emailSettings.fromEmail
    ? `"${emailSettings.fromName || 'NutriAID'}" <${emailSettings.fromEmail}>`
    : 'no-reply@nutriaid.eu';

  try {
    await transport.sendMail({
      from,
      to: body.to,
      ...(body.replyTo ? { replyTo: body.replyTo } : {}),
      subject: body.subject,
      text: body.text,
      html: body.html,
    });
  } catch (sendErr: unknown) {
    const msg = sendErr instanceof Error ? sendErr.message : String(sendErr);
    return NextResponse.json({ error: `Failed to send email: ${msg}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
