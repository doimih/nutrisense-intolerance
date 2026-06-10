import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { listGuidanceByUser } from "@/lib/server/guidance/store";

export const runtime = "nodejs";

function safeText(value: string): string {
  return value.replace(/[^\x20-\x7EÀ-ž]/g, (c) => {
    // keep Romanian diacritics as-is; strip anything else outside latin range
    return c;
  });
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const email = session.user.email.trim().toLowerCase();
  const allHistory = await listGuidanceByUser(email);

  if (allHistory.length === 0) {
    return NextResponse.json({ error: "No guidance history found. Log meals and generate guidance first." }, { status: 404 });
  }

  // Most recent guidance first
  const sorted = [...allHistory].sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
  const latest = sorted[0].result;
  const generatedAt = sorted[0].generatedAt;

  // Build symptom trend: count entries with symptoms per guidance record
  const trendData = sorted.slice(0, 10).reverse().map((rec, i) => ({
    label: `R${i + 1}`,
    avoidCount: rec.result.avoidFoods?.length ?? 0,
    tipCount: rec.result.generalTips?.length ?? 0,
    source: rec.result.source ?? "ai",
  }));

  // Generate PDF in memory
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", resolve);
    doc.on("error", reject);

    const GREEN = "#16a34a";
    const SLATE = "#334155";
    const LIGHT = "#f8fafc";
    const BORDER = "#e2e8f0";

    // ── Header ──────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 70).fill(GREEN);
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("white")
      .text("NutriAID Intolerances", 50, 22);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("white")
      .text("Raport personalizat de sensibilitati alimentare", 50, 46);

    doc.moveDown(3);

    // ── Meta ─────────────────────────────────────────────────────────────────
    const metaY = 90;
    doc.rect(50, metaY, doc.page.width - 100, 44).fill(LIGHT).stroke(BORDER);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(SLATE)
      .text(`Utilizator: ${email}`, 60, metaY + 8)
      .text(
        `Generat la: ${new Date(generatedAt).toLocaleDateString("ro-RO", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        60,
        metaY + 22
      );
    doc
      .font("Helvetica-Oblique")
      .fontSize(9)
      .fillColor(latest.source === "fallback" ? "#b45309" : GREEN)
      .text(
        `Sursa: ${latest.source === "fallback" ? "Analiza deterministica (AI indisponibil)" : "AI (model GPT-4o)"}`,
        doc.page.width / 2,
        metaY + 22,
        { align: "right" }
      );

    doc.y = metaY + 60;

    // ── Section helper ───────────────────────────────────────────────────────
    function sectionHeader(title: string) {
      doc
        .rect(50, doc.y, doc.page.width - 100, 22)
        .fill(GREEN);
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("white")
        .text(title, 58, doc.y - 18);
      doc.moveDown(0.3);
    }

    function pill(text: string, x: number, y: number, bg: string, fg: string) {
      const w = Math.min(doc.widthOfString(text) + 16, 200);
      doc.rect(x, y, w, 18).fill(bg);
      doc.font("Helvetica").fontSize(9).fillColor(fg).text(text, x + 8, y + 4, { width: w - 16, lineBreak: false });
      return w + 6;
    }

    // ── Alimente recomandate ─────────────────────────────────────────────────
    if (latest.recommendedFoods?.length > 0) {
      sectionHeader("Alimente recomandate (sigure pentru tine)");
      let px = 50;
      let py = doc.y + 4;
      for (const food of latest.recommendedFoods) {
        const w = pill(safeText(food), px, py, "#dcfce7", GREEN);
        px += w;
        if (px > doc.page.width - 100) {
          px = 50;
          py += 24;
        }
      }
      doc.y = py + 28;
      doc.moveDown(0.5);
    }

    // ── Alimente de evitat ───────────────────────────────────────────────────
    if (latest.avoidFoods?.length > 0) {
      sectionHeader("Alimente de evitat sau de testat cu atentie");
      let px = 50;
      let py = doc.y + 4;
      for (const food of latest.avoidFoods) {
        const w = pill(safeText(food), px, py, "#fee2e2", "#b91c1c");
        px += w;
        if (px > doc.page.width - 100) {
          px = 50;
          py += 24;
        }
      }
      doc.y = py + 28;
      doc.moveDown(0.5);
    }

    // ── Exemple de mese ──────────────────────────────────────────────────────
    if (latest.mealExamples?.length > 0) {
      sectionHeader("Exemple de mese personalizate");
      for (const meal of latest.mealExamples) {
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(SLATE)
          .text(safeText(meal.name), 58, doc.y + 6);
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor("#64748b")
          .text(
            `Ingrediente: ${meal.ingredients.map(safeText).join(", ")}`,
            66,
            doc.y + 2
          );
        if (meal.notes) {
          doc
            .font("Helvetica-Oblique")
            .fontSize(8)
            .fillColor("#94a3b8")
            .text(safeText(meal.notes), 66, doc.y + 2);
        }
        doc.moveDown(0.4);
      }
      doc.moveDown(0.5);
    }

    // ── Sfaturi generale ─────────────────────────────────────────────────────
    if (latest.generalTips?.length > 0) {
      sectionHeader("Sfaturi si observatii AI");
      for (const tip of latest.generalTips) {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(SLATE)
          .text(`• ${safeText(tip)}`, 58, doc.y + 4, { width: doc.page.width - 116 });
        doc.moveDown(0.3);
      }
      doc.moveDown(0.5);
    }

    // ── Avertismente ─────────────────────────────────────────────────────────
    if (latest.warnings && latest.warnings.length > 0) {
      sectionHeader("Avertismente");
      for (const w of latest.warnings) {
        doc
          .font("Helvetica-Oblique")
          .fontSize(9)
          .fillColor("#b45309")
          .text(`⚠ ${safeText(w)}`, 58, doc.y + 4, { width: doc.page.width - 116 });
        doc.moveDown(0.3);
      }
      doc.moveDown(0.5);
    }

    // ── Evolutie rapoarte ────────────────────────────────────────────────────
    if (trendData.length > 1) {
      sectionHeader(`Evolutie: ultimele ${trendData.length} rapoarte`);
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(SLATE)
        .text(
          `Nr. rapoarte salvate: ${sorted.length}  |  Primul raport: ${new Date(sorted[sorted.length - 1].generatedAt).toLocaleDateString("ro-RO")}  |  Ultimul: ${new Date(sorted[0].generatedAt).toLocaleDateString("ro-RO")}`,
          58,
          doc.y + 6,
          { width: doc.page.width - 116 }
        );
      doc.moveDown(1);
    }

    // ── Disclaimer ───────────────────────────────────────────────────────────
    const disclaimerY = doc.page.height - 80;
    doc.rect(50, disclaimerY, doc.page.width - 100, 44).fill("#fef9c3");
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#854d0e")
      .text("DISCLAIMER MEDICAL", 58, disclaimerY + 6);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#92400e")
      .text(
        safeText(
          latest.disclaimer ||
            "Acest raport descrie corelatii observate in jurnalul alimentar si nu reprezinta sfat medical. Nu inlocuieste consultatia unui medic sau nutritionist."
        ),
        58,
        disclaimerY + 18,
        { width: doc.page.width - 116 }
      );

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
