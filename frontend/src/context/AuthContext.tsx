/*
  ============================================================
  Datei: AuthContext.tsx

  Rolle im Projekt:
  Diese Datei implementiert den globalen Authentifizierungs-
  Zustand der Web App.

  Verantwortung:
  - Kennt den aktuellen Benutzer
  - Weiss, ob der Benutzer eingeloggt ist
  - Stellt Login, Signup und Logout Funktionen bereit

  Architektur:
  - React Context fuer globalen State
  - Kein Auth-Status in einzelnen Komponenten
  ============================================================
*/

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  fetchMe,
  loginUser,
  registerUser,
  logoutUser,
} from "../api/authClient";

/*
  Typ des authentifizierten Benutzers.
  Entspricht exakt der /auth/me API Response.
*/
type AuthUser = {
  id: string;
  email: string;
  name: string;

  googleConnected: boolean;
  githubConnected: boolean;
  passkeysCount: number;
};

/*
  Vertrag des Auth Contexts.
  Definiert, was Konsumenten nutzen duerfen.
*/
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =========================
   Provider
========================= */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /*
    Initialer Auth-Check beim App-Start.

    Zweck:
    - Pruefen, ob eine Session existiert
    - Benutzer nach Page Reload wiederherstellen
  */

  useEffect(() => {
    async function loadUser() {
      try {
        const me = await fetchMe();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const isAuthenticated = Boolean(user);

  /* =========================
     SIGNUP
  ========================= */
  const signup = async ({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  }) => {
    setIsLoading(true);

    try {
      await registerUser({ email, password, name });

      const me = await fetchMe();
      setUser(me);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     LOGIN
  ========================= */
  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setIsLoading(true);

    try {
      await loginUser({ email, password });
      const me = await fetchMe();
      setUser(me);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     LOGOUT
  ========================= */
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
    Aktualisiert den Benutzer explizit.
    Wird z.B. nach OAuth oder Passkey Login verwendet.
  */
  const refreshUser = async () => {
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/*
  Custom Hook fuer den AuthContext.
*/
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
