/*
  ExerciseSetDropdown.tsx

  Component: Collapsible set editor used in workout edit and running modes.
  - Shows per-set inputs (weight/reps) and actions to add/remove/complete sets.
  - Used by `WorkoutDetailExerciseList` and the start-workout flow.
*/

import React from "react";
import "./ExerciseSetDropdown.css";

export type ExerciseSet = {
  weight: number;
  reps: number;
  done?: boolean;
  previousWeight?: number | null;
  previousReps?: number | null;
};

type ExerciseSetDropdownProps = {
  isExpanded: boolean;
  mode: "edit" | "workout";

  sets: ExerciseSet[];

  onUpdateWeight?: (index: number, weight: number) => void;
  onUpdateReps?: (index: number, reps: number) => void;

  onRemoveSet?: (index: number) => void; // edit mode button
  onAddSet?: () => void; // edit mode button
  onCompleteSet?: (index: number) => void; // workout mode button
};

export default function ExerciseSetDropdown({
  isExpanded,
  mode,
  sets,
  onUpdateWeight,
  onUpdateReps,
  onRemoveSet,
  onAddSet,
  onCompleteSet,
}: ExerciseSetDropdownProps) {
  return (
    <div
      className={`exercise-set-dropdown-outer ${isExpanded ? "expanded" : ""}`}
    >
      <div className="exercise-set-dropdown-inner">
        {/* HEADER */}
        <div className="exercise-set-header">
          <span>Set</span>
          <span>Previous</span>
          <span>Kg</span>
          <span>Reps</span>
          <span></span>
        </div>

        {/* SET ROWS */}
        {sets.map((set, index) => (
          <div key={index} className="exercise-set-row">
            {/* Set number */}
            <span className="set-number">{index + 1}</span>

            {/* Previous value */}

            <span
              className="previous-value"
              onClick={() => {
                if (set.previousWeight != null && set.previousReps != null) {
                  onUpdateWeight?.(index, set.previousWeight);
                  onUpdateReps?.(index, set.previousReps);
                }
              }}
            >
              {set.previousWeight != null && set.previousReps != null
                ? `${set.previousWeight} x ${set.previousReps}`
                : "—"}
            </span>

            {/* Weight input */}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="set-input"
              value={set.weight === 0 ? "" : set.weight}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                onUpdateWeight?.(index, value === "" ? 0 : Number(value));
              }}
            />

            {/* Reps input */}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="set-input"
              value={set.reps === 0 ? "" : set.reps}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                onUpdateReps?.(index, value === "" ? 0 : Number(value));
              }}
            />

            {/* Buttons */}
            {mode === "edit" && onRemoveSet && (
              <button
                className="remove-set-btn"
                onClick={() => onRemoveSet(index)}
              >
                —
              </button>
            )}

            {mode === "workout" && onCompleteSet && (
              <button
                className={`complete-set-btn ${set.done ? "done" : ""}`}
                onClick={() => onCompleteSet(index)}
              >
                ✓
              </button>
            )}
          </div>
        ))}

        {/* Add Set Button (edit mode only) */}
        {mode === "edit" && onAddSet && (
          <button className="add-set-btn" onClick={onAddSet}>
            + Add Set
          </button>
        )}
      </div>
    </div>
  );
}
