// Real client for crowdfund-server (NEXT_PUBLIC_API_URL, :4000 in dev).
// Every call is JWT-authenticated: GET /api/auth/token (this app's own
// BetterAuth route, see app/api/auth/token/route.ts) mints a short-lived
// HS256 JWT signed with BETTER_AUTH_SECRET, sent as "Authorization: Bearer".
// Responses are returned as-is — callers destructure the real shape
// (list endpoints: { items|campaigns|notifications|reports, total, page,
// limit }; single items: a named key). No mock layer left in this file.

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Fetches a fresh short-lived JWT for the real server from our own BetterAuth route. */
async function getServerToken(): Promise<string> {
  const res = await fetch("/api/auth/token");
  if (!res.ok) throw new ApiError("Not authenticated", 401);
  const { token } = (await res.json()) as { token: string };
  return token;
}

/** Accepts "/campaigns", "/api/campaigns?mine=true", or a full URL — always hits the real server. */
function toServerUrl(path: string): string {
  const url = new URL(path, "http://placeholder.local");
  let pathname = url.pathname;
  if (pathname.startsWith("/api/")) pathname = pathname.slice(4);
  return `${SERVER_URL}/api${pathname}${url.search}`;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const token = await getServerToken();

  const res = await fetch(toServerUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json && typeof json === "object" && "message" in json && typeof json.message === "string"
        ? json.message
        : `Request to ${path} failed`;
    throw new ApiError(message, res.status);
  }

  return json as T;
}
