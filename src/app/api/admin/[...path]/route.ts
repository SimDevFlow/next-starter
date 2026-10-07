import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/config";
import { getAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

// Headers that either don't make sense to forward (hop-by-hop, or computed
// by the runtime) or would mismatch once fetch has already decoded the body.
const STRIP_REQUEST_HEADERS = new Set(["host", "cookie", "content-length"]);
const STRIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
]);

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { accessToken } = await getAdminSession();

  if (!accessToken) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  if (!API_BASE_URL) {
    return NextResponse.json(
      { detail: "API_BASE_URL is not configured" },
      { status: 500 }
    );
  }

  const { path } = await params;
  const targetUrl = new URL(
    `/api/admin/${path.join("/")}${request.nextUrl.search}`,
    API_BASE_URL
  );

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  headers.set("Authorization", `Bearer ${accessToken}`);

  const hasBody = !["GET", "HEAD"].includes(request.method);

  // `duplex` isn't in the DOM RequestInit typings yet, but undici (Node's
  // fetch) requires it whenever a streamed request body is passed through.
  type FetchInitWithDuplex = RequestInit & { duplex?: "half" };
  const init: FetchInitWithDuplex = {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    ...(hasBody ? { duplex: "half" } : {}),
  };

  const backendRes = await fetch(targetUrl, init);

  const responseHeaders = new Headers();
  backendRes.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: responseHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PATCH,
  proxy as PUT,
  proxy as DELETE,
};
