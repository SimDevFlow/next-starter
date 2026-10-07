import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin-session";

// The backend exposes no admin logout endpoint — this just drops the
// session cookies client-side.
export async function POST() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
