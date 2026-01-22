/*
  src/data/exercises.ts

  Data: Master list of exercises used throughout the app.
  - Exports `allExercises: Exercise[]` and small helpers for consistent ids.
  - Intended as the canonical exercise DB for explore and workout composition.
*/

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  thumbnail?: string;
  description?: string;
}

/** Small helper to create ids consistently */
const makeExerciseId = (n: number) => `ex-${String(n).padStart(3, "0")}`;

/** Starter exercise DB — 22 items (balanced across muscle groups) */
export const allExercises: Exercise[] = [
  {
    id: makeExerciseId(1),
    name: "Bench Press",
    muscle: "chest",
    thumbnail: "/images/ex/bench_press.png",
    description: "Flat bench—compound chest press.",
  },
  {
    id: makeExerciseId(2),
    name: "Incline Bench Press",
    muscle: "chest",
    thumbnail: "/images/ex/incline_bench.jpg",
  },
  {
    id: makeExerciseId(3),
    name: "Push-up",
    muscle: "chest",
    thumbnail: "/images/ex/push_up.jpg",
  },
  {
    id: makeExerciseId(4),
    name: "Barbell Row",
    muscle: "back",
    thumbnail: "/images/ex/barbell_row.jpg",
  },
  {
    id: makeExerciseId(5),
    name: "Pull-up",
    muscle: "back",
    thumbnail: "/images/ex/pull_up.jpg",
  },
  {
    id: makeExerciseId(6),
    name: "Lat Pulldown",
    muscle: "back",
    thumbnail: "/images/ex/lat_pulldown.jpg",
  },
  {
    id: makeExerciseId(7),
    name: "Overhead Press",
    muscle: "shoulders",
    thumbnail: "/images/ex/ohp.jpg",
  },
  {
    id: makeExerciseId(8),
    name: "Lateral Raise",
    muscle: "shoulders",
    thumbnail: "/images/ex/lateral_raise.jpg",
  },
  {
    id: makeExerciseId(9),
    name: "Squat",
    muscle: "legs",
    thumbnail: "/images/ex/squat.jpg",
  },
  {
    id: makeExerciseId(10),
    name: "Romanian Deadlift",
    muscle: "glutes",
    thumbnail: "/images/ex/rdl.jpg",
  },
  {
    id: makeExerciseId(11),
    name: "Leg Press",
    muscle: "legs",
    thumbnail: "/images/ex/leg_press.jpg",
  },
  {
    id: makeExerciseId(12),
    name: "Walking Lunge",
    muscle: "legs",
    thumbnail: "/images/ex/lunge.jpg",
  },
  {
    id: makeExerciseId(13),
    name: "Hip Thrust",
    muscle: "glutes",
    thumbnail: "/images/ex/hip_thrust.jpg",
  },
  {
    id: makeExerciseId(14),
    name: "Bicep Curl",
    muscle: "arms",
    thumbnail: "/images/ex/bicep_curl.jpg",
  },
  {
    id: makeExerciseId(15),
    name: "Tricep Dip",
    muscle: "arms",
    thumbnail: "/images/ex/tricep_dip.jpg",
  },
  {
    id: makeExerciseId(16),
    name: "Plank",
    muscle: "core",
    thumbnail: "/images/ex/plank.jpg",
  },
  {
    id: makeExerciseId(17),
    name: "Russian Twist",
    muscle: "core",
    thumbnail: "/images/ex/russian_twist.jpg",
  },
  {
    id: makeExerciseId(18),
    name: "Chest Fly Dumbbell",
    muscle: "chest",
    thumbnail: "/images/ex/dumbbell_fly.jpg",
  },
  {
    id: makeExerciseId(19),
    name: "Seated Row",
    muscle: "back",
    thumbnail: "/images/ex/seated_row.jpg",
  },
  {
    id: makeExerciseId(20),
    name: "Chest Press",
    muscle: "chest",
    thumbnail: "/images/ex/chest_press.jpg",
  },
  {
    id: makeExerciseId(21),
    name: "Chest Fly Cable",
    muscle: "chest",
    thumbnail: "/images/ex/chest_fly_cable.jpg",
  },
  {
    id: makeExerciseId(22),
    name: "Reverse Fly",
    muscle: "shoulders",
    thumbnail: "/images/ex/reverse_fly.jpg",
  },
];
