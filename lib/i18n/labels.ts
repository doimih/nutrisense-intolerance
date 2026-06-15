import type { AppLanguage } from "@/lib/i18n/config";
import type { DietaryPreference, Intolerance } from "@/types/profile";
import type { Symptom, WellbeingLevel } from "@/types/monitoring";

const intoleranceLabels: Record<AppLanguage, Record<Intolerance, string>> = {
  ro: {
    lactoza: "Lactoza",
    gluten: "Gluten",
    nuci: "Nuci",
    histamina: "Histamina",
    fodmap: "FODMAP",
    fructoza: "Fructoza",
    sorbitol: "Sorbitol",
    sulfiti: "Sulfiti",
    ou: "Oua",
    soia: "Soia",
    peste: "Peste",
    crustacee: "Crustacee",
    "proteina-lapte": "Proteina din lapte",
    solanacee: "Solanacee",
  },
  en: {
    lactoza: "Lactose",
    gluten: "Gluten",
    nuci: "Nuts",
    histamina: "Histamine",
    fodmap: "FODMAP",
    fructoza: "Fructose",
    sorbitol: "Sorbitol",
    sulfiti: "Sulfites",
    ou: "Eggs",
    soia: "Soy",
    peste: "Fish",
    crustacee: "Shellfish",
    "proteina-lapte": "Milk protein",
    solanacee: "Nightshades",
  },
};

const dietaryLabels: Record<AppLanguage, Record<DietaryPreference, string>> = {
  ro: {
    normal: "Normal / Omnivor",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    "low-carb": "Low-Carb / Keto",
    "gluten-free": "Fara Gluten",
    "dairy-free": "Fara Lactate",
  },
  en: {
    normal: "Normal / Omnivore",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    "low-carb": "Low-Carb / Keto",
    "gluten-free": "Gluten-Free",
    "dairy-free": "Dairy-Free",
  },
};

const symptomLabels: Record<AppLanguage, Record<Symptom, string>> = {
  ro: {
    balonare: "Balonare",
    dureri_abdominale: "Dureri abdominale",
    greata: "Greata",
    diaree: "Diaree",
    constipatie: "Constipatie",
    reflux: "Reflux / Arsuri",
    eruptii_cutanate: "Eruptii cutanate",
    oboseala: "Oboseala",
    dureri_de_cap: "Dureri de cap",
    dificultati_respiratorii: "Dificultati respiratorii",
    umflaturi: "Umflaturi",
  },
  en: {
    balonare: "Bloating",
    dureri_abdominale: "Abdominal pain",
    greata: "Nausea",
    diaree: "Diarrhea",
    constipatie: "Constipation",
    reflux: "Reflux / Heartburn",
    eruptii_cutanate: "Skin rash",
    oboseala: "Fatigue",
    dureri_de_cap: "Headache",
    dificultati_respiratorii: "Breathing difficulty",
    umflaturi: "Swelling",
  },
};

const wellbeingLabels: Record<AppLanguage, Record<WellbeingLevel, string>> = {
  ro: {
    1: "Foarte rau",
    2: "Rau",
    3: "Moderat",
    4: "Bine",
    5: "Excelent",
  },
  en: {
    1: "Very bad",
    2: "Bad",
    3: "Moderate",
    4: "Good",
    5: "Excellent",
  },
};

export function getIntoleranceLabel(value: Intolerance, lang: AppLanguage): string {
  return intoleranceLabels[lang][value];
}

export function getDietaryLabel(value: DietaryPreference, lang: AppLanguage): string {
  return dietaryLabels[lang][value];
}

export function getSymptomLabel(value: Symptom, lang: AppLanguage): string {
  return symptomLabels[lang][value];
}

export function getWellbeingLabel(value: WellbeingLevel, lang: AppLanguage): string {
  return wellbeingLabels[lang][value];
}
