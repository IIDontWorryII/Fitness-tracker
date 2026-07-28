import { api } from "./client";

export async function fetchExercises() {
  const res = await api.get("/api/exercises");

  return res.data.map((ex: any) => ({
    id: ex._id, // normalize here
    name: ex.name,
    muscle: ex.muscle,
    thumbnail: ex.thumbnail,
  }));
}
