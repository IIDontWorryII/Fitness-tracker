/**
 * WorkoutsPage.tsx
 *
 * Page: List saved workouts.
 */

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useExercises } from "../../hooks/useExercises";
import WorkoutCard from "../../components/WorkoutCard/WorkoutCard";
import { fetchWorkouts } from "../../api/workoutsClient";
import type { Workout } from "../../types";

import "./WorkoutsPage.css";

function WorkoutsPage() {
  const { exercises } = useExercises();

  const exerciseMap = useMemo(() => {
    return new Map(exercises.map((e) => [e.id, e]));
  }, [exercises]);

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkouts()
      .then(setWorkouts)
      .catch(() => setWorkouts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="workouts-page">
        <p>Loading workouts…</p>
      </div>
    );
  }

  return (
    <div className="workouts-page">
      <h2 className="workouts-title">Your Workouts</h2>

      <div className="workouts-grid">
        {workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            id={workout.id}
            name={workout.name}
            previewExercises={workout.exercises.map((we) => ({
              id: we.id,
              name: exerciseMap.get(we.id)?.name ?? "Unknown exercise",
              setCount: we.sets.length,
            }))}
          />
        ))}
      </div>
      <button
        className="create-workout-btn"
        onClick={() => navigate("/new-workout")}
      >
        + Create a new workout
      </button>
    </div>
  );
}

export default WorkoutsPage;
