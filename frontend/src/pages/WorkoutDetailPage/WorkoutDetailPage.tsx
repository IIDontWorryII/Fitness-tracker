/**
 * WorkoutDetailPage.tsx
 *
 * Page: View and edit a single workout's details.
 * - Shows exercises, sets and allows edit-mode for weight/reps/sets.
 * - Supports renaming and deleting the workout and adding/removing exercises.
 *
 * Notes:
 * - Async-safe version (backend-ready)
 */

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  buildDetailedExercises,
  updateWeightInWorkout,
  updateRepsInWorkout,
  addSetToWorkoutExercise,
  removeSetFromWorkoutExercise,
  removeExerciseFromWorkout,
} from "../../utils/workoutUtils";

import { updateWorkoutVisibility } from "../../api/workoutsClient";

import ExerciseModal from "../../components/ExerciseModal/ExerciseModal";
import ExerciseListModal from "../../components/ExerciseListModal/ExerciseListModal";

import WorkoutHeader from "../../components/WorkoutDetailHeader/WorkoutDetailHeader";
import WorkoutDetailExerciseList from "../../components/WorkoutDetailExerciseList/WorkoutDetailExerciseList";

import { useExercises } from "../../hooks/useExercises";

import type { Exercise, Workout, WorkoutExercise } from "../../types";

import "./WorkoutDetailPage.css";
import {
  deleteWorkout,
  fetchWorkoutById,
  updateWorkout,
} from "../../api/workoutsClient";

/* ============================================================
   ====================== PAGE COMPONENT =======================
   ============================================================ */

const WorkoutDetailPage = () => {
  const { exercises } = useExercises();

  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  const [isPublic, setIsPublic] = useState(false);

  /* ========================= EDIT MODE STATE ========================= */
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableExercises, setEditableExercises] = useState<WorkoutExercise[]>(
    []
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ====================== SETTINGS + MODALS ========================== */
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);

  /* ========================== SETTINGS MENU ========================== */
  const toggleSettings = () => setIsSettingsOpen((p) => !p);
  const closeSettings = () => setIsSettingsOpen(false);

  const handleConfirmRename = async () => {
    if (!workout) return;
    const trimmed = renameValue.trim();
    if (!trimmed) return;

    setIsSettingsOpen(false);
    const updated = await updateWorkout(workout.id, { name: trimmed });
    setWorkout(updated);
    setShowRenameModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!workout) return;
    await deleteWorkout(workout.id);
    navigate("/");
  };

  /* ========================= EDIT MODE ========================= */
  const handleEnterEdit = () => {
    if (!workout) return;
    setIsSettingsOpen(false);
    setIsEditMode(true);
    setEditableExercises(JSON.parse(JSON.stringify(workout.exercises)));
    setExpandedId(null);
  };

  const handleCancelEdit = () => {
    if (!workout) return;
    setIsSettingsOpen(false);
    setEditableExercises(JSON.parse(JSON.stringify(workout.exercises)));
    setExpandedId(null);
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (!workout) return;
    const updated = await updateWorkout(workout.id, {
      exercises: editableExercises,
    });
    setIsSettingsOpen(false);
    setWorkout(updated);
    setIsEditMode(false);
    setExpandedId(null);
  };

  const handleTogglePublic = async (nextValue: boolean) => {
    if (!workout) return;

    const updated = await updateWorkoutVisibility(workout.id, nextValue);

    setWorkout(updated);
    setIsPublic(updated.isPublic ?? false);
  };

  /* ======================= EDIT MODE HELPERS ======================= */
  const onUpdateWeight = (
    exerciseId: string,
    setIndex: number,
    weight: number
  ) =>
    setEditableExercises((prev) =>
      updateWeightInWorkout(prev, exerciseId, setIndex, weight)
    );

  const onUpdateReps = (exerciseId: string, setIndex: number, reps: number) =>
    setEditableExercises((prev) =>
      updateRepsInWorkout(prev, exerciseId, setIndex, reps)
    );

  const onAddSet = (exerciseId: string) =>
    setEditableExercises((prev) => addSetToWorkoutExercise(prev, exerciseId));

  const onRemoveSet = (exerciseId: string, setIndex: number) =>
    setEditableExercises((prev) =>
      removeSetFromWorkoutExercise(prev, exerciseId, setIndex)
    );

  const onRemoveExercise = (exerciseId: string) => {
    setEditableExercises((prev) => removeExerciseFromWorkout(prev, exerciseId));
    setExpandedId((prev) => (prev === exerciseId ? null : prev));
  };

  const onToggleExpand = (exerciseId: string) =>
    setExpandedId((prev) => (prev === exerciseId ? null : exerciseId));

  /* ======================= LOAD DATA ======================= */
  useEffect(() => {
    async function load() {
      if (!workoutId) {
        setLoading(false);
        return;
      }

      try {
        const w = await fetchWorkoutById(workoutId);

        setWorkout({
          ...w,
          exercises: w.exercises ?? [],
        });

        setEditableExercises(w.exercises ?? []);
        setRenameValue(w.name);
        setIsPublic(w.isPublic ?? false);
      } catch {
        setWorkout(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [workoutId]);

  /* ========================= VIEW MODE DATA ========================= */
  const detailedExercises = useMemo(() => {
    if (!workout) return [];
    return buildDetailedExercises(workout.exercises, exercises);
  }, [workout]);

  if (loading) {
    return (
      <div className="container workout-detail-page mt-4">
        <p>Loading workout…</p>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="container workout-detail-page mt-4">
        <p>Workout not found.</p>
      </div>
    );
  }

  /* ============================== RENDER ============================== */
  return (
    <div className="container workout-detail-page mt-4">
      <WorkoutHeader
        name={workout.name}
        isEditMode={isEditMode}
        /* VISIBILITY */
        isPublic={isPublic}
        onTogglePublic={handleTogglePublic}
        isSettingsOpen={isSettingsOpen}
        onToggleSettings={toggleSettings}
        onEnterEdit={handleEnterEdit}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit}
        isRenameOpen={showRenameModal}
        renameValue={renameValue}
        onRenameChange={setRenameValue}
        onOpenRename={() => setShowRenameModal(true)}
        onCloseRename={() => setShowRenameModal(false)}
        onConfirmRename={handleConfirmRename}
        isDeleteOpen={showDeleteConfirm}
        onOpenDelete={() => setShowDeleteConfirm(true)}
        onCloseDelete={() => setShowDeleteConfirm(false)}
        onConfirmDelete={handleConfirmDelete}
        onCloseSettings={closeSettings}
      />

      {!isEditMode && (
        <div className="view-mode">
          <WorkoutDetailExerciseList
            mode="view"
            detailedExercises={detailedExercises}
            expandedId={expandedId}
            onToggleExpand={onToggleExpand}
            onSelectExercise={setSelectedExercise}
          />
          <button
            className="start-workout-btn"
            onClick={() => navigate(`/workout/${workout.id}/start`)}
          >
            ▶ Start Workout
          </button>
        </div>
      )}

      {isEditMode && (
        <>
          <WorkoutDetailExerciseList
            mode="edit"
            detailedExercises={buildDetailedExercises(
              editableExercises,
              exercises
            )}
            expandedId={expandedId}
            onToggleExpand={onToggleExpand}
            onUpdateWeight={onUpdateWeight}
            onUpdateReps={onUpdateReps}
            onAddSet={onAddSet}
            onRemoveSet={onRemoveSet}
            onRemoveExercise={onRemoveExercise}
          />

          <button
            className="add-exercise-btn"
            onClick={() => setIsExercisePickerOpen(true)}
          >
            + Add Exercise
          </button>
        </>
      )}

      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}

      {isEditMode && isExercisePickerOpen && (
        <ExerciseListModal
          onDone={(list) => {
            setEditableExercises((prev) => [...prev, ...list]);
            setIsExercisePickerOpen(false);
          }}
          onClose={() => setIsExercisePickerOpen(false)}
        />
      )}
    </div>
  );
};

export default WorkoutDetailPage;
