import { api } from "./client";

export type Workout = {
  _id: string;
  name: string;
  description?: string;
  exercisesCount?: number; // optional, depending on backend
};

export async function fetchWorkouts(): Promise<Workout[]> {
  const res = await api.get("/api/workouts");
  return res.data;
}
