export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:4000";

/**
 * Generic helper for calling backend API.
 * Keeps fetch logic in ONE place.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // IMPORTANT for session auth
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }

  return res.json();
}
