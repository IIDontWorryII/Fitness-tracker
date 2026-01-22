import { apiFetch } from "./client";
import {
  prepareRegistrationOptions,
  registrationResponseToJSON,
  prepareAuthenticationOptions,
  authenticationResponseToJSON,
} from "../utils/webauthn";

/**
 * Register a new passkey for the currently authenticated user
 */
export async function registerPasskey(): Promise<void> {
  // 1. Start registration
  const options = await apiFetch<any>("/api/auth/passkeys/register/start", {
    method: "POST",
  });

  // 2. Create credential in the browser
  const publicKey = prepareRegistrationOptions(options);
  const credential = (await navigator.credentials.create({
    publicKey,
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("Passkey creation was cancelled");
  }

  // 3. Finish registration
  await apiFetch("/api/auth/passkeys/register/finish", {
    method: "POST",
    body: JSON.stringify(registrationResponseToJSON(credential)),
  });
}

/**
 * Login using an existing passkey
 */
export async function loginWithPasskey(): Promise<void> {
  // 1. Start login
  const options = await apiFetch<any>("/api/auth/passkeys/login/start", {
    method: "POST",
  });

  // 2. Get assertion from authenticator
  const publicKey = prepareAuthenticationOptions(options);
  const credential = (await navigator.credentials.get({
    publicKey,
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("Passkey login cancelled");
  }

  // 3. Finish login
  await apiFetch("/api/auth/passkeys/login/finish", {
    method: "POST",
    body: JSON.stringify(authenticationResponseToJSON(credential)),
  });
}
