import { api } from "./client";

export type AuthUser = {
  id: string;
  email: string;
  name: string;

  githubConnected: boolean;
  googleConnected: boolean;
  passkeysCount: number;
};

export async function fetchMe(): Promise<AuthUser> {
  const res = await api.get("/api/auth/me");
  return res.data;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  const res = await api.post("/api/auth/login", data);
  return res.data;
}

export async function signupUser(data: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthUser> {
  const res = await api.post("/api/auth/register", data);
  return res.data;
}

export async function logoutUser(): Promise<void> {
  await api.post("/api/auth/logout");
}
