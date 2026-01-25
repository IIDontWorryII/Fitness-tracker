/*
  useWorkoutEditor.ts

  Hook: Encapsulates editable workout state logic used in the Workout Detail page.
  - Manages `editableExercises`, expansion state and convenience callbacks for sets.
  - Internally uses pure util functions from `utils/workoutUtils`.
*/

import { useState, useCallback } from "react";
import type { WorkoutExercise, WorkoutSet, Exercise } from "../types";
import {
  updateWeightInWorkout,
  updateRepsInWorkout,
  addSetToWorkoutExercise,
  removeSetFromWorkoutExercise,
  removeExerciseFromWorkout,
  buildDetailedExercises,
} from "../utils/workoutUtils";

export function useWorkoutEditor(
  initialExercises: WorkoutExercise[],
  allExercises: Exercise[]
) {
  const [editableExercises, setEditableExercises] = useState<WorkoutExercise[]>(
    JSON.parse(JSON.stringify(initialExercises))
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ============= EXPAND / COLLAPSE ============= */
  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  /* ============= UPDATE WEIGHT ============= */
  const updateWeight = useCallback(
    (exerciseId: string, setIndex: number, newWeight: number) => {
      setEditableExercises((prev) =>
        updateWeightInWorkout(prev, exerciseId, setIndex, newWeight)
      );
    },
    []
  );

  /* ============= UPDATE REPS ============= */
  const updateReps = useCallback(
    (exerciseId: string, setIndex: number, reps: number) => {
      setEditableExercises((prev) =>
        updateRepsInWorkout(prev, exerciseId, setIndex, reps)
      );
    },
    []
  );

  /* ============= ADD SET ============= */
  const addSet = useCallback((exerciseId: string) => {
    setEditableExercises((prev) => addSetToWorkoutExercise(prev, exerciseId));
  }, []);

  /* ============= REMOVE SET ============= */
  const removeSet = useCallback((exerciseId: string, setIndex: number) => {
    setEditableExercises((prev) =>
      removeSetFromWorkoutExercise(prev, exerciseId, setIndex)
    );
  }, []);

  /* ============= REMOVE EXERCISE ============= */
  const removeExercise = useCallback((exerciseId: string) => {
    setEditableExercises((prev) => removeExerciseFromWorkout(prev, exerciseId));
    setExpandedId((prev) => (prev === exerciseId ? null : prev));
  }, []);

  /* ============= DETAILED EXERCISES (FOR UI) ============= */
  const detailed = buildDetailedExercises(editableExercises, allExercises);

  return {
    editableExercises,
    setEditableExercises,
    expandedId,
    toggleExpand,
    updateWeight,
    updateReps,
    addSet,
    removeSet,
    removeExercise,
    detailed,
  };
}
