/*
  ============================================================
  Datei: passkeys.routes.ts

  Rolle im Projekt:
  Diese Datei implementiert Passkey / WebAuthn Authentifizierung.
  Benutzer koennen sich:
  - ohne Passwort
  - mit biometrischen Merkmalen oder Geraeten
  authentifizieren.

  Enthaltene Funktionen:
  - Registrierung eines Passkeys (angemeldeter User)
  - Login mit Passkey (ohne Passwort)

  Sicherheitskonzept:
  - Kryptographische Challenge-Response
  - Private Keys verlassen niemals das Geraet
  - Schutz gegen Replay-Angriffe ueber Counter
  - Am Ende wird eine normale serverseitige Session gesetzt
  ============================================================
*/

import { Router } from "express";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { UserModel } from "../data/users.store";
import { requireAuth } from "../middleware/requireAuth";

/*
  Typ fuer gespeicherte Passkeys im User Model.

  Zweck:
  - Strukturiert gespeicherte WebAuthn Daten
  - Wird in MongoDB abgelegt
*/
type StoredPasskey = {
  credentialId: string; // eindeutige ID des Passkeys (base64url)
  publicKey: string; // oeffentlicher Schluessel (base64url)
  counter: number; // Schutz gegen Replay-Angriffe
  createdAt: Date;
  lastUsedAt?: Date;
};

const router = Router();

/*
  RP_ID (Relying Party ID)

  Entspricht:
  - der Domain deiner Anwendung
  - muss mit Origin uebereinstimmen
*/
const RP_ID = process.env.RP_ID!;

/*
  Erlaubte Origins fuer WebAuthn.

  Wichtig:
  - WebAuthn ist streng an Origins gebunden
  - Schutz gegen Phishing
*/
const ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

/*
  Hilfsfunktion zur Umwandlung von Uint8Array
  in base64url Strings fuer Speicherung.
*/
function toBase64url(input: Uint8Array): string {
  return Buffer.from(input).toString("base64url");
}

/* ============================================================
   PASSKEY REGISTRIERUNG (User ist eingeloggt)
   ============================================================ */

/*
  START Registrierung eines Passkeys
  POST /api/auth/passkeys/register/start

  Voraussetzung:
  - Benutzer ist bereits authentifiziert
*/
router.post("/register/start", requireAuth, async (req, res) => {
  const user = await UserModel.findById((req.session as any).userId);
  if (!user) return res.sendStatus(401);

  const passkeys = (user.passkeys as StoredPasskey[] | undefined) ?? [];

  /*
    Erzeugt eine Challenge und Registrierungsoptionen
    fuer den Browser und Authenticator.
  */
  const options = await generateRegistrationOptions({
    rpID: RP_ID,
    rpName: "Fitness Tracker App",
    userID: Buffer.from(user._id.toString(), "utf-8"),
    userName: user.email,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },

    /*
      Verhindert, dass derselbe Passkey mehrfach registriert wird.
    */
    excludeCredentials: passkeys.map((pk) => ({
      id: pk.credentialId,
    })),
  });

  /*
    Speicherung der Challenge in der Session.
    Wird spaeter zur Verifikation benoetigt.
  */
  (req.session as any).passkeyRegistration = {
    challenge: options.challenge,
  };

  res.json(options);
});

/*
  FINISH Registrierung eines Passkeys
  POST /api/auth/passkeys/register/finish
*/
router.post("/register/finish", requireAuth, async (req, res) => {
  const expectedChallenge = (req.session as any).passkeyRegistration?.challenge;

  if (!expectedChallenge) {
    return res.status(400).json({ message: "Missing challenge" });
  }

  const body = req.body as RegistrationResponseJSON;

  /*
    Kryptographische Verifikation der Antwort.
  */
  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: ALLOWED_ORIGINS,
    expectedRPID: RP_ID,
  });

  if (!verification.verified || !verification.registrationInfo) {
    return res.status(400).json({ message: "Passkey verification failed" });
  }

  const { credential } = verification.registrationInfo;

  const user = await UserModel.findById((req.session as any).userId);
  if (!user) return res.sendStatus(401);

  user.passkeys ??= [];
  (user.passkeys as StoredPasskey[]).push({
    credentialId: credential.id,
    publicKey: toBase64url(credential.publicKey),
    counter: credential.counter,
    createdAt: new Date(),
  });

  await user.save();
  delete (req.session as any).passkeyRegistration;

  res.json({ ok: true });
});

/* ============================================================
   LOGIN MIT PASSKEY (kein Passwort)
   ============================================================ */

/*
  START Login mit Passkey
  POST /api/auth/passkeys/login/start
*/
router.post("/login/start", async (req, res) => {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: "preferred",
  });

  (req.session as any).passkeyLogin = {
    challenge: options.challenge,
  };

  res.json(options);
});

/*
  FINISH Login mit Passkey
  POST /api/auth/passkeys/login/finish
*/
router.post("/login/finish", async (req, res) => {
  const expectedChallenge = (req.session as any).passkeyLogin?.challenge;
  if (!expectedChallenge) {
    return res.status(400).json({ message: "Missing challenge" });
  }

  const body = req.body as AuthenticationResponseJSON;
  const credentialId = body.rawId;

  /*
    Suche des Users ueber die Credential ID.
    Kein Username oder Passwort noetig.
  */
  const user = await UserModel.findOne({
    "passkeys.credentialId": credentialId,
  });

  if (!user || !user.passkeys) {
    return res.status(401).json({ message: "Unknown passkey" });
  }

  const passkey = (user.passkeys as StoredPasskey[]).find(
    (pk) => pk.credentialId === credentialId
  );

  if (!passkey) {
    return res.status(401).json({ message: "Unknown passkey" });
  }

  /*
    Kryptographische Verifikation der Login-Antwort.
  */
  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: ALLOWED_ORIGINS,
    expectedRPID: RP_ID,
    credential: {
      id: passkey.credentialId,
      publicKey: Buffer.from(passkey.publicKey, "base64url"),
      counter: passkey.counter,
    },
  });

  if (!verification.verified || !verification.authenticationInfo) {
    return res.status(401).json({ message: "Passkey verification failed" });
  }

  /*
    Aktualisierung des Counters.
    Schutz gegen Replay-Angriffe.
  */
  passkey.counter = verification.authenticationInfo.newCounter;
  passkey.lastUsedAt = new Date();
  await user.save();

  /*
    Aufbau einer normalen Session.
    Identisch zu Email, OAuth und OIDC Login.
  */
  (req.session as any).userId = user._id.toString();
  delete (req.session as any).passkeyLogin;

  res.json({ ok: true });
});

export default router;
