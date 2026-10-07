import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-fetch";
import {
  getAdminSession,
  setSessionTokens,
  clearAdminSession,
} from "@/lib/admin-session";
import type { RefreshTokenResponse } from "@/types/admin";

export async function POST() {
  const { refreshToken } = await getAdminSession();

  if (!refreshToken) {
    await clearAdminSession();
    return NextResponse.json({ detail: "No active session" }, { status: 401 });
  }

  const backendRes = await backendFetch("/api/admin/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!backendRes.ok) {
    await clearAdminSession();
    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.status });
  }

  const data = (await backendRes.json()) as RefreshTokenResponse;
  await setSessionTokens(data);

  return NextResponse.json({ ok: true });
}
