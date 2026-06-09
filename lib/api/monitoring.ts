import type { CreateMonitoringEntryRequest, MonitoringEntry } from "@/types/monitoring";

type MonitoringListResponse = {
  entries?: MonitoringEntry[];
  error?: string;
};

type MonitoringEntryResponse = {
  entry?: MonitoringEntry;
  error?: string;
};

export async function listMonitoringEntries(): Promise<MonitoringEntry[]> {
  const response = await fetch("/api/monitoring", { method: "GET" });
  const payload = (await response.json()) as MonitoringListResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Could not load monitoring entries.");
  }

  return Array.isArray(payload.entries) ? payload.entries : [];
}

export async function addMonitoringEntry(
  data: CreateMonitoringEntryRequest
): Promise<MonitoringEntry> {
  const response = await fetch("/api/monitoring", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const payload = (await response.json()) as MonitoringEntryResponse;
  if (!response.ok || !payload.entry) {
    throw new Error(payload.error ?? "Could not save monitoring entry.");
  }

  return payload.entry;
}

export async function getMonitoringEntry(id: string): Promise<MonitoringEntry | null> {
  const entries = await listMonitoringEntries();
  return entries.find((entry) => entry.id === id) ?? null;
}

export async function deleteMonitoringEntry(_id: string): Promise<void> {
  throw new Error("Delete monitoring entry is not implemented yet.");
}
