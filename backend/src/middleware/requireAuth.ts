/*
  ============================================================
  Datei: requireAuth Middleware

  Rolle im Projekt:
  Diese Middleware schuetzt API-Endpunkte vor unautorisiertem Zugriff.
  Sie stellt sicher, dass nur authentifizierte Benutzer auf
  geschuetzte Routen zugreifen koennen.

  Kontext:
  Wird vor sensiblen Routen verwendet, z.B.:
  - Workouts
  - WorkoutHistory
  - Benutzerbezogene Daten

  Abhaengigkeiten:
  - express-session (stellt req.session bereit)
  - Session enthaelt die userId nach erfolgreichem Login

  Sicherheitskonzept:
  Authentifizierung basiert auf serverseitigen Sessions
  und httpOnly Cookies.
  ============================================================
*/

import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  /*
    Zugriff auf die Session, die von express-session bereitgestellt wird.

    Die userId wird:
    - beim Login gesetzt
    - im Session Store gespeichert
    - bei jedem Request automatisch geladen
  */
  if (!req.session.userId) {
    /*
      HTTP 401 Unauthorized

      Bedeutung:
      - Anfrage ist technisch korrekt
      - aber der Benutzer ist nicht authentifiziert

      Wichtig:
      Keine Weitergabe von sensiblen Informationen.
    */
    return res.status(401).json({ message: "Not authenticated" });
  }

  /*
    Benutzer ist authentifiziert.

    Die Anfrage darf:
    - an die naechste Middleware
    - oder an die eigentliche Route weitergegeben werden
  */
  next();
}
