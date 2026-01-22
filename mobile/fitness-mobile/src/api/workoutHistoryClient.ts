import { api } from "./client";

export type HistoryEntry = {
  id: string; // normalized (from _id)
  workoutId: string;
  name: string;
  date: string;
  durationSeconds: number;
  totalVolume: number;
  completedSets: number;
  exercises?: any[];
};

function normalize(entry: any): HistoryEntry {
  const id = String(entry._id ?? entry.id ?? "");

  return {
    id,
    workoutId: String(entry.workoutId ?? ""),
    name: String(entry.name ?? ""),
    date: String(entry.date ?? ""),
    durationSeconds: Number(entry.durationSeconds ?? 0),
    totalVolume: Number(entry.totalVolume ?? 0),
    completedSets: Number(entry.completedSets ?? 0),
    exercises: entry.exercises ?? [],
  };
}

export async function fetchWorkoutHistory(): Promise<HistoryEntry[]> {
  const res = await api.get("/api/workout-history");
  const raw = Array.isArray(res.data) ? res.data : [];
  return raw.map(normalize).filter((e) => e.id); // filter out bad entries
}

export async function fetchWorkoutHistoryById(
  id: string
): Promise<HistoryEntry> {
  const res = await api.get(`/api/workout-history/${id}`);
  return normalize(res.data);
}
