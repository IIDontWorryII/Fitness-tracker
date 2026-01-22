import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AuthPages.css"; // shared styling for login/signup

export default function SignupPage() {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await signup({ email, password, name });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Signup failed.");
    }
  };

  if (isLoading) {
    return (
      <div className="auth-page">
        <p>Loading…</p>
      </div>
    );
  }

  if (success) {
    // after sign-up go straight to workouts
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name
            <input
              type="text"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              minLength={6}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              value={confirm}
              required
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn">
            Sign Up
          </button>

          <button
            type="button"
            className="auth-link"
            onClick={() => navigate("/login")}
          >
            Already have an account? Log in
          </button>
        </form>
      </div>
    </div>
  );
}
