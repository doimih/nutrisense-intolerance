import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";

// ─── Types ───────────────────────────────────────────────────────────────────

type EmailKind =
  | "verify-email"
  | "welcome"
  | "deletion-confirmation"
  | "deletion-feedback"
  | "password-reset";

type EmailOutboxItem = {
  id: string;
  kind: EmailKind;
  to: string;
  subject: string;
  text: string;
  html: string;
  createdAt: string;
};

type EmailOutboxDb = { items: EmailOutboxItem[] };

export type SendEmailResult = { delivered: boolean };

// ─── Outbox (fallback when backend unreachable) ───────────────────────────────

const OUTBOX_PATH = join(process.cwd(), "data", "email-outbox.json");

function ensureOutbox(): void {
  if (existsSync(OUTBOX_PATH)) return;
  mkdirSync(dirname(OUTBOX_PATH), { recursive: true });
  writeFileSync(OUTBOX_PATH, JSON.stringify({ items: [] } as EmailOutboxDb, null, 2), "utf8");
}

function enqueueFallbackEmail(item: Omit<EmailOutboxItem, "id" | "createdAt">): void {
  ensureOutbox();
  const db = JSON.parse(readFileSync(OUTBOX_PATH, "utf8")) as EmailOutboxDb;
  db.items.unshift({ ...item, id: `mail_${Date.now()}`, createdAt: new Date().toISOString() });
  db.items = db.items.slice(0, 2000);
  writeFileSync(OUTBOX_PATH, JSON.stringify(db, null, 2), "utf8");
}

// ─── Backend helpers ──────────────────────────────────────────────────────────

function getBackendBaseUrl(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.BACKEND_URL ||
    "https://backend.nutrisense-i.eu"
  ).replace(/\/$/, "");
}

function getBackendEmailUrl(): string {
  return `${getBackendBaseUrl()}/api/internal/email`;
}

async function logToBackend(
  token: string,
  level: "info" | "warn" | "error",
  message: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch(`${getBackendBaseUrl()}/api/internal/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ level, message, metadata }),
    });
  } catch {
    // best-effort
  }
}

// ─── Shared HTML builder ──────────────────────────────────────────────────────

function buildEmail(opts: {
  logoUrl: string;
  siteUrl: string;
  subject: string;
  preheader: string;
  bodyHtml: string;
  bodyText: string;
}): { html: string; text: string } {
  const year = new Date().getFullYear();
  const domain = opts.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const html = `<!DOCTYPE html>
<html lang="ro" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${opts.subject}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f6f4;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preheader (hidden) -->
  <div style="display:none;font-size:1px;color:#f4f6f4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${opts.preheader}&nbsp;&zwnj;&zwnj;&zwnj;&zwnj;</div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f4;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#4CAF50;padding:32px 40px;text-align:center;">
              <img src="${opts.logoUrl}" alt="NutriAID" width="52" height="52" style="display:block;margin:0 auto 12px;border-radius:12px;background:#ffffff;padding:4px;" />
              <span style="display:block;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;line-height:1;">NutriAID</span>
              <span style="display:block;color:rgba(255,255,255,0.80);font-size:13px;font-weight:400;margin-top:4px;">Platforma ta de nutritie personalizata</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;color:#1A1A1A;">
              ${opts.bodyHtml}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;background-color:#fafafa;">
              <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;line-height:1.6;">
                Ai nevoie de ajutor?
                <a href="mailto:support@${domain}" style="color:#4CAF50;text-decoration:none;">support@${domain}</a>
              </p>
              <p style="margin:0;font-size:11px;color:#c0c0c0;line-height:1.5;">
                &copy; ${year} NutriAID &nbsp;&middot;&nbsp;
                <a href="${opts.siteUrl}" style="color:#c0c0c0;text-decoration:none;">${domain}</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- End card -->

      </td>
    </tr>
  </table>
</body>
</html>`;

  return { html, text: opts.bodyText };
}

// ─── Template 1: Account Activation ──────────────────────────────────────────

function buildActivationEmail(opts: {
  name: string;
  activationLink: string;
  logoUrl: string;
  siteUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = "Activează-ți contul NutriAID";

  const bodyHtml = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1A1A1A;line-height:1.2;">
      Bun venit, ${opts.name}!
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.7;">
      Îți mulțumim că te-ai înregistrat în platforma NutriAID.<br/>
      Un singur pas mai rămâne — confirmă adresa de email pentru a-ți activa contul.
    </p>

    <!-- CTA -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:8px 0 28px;">
          <a href="${opts.activationLink}"
             style="display:inline-block;background-color:#4CAF50;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:15px 44px;border-radius:10px;letter-spacing:0.2px;">
            Activează contul
          </a>
        </td>
      </tr>
    </table>

    <!-- Info box -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fdf8;border:1px solid #d4edda;border-radius:10px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1A1A1A;">Informații importante:</p>
          <p style="margin:0;font-size:13px;color:#555555;line-height:1.7;">
            &bull; Linkul este valabil <strong>24 de ore</strong><br/>
            &bull; Dacă nu ai creat tu acest cont, ignoră acest mesaj<br/>
            &bull; După confirmare te poți autentifica imediat
          </p>
        </td>
      </tr>
    </table>

    <!-- Fallback link -->
    <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;line-height:1.7;">
      Dacă butonul nu funcționează, copiază și accesează linkul de mai jos:<br/>
      <a href="${opts.activationLink}" style="color:#4CAF50;word-break:break-all;">${opts.activationLink}</a>
    </p>

    <p style="margin:32px 0 0;font-size:14px;color:#1A1A1A;line-height:1.7;">
      Cu drag,<br/><strong>Echipa NutriAID</strong>
    </p>`;

  const bodyText = [
    `Salut, ${opts.name}!`,
    "",
    "Îți mulțumim că te-ai înregistrat în platforma NutriAID.",
    "Confirmă adresa de email accesând linkul de mai jos:",
    "",
    opts.activationLink,
    "",
    "Linkul este valabil 24 de ore.",
    "Dacă nu ai creat tu acest cont, ignoră acest mesaj.",
    "",
    "Cu drag,",
    "Echipa NutriAID",
  ].join("\n");

  const { html, text } = buildEmail({
    logoUrl: opts.logoUrl,
    siteUrl: opts.siteUrl,
    subject,
    preheader: "Confirmă adresa de email pentru a-ți activa contul NutriAID.",
    bodyHtml,
    bodyText,
  });

  return { subject, html, text };
}

// ─── Template 2: Welcome (after activation) ───────────────────────────────────

function buildWelcomeEmail(opts: {
  name: string;
  dashboardUrl: string;
  logoUrl: string;
  siteUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = "Bine ai venit în NutriAID!";

  const bodyHtml = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1A1A1A;line-height:1.2;">
      Contul tău este activ, ${opts.name}!
    </h1>
    <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.7;">
      Bine ai venit în NutriAID! Suntem bucuroși că ești alături de noi.
    </p>

    <!-- Feature list -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fdf8;border:1px solid #d4edda;border-radius:10px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1A1A1A;">Ce poți face acum:</p>
          <p style="margin:0;font-size:14px;color:#555555;line-height:1.9;">
            &bull; Înregistrează mesele și simptomele zilnice<br/>
            &bull; Descoperă corelațiile dintre alimente și simptome<br/>
            &bull; Primești recomandări personalizate bazate pe datele tale<br/>
            &bull; Urmărești evoluția în timp cu rapoarte clare
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:0 0 28px;">
          <a href="${opts.dashboardUrl}"
             style="display:inline-block;background-color:#4CAF50;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:15px 44px;border-radius:10px;letter-spacing:0.2px;">
            Intră în platformă
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#1A1A1A;line-height:1.7;">
      Îți dorim o experiență excelentă,<br/><strong>Echipa NutriAID</strong>
    </p>`;

  const bodyText = [
    `Salut, ${opts.name}!`,
    "",
    "Contul tău NutriAID este acum activ.",
    "Intră în platformă și începe să-ți înregistrezi mesele și simptomele:",
    "",
    opts.dashboardUrl,
    "",
    "Îți dorim o experiență excelentă,",
    "Echipa NutriAID",
  ].join("\n");

  const { html, text } = buildEmail({
    logoUrl: opts.logoUrl,
    siteUrl: opts.siteUrl,
    subject,
    preheader: "Contul tău NutriAID este activ. Intră acum în platformă.",
    bodyHtml,
    bodyText,
  });

  return { subject, html, text };
}

// ─── Template 3: Account Deletion Confirmation ────────────────────────────────

function buildDeletionConfirmationEmail(opts: {
  name: string;
  feedbackUrl: string;
  logoUrl: string;
  siteUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = "Contul tău NutriAID a fost șters";

  const bodyHtml = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1A1A1A;line-height:1.2;">
      Contul tău a fost șters
    </h1>
    <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.7;">
      Dragă ${opts.name}, contul tău NutriAID și toate datele asociate au fost eliminate definitiv din sistemul nostru, conform politicii noastre de confidențialitate.
    </p>

    <!-- Confirmation box -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fdf8;border:1px solid #d4edda;border-radius:10px;margin-bottom:28px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:13px;color:#555555;line-height:1.8;">
            &bull; Profilul tău a fost șters<br/>
            &bull; Istoricul de mese și simptome a fost eliminat<br/>
            &bull; Datele personale nu mai sunt stocate în sistemul nostru<br/>
            &bull; Abonamentul activ (dacă există) a fost anulat
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.7;">
      Ne pare rău că ai decis să pleci. Dacă ai un moment, feedback-ul tău ne ajută să îmbunătățim platforma:
    </p>

    <!-- CTA -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:0 0 28px;">
          <a href="${opts.feedbackUrl}"
             style="display:inline-block;background-color:#4CAF50;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:10px;letter-spacing:0.2px;">
            Oferă feedback
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#1A1A1A;line-height:1.7;">
      Îți mulțumim pentru că ai fost alături de noi,<br/><strong>Echipa NutriAID</strong>
    </p>`;

  const bodyText = [
    `Dragă ${opts.name},`,
    "",
    "Contul tău NutriAID și toate datele asociate au fost eliminate definitiv.",
    "",
    "Dacă ai un moment, feedback-ul tău ne ajută să îmbunătățim platforma:",
    opts.feedbackUrl,
    "",
    "Îți mulțumim pentru că ai fost alături de noi,",
    "Echipa NutriAID",
  ].join("\n");

  const { html, text } = buildEmail({
    logoUrl: opts.logoUrl,
    siteUrl: opts.siteUrl,
    subject,
    preheader: "Contul tău NutriAID a fost șters. Datele tale au fost eliminate.",
    bodyHtml,
    bodyText,
  });

  return { subject, html, text };
}

// ─── Template 4: Account Deletion Feedback Request ───────────────────────────

function buildDeletionFeedbackEmail(opts: {
  name: string;
  feedbackUrl: string;
  logoUrl: string;
  siteUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = "Ne pare rău că pleci…";

  const bodyHtml = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1A1A1A;line-height:1.2;">
      Ne pare rău că pleci, ${opts.name}
    </h1>
    <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.7;">
      Am observat că ai inițiat ștergerea contului tău NutriAID. Înainte de a pleca definitiv, ne-ar ajuta enorm să înțelegem ce a mers greșit sau ce ar fi putut fi mai bun.
    </p>

    <!-- Feedback options -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fdf8;border:1px solid #d4edda;border-radius:10px;margin-bottom:28px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1A1A1A;">Ce am putea îmbunătăți?</p>
          <p style="margin:0;font-size:13px;color:#555555;line-height:1.8;">
            &bull; Funcționalitățile platformei<br/>
            &bull; Ușurința în utilizare<br/>
            &bull; Calitatea recomandărilor<br/>
            &bull; Prețul abonamentului<br/>
            &bull; Altceva
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.7;">
      Feedback-ul tău ne ajută să creăm o experiență mai bună. Durează mai puțin de un minut.
    </p>

    <!-- CTA -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:0 0 28px;">
          <a href="${opts.feedbackUrl}"
             style="display:inline-block;background-color:#4CAF50;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:10px;letter-spacing:0.2px;">
            Trimite feedback
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#1A1A1A;line-height:1.7;">
      Mulțumim,<br/><strong>Echipa NutriAID</strong>
    </p>`;

  const bodyText = [
    `Dragă ${opts.name},`,
    "",
    "Am observat că ai inițiat ștergerea contului tău NutriAID.",
    "Feedback-ul tău ne ajută să îmbunătățim platforma:",
    "",
    opts.feedbackUrl,
    "",
    "Mulțumim,",
    "Echipa NutriAID",
  ].join("\n");

  const { html, text } = buildEmail({
    logoUrl: opts.logoUrl,
    siteUrl: opts.siteUrl,
    subject,
    preheader: "Feedback-ul tău ne ajută să creăm o experiență mai bună.",
    bodyHtml,
    bodyText,
  });

  return { subject, html, text };
}

// ─── Template 5: Password Reset ──────────────────────────────────────────────

function buildPasswordResetEmail(opts: {
  name: string;
  resetLink: string;
  logoUrl: string;
  siteUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = "Resetare parolă NutriAID";

  const bodyHtml = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1A1A1A;line-height:1.2;">
      Resetare parolă
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.7;">
      Salut, ${opts.name}! Am primit o solicitare de resetare a parolei pentru contul tău NutriAID.<br/>
      Apasă butonul de mai jos pentru a alege o parolă nouă.
    </p>

    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:8px 0 28px;">
          <a href="${opts.resetLink}"
             style="display:inline-block;background-color:#4CAF50;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:15px 44px;border-radius:10px;letter-spacing:0.2px;">
            Resetează parola
          </a>
        </td>
      </tr>
    </table>

    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fdf8;border:1px solid #d4edda;border-radius:10px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:13px;color:#555555;line-height:1.7;">
            &bull; Linkul este valabil <strong>1 oră</strong><br/>
            &bull; Dacă nu ai cerut tu resetarea parolei, ignoră acest mesaj — contul tău este în siguranță<br/>
            &bull; Parola actuală rămâne neschimbată până când folosești linkul
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;line-height:1.7;">
      Dacă butonul nu funcționează, copiază și accesează linkul de mai jos:<br/>
      <a href="${opts.resetLink}" style="color:#4CAF50;word-break:break-all;">${opts.resetLink}</a>
    </p>

    <p style="margin:32px 0 0;font-size:14px;color:#1A1A1A;line-height:1.7;">
      Cu drag,<br/><strong>Echipa NutriAID</strong>
    </p>`;

  const bodyText = [
    `Salut, ${opts.name}!`,
    "",
    "Am primit o solicitare de resetare a parolei pentru contul tău NutriAID.",
    "Accesează linkul de mai jos pentru a alege o parolă nouă (valabil 1 oră):",
    "",
    opts.resetLink,
    "",
    "Dacă nu ai cerut resetarea parolei, ignoră acest mesaj.",
    "",
    "Cu drag,",
    "Echipa NutriAID",
  ].join("\n");

  const { html, text } = buildEmail({
    logoUrl: opts.logoUrl,
    siteUrl: opts.siteUrl,
    subject,
    preheader: "Resetează parola contului tău NutriAID. Linkul este valabil 1 oră.",
    bodyHtml,
    bodyText,
  });

  return { subject, html, text };
}

// ─── Core send function ───────────────────────────────────────────────────────

async function sendEmail(
  kind: EmailKind,
  to: string,
  subject: string,
  html: string,
  text: string,
  token: string,
): Promise<SendEmailResult> {
  let res: Response | null = null;
  try {
    res = await fetch(getBackendEmailUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ to, subject, text, html }),
    });
  } catch (fetchErr) {
    const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
    enqueueFallbackEmail({ kind, to, subject, html, text });
    console.error(`[email:FAIL] fetch to backend failed (${kind}): ${msg}`);
    await logToBackend(token, "error", `[email] ${kind} NOT sent — backend unreachable`, { to, error: msg });
    return { delivered: false };
  }

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { error?: string };
    const reason = errBody.error ?? `HTTP ${res.status}`;
    enqueueFallbackEmail({ kind, to, subject, html, text });
    console.error(`[email:FAIL] backend error (${kind}): ${reason}`);
    await logToBackend(token, "error", `[email] ${kind} NOT sent — ${reason}`, { to, httpStatus: res.status });
    return { delivered: false };
  }

  await logToBackend(token, "info", `[email] ${kind} sent successfully`, { to });
  return { delivered: true };
}

async function getTokenAndSettings() {
  const settings = await getRuntimeSettings();
  const logoUrl = `${settings.backendUrl.replace(/\/$/, "")}/assets/images/app_logo.png`;
  return { settings, logoUrl, token: settings.internalEmailToken };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendVerificationEmail(input: {
  email: string;
  name: string;
  token: string;
}): Promise<SendEmailResult> {
  const { settings, logoUrl, token } = await getTokenAndSettings();

  if (!token) {
    const activationLink = `${settings.siteUrl.replace(/\/$/, "")}/verify?token=${encodeURIComponent(input.token)}`;
    const { subject, html, text } = buildActivationEmail({
      name: input.name,
      activationLink,
      logoUrl,
      siteUrl: settings.siteUrl,
    });
    enqueueFallbackEmail({ kind: "verify-email", to: input.email, subject, html, text });
    console.error(
      `[email:FAIL] internalEmailToken is null — backend unreachable. Email for ${input.email} queued but NOT sent. Link: ${activationLink}`
    );
    return { delivered: false };
  }

  const activationLink = `${settings.siteUrl.replace(/\/$/, "")}/verify?token=${encodeURIComponent(input.token)}`;
  const { subject, html, text } = buildActivationEmail({
    name: input.name,
    activationLink,
    logoUrl,
    siteUrl: settings.siteUrl,
  });

  return sendEmail("verify-email", input.email, subject, html, text, token);
}

export async function sendWelcomeEmail(input: {
  email: string;
  name: string;
}): Promise<SendEmailResult> {
  const { settings, logoUrl, token } = await getTokenAndSettings();
  if (!token) return { delivered: false };

  const dashboardUrl = `${settings.siteUrl.replace(/\/$/, "")}/dashboard`;
  const { subject, html, text } = buildWelcomeEmail({
    name: input.name,
    dashboardUrl,
    logoUrl,
    siteUrl: settings.siteUrl,
  });

  return sendEmail("welcome", input.email, subject, html, text, token);
}

export async function sendDeletionConfirmationEmail(input: {
  email: string;
  name: string;
}): Promise<SendEmailResult> {
  const { settings, logoUrl, token } = await getTokenAndSettings();
  if (!token) return { delivered: false };

  const feedbackUrl = `${settings.siteUrl.replace(/\/$/, "")}/contact?reason=deletion-feedback`;
  const { subject, html, text } = buildDeletionConfirmationEmail({
    name: input.name,
    feedbackUrl,
    logoUrl,
    siteUrl: settings.siteUrl,
  });

  return sendEmail("deletion-confirmation", input.email, subject, html, text, token);
}

export async function sendPasswordResetEmail(input: {
  email: string;
  name: string;
  token: string;
}): Promise<SendEmailResult> {
  const { settings, logoUrl, token } = await getTokenAndSettings();
  if (!token) return { delivered: false };

  const resetLink = `${settings.siteUrl.replace(/\/$/, "")}/auth/reset-password?token=${encodeURIComponent(input.token)}`;
  const { subject, html, text } = buildPasswordResetEmail({
    name: input.name,
    resetLink,
    logoUrl,
    siteUrl: settings.siteUrl,
  });

  return sendEmail("password-reset", input.email, subject, html, text, token);
}

export async function sendDeletionFeedbackEmail(input: {
  email: string;
  name: string;
}): Promise<SendEmailResult> {
  const { settings, logoUrl, token } = await getTokenAndSettings();
  if (!token) return { delivered: false };

  const feedbackUrl = `${settings.siteUrl.replace(/\/$/, "")}/contact?reason=deletion-feedback`;
  const { subject, html, text } = buildDeletionFeedbackEmail({
    name: input.name,
    feedbackUrl,
    logoUrl,
    siteUrl: settings.siteUrl,
  });

  return sendEmail("deletion-feedback", input.email, subject, html, text, token);
}
