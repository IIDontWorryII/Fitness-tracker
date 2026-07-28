/*
  ============================================================
  Datei: auth.routes.ts

  Rolle im Projekt:
  Diese Datei implementiert die klassische Authentifizierung
  ueber Email und Passwort.

  Enthaltene Endpunkte:
  - POST /auth/register  (Registrierung)
  - POST /auth/login     (Login)
  - POST /auth/logout    (Logout)
  - GET  /auth/me        (Session-Pruefung)

  Sicherheitskonzept:
  - Passwort wird niemals im Klartext gespeichert
  - Authentifizierung basiert auf serverseitigen Sessions
  - Client erhaelt nur eine Session-ID im Cookie
  ============================================================
*/

import { Router } from "express";
import { UserModel } from "../data/users.store";
import { hashPassword, verifyPassword } from "../utils/password";

const router = Router();

/*
  ============================================================
  POST /auth/register

  Zweck:
  Erstellt einen neuen Benutzer mit Email und Passwort.

  Sicherheitsaspekte:
  - Passwort wird gehasht
  - Email wird normalisiert
  - Keine sensiblen Daten im Response
  ============================================================
*/
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Einfache Validierung der Eingaben
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    /*
      Normalisierung der Email-Adresse.

      Zweck:
      - Vermeidet doppelte Accounts durch Gross-/Kleinschreibung
      - Erlaubt spaeteres Account Linking (OIDC, OAuth)
    */
    const normalizedEmail = email.trim().toLowerCase();

    // Pruefen, ob der Benutzer bereits existiert
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    /*
      Passwort wird gehasht.

      Wichtig:
      - Klartext-Passwort wird nie gespeichert
      - Hashing erfolgt mit sicherem Algorithmus (z.B. bcrypt)
    */
    const passwordHash = await hashPassword(password);

    // Neuen Benutzer anlegen
    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      passwordHash,
    });

    /*
      Login nach erfolgreicher Registrierung.

      Die userId wird serverseitig in der Session gespeichert.
    */
    (req.session as any).userId = user._id.toString();

    // Rueckgabe minimaler, sicherer User-Daten
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

/*
  ============================================================
  POST /auth/login

  Zweck:
  Authentifiziert einen bestehenden Benutzer.

  Sicherheitskonzept:
  - Email wird normalisiert
  - Passwort wird gegen Hash verifiziert
  - Session wird serverseitig gesetzt
  ============================================================
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    // Normalisierung fuer konsistente Suche
    const normalizedEmail = email.trim().toLowerCase();

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      // Keine Information, ob Email oder Passwort falsch war
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /*
      Passwort-Verifikation.

      Das Klartext-Passwort wird:
      - gehasht
      - mit dem gespeicherten Hash verglichen
    */
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Session setzen
    (req.session as any).userId = user._id.toString();

    // Erfolgreicher Login
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

/*
  ============================================================
  POST /auth/logout

  Zweck:
  Beendet die aktuelle Session.

  Sicherheitsaspekt:
  - Session wird serverseitig zerstoert
  - Cookie wird im Browser geloescht
  ============================================================
*/
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }

    // Cookie explizit entfernen
    res.clearCookie("fitnessapp.sid");
    res.json({ ok: true });
  });
});

/*
  ============================================================
  GET /auth/me

  Zweck:
  Prueft, ob der Benutzer eingeloggt ist
  und liefert die aktuellen User-Daten.

  Wird vom Frontend genutzt:
  - beim App-Start
  - beim Page-Reload
  ============================================================
*/
router.get("/me", async (req, res) => {
  // Keine Session vorhanden
  if (!(req.session as any).userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // User zur Session laden
  const user = await UserModel.findById((req.session as any).userId);

  // Ungueltige oder alte Session
  if (!user) {
    return res.status(401).json({ message: "Invalid session" });
  }

  // Rueckgabe sicherer User-Daten
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
