import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { startGithubLogin, startGoogleLogin } from "../../api/authClient";
import "./AuthPages.css";
import { loginWithPasskey } from "../../api/passkeysClient";

export default function LoginPage() {
  const { login, isLoading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login({ email, password });

      // Redirect to Workouts
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Login failed.");
    }
  };

  const handlePasskeyLogin = async () => {
    setError(null);
    try {
      await loginWithPasskey();
      await refreshUser();
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Passkey login failed.");
    }
  };

  if (isLoading) {
    return (
      <div className="auth-page">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn">
            Log In
          </button>
          <button
            type="button"
            className="auth-btn"
            onClick={() => startGoogleLogin()}
          >
            Login with Google
          </button>
          <button
            type="button"
            className="auth-btn"
            onClick={() => startGithubLogin()}
          >
            Login with GitHub
          </button>

          <button
            type="button"
            className="auth-btn auth-btn-secondary"
            onClick={handlePasskeyLogin}
          >
            Sign in with passkey
          </button>
        </form>

        <button className="auth-link" onClick={() => navigate("/signup")}>
          Create an account
        </button>
      </div>
    </div>
  );
}
