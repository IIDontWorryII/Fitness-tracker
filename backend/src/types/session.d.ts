import "express-session";

/*
  Augments express-session's SessionData with the fields this app stores on the
  session, so route handlers can use `req.session.userId` etc. without casting
  through `any`. userId is present on every authenticated request (guarded by
  requireAuth); the remaining fields are short-lived flow state.
*/
declare module "express-session" {
  interface SessionData {
    userId?: string;
    oauthState?: string;
    oidc?: { codeVerifier: string };
    passkeyRegistration?: { challenge: string };
    passkeyLogin?: { challenge: string };
  }
}
