import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";
import { getRefreshToken, getSessionUser, setSession, clearSession } from "@/lib/session";
import type { RefreshTokenResponse } from "@/types/admin";

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.json({ detail: "No refresh token" }, { status: 401 });
  }

  const backendResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  if (!backendResponse.ok) {
    await clearSession();
    return NextResponse.json({ detail: "Refresh failed" }, { status: 401 });
  }

  const data = (await backendResponse.json()) as RefreshTokenResponse;
  const user = await getSessionUser();

  if (!user) {
    await clearSession();
    return NextResponse.json({ detail: "No active session" }, { status: 401 });
  }

  await setSession({
    user,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });

  return NextResponse.json({ ok: true });
}
