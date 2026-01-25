/**
 * CommunityWorkoutsPage.tsx
 *
 * Page: Browse public workouts shared by other users.
 *
 * Responsibilities:
 * - Fetch public workouts
 * - Display them using PublicWorkoutCard
 * - Provide placeholder clone handler
 *
 * Notes:
 * - Layout and CSS intentionally mirror WorkoutsPage
 * - Clone logic is NOT implemented yet
 */

import { useEffect, useState, useMemo } from "react";
import { fetchPublicWorkouts, cloneWorkout } from "../../api/workoutsClient";
import { useExercises } from "../../hooks/useExercises";
import { useNavigate } from "react-router-dom";
import PublicWorkoutCard from "../../components/PublicWorkoutCard/PublicWorkoutCard";
import ExploreTabs from "../../components/ExploreTabs/ExploreTabs";
import type { Workout } from "../../types";

import "../WorkoutsPage/WorkoutsPage.css"; // reuse grid + layout styles

function CommunityWorkoutsPage() {
  const { exercises } = useExercises();
  const navigate = useNavigate();

  const exerciseMap = useMemo(() => {
    return new Map(exercises.map((e) => [e.id, e]));
  }, [exercises]);

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicWorkouts()
      .then(setWorkouts)
      .catch(() => setWorkouts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleClone = async (workoutId: string) => {
    try {
      const cloned = await cloneWorkout(workoutId);
      navigate(`/workout/${cloned.id}`);
    } catch (err) {
      console.error("Failed to clone workout", err);
    }
  };

  if (loading) {
    return (
      <div className="workouts-page">
        <p>Loading community workouts…</p>
      </div>
    );
  }

  return (
    <div className="workouts-page">
      <ExploreTabs />
      <h2 className="workouts-title">Explore the Community Workouts</h2>

      <div className="workouts-grid">
        {workouts.map((workout) => (
          <PublicWorkoutCard
            key={workout.id}
            id={workout.id}
            name={workout.name}
            previewExercises={workout.exercises.map((we) => ({
              id: we.id,
              name: exerciseMap.get(we.id)?.name ?? "Unknown exercise",
              setCount: we.sets.length,
            }))}
            onClone={handleClone}
          />
        ))}
      </div>

      {workouts.length === 0 && (
        <p className="text-muted mt-3">No public workouts available.</p>
      )}
    </div>
  );
}

export default CommunityWorkoutsPage;
