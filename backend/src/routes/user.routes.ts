import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { updateUserName, deleteUserAccount } from "../data/users.store";

const router = Router();

/**
 * PATCH /api/user/me
 */
router.patch("/me", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const { name } = req.body;

  const updated = await updateUserName(userId, name);
  if (!updated) {
    return res.status(400).json({ message: "Invalid name" });
  }

  res.json({
    id: updated._id.toString(),
    name: updated.name,
    email: updated.email,
  });
});

/**
 * DELETE /api/user/me
 */
router.delete("/me", requireAuth, async (req, res) => {
  const userId = req.session.userId!;

  await deleteUserAccount(userId);

  req.session.destroy(() => {});
  res.clearCookie("fitnessapp.sid");

  res.json({ success: true });
});

export default router;
