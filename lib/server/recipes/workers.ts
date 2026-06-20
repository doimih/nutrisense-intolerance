export type RecipeBatchWorkerInput = {
  batchSize: number;
  existingTitles: string[];
  cuisineHints?: string[];
  userProfile?: UserProfileContext;
};

export type RecipeInstructionWorkerInput = {
  titleEn: string;
  titleRo: string;
  ingredientsEn: { name: string; quantity: string; unit: string }[];
  ingredientsRo: { name: string; quantity: string; unit: string }[];
  prepTimeMinutes: number;
  difficulty: string;
  userProfile?: UserProfileContext;
};

export type UserProfileContext = {
  weightKg?: number | null;
  heightCm?: number | null;
  age?: number | null;
  activityLevel?: string | null;
  dietaryPreferences?: string[];
  intolerances?: string[];
};

export type RecipeValidationResult = {
  valid: boolean;
  reasons: string[];
};

// ─── TDEE Calculation ─────────────────────────────────────────────────────────

export function estimateTDEE(profile: UserProfileContext): number | null {
  const { weightKg, heightCm, age, activityLevel } = profile;
  if (!weightKg || !heightCm || !age) return null;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const multiplier = multipliers[activityLevel ?? ""] ?? 1.375;
  return Math.round(bmr * multiplier);
}

// ─── Recipe Validation ────────────────────────────────────────────────────────

const GENERIC_INGREDIENT_PATTERNS = [
  /^ingrediente?\s*$/i,
  /^ingredients?\s*$/i,
  /^alimente?\s*$/i,
  /^foods?\s*$/i,
  /^\d+\s*g\s+ingrediente/i,
  /^\d+\s*g\s+ingredients/i,
  /^diverse\s+ingrediente/i,
  /^various\s+ingredients/i,
  /^produse?\s+alimentare/i,
];

const GENERIC_STEP_PATTERNS = [
  /^pregăte[șs]te\s+(toate\s+)?ingredientele\.?$/i,
  /^prepare\s+(all\s+)?ingredients\.?$/i,
  /^combina\s+ingredientele\s+conform\s+rețetei\.?$/i,
  /^combine\s+ingredients\s+according\s+to\s+the\s+recipe\.?$/i,
  /^găte[șs]te\s+la\s+temperatură\s+medie/i,
  /^cook\s+at\s+medium\s+heat\s+for\s+\d+-\d+\s+minutes\.?$/i,
  /^serve[șs]te?\s+(cald|warm)\s+sau\s+conform\s+preferințelor\.?$/i,
  /^serve?\s+warm\s+or\s+according\s+to\s+preference\.?$/i,
];

export function validateRecipeItem(item: {
  title_en?: string;
  title_ro?: string;
  ingredients_en?: { name: string; quantity: string; unit: string }[];
  ingredients_ro?: { name: string; quantity: string; unit: string }[];
  instructions_en?: { step_index: number; text: string }[];
  instructions_ro?: { step_index: number; text: string }[];
  calories?: number;
  macros?: { protein: number; carbs: number; fats: number };
  prep_time_minutes?: number;
}): RecipeValidationResult {
  const reasons: string[] = [];

  // Title check
  if (!item.title_en || item.title_en.trim().length < 3) reasons.push("Missing English title");
  if (!item.title_ro || item.title_ro.trim().length < 3) reasons.push("Missing Romanian title");

  // Ingredients check
  const ingEn = item.ingredients_en ?? [];
  const ingRo = item.ingredients_ro ?? [];

  if (ingEn.length < 3) reasons.push(`Too few EN ingredients: ${ingEn.length}`);
  if (ingRo.length < 3) reasons.push(`Too few RO ingredients: ${ingRo.length}`);

  for (const ing of ingEn) {
    if (!ing.name || ing.name.trim().length < 2) { reasons.push("Blank EN ingredient name"); break; }
    if (GENERIC_INGREDIENT_PATTERNS.some((p) => p.test(ing.name))) {
      reasons.push(`Generic EN ingredient: "${ing.name}"`);
      break;
    }
    if (!ing.quantity || ing.quantity.trim() === "" || ing.quantity === "0") {
      reasons.push(`Missing quantity for: "${ing.name}"`);
      break;
    }
    if (!ing.unit || ing.unit.trim() === "") {
      reasons.push(`Missing unit for: "${ing.name}"`);
      break;
    }
  }

  for (const ing of ingRo) {
    if (GENERIC_INGREDIENT_PATTERNS.some((p) => p.test(ing.name))) {
      reasons.push(`Generic RO ingredient: "${ing.name}"`);
      break;
    }
  }

  // Instructions check
  const instrEn = item.instructions_en ?? [];
  const instrRo = item.instructions_ro ?? [];

  if (instrEn.length < 4) reasons.push(`Too few EN steps: ${instrEn.length}`);
  if (instrRo.length < 4) reasons.push(`Too few RO steps: ${instrRo.length}`);

  for (const step of instrEn) {
    if (GENERIC_STEP_PATTERNS.some((p) => p.test(step.text))) {
      reasons.push(`Generic EN step: "${step.text.slice(0, 60)}"`);
      break;
    }
    if (step.text.trim().length < 20) {
      reasons.push(`EN step too short: "${step.text}"`);
      break;
    }
  }

  for (const step of instrRo) {
    if (GENERIC_STEP_PATTERNS.some((p) => p.test(step.text))) {
      reasons.push(`Generic RO step: "${step.text.slice(0, 60)}"`);
      break;
    }
  }

  // Calorie check
  if (!item.calories || item.calories < 50 || item.calories > 1500) {
    reasons.push(`Unrealistic calories: ${item.calories ?? "missing"}`);
  }

  // Macro check
  if (!item.macros || typeof item.macros.protein !== "number" || typeof item.macros.carbs !== "number") {
    reasons.push("Missing macros");
  }

  // Title-ingredient consistency: key words from title should appear in ingredient names
  if (item.title_en && ingEn.length > 0) {
    const titleWords = item.title_en
      .toLowerCase()
      .replace(/\b(with|and|or|in|on|of|the|a|an|&)\b/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const ingredientText = ingEn.map((i) => i.name.toLowerCase()).join(" ");
    const missingWords = titleWords.filter((w) => !ingredientText.includes(w));
    if (missingWords.length > 0 && titleWords.length > 0 && missingWords.length >= titleWords.length) {
      reasons.push(`Title words not in ingredients: ${missingWords.slice(0, 3).join(", ")}`);
    }
  }

  return { valid: reasons.length === 0, reasons };
}

// ─── Batch Generator Prompt ───────────────────────────────────────────────────

export function buildBatchGeneratorPrompt(input: RecipeBatchWorkerInput): string {
  const avoidList = input.existingTitles.slice(0, 80).join(", ");
  const cuisineHint =
    input.cuisineHints && input.cuisineHints.length > 0
      ? `Prioritize these cuisines: ${input.cuisineHints.join(", ")}.`
      : "Vary cuisines across: Mediterranean, Asian, Romanian traditional, Mexican, Middle Eastern, Indian, Nordic, Japanese, Italian, Greek, Moroccan, Thai, Lebanese.";

  const profileLines: string[] = [];
  if (input.userProfile?.weightKg) profileLines.push(`User weight: ${input.userProfile.weightKg} kg`);
  if (input.userProfile?.heightCm) profileLines.push(`User height: ${input.userProfile.heightCm} cm`);
  if (input.userProfile?.age) profileLines.push(`User age: ${input.userProfile.age} years`);
  if (input.userProfile?.activityLevel) profileLines.push(`Activity level: ${input.userProfile.activityLevel}`);
  if (input.userProfile?.dietaryPreferences?.length) profileLines.push(`Dietary preferences: ${input.userProfile.dietaryPreferences.join(", ")}`);
  if (input.userProfile?.intolerances?.length) profileLines.push(`Intolerances (NEVER include): ${input.userProfile.intolerances.join(", ")}`);

  const tdee = input.userProfile ? estimateTDEE(input.userProfile) : null;
  if (tdee) profileLines.push(`Target daily calories (TDEE): ${tdee} kcal`);

  const profileSection = profileLines.length > 0
    ? `\nUSER PROFILE (adapt recipes to this):\n${profileLines.map((l) => `- ${l}`).join("\n")}\n`
    : "";

  return `You are a professional chef and nutritionist creating a bilingual recipe database for a healthy eating platform (Romanian + English).
${profileSection}
TASK: Generate ${input.batchSize} complete, realistic, healthy recipes. Each recipe must be restaurant-quality and match its title exactly.

${avoidList ? `ALREADY IN DATABASE (do NOT duplicate any of these): ${avoidList}\n` : ""}${cuisineHint}

═══════════════════════════════════════════
STRICT QUALITY RULES — VIOLATING ANY = REJECTION
═══════════════════════════════════════════

INGREDIENTS:
• Every ingredient must be a REAL, SPECIFIC food item (e.g. "Piept de pui / Chicken breast", "Ardei roșu / Red bell pepper", "Orez basmati / Basmati rice")
• FORBIDDEN: "ingrediente", "ingredients", "alimente", "diverse produse", "various ingredients"
• Every ingredient needs a realistic quantity (actual grams/ml/pieces, not "0" or "")
• Units: "g", "ml", "tbsp", "tsp", "pcs", "cups", "cloves", "slices" — never empty
• Quantity examples: chicken breast → "200 g", olive oil → "2 tbsp", garlic → "3 cloves"
• Minimum 5 ingredients per recipe, maximum 15
• ALL key ingredients from the title MUST appear in the list
• If title mentions a protein → that protein must be listed with realistic grams
• If title mentions a vegetable → that specific vegetable must be listed

CALORIE CALCULATION:
• Calculate calories realistically from actual ingredients and quantities
• Breakfast: 300–550 kcal | Lunch/Dinner: 450–750 kcal | Snack: 150–350 kcal
• Macros must add up: protein×4 + carbs×4 + fats×9 ≈ calories (±10%)

TITLE CONSISTENCY:
• "Chicken Stir-Fry with Vegetables" → must have chicken, at least 3 named vegetables, soy sauce or sesame oil
• "Greek Salad" → must have tomatoes, cucumber, feta, olives, red onion
• "Overnight Oats with Berries" → must have rolled oats, milk or yogurt, specific berries
• Never generate a title and then use completely different ingredients

BILINGUAL QUALITY:
• Romanian must be natural, idiomatic — NOT a literal translation of English
• Use correct Romanian culinary terms (e.g., "se sotează" not "se soteza")
• Both languages must be complete — no empty arrays, no partial translations
• Tags must be relevant and specific (not just "healthy", "delicious")

CUISINE DIVERSITY:
• Each batch must have variety — no more than 2 recipes from the same cuisine
• Mix categories: some breakfast, lunch, dinner, snack
• Include at least 1 vegetarian/vegan option per 5 recipes

OUTPUT: Return ONLY a valid JSON array of ${input.batchSize} objects. No markdown fences, no explanations, no text outside the array.

Each object must contain EXACTLY:
{
  "title_en": "Specific Recipe Name with Main Ingredients",
  "title_ro": "Denumire Rețetă Specifică în Română",
  "category": "breakfast" | "lunch" | "dinner" | "snack",
  "ingredients_en": [
    {"name": "Chicken breast", "quantity": "200", "unit": "g"},
    {"name": "Red bell pepper", "quantity": "1", "unit": "pcs"},
    {"name": "Olive oil", "quantity": "2", "unit": "tbsp"}
  ],
  "ingredients_ro": [
    {"name": "Piept de pui", "quantity": "200", "unit": "g"},
    {"name": "Ardei roșu", "quantity": "1", "unit": "buc"},
    {"name": "Ulei de măsline", "quantity": "2", "unit": "linguri"}
  ],
  "prep_time_minutes": 25,
  "difficulty": "easy" | "medium" | "hard",
  "calories": 520,
  "macros": {"protein": 38, "carbs": 42, "fats": 14},
  "cuisine": "Mediterranean",
  "tags_en": ["high-protein", "gluten-free", "meal-prep"],
  "tags_ro": ["bogat în proteine", "fără gluten", "pregătit în avans"],
  "allergens": ["dairy"],
  "substitutions_en": [{"for": "Chicken breast", "substitute_with": "Tofu", "note": "For a vegan version, press and cube firm tofu"}],
  "substitutions_ro": [{"for": "Piept de pui", "substitute_with": "Tofu", "note": "Pentru versiunea vegană, folosiți tofu ferm presat și tăiat cubulețe"}]
}`;
}

// ─── Instruction Worker Prompt ────────────────────────────────────────────────

export function buildInstructionWorkerPrompt(input: RecipeInstructionWorkerInput): string {
  const ingListEn = input.ingredientsEn
    .map((i) => `${i.quantity} ${i.unit} ${i.name}`.trim())
    .join(", ");
  const ingListRo = input.ingredientsRo
    .map((i) => `${i.quantity} ${i.unit} ${i.name}`.trim())
    .join(", ");

  const minSteps =
    input.difficulty === "hard" ? 8 : input.difficulty === "medium" ? 6 : 5;
  const maxSteps =
    input.difficulty === "hard" ? 12 : input.difficulty === "medium" ? 9 : 7;

  return `You are a professional culinary instructor writing step-by-step cooking instructions for a healthy eating app.

RECIPE (EN): ${input.titleEn}
RECIPE (RO): ${input.titleRo}
PREP TIME: ${input.prepTimeMinutes} minutes
DIFFICULTY: ${input.difficulty}

INGREDIENTS (EN): ${ingListEn}
INGREDIENTS (RO): ${ingListRo}

═══════════════════════════════════════════
INSTRUCTION QUALITY RULES — ALL REQUIRED
═══════════════════════════════════════════

COVERAGE:
• EVERY ingredient listed above MUST appear in at least one step — no exceptions
• Use the EXACT ingredient names from the list (not paraphrased)

STEP STRUCTURE (${minSteps}–${maxSteps} steps):
• Step 1: Preparation — washing, peeling, dicing, mincing, marinating as needed
• Step 2+: Cooking — specific techniques (sauté, roast, steam, boil, bake)
• Always specify: heat level (medium-high, low), time (minutes), visual cues ("until golden", "until tender")
• For proteins: specify internal doneness or cooking temperature in °C
• For vegetables: specify cut size and cooking time
• For baked items: specify oven temperature in °C and duration
• Final step: plating and optional garnish

FORBIDDEN GENERIC STEPS:
• "Prepare the ingredients" — NEVER write this
• "Pregătește ingredientele" — NEVER write this
• "Combine ingredients according to the recipe" — NEVER
• "Cook at medium heat for 15-20 minutes" without specifics — NEVER
• "Serve warm or according to preference" — NEVER

EXAMPLE GOOD STEP: "Heat 2 tbsp olive oil in a large skillet over medium-high heat. Add the diced chicken breast and cook for 6–7 minutes, turning once, until golden on the outside and no longer pink inside."

COOKING TIPS (3–5 tips):
• Practical, specific, actionable tips for this exact recipe
• Storage tips, make-ahead advice, or technique alternatives
• Never generic ("enjoy your meal", "bon appétit")

SUBSTITUTIONS:
• Offer 2–3 realistic ingredient swaps with brief notes
• Focus on dietary needs (vegan, gluten-free, lactose-free swaps)

BILINGUAL QUALITY:
• Romanian instructions must be natural, idiomatic — use real culinary terms
• "se sotează", "se rumenește", "se amestecă continuu", "se lasă la fiert"
• NOT a word-for-word translation from English
• Both EN and RO must be equally detailed and complete

Return ONLY valid JSON — no markdown fences, no text outside JSON:
{
  "instructions_en": [
    {"step_index": 1, "text": "Detailed, specific step referencing actual ingredient names..."},
    {"step_index": 2, "text": "..."}
  ],
  "instructions_ro": [
    {"step_index": 1, "text": "Pas detaliat în română folosind termeni culinari corecți..."},
    {"step_index": 2, "text": "..."}
  ],
  "substitutions_en": [{"for": "ingredient name", "substitute_with": "alternative", "note": "brief note"}],
  "substitutions_ro": [{"for": "ingredient ro", "substitute_with": "alternativă", "note": "notă scurtă"}],
  "cooking_tips_en": ["Specific, actionable tip 1", "Tip 2", "Tip 3"],
  "cooking_tips_ro": ["Sfat specific 1", "Sfat 2", "Sfat 3"]
}`;
}

// ─── Response Parsers ─────────────────────────────────────────────────────────

export function parseBatchGeneratorResponse(raw: string): unknown[] | null {
  try {
    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    // Sometimes the AI wraps in an object
    if (parsed && Array.isArray(parsed.recipes)) return parsed.recipes;
    return null;
  } catch {
    return null;
  }
}

export function parseInstructionWorkerResponse(raw: string): {
  instructions_en: { step_index: number; text: string }[];
  instructions_ro: { step_index: number; text: string }[];
  substitutions_en: { for: string; substitute_with: string; note: string }[];
  substitutions_ro: { for: string; substitute_with: string; note: string }[];
  cooking_tips_en: string[];
  cooking_tips_ro: string[];
} | null {
  try {
    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");
    const parsed = JSON.parse(cleaned);
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.instructions_en) &&
      Array.isArray(parsed.instructions_ro) &&
      parsed.instructions_en.length >= 4 &&
      parsed.instructions_ro.length >= 4
    ) {
      return {
        instructions_en: parsed.instructions_en,
        instructions_ro: parsed.instructions_ro,
        substitutions_en: Array.isArray(parsed.substitutions_en) ? parsed.substitutions_en : [],
        substitutions_ro: Array.isArray(parsed.substitutions_ro) ? parsed.substitutions_ro : [],
        cooking_tips_en: Array.isArray(parsed.cooking_tips_en) ? parsed.cooking_tips_en : [],
        cooking_tips_ro: Array.isArray(parsed.cooking_tips_ro) ? parsed.cooking_tips_ro : [],
      };
    }
    return null;
  } catch {
    return null;
  }
}
