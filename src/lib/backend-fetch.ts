import "server-only";
import { API_BASE_URL } from "@/lib/config";

export async function backendFetch(path: string, init?: RequestInit) {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not configured");
  }
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
