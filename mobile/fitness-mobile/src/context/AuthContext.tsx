/*
  ============================================================
  Datei: AuthContext.tsx (Mobile App)

  Rolle im Projekt:
  Diese Datei implementiert den globalen Authentifizierungs-
  Zustand fuer die React Native Mobile App.

  Zweck:
  - Speichert den aktuell eingeloggten Benutzer
  - Laedt den Benutzer beim App-Start aus dem Backend
  - Stellt Login, Signup und Logout Funktionen bereit
  - Kapselt Authentifizierungslogik zentral

  Kontext:
  - Wird in der App Root-Komponente eingebunden
  - Alle Screens koennen ueber useAuth() auf Auth-Daten zugreifen

  Abhaengigkeiten:
  - Backend REST API (/api/auth/*)
  - Session-basierte Authentifizierung
  - fetchMe, loginUser, signupUser, logoutUser

  Architekturentscheidung:
  - React Context statt Props-Weitergabe
  - Einheitliche Logik fuer Web und Mobile
  ============================================================
*/

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, signupUser, loginUser, logoutUser } from "../api/authClient";

/*
  ============================================================
  User-Datenmodell (Mobile)
  ============================================================

  Spiegelt die Daten wider, die vom Backend geliefert werden.
  Kein Passwort oder sensible Daten im Frontend.
*/
type AuthUser = {
  id: string;
  email: string;
  name: string;

  githubConnected: boolean;
  googleConnected: boolean;
  passkeysCount: number;
};

/*
  ============================================================
  Context Vertrag (Interface)
  ============================================================

  Definiert exakt:
  - welche Daten
  - welche Funktionen
  der Context bereitstellt
*/
type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

/*
  ============================================================
  Erstellung des Contexts
  ============================================================

  Initialwert ist undefined, damit Fehlbenutzung erkannt wird.
*/
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/*
  ============================================================
  AuthProvider Komponente
  ============================================================

  Umschliesst die gesamte App
  und stellt Auth-Daten global bereit.
*/
export function AuthProvider({ children }: { children: React.ReactNode }) {
  /*
    user:
    - null: nicht eingeloggt
    - Objekt: eingeloggt
  */
  const [user, setUser] = useState<AuthUser | null>(null);
  /*
    isLoading:
    - true waehrend API Calls
    - wichtig fuer Ladeanzeigen und Guards
  */
  const [isLoading, setIsLoading] = useState(true);

  /*
    ============================================================
    Effekt: Benutzer beim App-Start laden
    ============================================================

    Wird genau einmal ausgefuehrt.
    Prüft, ob eine gueltige Session existiert.
  */
  useEffect(() => {
    fetchMe()
      .then((user) => {
        console.log("ME:", user);
        setUser(user);
      })
      .catch((err) => {
        console.log("NOT AUTHENTICATED");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  /*
    ============================================================
    Benutzer neu laden
    ============================================================

    Wird z.B. nach OAuth oder Passkey Login verwendet.
  */
  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /*
    ============================================================
    LOGIN (Email + Passwort)
    ============================================================

    Ablauf:
    1. Login Request
    2. Session wird serverseitig erstellt
    3. /me wird erneut geladen
  */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await loginUser({ email, password });
      const me = await fetchMe();
      setUser(me);
    } finally {
      setIsLoading(false);
    }
  };

  /*
    ============================================================
    SIGNUP
    ============================================================

    Nach Registrierung wird automatisch eingeloggt.
  */
  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      await signupUser({ email, password, name });
      const me = await fetchMe();
      setUser(me);
    } finally {
      setIsLoading(false);
    }
  };

  /*
    ============================================================
    LOGOUT
    ============================================================

    Session wird serverseitig geloescht.
    Lokaler Benutzerzustand wird entfernt.
  */
  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /*
    ============================================================
    Context Provider
    ============================================================

    Stellt Auth-Zustand allen Kind-Komponenten bereit.
  */
  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/*
  ============================================================
  Custom Hook: useAuth
  ============================================================

  Vereinfachter Zugriff auf den AuthContext.
  Erzwingt korrekte Verwendung innerhalb des Providers.
*/
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
