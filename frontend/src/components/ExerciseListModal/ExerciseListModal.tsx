import React, { useState, useMemo } from "react";
import Modal from "../Modal/Modal";
import "./ExerciseListModal.css";
import type { WorkoutExercise } from "../../types";
import { useExercises } from "../../hooks/useExercises";
import { API_BASE } from "../../api/client";

type Props = {
  onClose: () => void;
  onDone: (selected: WorkoutExercise[]) => void;
};

const MUSCLES = [
  "chest",
  "back",
  "arms",
  "shoulders",
  "legs",
  "core",
  "glutes",
];

export default function ExerciseListModal({ onClose, onDone }: Props) {
  const { exercises } = useExercises();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<Set<string>>(
    new Set()
  );

  /* -------------------------
     HANDLERS
  ------------------------- */

  const toggleExercise = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles((prev) => {
      const next = new Set(prev);
      next.has(muscle) ? next.delete(muscle) : next.add(muscle);
      return next;
    });
  };

  /* -------------------------
     FILTER LOGIC
  ------------------------- */

  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(q) ||
        ex.muscle.toLowerCase().includes(q);

      const matchesMuscle =
        selectedMuscles.size === 0 || selectedMuscles.has(ex.muscle);

      return matchesSearch && matchesMuscle;
    });
  }, [exercises, searchQuery, selectedMuscles]);

  /* -------------------------
     BUILD RESULT
  ------------------------- */

  const buildWorkoutExercises = (): WorkoutExercise[] =>
    Array.from(selectedIds).map((id) => ({
      id,
      sets: [
        { weight: null, reps: 10 },
        { weight: null, reps: 10 },
        { weight: null, reps: 10 },
      ],
    }));

  /* -------------------------
     JSX
  ------------------------- */

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="modal-header">
          <h3>Select Exercises</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search exercise…"
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* MUSCLE FILTERS */}
        <div className="muscle-filters">
          {MUSCLES.map((muscle) => {
            const isActive = selectedMuscles.has(muscle);
            const icon = `${API_BASE}/images/muscles/${muscle}.png`;

            return (
              <div
                key={muscle}
                className={`muscle-circle ${isActive ? "active" : ""}`}
                onClick={() => toggleMuscle(muscle)}
              >
                {icon && <img src={icon} alt={muscle} draggable={false} />}
              </div>
            );
          })}
        </div>

        {/* EXERCISE LIST */}
        <div className="exercise-list-scroll">
          {filteredExercises.map((ex) => {
            const isSelected = selectedIds.has(ex.id);

            return (
              <div
                key={ex.id}
                className={`exercise-card ${isSelected ? "selected" : ""}`}
                onClick={() => toggleExercise(ex.id)}
              >
                <img
                  src={ex.thumbnail}
                  alt={ex.name}
                  className="exercise-img"
                />

                <div className="exercise-info">
                  <h5>{ex.name}</h5>
                  <p className="text-muted">{ex.muscle}</p>
                </div>

                <div className="exercise-select-indicator">
                  {isSelected ? "✓" : ""}
                </div>
              </div>
            );
          })}

          {filteredExercises.length === 0 && (
            <p className="text-muted text-center">No exercises found.</p>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer modal-footer-split">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn-primary"
            onClick={() => onDone(buildWorkoutExercises())}
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
