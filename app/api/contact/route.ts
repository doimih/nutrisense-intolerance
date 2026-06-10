import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';
import { getRuntimeSettings } from '@/lib/server/runtimeSettings';

export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  recaptchaToken?: string;
};

type VerifyResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  score?: number;
};

function buildContactHtml(name: string, email: string, subject: string, message: string): string {
  const escaped = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"/><title>Mesaj nou de contact</title></head>
<body style="margin:0;padding:0;background:#f1f5f1;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f1;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#16a34a;padding:28px 40px;">
            <span style="color:#ffffff;font-size:20px;font-weight:800;">🌿 NutriAID — Mesaj nou</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
              <tr style="background:#f9fafb;">
                <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">De la</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;">
                  <p style="margin:0;font-size:15px;font-weight:700;color:#111827;">${escaped(name)}</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#16a34a;">${escaped(email)}</p>
                </td>
              </tr>
              <tr style="background:#f9fafb;border-top:1px solid #e5e7eb;">
                <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Subiect</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:14px;color:#374151;font-weight:500;">${escaped(subject)}</td>
              </tr>
            </table>
            <p style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">Mesaj</p>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;font-size:14px;color:#374151;line-height:1.7;">
              ${escaped(message)}
            </div>
            <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
              Raspunde direct la acest email pentru a contacta expeditorul.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} NutriAID · Trimis prin formularul de contact</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildContactText(name: string, email: string, subject: string, message: string): string {
  return [
    `Mesaj nou de contact — NutriAID`,
    '',
    `De la: ${name} <${email}>`,
    `Subiect: ${subject}`,
    '',
    message,
    '',
    '---',
    'Trimis prin formularul de contact de pe nutriaid.eu',
  ].join('\n');
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = checkRateLimit({ key: `contact:${ip}`, maxRequests: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Prea multe cereri. Incearca din nou mai tarziu.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: 'Corp JSON invalid.' }, { status: 400 });
  }

  const name = body.name?.trim() ?? '';
  const email = body.email?.trim().toLowerCase() ?? '';
  const subject = body.subject?.trim() ?? '';
  const message = body.message?.trim() ?? '';

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'Toate campurile sunt obligatorii.' }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Adresa de email invalida.' }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: 'Mesajul este prea lung (max 5000 caractere).' }, { status: 400 });
  }

  const settings = await getRuntimeSettings();
  const backendBase = (
    process.env.BACKEND_INTERNAL_URL || settings.backendUrl
  ).replace(/\/$/, '');
  const token = settings.internalEmailToken;

  if (!token) {
    console.warn('[contact] internalEmailToken not configured — cannot process contact form');
    return NextResponse.json({ error: 'Serviciu de email neconfigurat. Contacteaza administratorul.' }, { status: 503 });
  }

  // reCAPTCHA verification
  if (settings.recaptcha.enabled) {
    const recaptchaToken = body.recaptchaToken?.trim() ?? '';
    if (!recaptchaToken) {
      return NextResponse.json({ error: 'Token reCAPTCHA lipsa.' }, { status: 400 });
    }

    const verifyRes = await fetch(`${backendBase}/api/internal/recaptcha/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ token: recaptchaToken }),
    }).catch(() => null);

    if (!verifyRes || !verifyRes.ok) {
      return NextResponse.json({ error: 'Verificarea anti-spam a esuat. Incearca din nou.' }, { status: 503 });
    }

    const verifyData = (await verifyRes.json().catch(() => ({ ok: false }))) as VerifyResult;
    if (!verifyData.ok && !verifyData.skipped) {
      return NextResponse.json(
        { error: 'Mesajul a fost detectat ca spam. Incearca din nou sau contacteaza-ne direct.' },
        { status: 403 },
      );
    }
  }

  // Send email
  const contactEmail = process.env.CONTACT_EMAIL || settings.siteUrl.replace(/https?:\/\//, 'contact@');

  const sendRes = await fetch(`${backendBase}/api/internal/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      to: contactEmail,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      text: buildContactText(name, email, subject, message),
      html: buildContactHtml(name, email, subject, message),
    }),
  }).catch(() => null);

  if (!sendRes || !sendRes.ok) {
    const errBody = sendRes
      ? ((await sendRes.json().catch(() => ({}))) as { error?: string })
      : {};
    console.warn('[contact] email send failed:', errBody.error ?? sendRes?.status ?? 'network error');
    return NextResponse.json(
      { error: 'Nu s-a putut trimite mesajul. Incearca din nou sau scrie-ne direct.' },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
