// Server-only: the FastAPI backend origin. Used exclusively inside Route
// Handlers (src/app/api/**) — never imported by client-bundled code.
export const API_BASE_URL = process.env.API_BASE_URL;

// Exposed to the browser: RTK Query calls this relative, same-origin path
// (this Next.js app acting as its own BFF), so it must be inlined into the
// client bundle, hence the NEXT_PUBLIC_ prefix.
export const INTERN_BASE_URL = process.env.NEXT_PUBLIC_INTERN_BASE_URL;

// Inlined at build time: Cloudflare Stream video lessons stay hidden until the
// backend runs with STREAMING_ENABLED=true.
export const STREAMING_ENABLED = process.env.NEXT_PUBLIC_STREAMING_ENABLED === "true";
