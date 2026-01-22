/*
  src/utils/workoutUtils.ts

  Utility helpers for manipulating workouts and sets.
  - Pure functions used by editing hooks and page components.
  - Keep these pure and easily testable.
*/

import { Exercise } from "../types";
import type { WorkoutExercise, WorkoutSet } from "../types";

export function updateWeightInWorkout(
  exercises: WorkoutExercise[],
  exerciseId: string,
  setIndex: number,
  weight: number
) {
  return exercises.map((ex) =>
    ex.id === exerciseId
      ? {
          ...ex,
          sets: ex.sets.map((s, i) =>
            i === setIndex ? { ...s, weight } : s
          ),
        }
      : ex
  );
}

export function updateRepsInWorkout(
  exercises: WorkoutExercise[],
  exerciseId: string,
  setIndex: number,
  reps: number
) {
  return exercises.map((ex) =>
    ex.id === exerciseId
      ? {
          ...ex,
          sets: ex.sets.map((s, i) =>
            i === setIndex ? { ...s, reps } : s
          ),
        }
      : ex
  );
}

export function addSetToWorkoutExercise(
  exercises: WorkoutExercise[],
  exerciseId: string
) {
  return exercises.map((ex) =>
    ex.id === exerciseId
      ? {
          ...ex,
          sets: [...ex.sets, { weight: 0, reps: 0 }],
        }
      : ex
  );
}

export function removeSetFromWorkoutExercise(
  exercises: WorkoutExercise[],
  exerciseId: string,
  setIndex: number
) {
  return exercises.map((ex) =>
    ex.id === exerciseId
      ? {
          ...ex,
          sets: ex.sets.filter((_, i) => i !== setIndex),
        }
      : ex
  );
}

export function removeExerciseFromWorkout(
  exercises: WorkoutExercise[],
  exerciseId: string
) {
  return exercises.filter((ex) => ex.id !== exerciseId);
}

export function buildDetailedExercises(
  exercises: WorkoutExercise[],
  allExercises: Exercise[]
) {
  return exercises
    .map((we) => {
      const meta = allExercises.find((ex) => ex.id === we.id);
      if (!meta) return null;

      const first = we.sets[0];
      const summary = first
        ? `${we.sets.length} sets • ${first.weight ?? 0} kg x ${first.reps}`
        : `${we.sets.length} sets`;

      return {
        id: we.id,
        exercise: meta,
        sets: we.sets,
        summary,
      };
    })
    .filter(Boolean) as Array<{
      id: string;
      exercise: Exercise;
      sets: WorkoutSet[];
      summary: string;
    }>;
}
