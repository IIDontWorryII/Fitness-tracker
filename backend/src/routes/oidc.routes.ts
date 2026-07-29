import { Router } from "express";
import { Issuer, generators, Client } from "openid-client";
import { UserModel } from "../data/users.store";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const router = Router();

/**
 * Static Google OIDC issuer configuration.
 * Avoids runtime discovery (more reliable, easier to explain).
 */
const googleIssuer = new Issuer({
  issuer: "https://accounts.google.com",
  authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  token_endpoint: "https://oauth2.googleapis.com/token",
  userinfo_endpoint: "https://openidconnect.googleapis.com/v1/userinfo",
  jwks_uri: "https://www.googleapis.com/oauth2/v3/certs",
});

/**
 * OIDC client (Google)
 */
const client: Client = new googleIssuer.Client({
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  redirect_uris: [process.env.OIDC_REDIRECT_URL!],
  response_types: ["code"],
});

/**
 * GET /api/auth/oidc/google/start
 */
router.get("/google/start", async (req, res) => {
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);

  req.session.oidc = { codeVerifier };

  const redirectUri = process.env.OIDC_REDIRECT_URL;
  if (!redirectUri) {
    throw new Error("OIDC_REDIRECT_URL is not defined");
  }

  const authorizationUrl = client.authorizationUrl({
    scope: "openid email profile",
    redirect_uri: redirectUri, // ✅ REQUIRED
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  res.redirect(authorizationUrl);
});

/**
 * GET /api/auth/oidc/google/callback
 */
router.get("/google/callback", async (req, res) => {
  const params = client.callbackParams(req);

  const codeVerifier = req.session.oidc?.codeVerifier;
  if (!codeVerifier) {
    return res.status(400).send("Missing PKCE verifier");
  }

  const tokenSet = await client.callback(
    process.env.OIDC_REDIRECT_URL!,
    params,
    { code_verifier: codeVerifier }
  );

  const claims = tokenSet.claims();

  // Explicit type checks (security + TS correctness)
  if (typeof claims.email !== "string" || typeof claims.sub !== "string") {
    return res.status(400).send("Invalid OIDC claims");
  }

  const email = normalizeEmail(claims.email);
  const emailVerified = claims.email_verified === true;

  // 1) Find by sub
  let user = await UserModel.findOne({ "oidc.google.sub": claims.sub });

  // 2) Only link by email if verified
  if (!user && emailVerified) {
    user = await UserModel.findOne({ email });
    if (user && !user.oidc?.google) {
      user.oidc ??= {};
      user.oidc.google = { sub: claims.sub, emailVerified: true };
      await user.save();
    }
  }

  // 3) Otherwise create a new user
  if (!user) {
    user = await UserModel.create({
      email,
      name: typeof claims.name === "string" ? claims.name : email,
      oidc: { google: { sub: claims.sub, emailVerified } },
    });
  }
  // Establish session (same as email/password)
  req.session.userId = user._id.toString();

  res.redirect("http://localhost:5173");
});

export default router;
