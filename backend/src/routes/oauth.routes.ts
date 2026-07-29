/*
  ============================================================
  Datei: oauth.routes.ts

  Rolle im Projekt:
  Diese Datei implementiert OAuth Login mit GitHub.
  Benutzer koennen sich mit ihrem GitHub Account anmelden
  oder ihren bestehenden Account mit GitHub verknuepfen.

  Enthaltene Endpunkte:
  - GET  /api/auth/oauth/github/start
  - GET  /api/auth/oauth/github/callback
  - POST /api/auth/oauth/github/disconnect

  Sicherheitskonzept:
  - OAuth Authorization Code Flow
  - Schutz gegen CSRF durch state Parameter
  - Serverseitige Sessions fuer Authentifizierung
  ============================================================
*/

import { Router } from "express";
import { UserModel } from "../data/users.store";
import crypto from "crypto";

const router = Router();

/*
  OAuth Client Konfiguration.

  Diese Werte stammen aus:
  GitHub Developer Settings

  Sie identifizieren:
  - deine Applikation (client_id)
  - deinen Server (client_secret)
*/
const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URL!;

/*
  Normalisierung der Email-Adresse.
  Wichtig fuer Account Linking und Konsistenz.
*/
function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/*
  ============================================================
  STEP 1: Redirect zu GitHub
  GET /api/auth/oauth/github/start

  Zweck:
  - Startet den OAuth Login Flow
  - Leitet den Benutzer zu GitHub weiter
  ============================================================
*/
router.get("/github/start", (req, res) => {
  /*
    state Parameter zum Schutz gegen CSRF Angriffe.

    Der Wert:
    - wird zufaellig generiert
    - in der Session gespeichert
    - spaeter im Callback verifiziert
  */
  const state = crypto.randomUUID();

  req.session.oauthState = state;

  /*
    Aufbau der GitHub Authorization URL.
  */
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "read:user user:email",
    state,
  });

  // Browser wird zu GitHub umgeleitet
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

/*
  ============================================================
  STEP 2: Callback von GitHub
  GET /api/auth/oauth/github/callback

  Zweck:
  - Verarbeitet die Antwort von GitHub
  - Tauscht Code gegen Access Token
  - Erstellt oder verknuepft einen User
  - Baut eine Session auf
  ============================================================
*/
router.get("/github/callback", async (req, res) => {
  const { code, state } = req.query;

  /*
    Verifikation des state Parameters.

    Sicherheitsaspekt:
    - Schutz gegen CSRF
    - Stellt sicher, dass der Callback zu dieser Session gehoert
  */
  if (typeof state !== "string" || state !== req.session.oauthState) {
    return res.status(400).send("Invalid OAuth state");
  }

  // state wird nach Verwendung entfernt
  delete req.session.oauthState;

  if (typeof code !== "string") {
    return res.status(400).send("Missing code");
  }

  /*
    Austausch des Authorization Codes gegen ein Access Token.
    Dieser Schritt erfolgt serverseitig.
  */
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

  /*
    Abruf des GitHub Benutzerprofils.
  */
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

  /*
    GitHub liefert oft keine Email direkt.
    In diesem Fall wird eine separate API aufgerufen.
  */
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

    // Es wird nur eine primaere und verifizierte Email akzeptiert
    email = emails.find((e) => e.primary && e.verified)?.email ?? null;
  }

  if (!email) {
    return res.status(400).send("No verified email found");
  }

  const normalizedEmail = normalizeEmail(email);

  /*
    ============================================================
    USER ZUORDNUNG
    ============================================================
  */

  // 1) Suche nach bereits verknuepfter GitHub ID
  let user = await UserModel.findOne({ "oauth.github.id": ghUser.id });

  // 2) Falls nicht gefunden: Verknuepfung ueber Email
  if (!user) {
    user = await UserModel.findOne({ email: normalizedEmail });

    if (user) {
      /*
        Sicherheitscheck:
        Verhindert, dass ein Account mit zwei GitHub IDs verknuepft wird.
      */
      if (user.oauth?.github?.id && user.oauth.github.id !== ghUser.id) {
        return res
          .status(409)
          .send("This account is already linked to a different GitHub user");
      }

      user.oauth ??= {};
      user.oauth.github = {
        id: ghUser.id,
        login: ghUser.login,
      };
      await user.save();
    }
  }

  // 3) Falls kein User existiert: neuen User erstellen
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

  /*
    Aufbau der Session.
    Gleiches Verfahren wie bei allen anderen Login-Methoden.
  */
  req.session.userId = user._id.toString();

  /*
    Redirect zurueck zum Frontend.
    Unterschiedliche Ziele fuer Web und Mobile.
  */
  const platform = req.query.platform;

  if (platform === "mobile") {
    return res.redirect("fitnessapp://auth/callback");
  }

  res.redirect("http://localhost:5173/workouts");
});

/*
  ============================================================
  DISCONNECT GITHUB
  POST /api/auth/oauth/github/disconnect

  Zweck:
  Entfernt die GitHub Verknuepfung vom User Account.
  ============================================================
*/
router.post("/github/disconnect", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.sendStatus(401);

  const user = await UserModel.findById(userId);
  if (!user) return res.sendStatus(404);

  if (!user.oauth?.github) {
    return res.status(400).json({ message: "GitHub not connected" });
  }

  // Entfernt die GitHub Verknuepfung
  user.oauth.github = undefined;

  await user.save();

  res.json({ ok: true });
});

export default router;
