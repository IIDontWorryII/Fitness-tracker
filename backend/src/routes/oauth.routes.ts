import { Router } from "express";
import { UserModel } from "../data/users.store";
import crypto from "crypto";

const router = Router();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URL!;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * STEP 1: Redirect user to GitHub
 * GET /api/auth/oauth/github/start
 */
router.get("/github/start", (req, res) => {
  const state = crypto.randomUUID();

  (req.session as any).oauthState = state;

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "read:user user:email",
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

/**
 * STEP 2: GitHub redirects back here
 * GET /api/auth/oauth/github/callback
 */
router.get("/github/callback", async (req, res) => {
  const { code, state } = req.query;

  if (typeof state !== "string" || state !== (req.session as any).oauthState) {
    return res.status(400).send("Invalid OAuth state");
  }

  delete (req.session as any).oauthState;

  if (typeof code !== "string") {
    return res.status(400).send("Missing code");
  }

  // Exchange code → access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const tokenData = (await tokenRes.json()) as { access_token?: string };

  if (!tokenData.access_token) {
    return res.status(401).send("Failed to obtain access token");
  }

  const accessToken = tokenData.access_token;

  // Fetch GitHub user profile
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const ghUser = (await userRes.json()) as {
    id: number;
    login: string;
    email: string | null;
    name: string | null;
  };

  // Fetch emails if GitHub hides email
  let email = ghUser.email;

  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const emails = (await emailsRes.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;

    email = emails.find((e) => e.primary && e.verified)?.email ?? null;
  }

  if (!email) {
    return res.status(400).send("No verified email found");
  }

  const normalizedEmail = normalizeEmail(email);

  // 1) Find by GitHub ID (already linked)
  let user = await UserModel.findOne({ "oauth.github.id": ghUser.id });

  // 2) Link by email (IMPORTANT: normalized)
  if (!user) {
    user = await UserModel.findOne({ email: normalizedEmail });

    if (user.oauth?.github?.id && user.oauth.github.id !== ghUser.id) {
      return res
        .status(409)
        .send("This account is already linked to a different GitHub user");
    }

    if (user) {
      user.oauth ??= {};
      user.oauth.github = {
        id: ghUser.id,
        login: ghUser.login,
      };
      await user.save();
    }
  }

  // 3) Create new user (store normalized email)
  if (!user) {
    user = await UserModel.create({
      email: normalizedEmail,
      name: ghUser.name || ghUser.login,
      oauth: {
        github: {
          id: ghUser.id,
          login: ghUser.login,
        },
      },
    });
  }

  // Create session
  (req.session as any).userId = user._id.toString();

  // Redirect back to frontend
  const platform = req.query.platform;

  if (platform === "mobile") {
    return res.redirect("fitnessapp://auth/callback");
  }

  res.redirect("http://localhost:5173/workouts");
});

/**
 * DISCONNECT GITHUB
 * POST /api/auth/oauth/github/disconnect
 */
router.post("/github/disconnect", async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) return res.sendStatus(401);

  const user = await UserModel.findById(userId);
  if (!user) return res.sendStatus(404);

  if (!user.oauth?.github) {
    return res.status(400).json({ message: "GitHub not connected" });
  }

  // Remove GitHub link
  user.oauth.github = undefined;

  await user.save();

  res.json({ ok: true });
});

export default router;
