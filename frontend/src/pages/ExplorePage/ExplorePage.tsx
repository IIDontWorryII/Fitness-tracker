/**
 * ExplorePage.tsx
 *
 * Page: Browse and filter exercises.
 * - Provides a search bar and muscle filters to narrow exercises.
 * - Shows `ExerciseCard` list and opens `ExerciseModal` for details.
 *
 * Notes:
 * - Uses `useExerciseFilter` hook for filtering logic.
 */

import { useState } from "react";
import ExerciseCard from "../../components/ExerciseCard/ExerciseCard";
import ExerciseModal from "../../components/ExerciseModal/ExerciseModal";
import { useExercises } from "../../hooks/useExercises";
import { useExerciseFilter } from "../../hooks/useExerciseFilter";
import ExerciseSearchBar from "../../components/ExerciseSearchBar/ExerciseSearchBar";
import MuscleFilterBar from "../../components/MuscleFilterBar/MuscleFilterBar";
import type { Exercise } from "../../types";
import "./ExplorePage.css";

const ExplorePage = () => {
  const { exercises, loading } = useExercises();
  const {
    searchQuery,
    setSearchQuery,
    selectedMuscles,
    toggleMuscle,
    filteredExercises,
  } = useExerciseFilter(exercises);

  // Currently opened exercise in the modal (or null if closed)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  return (
    <div className="container">
      {/* SEARCH BAR */}
      <ExerciseSearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* MUSCLE FILTERS */}
      <MuscleFilterBar selected={selectedMuscles} toggle={toggleMuscle} />

      {/* EXERCISE LIST */}
      <div className="exercise-list">
        {filteredExercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            variant="explore"
            exercise={ex}
            onClick={() => setSelectedExercise(ex)}
          />
        ))}

        {filteredExercises.length === 0 && (
          <p className="text-center text-muted mt-3">No exercises found.</p>
        )}
      </div>

      {/* MODAL */}
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
};

export default ExplorePage;
