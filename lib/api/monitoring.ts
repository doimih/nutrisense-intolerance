import type {
  MonitoringEntry,
  CreateMonitoringEntryRequest,
} from "@/types/monitoring";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_ENTRIES: MonitoringEntry[] = [
  {
    id: "mon_mock_001",
    userId: "usr_mock_001",
    date: "2024-06-01",
    consumedFoods: ["Salată cu ton", "Pâine fără gluten", "Mere"],
    symptoms: ["balonare"],
    symptomsIntensity: 3,
    wellbeing: 4,
    notes: "Ușoară balonare după masă, a dispărut în aproximativ o oră.",
    createdAt: "2024-06-01T20:30:00Z",
  },
  {
    id: "mon_mock_002",
    userId: "usr_mock_001",
    date: "2024-05-30",
    consumedFoods: ["Orez cu legume", "Pui la grătar", "Portocală"],
    symptoms: [],
    symptomsIntensity: 0,
    wellbeing: 5,
    notes: "Zi excelentă, fără nicio reacție.",
    createdAt: "2024-05-30T21:00:00Z",
  },
  {
    id: "mon_mock_003",
    userId: "usr_mock_001",
    date: "2024-05-28",
    consumedFoods: ["Pizza (conținea urme de lactoză)", "Suc de portocale"],
    symptoms: ["balonare", "dureri_abdominale", "greata"],
    symptomsIntensity: 7,
    wellbeing: 2,
    notes: "Reacție clară la pizza. Evit în viitor.",
    createdAt: "2024-05-28T22:00:00Z",
  },
];

function getStoredEntries(): MonitoringEntry[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("ns_monitoring");
    if (stored) return JSON.parse(stored) as MonitoringEntry[];
  }
  return MOCK_ENTRIES;
}

export async function listMonitoringEntries(): Promise<MonitoringEntry[]> {
  await delay(400);
  return getStoredEntries().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function addMonitoringEntry(
  data: CreateMonitoringEntryRequest
): Promise<MonitoringEntry> {
  await delay(600);

  const entry: MonitoringEntry = {
    id: `mon_${Date.now()}`,
    userId: "usr_mock_001",
    ...data,
    createdAt: new Date().toISOString(),
  };

  const entries = getStoredEntries();
  entries.unshift(entry);

  if (typeof window !== "undefined") {
    localStorage.setItem("ns_monitoring", JSON.stringify(entries));
  }

  return entry;
}

export async function getMonitoringEntry(
  id: string
): Promise<MonitoringEntry | null> {
  await delay(200);
  const entries = getStoredEntries();
  return entries.find((e) => e.id === id) ?? null;
}

export async function deleteMonitoringEntry(id: string): Promise<void> {
  await delay(400);
  const entries = getStoredEntries().filter((e) => e.id !== id);

  if (typeof window !== "undefined") {
    localStorage.setItem("ns_monitoring", JSON.stringify(entries));
  }
}
