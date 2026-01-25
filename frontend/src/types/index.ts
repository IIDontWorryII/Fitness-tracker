/*
  src/models/types.ts

  Central types used across the app.
  - Defines `Exercise`, `Workout`, `WorkoutExercise`, and related shapes.
  - Keep this file small and import types from here for consistent typing.
*/

/** Basic muscle groups we support in the app */
export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "legs"
  | "glutes"
  | "arms"
  | "core";

export const ALL_MUSCLES: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "legs",
  "glutes",
  "arms",
  "core",
];

// Base exercise metadata (from allExercises)
export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  thumbnail?: string;
  description?: string;
}

// A single set inside a workout exercise
export interface WorkoutSet {
  weight: number | null; // kg — null when empty
  reps: number; // reps — required
}

// An exercise inside a workout, containing multiple sets
export interface WorkoutExercise {
  id: string; // reference to Exercise.id
  sets: WorkoutSet[]; // array of sets
}

// Workout model
export interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];

  isPublic?: boolean;
}

export interface ExerciseStats {
  sets: number;
  reps: number;
  weight?: number; // optional
}

export type WorkoutHistoryEntry = {
  id: string;
  workoutId: string;
  name: string;
  date: string; // ISO date
  durationSeconds: number;
  totalVolume: number;
  completedSets: number;
  exercises: {
    id: string;
    name: string;
    muscle: string;
    sets: {
      weight: number;
      reps: number;
      done: boolean;
      volume: number;
    }[];
  }[];
};

// /** An Exercise object (stored once in the master list) */
// export interface Exercise {
//   id: string;         // stable unique id (e.g. "ex-001") - used by workouts to reference it
//   name: string;       // human readable name ("Bench Press")
//   muscle: MuscleGroup;// primary muscle group targeted
//   thumbnail: string; // optional - path/URL to small image/icon
//   description?: string;     // optional short tips or description
//   // optional user-specific values; left on the Exercise shape for simplicity
//   // (they may be omitted when using the master DB)
//   sets?: number;
//   reps?: number;
// }

export interface ExerciseCardProps {
  exercise: Exercise;
  onClick: (exercise: Exercise) => void;
}

/** A Workout contains a name and an ordered array of exercise IDs.
 *  We store exercise references (ids) instead of full objects to avoid duplication.
 */
// export interface Workout {
//   id: string;             // unique id for the workout (e.g. "w-2025-01")
//   name: string;           // workout title ("Push Day")
//   exercises: string[];    // array of exercise ids, ordered
// }
