function bufferToBase64url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, "+").replace(/_/g, "/");

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert server registration options to browser format
 */
export function prepareRegistrationOptions(options: any) {
  return {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
    user: {
      ...options.user,
      id: base64urlToBuffer(options.user.id),
    },
    excludeCredentials: options.excludeCredentials?.map((cred: any) => ({
      ...cred,
      id: base64urlToBuffer(cred.id),
    })),
  };
}

/**
 * Convert browser registration response to server JSON
 */
export function registrationResponseToJSON(cred: PublicKeyCredential) {
  const response = cred.response as AuthenticatorAttestationResponse;

  return {
    id: cred.id,
    rawId: bufferToBase64url(cred.rawId),
    type: cred.type,
    response: {
      attestationObject: bufferToBase64url(response.attestationObject),
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
    },
  };
}

/**
 * Convert server authentication options to browser format
 */
export function prepareAuthenticationOptions(options: any) {
  return {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
    allowCredentials: options.allowCredentials?.map((cred: any) => ({
      ...cred,
      id: base64urlToBuffer(cred.id),
    })),
  };
}

/**
 * Convert browser authentication response to server JSON
 */
export function authenticationResponseToJSON(cred: PublicKeyCredential) {
  const response = cred.response as AuthenticatorAssertionResponse;

  return {
    id: cred.id,
    rawId: bufferToBase64url(cred.rawId),
    type: cred.type,
    response: {
      authenticatorData: bufferToBase64url(response.authenticatorData),
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      signature: bufferToBase64url(response.signature),
      userHandle: response.userHandle
        ? bufferToBase64url(response.userHandle)
        : null,
    },
  };
}
