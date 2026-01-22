import { useEffect, useState } from "react";
import { fetchExercises } from "../api/exercisesClient";
import type { Exercise } from "../types";

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises()
      .then(setExercises)
      .finally(() => setLoading(false));
  }, []);

  return { exercises, loading };
}
