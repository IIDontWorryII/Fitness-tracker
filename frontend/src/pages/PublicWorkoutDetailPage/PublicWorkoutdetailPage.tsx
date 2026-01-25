import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPublicWorkoutById, cloneWorkout } from "../../api/workoutsClient";
import { useExercises } from "../../hooks/useExercises";
import type { Workout } from "../../types";

import "./PublicWorkoutDetailPage.css";

function PublicWorkoutDetailPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { exercises } = useExercises();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  const exerciseMap = useMemo(() => {
    return new Map(exercises.map((e) => [e.id, e]));
  }, [exercises]);

  useEffect(() => {
    if (!workoutId) return;

    fetchPublicWorkoutById(workoutId)
      .then(setWorkout)
      .catch(() => setWorkout(null))
      .finally(() => setLoading(false));
  }, [workoutId]);

  const handleClone = async () => {
    if (!workout) return;
    const cloned = await cloneWorkout(workout.id);
    navigate(`/workout/${cloned.id}`);
  };

  if (loading) {
    return <p className="container">Loading workout…</p>;
  }

  if (!workout) {
    return <p className="container">Workout not found.</p>;
  }

  return (
    <div className="container public-workout-detail">
      <div className="public-header">
        <h2>{workout.name}</h2>
        <button className="btn-clone" onClick={handleClone}>
          Clone workout
        </button>
      </div>

      <ul className="exercise-list">
        {workout.exercises.map((we) => {
          const ex = exerciseMap.get(we.id);
          return (
            <li key={we.id} className="exercise-row">
              <span>{ex?.name ?? "Unknown exercise"}</span>
              {ex?.muscle && <span className="muscle">{ex.muscle}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PublicWorkoutDetailPage;
