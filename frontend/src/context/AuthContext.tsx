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

/* =========================
   User model
========================= */
type AuthUser = {
  id: string;
  email: string;
  name: string;

  googleConnected: boolean;
  githubConnected: boolean;
  passkeysCount: number;
};

/* =========================
   Context contract
========================= */
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

  /* Load user on app start */
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

/* =========================
   Hook
========================= */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
