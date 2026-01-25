// src/api/authClient.ts
import { apiFetch, API_BASE } from "./client";

export type AuthUser = {
  id: string;
  email: string;
  name: string;

  githubConnected: boolean;
  googleConnected: boolean;
  passkeysCount: number;
};

export async function fetchMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me");
}

export async function updateMyName(name: string) {
  return apiFetch("/api/user/me", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function deleteMyAccount() {
  await apiFetch("/api/user/me", { method: "DELETE" });
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logoutUser(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
}

export function startGoogleLogin() {
  window.location.href = `${API_BASE}/api/auth/oidc/google/start`;
}

export function startGithubLogin() {
  window.location.href = `${API_BASE}/api/auth/oauth/github/start`;
}

export async function disconnectGitHub(): Promise<void> {
  await apiFetch("/api/auth/oauth/github/disconnect", {
    method: "POST",
  });
}
