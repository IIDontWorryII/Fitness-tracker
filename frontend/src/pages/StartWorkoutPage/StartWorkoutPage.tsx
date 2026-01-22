/**
 * StartWorkoutPage.tsx
 *
 * Page: Run a workout session.
 * - Loads a workout by `workoutId` route param and builds a live session state.
 * - Tracks elapsed time, live stats (volume / completed sets), and per-exercise sets.
 * - Allows marking sets done and finishes the session to save a history snapshot.
 */

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fetchWorkoutById } from "../../api/workoutsClient";
import { fetchWorkoutHistory } from "../../api/workoutHistoryClient";
import { createWorkoutHistory } from "../../api/workoutHistoryClient";
import { useExercises } from "../../hooks/useExercises";
import type { Workout, WorkoutExercise, WorkoutSet } from "../../types";

import ExerciseCard from "../../components/ExerciseCard/ExerciseCard";
import ExerciseSetDropdown from "../../components/ExerciseSetDropdown/ExerciseSetDropdown";

import "./StartWorkoutPage.css";

/* ========================== TYPES ========================== */

type SessionSet = {
  weight: number;
  reps: number;
  done: boolean;
  previousWeight: number | null;
  previousReps: number | null;
};

type SessionExercise = {
  id: string;
  name: string;
  muscle: string;
  thumbnail: string | undefined;
  sets: SessionSet[];
};

/* ====================== COMPONENT ========================== */

const StartWorkoutPage = () => {
  const { exercises } = useExercises();
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const [seconds, setSeconds] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function load() {
      if (!workoutId || exercises.length === 0) {
        return;
      }

      let found: Workout;

      try {
        found = await fetchWorkoutById(workoutId);
        setWorkout(found);
      } catch {
        setWorkout(null);
        setLoading(false);
        return;
      }

      let history: any[] = [];
      try {
        history = await fetchWorkoutHistory();
      } catch {
        history = [];
      }

      const sessionExercisesBuilt: SessionExercise[] = found.exercises
        .map((we: WorkoutExercise) => {
          const meta = exercises.find((ex) => ex.id === we.id);
          if (!meta) return null;

          const last =
            [...history]
              .reverse()
              .find((h) => h.exercises.some((e: any) => e.id === we.id))
              ?.exercises.find((e: any) => e.id === we.id) ?? null;

          return {
            id: meta.id,
            name: meta.name,
            muscle: meta.muscle,
            thumbnail: meta.thumbnail,
            sets: we.sets.map((s: WorkoutSet, index: number) => {
              const prev = last?.sets[index] ?? null;
              return {
                weight: s.weight ?? 0,
                reps: s.reps,
                done: false,
                previousWeight: prev?.weight ?? null,
                previousReps: prev?.reps ?? null,
              };
            }),
          };
        })
        .filter((x): x is SessionExercise => x !== null);

      setSessionExercises(sessionExercisesBuilt);
      setLoading(false);
    }

    load();
  }, [workoutId, exercises]);

  /* ======================= TIMER ======================= */

  const formatTime = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* ===================== LIVE STATS ===================== */
  const stats = useMemo(() => {
    let totalVolume = 0;
    let completedSets = 0;

    sessionExercises.forEach((ex) =>
      ex.sets.forEach((s) => {
        if (s.done) {
          completedSets++;
          totalVolume += s.weight * s.reps;
        }
      })
    );

    return { totalVolume, completedSets };
  }, [sessionExercises]);

  /* ================= SNAPSHOT ================= */
  const sessionSnapshot = useMemo(
    () =>
      workout
        ? {
            date: new Date().toISOString(),
            workoutId: workout.id,
            name: workout.name,
            durationSeconds: seconds,
            totalVolume: stats.totalVolume,
            completedSets: stats.completedSets,
            exercises: sessionExercises.map((ex) => ({
              id: ex.id,
              name: ex.name,
              muscle: ex.muscle,
              sets: ex.sets.map((s) => ({
                weight: s.weight,
                reps: s.reps,
                done: s.done,
                volume: (s.weight ?? 0) * s.reps,
              })),
            })),
          }
        : null,
    [sessionExercises, seconds, stats, workout]
  );

  /* ================== INTERACTION ================== */
  const toggleSetDone = (exerciseId: string, setIndex: number) => {
    setSessionExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s, i) =>
                i === setIndex ? { ...s, done: !s.done } : s
              ),
            }
          : ex
      )
    );
  };

  const updateSetWeight = (
    exerciseId: string,
    setIndex: number,
    weight: number
  ) => {
    setSessionExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s, i) =>
                i === setIndex ? { ...s, weight } : s
              ),
            }
          : ex
      )
    );
  };

  const updateSetReps = (
    exerciseId: string,
    setIndex: number,
    reps: number
  ) => {
    setSessionExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s, i) =>
                i === setIndex ? { ...s, reps } : s
              ),
            }
          : ex
      )
    );
  };

  const handleFinishWorkout = async () => {
    if (!workout || !sessionSnapshot) return;
    const saved = await createWorkoutHistory(sessionSnapshot);

    navigate(`/workout/${workout.id}/summary/${saved.id}`, {
      state: { from: "workout" },
    });
  };

  /* ======================= LOADING / ERROR ======================= */
  if (loading) {
    return (
      <div className="container start-workout-page">
        <p>Loading workout…</p>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="container start-workout-page">
        <p>Workout not found.</p>
      </div>
    );
  }

  /* ======================= RENDER ======================= */
  return (
    <div className="container start-workout-page">
      <div className="session-header">
        <div className="timer-display">{formatTime()}</div>

        <div className="session-stats">
          <div>
            <span className="stat-label">Volume</span>
            <span className="stat-value">{stats.totalVolume} kg</span>
          </div>
          <div>
            <span className="stat-label">Sets</span>
            <span className="stat-value">{stats.completedSets}</span>
          </div>
        </div>
      </div>

      <div className="session-exercises">
        {sessionExercises.map((ex) => (
          <div
            key={ex.id}
            id={`exercise-${ex.id}`}
            className="workout-exercise-wrapper"
          >
            <ExerciseCard
              variant="workout"
              exercise={ex}
              setsDone={ex.sets.filter((s) => s.done).length}
              totalSets={ex.sets.length}
              onClick={() =>
                setExpandedId((prev) => (prev === ex.id ? null : ex.id))
              }
            />

            <ExerciseSetDropdown
              isExpanded={expandedId === ex.id}
              mode="workout"
              sets={ex.sets}
              onUpdateWeight={(i, w) => updateSetWeight(ex.id, i, w)}
              onUpdateReps={(i, r) => updateSetReps(ex.id, i, r)}
              onCompleteSet={(i) => toggleSetDone(ex.id, i)}
            />
          </div>
        ))}
      </div>

      <button className="finish-button" onClick={handleFinishWorkout}>
        Finish Workout
      </button>
    </div>
  );
};

export default StartWorkoutPage;
