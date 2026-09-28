import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";
import { getAccessToken } from "@/lib/session";

async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${API_BASE_URL}/${path.join("/")}${req.nextUrl.search}`;

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  let body: string | undefined;
  if (hasBody) {
    const text = await req.text();
    if (text) {
      body = text;
      headers["Content-Type"] = "application/json";
    }
  }

  const backendResponse = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
    cache: "no-store",
  });

  if (backendResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const responseText = await backendResponse.text();
  const contentType = backendResponse.headers.get("content-type") ?? "";

  if (!responseText) {
    return new NextResponse(null, { status: backendResponse.status });
  }

  if (contentType.includes("application/json")) {
    return NextResponse.json(JSON.parse(responseText), {
      status: backendResponse.status,
    });
  }

  return new NextResponse(responseText, { status: backendResponse.status });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};
