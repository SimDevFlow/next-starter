import "server-only";
import { cookies } from "next/headers";
import type { AdminRole, Token } from "@/types/admin";

export const ACCESS_TOKEN_COOKIE = "admin_access_token";
export const REFRESH_TOKEN_COOKIE = "admin_refresh_token";
export const ROLE_COOKIE = "admin_role";
export const EMAIL_COOKIE = "admin_email";

const isProduction = process.env.NODE_ENV === "production";

function maxAgeFromExpiry(expiredAt: string) {
  const seconds = Math.floor((new Date(expiredAt).getTime() - Date.now()) / 1000);
  return Math.max(5, seconds);
}

export async function setSessionTokens(tokens: {
  access_token: Token;
  refresh_token: Token;
}) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token.token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeFromExpiry(tokens.access_token.expired_at),
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token.token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeFromExpiry(tokens.refresh_token.expired_at),
  });
}

// Non-sensitive identity fields, readable server-side (e.g. in
// admin/layout.tsx) to render the sidebar/topbar without a "who am I"
// endpoint, which the backend doesn't expose.
export async function setSessionIdentity(
  admin: { role: AdminRole; email: string },
  refreshExpiredAt: string
) {
  const cookieStore = await cookies();
  const maxAge = maxAgeFromExpiry(refreshExpiredAt);
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
  cookieStore.set(ROLE_COOKIE, admin.role, options);
  cookieStore.set(EMAIL_COOKIE, admin.email, options);
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(ROLE_COOKIE);
  cookieStore.delete(EMAIL_COOKIE);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value,
    role: cookieStore.get(ROLE_COOKIE)?.value as AdminRole | undefined,
    email: cookieStore.get(EMAIL_COOKIE)?.value,
  };
}
