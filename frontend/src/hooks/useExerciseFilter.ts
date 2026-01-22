/*
  useExerciseFilter.ts

  Hook: Provides search + muscle-filter state and derived `filteredExercises`.
  - Stateless from outside: parent supplies the exercises array to filter.
  - Returns the query, selected muscles and helper toggle.
*/

import { useState, useMemo } from "react";
import type { Exercise } from "../types";

export function useExerciseFilter(allExercises: Exercise[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<Set<string>>(
    new Set()
  );

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles((prev) => {
      const next = new Set(prev);
      next.has(muscle) ? next.delete(muscle) : next.add(muscle);
      return next;
    });
  };

  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allExercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(q) ||
        ex.muscle.toLowerCase().includes(q);

      const matchesMuscle =
        selectedMuscles.size === 0 || selectedMuscles.has(ex.muscle);

      return matchesSearch && matchesMuscle;
    });
  }, [searchQuery, selectedMuscles, allExercises]);

  return {
    searchQuery,
    setSearchQuery,
    selectedMuscles,
    toggleMuscle,
    filteredExercises,
  };
}
