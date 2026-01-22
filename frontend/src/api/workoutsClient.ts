import { apiFetch } from "./client";
import type { Workout } from "../types";

/* ===================== NORMALIZE ===================== */

function normalize(workout: any): Workout {
  return {
    ...workout,
    id: workout._id ?? workout.id,
  };
}

/* ===================== READ ===================== */

export async function fetchWorkouts(): Promise<Workout[]> {
  const raw = await apiFetch<any[]>("/api/workouts");
  return raw.map(normalize);
}

export async function fetchWorkoutById(id: string): Promise<Workout> {
  const raw = await apiFetch<any>(`/api/workouts/${id}`);
  return normalize(raw);
}

/* ===================== CREATE ===================== */

export async function createWorkout(payload: {
  name: string;
  exercises: any[];
}): Promise<Workout> {
  const raw = await apiFetch<any>("/api/workouts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalize(raw);
}

/* ===================== UPDATE ===================== */

export async function updateWorkout(
  id: string,
  data: Partial<{ name: string; exercises: any[] }>
): Promise<Workout> {
  const raw = await apiFetch<any>(`/api/workouts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return normalize(raw);
}

/* ===================== DELETE ===================== */

export async function deleteWorkout(workoutId: string): Promise<void> {
  await apiFetch<void>(`/api/workouts/${workoutId}`, {
    method: "DELETE",
  });
}
