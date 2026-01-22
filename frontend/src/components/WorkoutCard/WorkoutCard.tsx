import React from "react";
import { useNavigate } from "react-router-dom";
import "./WorkoutCard.css";

type WorkoutCardProps = {
  id: string;
  name: string;
  previewExercises: {
    id: string;
    name: string;
    setCount: number;
  }[];
};

export default function WorkoutCard({
  id,
  name,
  previewExercises,
}: WorkoutCardProps) {
  const navigate = useNavigate();
  return (
    <div
      className="workout-card"
      onClick={() => navigate(`/workout/${id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/workout/${id}`)}
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
    </div>
  );
}
