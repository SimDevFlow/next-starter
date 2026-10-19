import { cookies } from "next/headers";
import type { Token, User } from "@/types/admin";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";
const USER_COOKIE = "admin_user";

// Secure cookies are dropped by browsers over plain HTTP (except on localhost),
// so allow disabling them for local containers served without TLS.
const secureCookies = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === "true"
  : process.env.NODE_ENV === "production";

export type SessionUser = Pick<User, "email" | "full_name" | "role">;

function maxAgeFromExpiry(expiredAt: string): number {
  const expiryMs = new Date(expiredAt).getTime();
  return Math.max(0, Math.floor((expiryMs - Date.now()) / 1000));
}

export async function setSession(params: {
  user: SessionUser;
  accessToken: Token;
  refreshToken: Token;
}) {
  const store = await cookies();
  const base = {
    httpOnly: true,
    secure: secureCookies,
    sameSite: "lax" as const,
    path: "/",
  };

  store.set(ACCESS_COOKIE, params.accessToken.token, {
    ...base,
    maxAge: maxAgeFromExpiry(params.accessToken.expired_at),
  });
  store.set(REFRESH_COOKIE, params.refreshToken.token, {
    ...base,
    maxAge: maxAgeFromExpiry(params.refreshToken.expired_at),
  });
  store.set(
    USER_COOKIE,
    JSON.stringify({
      email: params.user.email,
      full_name: params.user.full_name,
      role: params.user.role,
    }),
    {
      ...base,
      maxAge: maxAgeFromExpiry(params.refreshToken.expired_at),
    }
  );
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(USER_COOKIE);
}
