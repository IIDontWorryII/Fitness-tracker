import type { UserDocument } from "../data/users.store";

/*
  The public, session-safe view of a user returned by the auth endpoints
  (register / login / me). Never includes the password hash or provider tokens.
*/
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  githubConnected: boolean;
  googleConnected: boolean;
  passkeysCount: number;
};

/*
  Serialize a user document into the AuthUser shape. Kept in one place so the
  three auth endpoints stay consistent (register/login previously used looser
  Boolean() checks than /me).
*/
export function toAuthUser(user: UserDocument & { _id: unknown }): AuthUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    githubConnected: typeof user.oauth?.github?.id === "number",
    googleConnected:
      typeof user.oidc?.google?.sub === "string" &&
      user.oidc.google.sub.length > 0,
    passkeysCount: Array.isArray(user.passkeys) ? user.passkeys.length : 0,
  };
}
