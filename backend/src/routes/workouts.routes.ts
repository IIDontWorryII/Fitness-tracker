// backend/src/routes/workouts.ts
import { Router } from "express";
import {
  getAllWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from "../data/workouts.store";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

/**
 * GET /workouts
 * Returns workouts of the logged-in user
 */
router.get("/", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;

  const workouts = await getAllWorkouts(userId);
  res.json(workouts);
});

/**
 * GET /workouts/:id
 * Returns a single workout owned by the logged-in user
 */
router.get("/:id", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const { id } = req.params;

  const workout = await getWorkoutById(userId, id);

  if (!workout) {
    return res.status(404).json({ message: "Workout not found" });
  }

  res.json(workout);
});

/**
 * PATCH /workouts/:id
 * Updates name and/or exercises of a workout
 */
router.patch("/:id", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const { id } = req.params;
  const { name, exercises } = req.body;

  const updated = await updateWorkout(userId, id, {
    ...(name !== undefined && { name }),
    ...(exercises !== undefined && { exercises }),
  });

  if (!updated) {
    return res.status(404).json({ message: "Workout not found" });
  }

  res.json(updated);
});

/**
 * POST /workouts
 */
router.post("/", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const { name, exercises } = req.body;

  const normalizedExercises = (exercises ?? []).map((ex: any) => ({
    id: String(ex.id), // ← slug only
    sets: ex.sets ?? [],
  }));

  const workout = await createWorkout({
    userId,
    name,
    exercises: normalizedExercises,
  });

  res.status(201).json(workout);
});

/**
 * DELETE /workouts/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const { id } = req.params;

  const success = await deleteWorkout(userId, id);

  if (!success) {
    return res.status(404).json({ message: "Workout not found" });
  }

  res.json({ success: true });
});

export default router;
