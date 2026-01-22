/*
  ExerciseCard.tsx

  Component: Reusable exercise preview card used across explore, workouts and pickers.
  - Supports multiple `variant` modes that adjust displayed metadata and actions.
  - Pure presentational; parent provides handlers for clicks/removals.
*/

import React from "react";
import "./ExerciseCard.css";
import type { Exercise } from "../../types";

export type ExerciseCardProps = {
  variant: "myworkout" | "explore" | "picker" | "edit" | "workout";
  exercise: Exercise;
  summary?: string;
  onClick?: (exercise: Exercise) => void;
  onRemove?: () => void;
  setsDone?: number; // used in workout mode
  totalSets?: number; // used in workout mode
};

export default function ExerciseCard({
  variant,
  exercise,
  summary,
  onClick,
  onRemove,
  setsDone,
  totalSets,
}: ExerciseCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(exercise);
    }
  };

  return (
    <div className={`exercise-card exercise-card--${variant}`}>
      <div className="exercise-card-content" onClick={handleClick}>
        {exercise.thumbnail && (
          <div className="exercise-thumbnail-wrapper">
            <img
              src={exercise.thumbnail}
              alt={exercise.name}
              className="exercise-thumbnail"
            />
          </div>
        )}

        <div className="exercise-info">
          <h4 className="exercise-name">{exercise.name}</h4>

          {/* TEXT LINE UNDER THE NAME DEPENDS ON VARIANT */}
          {variant === "workout" ? (
            // Start workout mode → show progress
            <p className="exercise-workout-progress">
              {setsDone ?? 0} / {totalSets ?? 0} sets
            </p>
          ) : (variant === "myworkout" || variant === "edit") && summary ? (
            // View + Edit workout modes → show summary like "3 sets • 40 kg x 12"
            <p className="exercise-summary">{summary}</p>
          ) : (
            // Default: show target muscle (explore/picker, etc.)
            <p className="exercise-muscle">{exercise.muscle}</p>
          )}
        </div>
      </div>

      {/* Remove button: ONLY in edit mode */}
      {onRemove && variant === "edit" && (
        <button
          className="exercise-card-remove-btn"
          onClick={(e) => {
            e.stopPropagation(); // do not trigger onClick / expand
            onRemove();
          }}
        >
          Remove
        </button>
      )}
    </div>
  );
}
