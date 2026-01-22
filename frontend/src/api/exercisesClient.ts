import { apiFetch } from "./client";
import type { Exercise } from "../types";

function normalize(ex: any): Exercise {
  return {
    id: ex.slug ?? ex._id,
    name: ex.name,
    muscle: ex.muscle,
    thumbnail: ex.thumbnail,
    description: ex.description,
  };
}

export async function fetchExercises(): Promise<Exercise[]> {
  const raw = await apiFetch<any[]>("/api/exercises");
  return raw.map(normalize);
}
