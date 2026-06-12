import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { appendAuditEvent, mutateDb, readDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

function generateToken(): string {
  return `arch_${Date.now()}_${Math.random().toString(36).slice(2, 14)}${Math.random().toString(36).slice(2, 14)}`;
}

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = (body.email ?? '').trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, message: 'Adresa de email este invalida.' },
      { status: 400 },
    );
  }

  const db = readDb();
  const emailSettings = db.settings?.email;

  if (!emailSettings?.smtpHost || !emailSettings?.smtpPass) {
    return NextResponse.json(
      { ok: false, message: 'SMTP nu este configurat. Configureaza setarile de email mai intai.' },
      { status: 400 },
    );
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
  const createdAt = new Date().toISOString();
  const linkId = id('arch');

  const adminConsoleUrl =
    db.settings?.app?.adminConsoleUrl || db.settings?.app?.backendUrl || 'https://backend.nutriaid.eu';
  const downloadUrl = `${adminConsoleUrl}/api/superadmin/archive/download?token=${token}`;

  mutateDb((d) => {
    if (!Array.isArray(d.archiveLinks)) d.archiveLinks = [];
    d.archiveLinks.unshift({
      id: linkId,
      token,
      sentToEmail: email,
      generatedBy: auth.session.email,
      expiresAt,
      downloadedAt: null,
      createdAt,
    });
    d.archiveLinks = d.archiveLinks.slice(0, 100);
  });

  const from = emailSettings.fromEmail
    ? `"${emailSettings.fromName || 'NutriAID'}" <${emailSettings.fromEmail}>`
    : `"NutriAID" <noreply@nutriaid.eu>`;

  try {
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

    await transport.sendMail({
      from,
      to: email,
      subject: '📦 NutriAID — Link descarcare arhiva platforma',
      text: `Ai primit un link pentru descarcarea arhivei platformei NutriAID.\n\nLink descarcare:\n${downloadUrl}\n\nLink-ul este valabil 12 ore (expira la ${new Date(expiresAt).toLocaleString('ro-RO')}).\n\nDaca nu ai solicitat acest link, ignora acest email.`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
  <h2 style="color:#1d4ed8;margin:0 0 12px;">📦 Arhiva Platforma NutriAID</h2>
  <p style="color:#374151;margin:0 0 16px;">Ai primit un link pentru descarcarea arhivei complete a platformei NutriAID.</p>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:0 0 16px;">
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Link descarcare:</p>
    <a href="${downloadUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;">Descarca Arhiva</a>
    <p style="margin:12px 0 0;font-size:11px;color:#9ca3af;word-break:break-all;">${downloadUrl}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:13px;color:#6b7280;">
    <tr><td style="padding:4px 8px 4px 0;font-weight:600;color:#374151;">Valabil pana la</td><td>${new Date(expiresAt).toLocaleString('ro-RO')}</td></tr>
    <tr><td style="padding:4px 8px 4px 0;font-weight:600;color:#374151;">Generat de</td><td>${auth.session.email}</td></tr>
  </table>
  <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">Daca nu ai solicitat acest link, ignora acest email. NutriAID Admin · ${new Date().toLocaleString('ro-RO')}</p>
</div>`,
    });
  } catch (err) {
    mutateDb((d) => {
      d.archiveLinks = (d.archiveLinks ?? []).filter((l) => l.id !== linkId);
    });
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, message: `Trimitere email esuata: ${message.slice(0, 200)}` });
  }

  appendAuditEvent({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    action: 'archive.generate-link',
    resource: 'archive',
    resourceId: linkId,
    ip: getClientIp(request),
    metadata: { sentToEmail: email, expiresAt },
  });

  return NextResponse.json({
    ok: true,
    message: `Link-ul a fost trimis la ${email}. Valabil 12 ore.`,
    downloadUrl,
    expiresAt,
    linkId,
  });
}
