import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { listGuidanceByUser } from "@/lib/server/guidance/store";

export const runtime = "nodejs";

// Strip characters outside printable Latin range (pdfkit built-in fonts)
function safeText(value: string): string {
  return value
    .replace(/’/g, "'")
    .replace(/“|”/g, '"')
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/[^\x20-\x7EÀ-ž]/g, "");
}

const GREEN      = "#16a34a";
const GREEN_LIGHT= "#dcfce7";
const RED_DARK   = "#b91c1c";
const RED_LIGHT  = "#fee2e2";
const TEAL       = "#0d9488";
const TEAL_LIGHT = "#ccfbf1";
const AMBER      = "#d97706";
const AMBER_LIGHT= "#fef3c7";
const SLATE      = "#334155";
const SLATE_LIGHT= "#f8fafc";
const BORDER     = "#e2e8f0";
const WHITE      = "#ffffff";
const GRAY       = "#64748b";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const email = session.user.email.trim().toLowerCase();
  const userName = session.user.name?.trim() || "";
  const allHistory = await listGuidanceByUser(email);

  if (allHistory.length === 0) {
    return NextResponse.json(
      { error: "No guidance history found. Generate guidance first." },
      { status: 404 }
    );
  }

  const sorted = [...allHistory].sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
  const latest  = sorted[0].result;
  const generatedAt = sorted[0].generatedAt;

  const PAGE_W = 595.28; // A4 width in points
  const MARGIN  = 40;
  const CONTENT = PAGE_W - MARGIN * 2;

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: "A4", autoFirstPage: true });
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", resolve);
    doc.on("error", reject);

    // ── HELPERS ────────────────────────────────────────────────────────────────

    // Full-width section header bar — returns Y below the bar
    function sectionBar(title: string, color: string, startY: number): number {
      const BAR_H = 26;
      doc.rect(MARGIN, startY, CONTENT, BAR_H).fill(color);
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(WHITE)
        .text(safeText(title), MARGIN + 10, startY + 7, { width: CONTENT - 20, lineBreak: false });
      return startY + BAR_H + 8;
    }

    // Column-scoped header bar (for 2-column layout)
    function colBar(title: string, color: string, x: number, w: number, startY: number): number {
      const BAR_H = 24;
      doc.rect(x, startY, w, BAR_H).fill(color);
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(WHITE)
        .text(safeText(title), x + 8, startY + 6, { width: w - 16, lineBreak: false });
      return startY + BAR_H + 8;
    }

    // Draw a small rounded pill tag; returns the width used
    function tag(text: string, x: number, y: number, bg: string, fg: string): number {
      const label = safeText(text);
      const tw = Math.min(doc.font("Helvetica").fontSize(9).widthOfString(label) + 14, 180);
      doc.rect(x, y, tw, 16).fill(bg);
      doc.font("Helvetica").fontSize(9).fillColor(fg).text(label, x + 7, y + 3, {
        width: tw - 14,
        lineBreak: false,
      });
      return tw + 5;
    }

    // Render a list of food tags in a column of given width, starting at (x, y)
    // Returns the Y coordinate after all tags
    function foodTags(
      foods: string[],
      x: number,
      y: number,
      colWidth: number,
      bg: string,
      fg: string
    ): number {
      let cx = x;
      let cy = y;
      for (const food of foods) {
        const label = safeText(food);
        const tw = Math.min(doc.font("Helvetica").fontSize(9).widthOfString(label) + 14, colWidth);
        if (cx + tw > x + colWidth) {
          cx = x;
          cy += 22;
        }
        tag(food, cx, cy, bg, fg);
        cx += tw + 5;
      }
      return cy + 22;
    }

    // ── HEADER ─────────────────────────────────────────────────────────────────
    doc.rect(0, 0, PAGE_W, 64).fill(GREEN);
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor(WHITE)
      .text("NutriAID", MARGIN, 14);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#bbf7d0")
      .text("Raport personalizat de sensibilitati alimentare", MARGIN, 37);
    // Date right-aligned
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(WHITE)
      .text(
        new Date(generatedAt).toLocaleDateString("ro-RO", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        MARGIN,
        37,
        { width: CONTENT, align: "right" }
      );

    // ── META BAR ───────────────────────────────────────────────────────────────
    const DETAIL_LABEL: Record<string, string> = {
      basic: "De baza",
      detailed: "Detaliat",
      comprehensive: "Complet",
    };
    const detailLabel = DETAIL_LABEL[latest.detailLevel ?? ""] ?? "";

    const metaY = 72;
    doc.rect(MARGIN, metaY, CONTENT, 36).fill(SLATE_LIGHT).stroke(BORDER);
    // Left: name + email
    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(SLATE)
      .text(safeText(userName), MARGIN + 10, metaY + 6, { lineBreak: false });
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(GRAY)
      .text(email, MARGIN + 10, metaY + 20, { lineBreak: false });
    // Right: source + detail level
    const srcLabel =
      latest.source === "fallback"
        ? "Analiza deterministica (AI indisponibil)"
        : "AI — GPT-4o";
    const srcColor = latest.source === "fallback" ? AMBER : GREEN;
    doc
      .font("Helvetica-Oblique")
      .fontSize(8)
      .fillColor(srcColor)
      .text(`Sursa: ${srcLabel}`, MARGIN + 10, metaY + 6, { width: CONTENT - 20, align: "right" });
    if (detailLabel) {
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(GRAY)
        .text(`Nivel detaliu: ${detailLabel}`, MARGIN + 10, metaY + 20, { width: CONTENT - 20, align: "right" });
    }

    let curY = metaY + 52;

    // ── 2-COLUMN FOODS ─────────────────────────────────────────────────────────
    const COL_GAP  = 12;
    const COL_W    = (CONTENT - COL_GAP) / 2;
    const leftX    = MARGIN;
    const rightX   = MARGIN + COL_W + COL_GAP;

    // Each column gets its own header bar at the same Y
    const colTagsStartY = colBar("Alimente recomandate", GREEN,    leftX,  COL_W, curY);
                          colBar("Alimente de evitat",   RED_DARK, rightX, COL_W, curY);
    curY = colTagsStartY; // both bars are same height

    const recFoods  = latest.recommendedFoods ?? [];
    const avoidFoods = latest.avoidFoods ?? [];

    const recEndY   = foodTags(recFoods,   leftX,  curY, COL_W,  GREEN_LIGHT, GREEN);
    const avoidEndY = foodTags(avoidFoods, rightX, curY, COL_W,  RED_LIGHT,   RED_DARK);

    curY = Math.max(recEndY, avoidEndY) + 16;

    // ── MEAL EXAMPLES ──────────────────────────────────────────────────────────
    const mealExamples = latest.mealExamples ?? [];
    if (mealExamples.length > 0) {
      // Check if we need a new page
      if (curY > doc.page.height - 180) {
        doc.addPage();
        curY = MARGIN;
      }

      curY = sectionBar("Exemple de mese", TEAL, curY);

      for (const meal of mealExamples) {
        // Estimate height needed: title(14) + tags row(22) + optional note(14) + padding(16)
        const estimatedH = 14 + 22 * Math.ceil(meal.ingredients.length / 4) + (meal.notes ? 14 : 0) + 24;
        if (curY + estimatedH > doc.page.height - MARGIN - 60) {
          doc.addPage();
          curY = MARGIN;
        }

        // Card background
        doc.rect(MARGIN, curY, CONTENT, estimatedH).fill(SLATE_LIGHT).stroke(BORDER);

        // Meal name
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(SLATE)
          .text(safeText(meal.name), MARGIN + 12, curY + 9, {
            width: CONTENT - 24,
            lineBreak: false,
          });

        // Ingredients as teal tags
        let tx = MARGIN + 12;
        let ty = curY + 25;
        for (const ing of meal.ingredients) {
          const label = safeText(ing);
          const tw = Math.min(doc.font("Helvetica").fontSize(8.5).widthOfString(label) + 12, COL_W);
          if (tx + tw > MARGIN + CONTENT - 12) {
            tx = MARGIN + 12;
            ty += 20;
          }
          doc.rect(tx, ty, tw, 15).fill(TEAL_LIGHT);
          doc.font("Helvetica").fontSize(8.5).fillColor(TEAL).text(label, tx + 6, ty + 3, {
            width: tw - 12,
            lineBreak: false,
          });
          tx += tw + 5;
        }

        // Notes
        if (meal.notes) {
          const noteY = ty + 20;
          doc
            .font("Helvetica-Oblique")
            .fontSize(8)
            .fillColor(GRAY)
            .text(safeText(meal.notes), MARGIN + 12, noteY, { width: CONTENT - 24 });
        }

        curY += estimatedH + 8;
      }

      curY += 8;
    }

    // ── GENERAL TIPS ──────────────────────────────────────────────────────────
    const tips = latest.generalTips ?? [];
    if (tips.length > 0) {
      if (curY > doc.page.height - 120) {
        doc.addPage();
        curY = MARGIN;
      }

      curY = sectionBar("Sfaturi si observatii", "#0f766e", curY);

      for (const tip of tips) {
        const text = `• ${safeText(tip)}`;
        const lineH = doc.font("Helvetica").fontSize(9).heightOfString(text, { width: CONTENT - 24 });
        if (curY + lineH + 8 > doc.page.height - MARGIN - 60) {
          doc.addPage();
          curY = MARGIN;
        }
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(SLATE)
          .text(text, MARGIN + 12, curY, { width: CONTENT - 24 });
        curY += lineH + 6;
      }
      curY += 8;
    }

    // ── WARNINGS ──────────────────────────────────────────────────────────────
    const warnings = latest.warnings ?? [];
    if (warnings.length > 0) {
      if (curY > doc.page.height - 100) {
        doc.addPage();
        curY = MARGIN;
      }
      curY = sectionBar("Avertismente", AMBER, curY);
      for (const w of warnings) {
        doc
          .font("Helvetica-Oblique")
          .fontSize(9)
          .fillColor(AMBER)
          .text(`⚠ ${safeText(w)}`, MARGIN + 12, curY, { width: CONTENT - 24 });
        curY += 16;
      }
      curY += 8;
    }

    // ── DISCLAIMER ────────────────────────────────────────────────────────────
    const disclaimer = safeText(
      latest.disclaimer ||
        "Acest raport descrie corelatii observate in jurnalul alimentar si nu reprezinta sfat medical. Nu inlocuieste consultatia unui medic sau nutritionist."
    );
    const discH = doc.font("Helvetica").fontSize(8).heightOfString(disclaimer, { width: CONTENT - 24 }) + 28;

    // Force disclaimer onto same page if it fits, else new page
    if (curY + discH > doc.page.height - MARGIN) {
      doc.addPage();
      curY = MARGIN;
    }

    doc.rect(MARGIN, curY, CONTENT, discH).fill(AMBER_LIGHT).stroke("#fcd34d");
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#92400e")
      .text("DISCLAIMER MEDICAL", MARGIN + 12, curY + 8);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#78350f")
      .text(disclaimer, MARGIN + 12, curY + 20, { width: CONTENT - 24 });

    doc.end();
  });

  const pdfBuffer = Buffer.concat(chunks);
  const filename = `nutriaid_raport_${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
