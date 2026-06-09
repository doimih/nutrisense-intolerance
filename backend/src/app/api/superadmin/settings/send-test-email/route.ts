import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const emailSettings = readDb().settings?.email;

  if (!emailSettings?.smtpHost) {
    return NextResponse.json(
      { ok: false, message: 'SMTP Host nu este configurat. Salveaza setarile de email mai intai.' },
      { status: 400 },
    );
  }

  if (!emailSettings.smtpPass) {
    return NextResponse.json(
      { ok: false, message: 'SMTP Password nu este setat. Salveaza parola mai intai.' },
      { status: 400 },
    );
  }

  const to = auth.session.email;
  const from = emailSettings.fromEmail
    ? `"${emailSettings.fromName || 'NutriAID'}" <${emailSettings.fromEmail}>`
    : `"NutriAID" <noreply@nutrisense-i.eu>`;

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
      to,
      subject: '✅ NutriAID — Email de test',
      text: `Configurarea SMTP functioneaza corect.\n\nAcest email a fost trimis din panoul de administrare NutriAID pentru a verifica setarile SMTP.\n\nServer: ${emailSettings.smtpHost}:${emailSettings.smtpPort ?? 587}`,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
  <h2 style="color:#16a34a;margin:0 0 12px;">✅ Configurare SMTP reusita</h2>
  <p style="color:#374151;margin:0 0 16px;">Acest email confirma ca setarile SMTP sunt corecte si emailurile pot fi trimise.</p>
  <table style="width:100%;border-collapse:collapse;font-size:13px;color:#6b7280;">
    <tr><td style="padding:4px 8px 4px 0;font-weight:600;color:#374151;">Server</td><td>${emailSettings.smtpHost}:${emailSettings.smtpPort ?? 587}</td></tr>
    <tr><td style="padding:4px 8px 4px 0;font-weight:600;color:#374151;">Utilizator</td><td>${emailSettings.smtpUser || '—'}</td></tr>
    <tr><td style="padding:4px 8px 4px 0;font-weight:600;color:#374151;">Criptare</td><td>${emailSettings.encryption?.toUpperCase() ?? 'TLS'}</td></tr>
  </table>
  <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">NutriAID Admin · ${new Date().toLocaleString('ro-RO')}</p>
</div>`,
    });

    return NextResponse.json({
      ok: true,
      message: `Email de test trimis catre ${to}.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: false,
      message: `Trimitere esuata: ${message.slice(0, 200)}`,
    });
  }
}
