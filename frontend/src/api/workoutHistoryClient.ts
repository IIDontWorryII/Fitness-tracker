import { apiFetch } from "./client";

export type HistoryEntry = {
  id: string;
  workoutId: string;
  name: string;
  date: string;
  durationSeconds: number;
  totalVolume: number;
  completedSets: number;
  exercises: any[];
};

function normalize(entry: any): HistoryEntry {
  return {
    id: entry._id ?? entry.id, // <-- THIS IS THE CRITICAL LINE
    workoutId: entry.workoutId,
    name: entry.name,
    date: entry.date,
    durationSeconds: entry.durationSeconds,
    totalVolume: entry.totalVolume,
    completedSets: entry.completedSets,
    exercises: entry.exercises ?? [],
  };
}

export async function fetchWorkoutHistoryById(
  id: string
): Promise<HistoryEntry> {
  const raw = await apiFetch<any>(`/api/workout-history/${id}`);
  return normalize(raw);
}

export async function fetchWorkoutHistory(): Promise<HistoryEntry[]> {
  const raw = await apiFetch<any[]>("/api/workout-history");
  return raw.map(normalize);
}

export async function createWorkoutHistory(data: any): Promise<HistoryEntry> {
  const raw = await apiFetch<any>(`/api/workout-history`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalize(raw);
}
