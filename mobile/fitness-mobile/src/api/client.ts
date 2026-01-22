// src/api/client.ts
import axios from "axios";

/**
 * IMPORTANT:
 * - Android emulator uses 10.0.2.2 for localhost
 * - Expo Go on real phone must reach your PC via network or tunnel
 * - Tunnel mode ignores this base URL issue
 */

const LAN_IP = "http://192.168.0.26:4000";
export const API_BASE = LAN_IP;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // 🔴 REQUIRED for session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Optional: simple response error normalizer
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      throw err.response.data ?? err;
    }
    throw err;
  }
);
