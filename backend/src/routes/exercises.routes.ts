import { Router } from "express";
import Exercise from "../data/exercises.store";

const router = Router();

/**
 * GET /api/exercises
 * Public, global exercise list
 */
router.get("/", async (_req, res) => {
  const baseUrl = `${_req.protocol}://${_req.get("host")}`;

  const exercises = await Exercise.find({ isGlobal: true })
    .sort({ name: 1 })
    .lean();

  const normalized = exercises.map((ex) => ({
    ...ex,
    thumbnail: ex.thumbnail ? `${baseUrl}${ex.thumbnail}` : null,
  }));

  res.json(normalized);
});

export default router;
