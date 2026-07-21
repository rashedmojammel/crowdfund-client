// TODO: replace with real fetch when server is ready — see lib/mock-api.ts
//
// apiFetch() keeps the exact call signature the real client will have
// (path + method + body, resolving to typed JSON), but routes every request
// to lib/mock-api.ts instead of the crowdfund-server on port 4000.
// The "JWT" step is simulated by reading the logged-in user from the
// Zustand session store (lib/store.ts) and passing their email to the
// mock handlers, the way the real server reads identity from the token.

import * as mock from "@/lib/mock-api";
import { ApiError } from "@/lib/mock-api";
import { useSessionStore } from "@/lib/store";
import type { UserRole } from "@/types";

export { ApiError };

export interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

interface RouteContext {
  /** Regex capture groups from the path, e.g. the :id segment. */
  params: string[];
  query: URLSearchParams;
  // Request bodies are caller-provided JSON; handlers cast to what each mock expects.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  /** Email of the logged-in user, or null — the mock stand-in for the JWT. */
  email: string | null;
}

type RouteHandler = (ctx: RouteContext) => Promise<unknown>;

/** Mock equivalent of "no/invalid Authorization header" → 401. */
const requireEmail = (ctx: RouteContext): string => {
  if (!ctx.email) throw new ApiError("Not authenticated", 401);
  return ctx.email;
};

const routes: Array<[method: string, pattern: RegExp, handler: RouteHandler]> = [
  // Auth
  ["POST", /^\/auth\/sign-in$/, (c) => mock.mockLogin(c.body.email, c.body.password)],
  ["POST", /^\/auth\/sign-up$/, (c) => mock.mockRegister(c.body)],
  ["POST", /^\/auth\/grant-signup-bonus$/, (c) => mock.mockGrantSignupBonus(requireEmail(c))],

  // Users
  ["GET", /^\/users\/me$/, (c) => mock.mockGetMe(requireEmail(c))],
  ["GET", /^\/users$/, () => mock.mockGetUsers()],
  [
    "PATCH",
    /^\/users\/([^/]+)\/role$/,
    (c) => mock.mockUpdateUserRole(c.params[0], c.body.role as UserRole),
  ],
  ["DELETE", /^\/users\/([^/]+)$/, (c) => mock.mockDeleteUser(c.params[0])],

  // Campaigns — literal segments before the [id] catch-alls
  ["GET", /^\/campaigns\/all$/, () => mock.mockGetAllCampaigns()],
  ["GET", /^\/campaigns\/top-funded$/, () => mock.mockGetTopFunded()],
  ["GET", /^\/campaigns\/mine$/, (c) => mock.mockGetMyCampaigns(requireEmail(c))],
  ["PATCH", /^\/campaigns\/([^/]+)\/approve$/, (c) => mock.mockApproveCampaign(c.params[0])],
  ["PATCH", /^\/campaigns\/([^/]+)\/reject$/, (c) => mock.mockRejectCampaign(c.params[0])],
  ["PATCH", /^\/campaigns\/([^/]+)\/suspend$/, (c) => mock.mockSuspendCampaign(c.params[0])],
  ["GET", /^\/campaigns\/([^/]+)$/, (c) => mock.mockGetCampaign(c.params[0])],
  [
    "PATCH",
    /^\/campaigns\/([^/]+)$/,
    (c) => mock.mockUpdateCampaign(requireEmail(c), c.params[0], c.body),
  ],
  ["DELETE", /^\/campaigns\/([^/]+)$/, (c) => mock.mockDeleteCampaign(c.params[0])],
  [
    "GET",
    /^\/campaigns$/,
    (c) =>
      mock.mockGetCampaigns({
        category: c.query.get("category") ?? undefined,
        search: c.query.get("search") ?? undefined,
        deadlineWithinDays: c.query.has("deadlineWithinDays")
          ? Number(c.query.get("deadlineWithinDays"))
          : undefined,
        minGoal: c.query.has("minGoal") ? Number(c.query.get("minGoal")) : undefined,
        maxGoal: c.query.has("maxGoal") ? Number(c.query.get("maxGoal")) : undefined,
        sort: (c.query.get("sort") as mock.CampaignFilters["sort"]) ?? undefined,
      }),
  ],
  ["POST", /^\/campaigns$/, (c) => mock.mockCreateCampaign(requireEmail(c), c.body)],

  // Contributions
  ["POST", /^\/contributions$/, (c) => mock.mockCreateContribution(requireEmail(c), c.body)],
  [
    "GET",
    /^\/contributions$/,
    (c) => {
      const email = requireEmail(c);
      if (c.query.get("forCreator") === "true") {
        return mock.mockGetContributionsForCreator(email);
      }
      return mock.mockGetMyContributions(
        email,
        Number(c.query.get("page") ?? 1),
        Number(c.query.get("limit") ?? 10)
      );
    },
  ],
  ["PATCH", /^\/contributions\/([^/]+)\/approve$/, (c) => mock.mockApproveContribution(c.params[0])],
  ["PATCH", /^\/contributions\/([^/]+)\/reject$/, (c) => mock.mockRejectContribution(c.params[0])],

  // Withdrawals
  ["POST", /^\/withdrawals$/, (c) => mock.mockCreateWithdrawal(requireEmail(c), c.body)],
  [
    "GET",
    /^\/withdrawals$/,
    (c) =>
      c.query.get("mine") === "true"
        ? mock.mockGetMyWithdrawals(requireEmail(c))
        : mock.mockGetWithdrawalRequests(),
  ],
  ["PATCH", /^\/withdrawals\/([^/]+)\/approve$/, (c) => mock.mockApproveWithdrawal(c.params[0])],

  // Notifications
  ["GET", /^\/notifications\/unread-count$/, (c) => mock.mockGetUnreadCount(requireEmail(c))],
  ["GET", /^\/notifications$/, (c) => mock.mockGetNotifications(requireEmail(c))],
  ["PATCH", /^\/notifications$/, (c) => mock.mockMarkNotificationsRead(requireEmail(c))],

  // Payments — Stripe Checkout shape: create session, confirm (webhook
  // stand-in), cancel, then the generic history route.
  ["GET", /^\/payments\/session$/, (c) => mock.mockGetCheckoutSession(c.query.get("session_id") ?? "")],
  ["POST", /^\/payments\/confirm$/, (c) => mock.mockConfirmCheckout(c.body.sessionId)],
  ["POST", /^\/payments\/cancel$/, (c) => mock.mockCancelCheckout(c.body.sessionId)],
  ["POST", /^\/payments$/, (c) => mock.mockCreateCheckoutSession(requireEmail(c), c.body)],
  ["GET", /^\/payments$/, (c) => mock.mockGetPaymentHistory(requireEmail(c))],

  // Reports
  ["POST", /^\/reports$/, (c) => mock.mockCreateReport(requireEmail(c), c.body)],
  ["GET", /^\/reports$/, () => mock.mockGetReports()],
  ["PATCH", /^\/reports\/([^/]+)$/, (c) => mock.mockUpdateReport(c.params[0], c.body.status)],

  // Stats
  ["GET", /^\/stats\/platform$/, () => mock.mockGetPlatformStats()],
  ["GET", /^\/stats\/creator$/, (c) => mock.mockGetCreatorStats(requireEmail(c))],
  ["GET", /^\/stats\/supporter$/, (c) => mock.mockGetSupporterStats(requireEmail(c))],
];

/** Accepts "/campaigns", "/api/campaigns?mine=true", or a full URL. */
const normalizePath = (path: string): { pathname: string; query: URLSearchParams } => {
  const url = new URL(path, "http://mock.local");
  let pathname = url.pathname;
  if (pathname.startsWith("/api/")) pathname = pathname.slice(4);
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
  return { pathname, query: url.searchParams };
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const { pathname, query } = normalizePath(path);
  const sessionUser = useSessionStore.getState().user;
  const email = sessionUser?.email ?? null;

  // A reload resets the in-memory mock DB but not the persisted session —
  // re-insert the logged-in user if the reset dropped them (registered
  // accounts aren't in the seed data).
  if (sessionUser) {
    mock.restoreSessionUser(sessionUser);
  }

  const route = routes.find(([m, pattern]) => m === method && pattern.test(pathname));
  if (!route) {
    throw new ApiError(`No mock handler for ${method} ${pathname}`, 404);
  }
  const params = pathname.match(route[1])?.slice(1) ?? [];

  const result = (await route[2]({ params, query, body: options.body, email })) as T;

  // Mutations can change the logged-in user's credits (contribute, purchase,
  // refunds) — refresh the cached session user so the navbar stays accurate.
  if (method !== "GET" && email) {
    const fresh = mock.getUserSnapshot(email);
    if (fresh) useSessionStore.getState().updateUser(fresh);
  }

  return result;
}
