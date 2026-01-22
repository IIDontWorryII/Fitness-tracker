/*
  WorkoutDetailExerciseList.tsx

  Component: Renders the list of exercises inside the Workout Detail page.
  - Supports `view` and `edit` modes; in edit mode shows per-exercise set controls.
  - Composes `ExerciseCard` and `ExerciseSetDropdown` and forwards edit callbacks.
*/

import React from "react";
import ExerciseCard from "../ExerciseCard/ExerciseCard";
import ExerciseSetDropdown from "../ExerciseSetDropdown/ExerciseSetDropdown";
import type { Exercise, WorkoutSet } from "../../types";

type Props = {
  mode: "view" | "edit";
  detailedExercises: Array<{
    exercise: Exercise;
    sets: WorkoutSet[];
    id: string;
    summary: string;
  }>;

  expandedId: string | null;
  onToggleExpand: (id: string) => void;

  // Edit mode only
  onUpdateWeight?: (exerciseId: string, setIndex: number, weight: number) => void;
  onUpdateReps?: (exerciseId: string, setIndex: number, reps: number) => void;
  onAddSet?: (exerciseId: string) => void;
  onRemoveSet?: (exerciseId: string, setIndex: number) => void;
  onRemoveExercise?: (exerciseId: string) => void;
  onSelectExercise?: (exercise: Exercise) => void;
};

export default function WorkoutExerciseList({
  mode,
  detailedExercises,
  expandedId,
  onToggleExpand,
  onUpdateWeight,
  onUpdateReps,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onSelectExercise
}: Props) {
  const isEdit = mode === "edit";

  return (
    <div className="workout-exercise-list-wrapper">
      {detailedExercises.map(({ exercise, sets, id, summary }) => {
        const isOpen = expandedId === id;

        return (
          <div key={id} className="exercise-list-item">
            
            {/* ---- CARD ---- */}
            <ExerciseCard
              variant={isEdit ? "edit" : "myworkout"}
              exercise={exercise}
              summary={summary}
              onClick={
    isEdit
      ? () => onToggleExpand(id)
      : () => onSelectExercise?.(exercise)   // ← restored behavior
  }
              onRemove={isEdit ? () => onRemoveExercise?.(id) : undefined}
            />

            {/* ---- EDIT DROPDOWN ---- */}
            {isEdit && (
              <ExerciseSetDropdown
                isExpanded={isOpen}
                mode="edit"
                sets={sets.map((s) => ({
                  weight: s.weight ?? 0,
                  reps: s.reps,
                  previousWeight: null,
                  previousReps: null,
                }))}
                onUpdateWeight={(i, w) => onUpdateWeight?.(id, i, w)}
                onUpdateReps={(i, r) => onUpdateReps?.(id, i, r)}
                onRemoveSet={(i) => onRemoveSet?.(id, i)}
                onAddSet={() => onAddSet?.(id)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
