import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  let auth;
  try {
    auth = useAuth();
  } catch {
    return null; // prevent hard crash
  }

  const { user, isLoading } = auth;

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
