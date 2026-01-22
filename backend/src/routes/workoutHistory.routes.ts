import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  createWorkoutHistory,
  getWorkoutHistoryById,
  getWorkoutHistory,
} from "../data/workoutHistory.store";

const router = Router();

/**
 * POST /api/workout-history
 * Save finished workout session
 */
router.post("/", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;

  const entry = await createWorkoutHistory({
    userId,
    ...req.body,
  });

  res.status(201).json({
    id: entry._id.toString(),
    workoutId: entry.workoutId,
    name: entry.name,
    date: entry.date,
    durationSeconds: entry.durationSeconds,
    totalVolume: entry.totalVolume,
    completedSets: entry.completedSets,
    exercises: entry.exercises,
  });
});

/**
 * GET /api/workout-history
 * List all sessions for user
 */
router.get("/", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const history = await getWorkoutHistory(userId);
  res.json(history);
});

/**
 * GET /api/workout-history/:id
 * Get single session
 */
router.get("/:id", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const entry = await getWorkoutHistoryById(userId, req.params.id);

  if (!entry) {
    return res.status(404).json({ message: "Session not found" });
  }

  res.json(entry);
});

export default router;
