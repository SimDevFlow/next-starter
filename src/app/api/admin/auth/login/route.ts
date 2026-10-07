import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-fetch";
import { setSessionTokens, setSessionIdentity } from "@/lib/admin-session";
import type { AdminAuthResponse } from "@/types/admin";

export async function POST(request: Request) {
  const body = await request.text();

  const backendRes = await backendFetch("/api/admin/auth/login", {
    method: "POST",
    body,
  });

  const data: AdminAuthResponse | null = await backendRes.json().catch(() => null);

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const auth = data as AdminAuthResponse;
  await setSessionTokens(auth);
  await setSessionIdentity(auth.admin, auth.refresh_token.expired_at);

  return NextResponse.json({ admin: auth.admin }, { status: backendRes.status });
}
