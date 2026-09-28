import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";
import { setSession } from "@/lib/session";
import type { AuthUserResponse } from "@/types/admin";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const backendResponse = await fetch(`${API_BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await backendResponse.json();

  if (!backendResponse.ok) {
    return NextResponse.json(data, { status: backendResponse.status });
  }

  const auth = data as AuthUserResponse;

  if (auth.user.role !== "admin") {
    return NextResponse.json(
      { detail: "This account does not have admin access." },
      { status: 403 }
    );
  }

  await setSession({
    user: auth.user,
    accessToken: auth.access_token,
    refreshToken: auth.refresh_token,
  });

  return NextResponse.json({ user: auth.user });
}
