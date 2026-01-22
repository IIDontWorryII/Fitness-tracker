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

type StoredPasskey = {
  credentialId: string; // base64url
  publicKey: string; // base64url
  counter: number;
  createdAt: Date;
  lastUsedAt?: Date;
};

const router = Router();

const RP_ID = process.env.RP_ID!;
const ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

function toBase64url(input: Uint8Array): string {
  return Buffer.from(input).toString("base64url");
}

/* ===================== REGISTER PASSKEY ===================== */

router.post("/register/start", requireAuth, async (req, res) => {
  const user = await UserModel.findById((req.session as any).userId);
  if (!user) return res.sendStatus(401);

  const passkeys = (user.passkeys as StoredPasskey[] | undefined) ?? [];

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
    excludeCredentials: passkeys.map((pk) => ({
      id: pk.credentialId, // base64url string, as expected by simplewebauthn
    })),
  });

  (req.session as any).passkeyRegistration = {
    challenge: options.challenge,
  };

  res.json(options);
});

router.post("/register/finish", requireAuth, async (req, res) => {
  const expectedChallenge = (req.session as any).passkeyRegistration?.challenge;

  if (!expectedChallenge) {
    return res.status(400).json({ message: "Missing challenge" });
  }

  const body = req.body as RegistrationResponseJSON;

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

/* ===================== LOGIN WITH PASSKEY ===================== */

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

router.post("/login/finish", async (req, res) => {
  const expectedChallenge = (req.session as any).passkeyLogin?.challenge;
  if (!expectedChallenge) {
    return res.status(400).json({ message: "Missing challenge" });
  }

  const body = req.body as AuthenticationResponseJSON;
  const credentialId = body.rawId; // store base64url as-is

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

  passkey.counter = verification.authenticationInfo.newCounter;
  passkey.lastUsedAt = new Date();
  await user.save();

  (req.session as any).userId = user._id.toString();
  delete (req.session as any).passkeyLogin;

  res.json({ ok: true });
});

export default router;
