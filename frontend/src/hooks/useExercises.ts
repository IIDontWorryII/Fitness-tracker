/*
  ============================================================
  Datei: useExercises.ts

  Rolle im Projekt:
  Dieser Custom Hook kapselt das Laden von Exercises
  aus der API.

  Ziel:
  - Wiederverwendbare Datenlogik
  - Keine Fetch Logik in Pages
  ============================================================
*/
import { useEffect, useState } from "react";
import { fetchExercises } from "../api/exercisesClient";
import type { Exercise } from "../types";

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  /*
    Side Effect:
    - Laedt Exercises beim ersten Rendern
  */
  useEffect(() => {
    fetchExercises()
      .then(setExercises)
      .finally(() => setLoading(false));
  }, []);

  return { exercises, loading };
}
