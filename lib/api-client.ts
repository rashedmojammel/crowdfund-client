// Real client for crowdfund-server (NEXT_PUBLIC_API_URL, :4000 in dev).
// Every call is JWT-authenticated: GET /api/auth/token (this app's own
// BetterAuth route, see app/api/auth/token/route.ts) mints a short-lived
// HS256 JWT signed with BETTER_AUTH_SECRET, sent as "Authorization: Bearer".
// Responses are returned as-is — callers destructure the real shape
// (list endpoints: { items|campaigns|notifications|reports, total, page,
// limit }; single items: a named key). No mock layer left in this file.

import { authClient } from "@/lib/auth-client";

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
  /**
   * Set for endpoints the server itself treats as public (the campaign
   * list, top-funded). Skips requiring a session — a logged-out visitor
   * still gets the data instead of a 401 from our own token route before
   * the request ever reaches the real server. If a session does exist the
   * token is still attached, so the call is identical either way for a
   * logged-in visitor.
   */
  public?: boolean;
}

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Fetches a fresh short-lived JWT for the real server from our own BetterAuth route, or null if there's no session. */
async function getServerToken(): Promise<string | null> {
  const res = await fetch("/api/auth/token");
  if (!res.ok) return null;
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

  if (!token && !options.public) {
    throw new ApiError("Not authenticated", 401);
  }

  const res = await fetch(toServerUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  // Mutations can change the caller's own credits or role (contribute,
  // purchase, withdraw, admin actions) via a plain fetch that BetterAuth's
  // client never sees — nudge its session atom to refetch so every
  // useSession() consumer (navbar/topbar credit badges, wallet balances,
  // the lib/store.ts mirror via SessionSync) picks up the fresh value
  // instead of showing a stale one until the next focus/poll refresh.
  if (method !== "GET") {
    authClient.$store.notify("$sessionSignal");
  }

  return json as T;
}
