export type Symptom =
  | "balonare"
  | "dureri_abdominale"
  | "greata"
  | "diaree"
  | "constipatie"
  | "reflux"
  | "eruptii_cutanate"
  | "oboseala"
  | "dureri_de_cap"
  | "dificultati_respiratorii"
  | "umflaturi";

export type WellbeingLevel = 1 | 2 | 3 | 4 | 5;

export interface MonitoringEntry {
  id: string;
  userId: string;
  date: string;
  mealTime?: string;
  consumedFoods: string[];
  symptoms: Symptom[];
  symptomsIntensity: number; // 1-10
  reactionLatencyMinutes?: number | null;
  wellbeing: WellbeingLevel;
  notes: string;
  createdAt: string;
}

export interface CreateMonitoringEntryRequest {
  date: string;
  mealTime?: string;
  consumedFoods: string[];
  symptoms: Symptom[];
  symptomsIntensity: number;
  reactionLatencyMinutes?: number | null;
  wellbeing: WellbeingLevel;
  notes: string;
}

export const SYMPTOM_LABELS: Record<Symptom, string> = {
  balonare: "Balonare",
  dureri_abdominale: "Dureri abdominale",
  greata: "Greață",
  diaree: "Diaree",
  constipatie: "Constipație",
  reflux: "Reflux / Arsuri",
  eruptii_cutanate: "Erupții cutanate",
  oboseala: "Oboseală",
  dureri_de_cap: "Dureri de cap",
  dificultati_respiratorii: "Dificultăți respiratorii",
  umflaturi: "Umflături",
};

export const WELLBEING_LABELS: Record<WellbeingLevel, string> = {
  1: "Foarte rău",
  2: "Rău",
  3: "Moderat",
  4: "Bine",
  5: "Excelent",
};
