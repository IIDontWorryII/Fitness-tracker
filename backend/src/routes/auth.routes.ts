import { Router } from "express";
import { UserModel } from "../data/users.store";
import Exercise from "../data/exercises.store";
import { hashPassword, verifyPassword } from "../utils/password";

const router = Router();

/**
 * POST /auth/register
 * Body:
 * {
 *   name: string,
 *   email: string,
 *   password: string
 * }
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation (keep simple)
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Normalize email for consistency and account linking
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      passwordHash,
    });

    (req.session as any).userId = user._id.toString();

    // Return minimal safe user data
    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,

      githubConnected: Boolean(user.oauth?.github),
      googleConnected: Boolean(user.oidc?.google),
      passkeysCount: user.passkeys?.length ?? 0,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /auth/login
 * Body:
 * {
 *   email: string,
 *   password: string
 * }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    // Normalize email for lookup
    const normalizedEmail = email.trim().toLowerCase();

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    (req.session as any).userId = user._id.toString();

    // Successful login
    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,

      githubConnected: Boolean(user.oauth?.github),
      googleConnected: Boolean(user.oidc?.google),
      passkeysCount: user.passkeys?.length ?? 0,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("fitnessapp.sid");
    res.json({ ok: true });
  });
});

router.get("/me", async (req, res) => {
  if (!(req.session as any).userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = await UserModel.findById((req.session as any).userId);

  if (!user) {
    return res.status(401).json({ message: "Invalid session" });
  }

  res.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,

    githubConnected: typeof user.oauth?.github?.id === "number",
    googleConnected:
      typeof user.oidc?.google?.sub === "string" &&
      user.oidc.google.sub.length > 0,
    passkeysCount: Array.isArray(user.passkeys) ? user.passkeys.length : 0,
  });
});

export default router;
