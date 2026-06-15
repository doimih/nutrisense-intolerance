import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { Readable } from 'node:stream';
import PDFDocument from 'pdfkit';
import { appendAcquisitionDownload } from '@/lib/server/acquisitionStore';

export const runtime = 'nodejs';

// Maps document filenames to their subfolders
const FILE_MAP: Record<string, string> = {
  // Executive & Product
  'Executive-Summary.pdf': 'Executive-and-Product-Reports',
  'Product-Overview.pdf': 'Executive-and-Product-Reports',
  'Unique-Selling-Points.pdf': 'Executive-and-Product-Reports',
  'Demo-Walkthrough.pdf': 'Executive-and-Product-Reports',
  // Technical
  'Architecture-Report.pdf': 'Technical-Documentation',
  'AI-Brain-Documentation.pdf': 'Technical-Documentation',
  'Self-Healing-Layer.pdf': 'Technical-Documentation',
  'Diagnostic-Engine.pdf': 'Technical-Documentation',
  'Prompt-Rewriter.pdf': 'Technical-Documentation',
  'Worker-Orchestration.pdf': 'Technical-Documentation',
  'API-Documentation.pdf': 'Technical-Documentation',
  'Database-Schema-Report.pdf': 'Technical-Documentation',
  // Deployment
  'Installation-Guide.pdf': 'Installation-and-Deployment',
  'Deployment-Guide.pdf': 'Installation-and-Deployment',
  'Scaling-Guide.pdf': 'Installation-and-Deployment',
  // Business
  'Market-Analysis.pdf': 'Business-and-Valuation',
  'Target-Audience-Report.pdf': 'Business-and-Valuation',
  'Competitive-Analysis.pdf': 'Business-and-Valuation',
  'Monetization-Models.pdf': 'Business-and-Valuation',
  'Cost-Structure.pdf': 'Business-and-Valuation',
  'Valuation-Report.pdf': 'Business-and-Valuation',
  'Growth-Strategy.pdf': 'Business-and-Valuation',
  // Media Kit
  'Media-Kit-Report.pdf': 'Media-Kit',
  'Demo-Video-Script.pdf': 'Media-Kit',
  'Short-Video-Script.pdf': 'Media-Kit',
  'Branding-Guidelines.pdf': 'Media-Kit',
  // Legal
  'NDA.pdf': 'Legal-Pack',
  'IP-Transfer-Agreement.pdf': 'Legal-Pack',
  'License-Agreement.pdf': 'Legal-Pack',
  'Terms-of-Sale.pdf': 'Legal-Pack',
  'Liability-Disclaimer.pdf': 'Legal-Pack',
};

// ─── Colours ──────────────────────────────────────────────────────────────────
const GREEN       = '#16a34a';
const SLATE_900   = '#0f172a';
const SLATE_700   = '#334155';
const SLATE_500   = '#64748b';
const SLATE_50    = '#f8fafc';
const BORDER      = '#e2e8f0';
const WHITE       = '#ffffff';
const YELLOW_BG   = '#fef9c3';
const YELLOW_BAR  = '#eab308';
const YELLOW_TEXT = '#713f12';

// Strip characters outside printable Latin range (pdfkit built-in fonts)
function safe(s: string): string {
  return s
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

// ─── Markdown → PDF ───────────────────────────────────────────────────────────
async function buildPdfFromMarkdown(mdContent: string): Promise<Buffer> {
  const PAGE_W      = 595.28;
  const PAGE_H      = 841.89;
  const MARGIN      = 48;
  const CONTENT_W   = PAGE_W - MARGIN * 2;
  const HEADER_H    = 52;
  const CONTENT_TOP = HEADER_H + 16;
  const FOOTER_H    = 32;
  const BOTTOM_LIMIT = PAGE_H - FOOTER_H - 8;

  const SKIP_PREFIXES = ['**FILE PATH:**', '**DOWNLOAD LINK:**'];

  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      margin: MARGIN,
      size: 'A4',
      autoFirstPage: true,
      bufferPages: true,
    });

    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Header strip (drawn on every new page) ─────────────────────────────
    function drawHeader() {
      const today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric',
      });
      doc.rect(0, 0, PAGE_W, HEADER_H).fill(GREEN);
      doc.font('Helvetica-Bold').fontSize(15).fillColor(WHITE)
        .text('NutriAID', MARGIN, 13, { lineBreak: false });
      doc.font('Helvetica').fontSize(8).fillColor('#bbf7d0')
        .text('Acquisition Portal  •  Confidential Document', MARGIN, 34, { lineBreak: false });
      doc.font('Helvetica').fontSize(8).fillColor(WHITE)
        .text(today, MARGIN, 34, { width: CONTENT_W, align: 'right', lineBreak: false });
    }

    drawHeader();
    doc.y = CONTENT_TOP;

    // ── Space guard ────────────────────────────────────────────────────────
    function need(h: number) {
      if (doc.y + h > BOTTOM_LIMIT) {
        doc.addPage();
        drawHeader();
        doc.y = CONTENT_TOP;
      }
    }

    // Safe moveDown — clamps so doc.y never exceeds BOTTOM_LIMIT
    function move(amount: number) {
      const LINE = 12;
      const delta = amount * LINE;
      if (doc.y + delta < BOTTOM_LIMIT) {
        doc.moveDown(amount);
      } else {
        doc.y = BOTTOM_LIMIT - 2;
      }
    }

    // ── Inline bold renderer (splits on **) ────────────────────────────────
    function inlineBold(
      text: string,
      x: number,
      startY: number,
      maxW: number,
      fontSize: number,
      normalColor: string,
    ) {
      const parts = text.split('**');
      let firstWritten = false;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;

        const isBold = i % 2 === 1;
        const remaining = parts.slice(i + 1);
        const isLast = remaining.every((p) => !p);

        doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(fontSize)
          .fillColor(isBold ? SLATE_900 : normalColor);

        if (!firstWritten) {
          doc.text(safe(part), x, startY, { continued: !isLast, width: maxW });
          firstWritten = true;
        } else {
          doc.text(safe(part), { continued: !isLast, width: maxW });
        }
      }
    }

    // ── Line-by-line rendering ─────────────────────────────────────────────
    // Trim trailing blank lines to prevent empty pages at the end
    const rawLines = mdContent.split('\n');
    while (rawLines.length > 0 && !rawLines[rawLines.length - 1].trim()) rawLines.pop();
    const lines = rawLines;

    let prevWasBlank = false;

    for (const raw of lines) {
      const line = raw.trim();

      // Skip metadata header lines
      if (SKIP_PREFIXES.some((p) => line.startsWith(p))) continue;

      // Blank line — collapse consecutive blanks into one small gap
      if (!line) {
        if (!prevWasBlank) move(0.3);
        prevWasBlank = true;
        continue;
      }
      prevWasBlank = false;

      // Horizontal rule
      if (line === '---') {
        need(20);
        move(0.3);
        const ry = doc.y;
        doc.moveTo(MARGIN, ry).lineTo(MARGIN + CONTENT_W, ry)
          .strokeColor(BORDER).lineWidth(0.5).stroke();
        doc.y = ry + 8;
        continue;
      }

      // H1
      if (line.startsWith('# ')) {
        const text = safe(line.slice(2).replace(/\*\*/g, ''));
        need(56);
        move(0.4);
        doc.font('Helvetica-Bold').fontSize(17).fillColor(SLATE_900)
          .text(text, MARGIN, doc.y, { width: CONTENT_W });
        move(0.3);
        continue;
      }

      // H2 — green section bar (spacing included in need estimate)
      if (line.startsWith('## ')) {
        const text = safe(line.slice(3).replace(/\*\*/g, ''));
        need(56);
        move(0.6);
        const by = doc.y;
        doc.rect(MARGIN, by, CONTENT_W, 24).fill(GREEN);
        doc.font('Helvetica-Bold').fontSize(10.5).fillColor(WHITE)
          .text(text, MARGIN + 10, by + 6, { width: CONTENT_W - 20, lineBreak: false });
        doc.y = by + 32;
        continue;
      }

      // H3
      if (line.startsWith('### ')) {
        const text = safe(line.slice(4).replace(/\*\*/g, ''));
        need(34);
        move(0.4);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(SLATE_700)
          .text(text, MARGIN, doc.y, { width: CONTENT_W });
        move(0.2);
        continue;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        const inner = safe(line.slice(2).replace(/\*\*/g, ''));
        const th = doc.font('Helvetica-Oblique').fontSize(8.5)
          .heightOfString(inner, { width: CONTENT_W - 32 });
        const bh = th + 20;
        need(bh + 16);
        move(0.3);
        const qy = doc.y;
        doc.rect(MARGIN, qy, CONTENT_W, bh).fill(YELLOW_BG);
        doc.rect(MARGIN, qy, 3, bh).fill(YELLOW_BAR);
        doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(YELLOW_TEXT)
          .text(inner, MARGIN + 14, qy + 10, { width: CONTENT_W - 32 });
        doc.y = qy + bh + 10;
        continue;
      }

      // Bullet list item
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const inner = safe(line.slice(2).replace(/\*\*/g, ''));
        need(22);
        const ly = doc.y;
        doc.font('Helvetica').fontSize(9).fillColor(GREEN)
          .text('•', MARGIN + 8, ly, { width: 12, lineBreak: false });
        doc.font('Helvetica').fontSize(9).fillColor(SLATE_700)
          .text(inner, MARGIN + 22, ly, { width: CONTENT_W - 22 });
        move(0.1);
        continue;
      }

      // Line with inline bold
      if (line.includes('**')) {
        need(22);
        const ly = doc.y;
        inlineBold(line, MARGIN, ly, CONTENT_W, 9, SLATE_700);
        move(0.3);
        continue;
      }

      // Plain paragraph (strip leading * for italic lines)
      const plainText = safe(line.replace(/^\*(.+)\*$/, '$1'));
      need(18);
      doc.font('Helvetica').fontSize(9).fillColor(SLATE_700)
        .text(plainText, MARGIN, doc.y, { width: CONTENT_W });
      move(0.2);
    }

    // ── Footer on every page ───────────────────────────────────────────────
    const range = doc.bufferedPageRange();
    const total = range.count;
    for (let i = range.start; i < range.start + total; i++) {
      doc.switchToPage(i);
      const fy = PAGE_H - FOOTER_H;
      doc.rect(0, fy, PAGE_W, FOOTER_H).fill(SLATE_50);
      doc.moveTo(0, fy).lineTo(PAGE_W, fy).strokeColor(BORDER).lineWidth(0.5).stroke();
      doc.font('Helvetica').fontSize(7).fillColor(SLATE_500).text(
        `NutriAID Acquisition Portal  •  Confidential  •  Page ${i - range.start + 1} of ${total}`,
        MARGIN, fy + 11, { width: CONTENT_W, align: 'center', lineBreak: false },
      );
    }

    doc.end();
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '0.0.0.0'
  );
}

function getCdnCountryCode(request: NextRequest): string | null {
  return (
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('x-country') ||
    null
  );
}

function isPrivateIp(ip: string): boolean {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '0.0.0.0' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

async function resolveCountryName(ip: string, cdnCode: string | null): Promise<string | null> {
  if (cdnCode) {
    try {
      return new Intl.DisplayNames(['en'], { type: 'region' }).of(cdnCode) ?? cdnCode;
    } catch { return cdnCode; }
  }
  if (isPrivateIp(ip)) return null;
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 2000);
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country`, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) return null;
    const data = await res.json() as { country?: string };
    return data.country ?? null;
  } catch { return null; }
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const file = searchParams.get('file')?.trim();

  if (!file) {
    return NextResponse.json({ error: 'Missing file parameter.' }, { status: 400 });
  }

  const safeFile = basename(file);
  const ext = extname(safeFile).toLowerCase();
  if (ext !== '.pdf' && ext !== '.md') {
    return NextResponse.json({ error: 'Invalid file type.' }, { status: 400 });
  }

  const subfolder = FILE_MAP[safeFile];
  if (!subfolder) {
    return NextResponse.json({ error: 'Unknown document.' }, { status: 404 });
  }

  const ip = getClientIp(request);
  const cdnCode = getCdnCountryCode(request);
  const userAgent = request.headers.get('user-agent') ?? '';

  try {
    const country = await resolveCountryName(ip, cdnCode);
    appendAcquisitionDownload({
      timestamp: new Date().toISOString(),
      ip,
      country,
      userAgent,
      file: safeFile,
      subfolder,
    });
  } catch {
    // Non-critical — never fail the download because of logging
  }

  const dataRoot = join(process.cwd(), 'data', 'acquisition', subfolder);
  const pdfPath  = join(dataRoot, safeFile);
  const mdPath   = join(dataRoot, safeFile.replace(/\.pdf$/, '.md'));

  // Serve pre-built PDF if it exists
  if (existsSync(pdfPath)) {
    const stat   = statSync(pdfPath);
    const stream = createReadStream(pdfPath);
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(stat.size),
        'Content-Disposition': `attachment; filename="${safeFile}"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  // Generate PDF on-the-fly from .md source
  if (existsSync(mdPath)) {
    const mdContent = readFileSync(mdPath, 'utf-8');
    const pdfBuffer = await buildPdfFromMarkdown(mdContent);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(pdfBuffer.byteLength),
        'Content-Disposition': `attachment; filename="${safeFile}"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.json(
    { error: 'Document not yet available. Contact acquire@nutriaid.eu to request access.' },
    { status: 404 },
  );
}
