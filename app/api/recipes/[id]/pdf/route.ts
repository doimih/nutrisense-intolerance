import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import path from "path";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { getRecipeById } from "@/lib/server/recipeStore";
import { isAppLanguage } from "@/lib/i18n/config";

export const runtime = "nodejs";

function safeText(value: string): string {
  return value
    // curly quotes / dashes
    .replace(/'/g, "'").replace(/'/g, "'")
    .replace(/"|"/g, '"')
    .replace(/—/g, "-").replace(/–/g, "-")
    // Romanian diacritics → ASCII equivalents (both Unicode and legacy forms)
    .replace(/[ăĂ]/g, (c) => c === c.toUpperCase() ? "A" : "a")
    .replace(/[âÂ]/g, (c) => c === c.toUpperCase() ? "A" : "a")
    .replace(/[îÎ]/g, (c) => c === c.toUpperCase() ? "I" : "i")
    .replace(/[șȘşŞ]/g, (c) => c === c.toUpperCase() ? "S" : "s")
    .replace(/[țȚţŢ]/g, (c) => c === c.toUpperCase() ? "T" : "t")
    // strip anything remaining outside printable Latin-1
    .replace(/[^\x20-\x7E\xC0-\xFF]/g, "");
}

const LABELS = {
  ro: {
    subtitle: "Reteta personalizata NutriAID",
    prepTime: "Timp preparare",
    minutes: "min",
    calories: "calorii",
    difficulty: { easy: "Usor", medium: "Mediu", hard: "Dificil" },
    category: { breakfast: "Mic dejun", lunch: "Pranz", dinner: "Cina", snack: "Gustare" },
    ingredients: "Ingrediente",
    instructions: "Instructiuni de gatit",
    tips: "Sfaturi utile",
    substitutions: "Substitutii",
    substituteWith: "Inlocuitor",
    allergens: "Alergeni",
    macros: "Macronutrienti",
    protein: "Proteine",
    carbs: "Carbohidrati",
    fats: "Grasimi",
    disclaimer: "Aceasta reteta are scop informativ si nu reprezinta sfat medical sau nutritional. Consultati un specialist inainte de a face schimbari majore in alimentatie.",
    disclaimerLabel: "NOTA",
    filename: "nutriaid_reteta",
    step: "Pasul",
    cuisine: "Bucatarie",
  },
  en: {
    subtitle: "NutriAID Personalised Recipe",
    prepTime: "Prep time",
    minutes: "min",
    calories: "calories",
    difficulty: { easy: "Easy", medium: "Medium", hard: "Hard" },
    category: { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" },
    ingredients: "Ingredients",
    instructions: "Cooking instructions",
    tips: "Cooking tips",
    substitutions: "Substitutions",
    substituteWith: "Substitute with",
    allergens: "Allergens",
    macros: "Macros",
    protein: "Protein",
    carbs: "Carbs",
    fats: "Fats",
    disclaimer: "This recipe is for informational purposes only and does not constitute medical or nutritional advice. Consult a specialist before making major dietary changes.",
    disclaimerLabel: "NOTE",
    filename: "nutriaid_recipe",
    step: "Step",
    cuisine: "Cuisine",
  },
} as const;

const GREEN       = "#16a34a";
const GREEN_LIGHT = "#dcfce7";
const TEAL        = "#0d9488";
const TEAL_LIGHT  = "#ccfbf1";
const AMBER       = "#d97706";
const AMBER_LIGHT = "#fef3c7";
const SLATE       = "#334155";
const SLATE_LIGHT = "#f8fafc";
const GRAY        = "#64748b";
const BORDER      = "#e2e8f0";
const WHITE       = "#ffffff";
const RED_DARK    = "#b91c1c";
const RED_LIGHT   = "#fee2e2";
const PURPLE      = "#7c3aed";
const PURPLE_LIGHT = "#ede9fe";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const rawLang = request.nextUrl.searchParams.get("lang") ??
    request.cookies.get("ns_lang")?.value;
  const lang = isAppLanguage(rawLang) ? rawLang : "ro";
  const L = LABELS[lang];

  const recipe = await getRecipeById(params.id);
  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  }

  const title = lang === "ro" ? recipe.titleRo : recipe.titleEn;
  const ingredients = lang === "ro" ? recipe.ingredientsRo : recipe.ingredientsEn;
  const instructions = lang === "ro" ? recipe.instructionsRo : recipe.instructionsEn;
  const tips = lang === "ro" ? recipe.cookingTipsRo : recipe.cookingTipsEn;
  const substitutions = lang === "ro" ? recipe.substitutionsRo : recipe.substitutionsEn;
  const allergens = recipe.allergens ?? [];

  const PAGE_W = 595.28;
  const MARGIN  = 40;
  const CONTENT = PAGE_W - MARGIN * 2;

  const LOGO_PATH = path.join(process.cwd(), "public", "icon-192.png");

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: "A4", autoFirstPage: true, bufferPages: true });
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", resolve);
    doc.on("error", reject);

    // ── HELPERS ──────────────────────────────────────────────────────────────

    function sectionBar(sectionTitle: string, color: string, y: number): number {
      const H = 26;
      doc.rect(MARGIN, y, CONTENT, H).fill(color);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(WHITE)
        .text(safeText(sectionTitle), MARGIN + 10, y + 7, { width: CONTENT - 20, lineBreak: false });
      return y + H + 10;
    }

    function ensureSpace(needed: number, y: number): number {
      if (y + needed > doc.page.height - MARGIN - 60) {
        doc.addPage();
        return MARGIN;
      }
      return y;
    }

    // ── HEADER BAND ──────────────────────────────────────────────────────────
    doc.rect(0, 0, PAGE_W, 70).fill(GREEN);

    // Logo PNG (icon-192.png) — fallback to styled circle if missing
    try {
      doc.image(LOGO_PATH, MARGIN, 10, { width: 48, height: 48 });
      doc.font("Helvetica-Bold").fontSize(20).fillColor(WHITE)
        .text("NutriAID", MARGIN + 56, 14, { lineBreak: false });
      doc.font("Helvetica").fontSize(9).fillColor("#bbf7d0")
        .text(L.subtitle, MARGIN + 56, 38, { lineBreak: false });
    } catch {
      doc.circle(MARGIN + 14, 28, 14).fill(WHITE);
      doc.font("Helvetica-Bold").fontSize(10).fillColor(GREEN)
        .text("N", MARGIN + 8, 22, { lineBreak: false });
      doc.font("Helvetica-Bold").fontSize(20).fillColor(WHITE)
        .text("NutriAID", MARGIN + 32, 14, { lineBreak: false });
      doc.font("Helvetica").fontSize(9).fillColor("#bbf7d0")
        .text(L.subtitle, MARGIN + 32, 38, { lineBreak: false });
    }

    // Date top-right
    doc.font("Helvetica").fontSize(8).fillColor(WHITE)
      .text(
        new Date().toLocaleDateString(lang === "ro" ? "ro-RO" : "en-GB", {
          day: "2-digit", month: "long", year: "numeric",
        }),
        MARGIN, 22, { width: CONTENT, align: "right" }
      );

    // ── RECIPE TITLE BLOCK ───────────────────────────────────────────────────
    let curY = 82;

    // Category + Difficulty badges
    const catLabel = L.category[recipe.category as keyof typeof L.category] ?? recipe.category;
    const diffLabel = L.difficulty[recipe.difficulty as keyof typeof L.difficulty] ?? recipe.difficulty;
    const diffColor = recipe.difficulty === "easy" ? GREEN : recipe.difficulty === "medium" ? AMBER : RED_DARK;
    const diffBg = recipe.difficulty === "easy" ? GREEN_LIGHT : recipe.difficulty === "medium" ? AMBER_LIGHT : RED_LIGHT;

    // Cat badge
    const catW = doc.font("Helvetica-Bold").fontSize(8).widthOfString(catLabel) + 16;
    doc.rect(MARGIN, curY, catW, 18).fill(TEAL_LIGHT);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(TEAL)
      .text(safeText(catLabel), MARGIN + 8, curY + 4, { lineBreak: false });

    // Diff badge
    const diffW = doc.font("Helvetica-Bold").fontSize(8).widthOfString(diffLabel) + 16;
    doc.rect(MARGIN + catW + 6, curY, diffW, 18).fill(diffBg);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(diffColor)
      .text(safeText(diffLabel), MARGIN + catW + 14, curY + 4, { lineBreak: false });

    // Cuisine badge
    if (recipe.cuisine) {
      const cuisineW = doc.font("Helvetica").fontSize(8).widthOfString(recipe.cuisine) + 16;
      doc.rect(MARGIN + catW + diffW + 12, curY, cuisineW, 18).fill(PURPLE_LIGHT);
      doc.font("Helvetica").fontSize(8).fillColor(PURPLE)
        .text(safeText(recipe.cuisine), MARGIN + catW + diffW + 20, curY + 4, { lineBreak: false });
    }

    curY += 26;

    // Title
    doc.font("Helvetica-Bold").fontSize(18).fillColor(SLATE)
      .text(safeText(title), MARGIN, curY, { width: CONTENT });
    curY += doc.font("Helvetica-Bold").fontSize(18).heightOfString(title, { width: CONTENT }) + 6;

    // Meta row: prep time, calories
    const metaParts: string[] = [
      `${L.prepTime}: ${recipe.prepTimeMinutes} ${L.minutes}`,
    ];
    if (recipe.calories) metaParts.push(`${recipe.calories} ${L.calories}`);
    doc.font("Helvetica").fontSize(9).fillColor(GRAY)
      .text(metaParts.join("  ·  "), MARGIN, curY, { lineBreak: false });
    curY += 18;

    // Macros row
    if (recipe.macros) {
      const { protein, carbs, fats } = recipe.macros;
      const macroStr = `${L.protein}: ${protein}g  ·  ${L.carbs}: ${carbs}g  ·  ${L.fats}: ${fats}g`;
      doc.font("Helvetica").fontSize(9).fillColor(GRAY)
        .text(safeText(macroStr), MARGIN, curY, { lineBreak: false });
      curY += 18;
    }

    // Divider
    doc.moveTo(MARGIN, curY).lineTo(MARGIN + CONTENT, curY).strokeColor(BORDER).lineWidth(1).stroke();
    curY += 14;

    // ── ALLERGENS WARNING ────────────────────────────────────────────────────
    if (allergens.length > 0) {
      curY = ensureSpace(40, curY);
      const allergenStr = allergens.join(", ");
      const allergenH = doc.font("Helvetica").fontSize(8.5).heightOfString(allergenStr, { width: CONTENT - 24 }) + 22;
      doc.rect(MARGIN, curY, CONTENT, allergenH).fill(AMBER_LIGHT).stroke("#fcd34d");
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#92400e")
        .text(`! ${L.allergens}: `, MARGIN + 10, curY + 8, { continued: true, lineBreak: false });
      doc.font("Helvetica").fontSize(8).fillColor("#78350f")
        .text(safeText(allergenStr), { width: CONTENT - 24 });
      curY += allergenH + 10;
    }

    // ── INGREDIENTS ──────────────────────────────────────────────────────────
    curY = ensureSpace(60, curY);
    curY = sectionBar(L.ingredients, TEAL, curY);

    for (const ing of ingredients) {
      curY = ensureSpace(24, curY);
      const ingLine = `${safeText(ing.quantity)} ${safeText(ing.unit)}  ${safeText(ing.name)}`.trim();
      const bulletX = MARGIN + 10;
      const textX = MARGIN + 22;
      doc.circle(bulletX, curY + 5, 3).fill(TEAL);
      doc.font("Helvetica").fontSize(9.5).fillColor(SLATE)
        .text(ingLine, textX, curY, { width: CONTENT - 22 });
      const lineH = doc.font("Helvetica").fontSize(9.5).heightOfString(ingLine, { width: CONTENT - 22 });
      curY += lineH + 5;
    }
    curY += 10;

    // ── INSTRUCTIONS ─────────────────────────────────────────────────────────
    if (instructions.length > 0) {
      curY = ensureSpace(60, curY);
      curY = sectionBar(L.instructions, GREEN, curY);

      for (const step of instructions) {
        const stepLabel = `${L.step} ${step.step_index}`;
        const stepText = safeText(step.text);
        const estimatedH = doc.font("Helvetica").fontSize(9.5).heightOfString(stepText, { width: CONTENT - 60 }) + 16;
        curY = ensureSpace(estimatedH + 10, curY);

        // Step number circle
        doc.circle(MARGIN + 12, curY + 10, 10).fill(GREEN);
        doc.font("Helvetica-Bold").fontSize(8).fillColor(WHITE)
          .text(String(step.step_index), MARGIN + 8, curY + 6, { width: 10, align: "center", lineBreak: false });

        // Step label
        doc.font("Helvetica-Bold").fontSize(8).fillColor(GREEN)
          .text(safeText(stepLabel), MARGIN + 28, curY, { lineBreak: false });

        // Step text
        doc.font("Helvetica").fontSize(9.5).fillColor(SLATE)
          .text(stepText, MARGIN + 28, curY + 12, { width: CONTENT - 38 });
        const textH = doc.font("Helvetica").fontSize(9.5).heightOfString(stepText, { width: CONTENT - 38 });
        curY += Math.max(24, textH + 20);
      }
      curY += 6;
    }

    // ── COOKING TIPS ─────────────────────────────────────────────────────────
    if (tips && tips.length > 0) {
      curY = ensureSpace(50, curY);
      curY = sectionBar(L.tips, AMBER, curY);

      for (const tip of tips) {
        const tipText = `• ${safeText(tip)}`;
        const lineH = doc.font("Helvetica-Oblique").fontSize(9).heightOfString(tipText, { width: CONTENT - 24 });
        curY = ensureSpace(lineH + 8, curY);
        doc.font("Helvetica-Oblique").fontSize(9).fillColor(SLATE)
          .text(tipText, MARGIN + 12, curY, { width: CONTENT - 24 });
        curY += lineH + 6;
      }
      curY += 8;
    }

    // ── SUBSTITUTIONS ────────────────────────────────────────────────────────
    if (substitutions && substitutions.length > 0) {
      curY = ensureSpace(50, curY);
      curY = sectionBar(L.substitutions, PURPLE, curY);

      for (const sub of substitutions) {
        const subLine = `${safeText(sub.for)}  →  ${safeText(sub.substitute_with)}${sub.note ? `  (${safeText(sub.note)})` : ""}`;
        const lineH = doc.font("Helvetica").fontSize(9).heightOfString(subLine, { width: CONTENT - 24 });
        curY = ensureSpace(lineH + 8, curY);
        doc.font("Helvetica-Bold").fontSize(9).fillColor(PURPLE)
          .text(`${safeText(sub.for)}`, MARGIN + 12, curY, { continued: false, lineBreak: false });
        doc.font("Helvetica").fontSize(9).fillColor(GRAY)
          .text(`  →  ${safeText(sub.substitute_with)}${sub.note ? `  (${safeText(sub.note)})` : ""}`, { lineBreak: false });
        curY += lineH + 8;
      }
      curY += 6;
    }

    // ── DISCLAIMER FOOTER ────────────────────────────────────────────────────
    const discText = safeText(L.disclaimer);
    const discH = doc.font("Helvetica").fontSize(8).heightOfString(discText, { width: CONTENT - 24 }) + 28;
    curY = ensureSpace(discH + 10, curY);
    doc.rect(MARGIN, curY, CONTENT, discH).fill(SLATE_LIGHT).stroke(BORDER);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(SLATE)
      .text(L.disclaimerLabel, MARGIN + 12, curY + 8, { lineBreak: false });
    doc.font("Helvetica").fontSize(8).fillColor(GRAY)
      .text(discText, MARGIN + 12, curY + 20, { width: CONTENT - 24 });

    // ── FOOTER WATERMARK ────────────────────────────────────────────────────
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.font("Helvetica").fontSize(7).fillColor("#94a3b8")
        .text("nutriaid.eu  ·  NutriAID © " + new Date().getFullYear(), MARGIN, doc.page.height - 28, {
          width: CONTENT, align: "center",
        });
    }

    doc.end();
  });

  const pdfBuffer = Buffer.concat(chunks);
  const safeTitle = title
    .replace(/[ăÄ]/g, "a").replace(/[âÂ]/g, "a").replace(/[îÎ]/g, "i")
    .replace(/[șȘşŞ]/g, "s").replace(/[țȚţŢ]/g, "t")
    .replace(/[éèêëÉÈÊË]/g, "e").replace(/[àáãäÀÁÃÄ]/g, "a")
    .replace(/[öóòôÖÓÒÔ]/g, "o").replace(/[üùúûÜÙÚÛ]/g, "u")
    .replace(/[^a-zA-Z0-9\s-]/g, "").trim().replace(/\s+/g, "_").slice(0, 40);
  const filename = `${L.filename}_${safeTitle}_${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
