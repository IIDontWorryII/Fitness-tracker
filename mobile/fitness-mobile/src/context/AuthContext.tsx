import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, signupUser, loginUser, logoutUser } from "../api/authClient";

type AuthUser = {
  id: string;
  email: string;
  name: string;

  githubConnected: boolean;
  googleConnected: boolean;
  passkeysCount: number;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
