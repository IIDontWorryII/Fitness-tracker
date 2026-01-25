/**
 * PublicWorkoutCard.tsx
 *
 * Represents a public (shared) workout from the community.
 *
 * Responsibilities:
 * - Display workout preview (read-only)
 * - Allow user to clone the workout via button
 * - Navigate to public workout detail on card click
 *
 * Notes:
 * - Does NOT own the workout
 * - Clone logic is delegated via callback
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import "../WorkoutCard/WorkoutCard.css";

type PublicWorkoutCardProps = {
  id: string;
  name: string;
  previewExercises: {
    id: string;
    name: string;
    setCount: number;
  }[];
  onClone: (workoutId: string) => void;
};

export default function PublicWorkoutCard({
  id,
  name,
  previewExercises,
  onClone,
}: PublicWorkoutCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="workout-card"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/explore/community/${id}`)}
      onKeyDown={(e) =>
        e.key === "Enter" && navigate(`/explore/community/${id}`)
      }
    >
      <div className="workout-card-header">
        <h3>{name}</h3>
        <span>{previewExercises.length} exercises</span>
      </div>

      <ul className="workout-exercise-list">
        {previewExercises.slice(0, 3).map((ex) => (
          <li key={ex.id}>
            <span>{ex.name}</span>
            <span>{ex.setCount} sets</span>
          </li>
        ))}
      </ul>

      {/* ACTIONS */}
      <div className="workout-card-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={(e) => {
            e.stopPropagation(); // prevent card navigation
            onClone(id);
          }}
        >
          Clone workout
        </button>
      </div>
    </div>
  );
}
