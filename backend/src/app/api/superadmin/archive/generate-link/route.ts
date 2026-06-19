import { NextRequest, NextResponse } from 'next/server';
import { statSync } from 'fs';
import { join } from 'path';
import nodemailer from 'nodemailer';
import { appendAuditEvent, mutateDb, readDb } from '@/lib/server/superadmin/store';
import { getClientIp, requireSuperadmin } from '@/lib/server/superadmin/rbac';

export const runtime = 'nodejs';

const ARCHIVE_PATH = join(process.cwd(), 'data', 'platform-archive.zip');

function generateToken(): string {
  return `arch_${Date.now()}_${Math.random().toString(36).slice(2, 14)}${Math.random().toString(36).slice(2, 14)}`;
}

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = (body.email ?? '').trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, message: 'The email address is invalid.' },
      { status: 400 },
    );
  }

  // Verify platform archive exists
  let archiveSizeMb = '';
  try {
    const stat = statSync(ARCHIVE_PATH);
    archiveSizeMb = formatBytes(stat.size);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: 'The platform archive does not exist. Run scripts/build-platform-archive.sh to generate it, then try again.',
      },
      { status: 503 },
    );
  }

  const db = readDb();
  const emailSettings = db.settings?.email;

  if (!emailSettings?.smtpHost || !emailSettings?.smtpPass) {
    return NextResponse.json(
      { ok: false, message: 'SMTP is not configured. Configure the email settings first.' },
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

  const expiresFormatted = new Date(expiresAt).toLocaleString('en-GB');

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
      subject: '📦 NutriAID Platform — Source code download link',
      text: [
        'Congratulations! You have purchased the NutriAID platform.',
        '',
        'Download the full platform archive (source code, full structure):',
        downloadUrl,
        '',
        `Archive size: ${archiveSizeMb}`,
        `Link valid until: ${expiresFormatted}`,
        '',
        'The archive contains:',
        '• Full source code — Next.js frontend + Node.js backend',
        '• Complete folder structure and configs',
        '• Dockerfiles, docker-compose, deployment scripts',
        '• Documentation (DOCKER.md, README)',
        '• node_modules and builds included — ready to run',
        '• Acquisition data (acquisition folder)',
        '• AI orchestrator system, workers, GEO engine',
        '• Acquisition portal, user dashboard, admin panel',
        '• i18n system (RO/EN), authentication, subscriptions',
        '',
        'Not included: secret keys (.env), runtime database.',
        '',
        'After downloading, follow the instructions in DOCKER.md to install.',
        '',
        'NutriAID · doimih@gmail.com',
      ].join('\n'),
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
  <h2 style="color:#1d4ed8;margin:0 0 8px;">📦 NutriAID Platform — Source Code</h2>
  <p style="color:#374151;margin:0 0 20px;">Congratulations! You have purchased the NutriAID platform. Download the full source code archive below.</p>

  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:0 0 20px;">
    <a href="${downloadUrl}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:.3px;">⬇️ Download Archive (${archiveSizeMb})</a>
    <p style="margin:14px 0 0;font-size:11px;color:#9ca3af;word-break:break-all;">${downloadUrl}</p>
  </div>

  <table style="width:100%;border-collapse:collapse;font-size:13px;color:#6b7280;margin:0 0 20px;">
    <tr><td style="padding:6px 8px 6px 0;font-weight:600;color:#374151;width:140px;">Size</td><td>${archiveSizeMb}</td></tr>
    <tr><td style="padding:6px 8px 6px 0;font-weight:600;color:#374151;">Valid until</td><td style="color:#dc2626;font-weight:600;">${expiresFormatted}</td></tr>
    <tr><td style="padding:6px 8px 6px 0;font-weight:600;color:#374151;">Generated by</td><td>${auth.session.email}</td></tr>
  </table>

  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin:0 0 20px;font-size:13px;color:#166534;">
    <strong>The archive contains:</strong>
    <ul style="margin:8px 0 0;padding-left:18px;line-height:1.8;">
      <li>Full source code — Next.js frontend + Node.js backend</li>
      <li>Complete folder structure and configs</li>
      <li>Dockerfiles, docker-compose, deployment scripts</li>
      <li>Documentation (DOCKER.md, README)</li>
      <li>node_modules and builds included — ready to run</li>
      <li>Acquisition data (acquisition folder)</li>
      <li>AI orchestrator system, workers, GEO engine</li>
      <li>Acquisition portal, user dashboard, admin panel</li>
      <li>i18n system (RO/EN), authentication, subscriptions</li>
    </ul>
    <p style="margin:10px 0 0;font-size:11px;color:#15803d;">Not included: secret keys (.env), runtime database</p>
  </div>

  <p style="margin:0;font-size:12px;color:#9ca3af;">NutriAID · ${new Date().toLocaleString('en-GB')}<br>Support: doimih@gmail.com</p>
</div>`,
    });
  } catch (err) {
    mutateDb((d) => {
      d.archiveLinks = (d.archiveLinks ?? []).filter((l) => l.id !== linkId);
    });
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, message: `Email sending failed: ${message.slice(0, 200)}` });
  }

  appendAuditEvent({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    action: 'archive.generate-link',
    resource: 'archive',
    resourceId: linkId,
    ip: getClientIp(request),
    metadata: { sentToEmail: email, expiresAt, archiveSizeMb },
  });

  return NextResponse.json({
    ok: true,
    message: `The link was sent to ${email}. Valid for 12 hours.`,
    downloadUrl,
    expiresAt,
    linkId,
    archiveSizeMb,
  });
}
