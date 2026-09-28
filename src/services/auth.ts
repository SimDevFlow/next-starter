import type { SessionUser } from "@/lib/session";

export class AuthError extends Error {}

async function parseErrorDetail(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.detail ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export async function login(email: string, password: string): Promise<SessionUser> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new AuthError(await parseErrorDetail(response));
  }

  const data = await response.json();
  return data.user;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function fetchCurrentUser(): Promise<SessionUser | null> {
  const response = await fetch("/api/auth/me");
  if (!response.ok) return null;
  const data = await response.json();
  return data.user;
}
