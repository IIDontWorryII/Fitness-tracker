/**
 * NewWorkoutPage.tsx
 *
 * Page: Create a new workout routine (name + pick exercises).
 * - Shows a form to enter a workout name.
 * - Opens `ExerciseListModal` to select exercises.
 * - Previews selected exercises and saves the new workout to localStorage.
 *
 * Notes:
 * - No props; uses `useNavigate` to redirect after saving.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import ExerciseListModal from "../../components/ExerciseListModal/ExerciseListModal";
import ExerciseCard from "../../components/ExerciseCard/ExerciseCard";
import ExerciseModal from "../../components/ExerciseModal/ExerciseModal";

import { useExercises } from "../../hooks/useExercises";
import { createWorkout } from "../../api/workoutsClient";
import type { WorkoutExercise, Exercise } from "../../types";

import "./NewWorkoutPage.css";

const NewWorkoutPage: React.FC = () => {
  const { exercises } = useExercises();
  const navigate = useNavigate();
  /* ------------------------------------------------------
     LOCAL STATE
  ------------------------------------------------------ */
  // Title of the workout
  const [workoutName, setWorkoutName] = useState("");

  // Modal visibility
  const [showModal, setShowModal] = useState(false);

  // The exercises returned from the modal (now FULL objects)
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>(
    []
  );

  // Holds the exercise currently selected by the user, or null when no modal is open.
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  /* ------------------------------------------------------
     INPUT HANDLING
  ------------------------------------------------------ */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkoutName(e.target.value);
  };

  /* ------------------------------------------------------
     MODAL HANDLERS
  ------------------------------------------------------ */

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // Modal now returns WorkoutExercise[]
  const onModalDone = (list: WorkoutExercise[]) => {
    setSelectedExercises((prev) => {
      const existingIds = new Set(prev.map((ex) => ex.id));

      const merged = [...prev, ...list.filter((ex) => !existingIds.has(ex.id))];

      return merged;
    });

    closeModal();
  };

  /* ------------------------------------------------------
     SAVE WORKOUT
  ------------------------------------------------------ */
  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      alert("Please enter a workout name");
      return;
    }

    if (selectedExercises.length === 0) {
      alert("Please select at least one exercise");
      return;
    }

    try {
      (await createWorkout({
        name: workoutName,
        exercises: selectedExercises,
      }),
        navigate("/"));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  /* ------------------------------------------------------
     JSX
  ------------------------------------------------------ */
  return (
    <div className="new-workout-page">
      <h1 className="new-workout-title">Create New Workout</h1>

      {/* Workout name */}
      <div className="new-workout-field">
        <input
          type="text"
          className="new-workout-input"
          placeholder=" Workout title…"
          value={workoutName}
          onChange={handleNameChange}
        />
      </div>

      {/* Actions */}
      <div className="new-workout-actions">
        <button className="btn-secondary" onClick={openModal}>
          + Add Exercises
        </button>

        <button className="btn-primary" onClick={saveWorkout}>
          Save Workout
        </button>
      </div>

      {/* Selected exercises preview */}
      {selectedExercises.length > 0 && (
        <div className="new-workout-preview">
          <h3 className="preview-title">Selected Exercises</h3>

          {selectedExercises.map((item) => {
            const ex = exercises.find((e) => e.id === item.id);
            if (!ex) return null;

            return (
              <ExerciseCard
                key={item.id}
                variant="picker"
                exercise={ex}
                onClick={setSelectedExercise}
              />
            );
          })}
        </div>
      )}

      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}

      {showModal && (
        <ExerciseListModal onClose={closeModal} onDone={onModalDone} />
      )}
    </div>
  );
};

export default NewWorkoutPage;
