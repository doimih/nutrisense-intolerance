import type { MealDay, MealExample, MealType } from "@/types/guidance";

export const DAY_ORDER: MealDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const MEAL_TYPE_ORDER: MealType[] = ["breakfast", "lunch", "dinner"];

const DAY_LABELS: Record<MealDay, { ro: string; en: string }> = {
  monday: { ro: "Luni", en: "Monday" },
  tuesday: { ro: "Marți", en: "Tuesday" },
  wednesday: { ro: "Miercuri", en: "Wednesday" },
  thursday: { ro: "Joi", en: "Thursday" },
  friday: { ro: "Vineri", en: "Friday" },
  saturday: { ro: "Sâmbătă", en: "Saturday" },
  sunday: { ro: "Duminică", en: "Sunday" },
};

const MEAL_TYPE_LABELS: Record<MealType, { ro: string; en: string }> = {
  breakfast: { ro: "Mic dejun", en: "Breakfast" },
  lunch: { ro: "Prânz", en: "Lunch" },
  dinner: { ro: "Cină", en: "Dinner" },
};

export function dayLabel(day: MealDay, lang: "ro" | "en"): string {
  return DAY_LABELS[day][lang];
}

export function mealTypeLabel(mealType: MealType, lang: "ro" | "en"): string {
  return MEAL_TYPE_LABELS[mealType][lang];
}

export interface GroupedMealDay {
  day: MealDay;
  label: string;
  meals: Array<{ mealType: MealType; label: string; meal: MealExample }>;
}

/**
 * Groups a flat meal list into one entry per day, each containing its
 * breakfast/lunch/dinner meals in order. Returns null when the meals don't
 * carry day/mealType metadata (e.g. older history records generated before
 * the per-day grouping was introduced) so callers can fall back to a flat list.
 */
export function groupMealExamplesByDay(
  meals: MealExample[],
  lang: "ro" | "en"
): GroupedMealDay[] | null {
  const withMetadata = meals.filter((m) => m.day && m.mealType);
  if (withMetadata.length === 0) return null;

  const byDay = new Map<MealDay, GroupedMealDay>();
  for (const day of DAY_ORDER) {
    byDay.set(day, { day, label: dayLabel(day, lang), meals: [] });
  }

  for (const meal of withMetadata) {
    const day = meal.day as MealDay;
    const mealType = meal.mealType as MealType;
    const bucket = byDay.get(day);
    if (!bucket) continue;
    bucket.meals.push({ mealType, label: mealTypeLabel(mealType, lang), meal });
  }

  const result = Array.from(byDay.values()).filter((d) => d.meals.length > 0);
  for (const d of result) {
    d.meals.sort((a, b) => MEAL_TYPE_ORDER.indexOf(a.mealType) - MEAL_TYPE_ORDER.indexOf(b.mealType));
  }
  return result;
}
