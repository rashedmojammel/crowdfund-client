// Mock implementation of the crowdfund-server API.
// Function shapes mirror the real endpoints in ../crowdfund-server/app/api so
// that swapping in real fetch calls later only touches lib/api-client.ts.
//
// State is held in module-level arrays copied from lib/mock-data.ts —
// mutations persist across navigation, reset on full page reload.
// Every state change that affects another user pushes a notification,
// matching the server-side rule in CLAUDE.md.

import {
  mockCampaigns,
  mockContributions,
  mockNotifications,
  mockPayments,
  mockReports,
  mockUsers,
  mockWithdrawals,
  type MockUser,
} from "@/lib/mock-data";
import type {
  AppNotification,
  AuthResponse,
  Campaign,
  CampaignCategory,
  CheckoutSession,
  Contribution,
  CreatorStats,
  Paginated,
  Payment,
  PlatformStats,
  Report,
  SupporterStats,
  User,
  UserRole,
  Withdrawal,
} from "@/types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// In-memory database (seeded fresh on every reload)
// ---------------------------------------------------------------------------

const db = {
  users: mockUsers.map((u) => ({ ...u })),
  campaigns: mockCampaigns.map((c) => ({ ...c })),
  contributions: mockContributions.map((c) => ({ ...c })),
  notifications: mockNotifications.map((n) => ({ ...n })),
  withdrawals: mockWithdrawals.map((w) => ({ ...w })),
  reports: mockReports.map((r) => ({ ...r })),
  payments: mockPayments.map((p) => ({ ...p })),
};

const NETWORK_DELAY_MS = 300;
const delay = () => new Promise<void>((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${++idCounter}`;
const now = () => new Date().toISOString();

const sanitizeUser = (user: MockUser): User => {
  const copy: Partial<MockUser> = { ...user };
  delete copy.password;
  return copy as User;
};

const findUser = (email: string) => db.users.find((u) => u.email === email);

const requireUser = (email: string | null | undefined): MockUser => {
  const user = email ? findUser(email) : undefined;
  if (!user) throw new ApiError("Not authenticated", 401);
  return user;
};

const requireCampaign = (id: string): Campaign => {
  const campaign = db.campaigns.find((c) => c.id === id);
  if (!campaign) throw new ApiError("Campaign not found", 404);
  return campaign;
};

const notify = (toEmail: string, message: string, actionRoute: string) => {
  db.notifications.unshift({
    id: nextId("notif"),
    toEmail,
    message,
    actionRoute,
    read: false,
    createdAt: now(),
  });
};

const notifyAdmins = (message: string, actionRoute: string) => {
  db.users
    .filter((u) => u.role === "admin")
    .forEach((admin) => notify(admin.email, message, actionRoute));
};

/**
 * Synchronous snapshot of a user's current state (no delay, no auth).
 * Used by lib/api-client.ts to keep the Zustand session in sync with
 * credit changes after mutations. Not part of the real API surface.
 */
export const getUserSnapshot = (email: string): User | null => {
  const user = findUser(email);
  return user ? sanitizeUser(user) : null;
};

// Sentinel that can never match a typed password — restored accounts can't
// log in again after logout (their original password died with the reload).
const RESTORED_SESSION_PASSWORD = "__restored-session__";

/**
 * The persisted Zustand session survives full page reloads, but this
 * in-memory DB does not — accounts created via sign-up vanish, and every
 * authenticated call would then 401 with "Not authenticated". Called by
 * lib/api-client.ts before each request to re-insert the session's user
 * (with their last known credits) if the reload wiped them. Seeded users
 * are left untouched. Not part of the real API surface.
 */
export const restoreSessionUser = (user: User): void => {
  if (!findUser(user.email)) {
    db.users.push({ ...user, password: RESTORED_SESSION_PASSWORD });
  }
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function mockLogin(email: string, password: string): Promise<AuthResponse> {
  await delay();
  const user = findUser(email.trim().toLowerCase());
  if (!user || user.password !== password) {
    throw new ApiError("Invalid email or password", 401);
  }
  return { user: sanitizeUser(user), token: `mock-jwt.${user.id}.${Date.now()}` };
}

export async function mockRegister(input: {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "admin">;
  image?: string;
}): Promise<AuthResponse> {
  await delay();
  const email = input.email.trim().toLowerCase();
  if (findUser(email)) {
    throw new ApiError("An account with this email already exists", 409);
  }
  const user: MockUser = {
    id: nextId("user"),
    name: input.name,
    email,
    password: input.password,
    role: input.role,
    credits: 0, // bonus is granted by the separate grant-signup-bonus call
    image: input.image,
    signupBonusGranted: false,
    createdAt: now(),
  };
  db.users.push(user);
  return { user: sanitizeUser(user), token: `mock-jwt.${user.id}.${Date.now()}` };
}

/** Idempotent — mirrors POST /api/auth/grant-signup-bonus on the server. */
export async function mockGrantSignupBonus(email: string): Promise<User> {
  await delay();
  const user = requireUser(email);
  if (!user.signupBonusGranted) {
    const bonus = user.role === "supporter" ? 50 : user.role === "creator" ? 20 : 0;
    user.credits += bonus;
    user.signupBonusGranted = true;
    if (bonus > 0) {
      notify(
        user.email,
        `Welcome to FundSpark! Your ${bonus}-credit signup bonus has been added to your wallet.`,
        "/dashboard"
      );
    }
  }
  return sanitizeUser(user);
}

export async function mockGetMe(email: string): Promise<User> {
  await delay();
  return sanitizeUser(requireUser(email));
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export interface CampaignFilters {
  category?: string;
  search?: string;
  /** Only campaigns ending within this many days. */
  deadlineWithinDays?: number;
  /** Funding-goal range in credits. */
  minGoal?: number;
  maxGoal?: number;
  sort?: "newest" | "deadline" | "most-funded";
}

/** Public list: approved campaigns whose deadline has not passed. */
export async function mockGetCampaigns(filters: CampaignFilters = {}): Promise<Campaign[]> {
  await delay();
  let result = db.campaigns.filter(
    (c) => c.status === "approved" && new Date(c.deadline).getTime() > Date.now()
  );
  if (filters.category) {
    result = result.filter((c) => c.category === filters.category);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (c) => c.title.toLowerCase().includes(q) || c.story.toLowerCase().includes(q)
    );
  }
  if (filters.deadlineWithinDays !== undefined) {
    const cutoff = Date.now() + filters.deadlineWithinDays * 24 * 60 * 60 * 1000;
    result = result.filter((c) => new Date(c.deadline).getTime() <= cutoff);
  }
  if (filters.minGoal !== undefined) {
    result = result.filter((c) => c.funding_goal >= filters.minGoal!);
  }
  if (filters.maxGoal !== undefined) {
    result = result.filter((c) => c.funding_goal <= filters.maxGoal!);
  }
  switch (filters.sort) {
    case "deadline":
      result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      break;
    case "most-funded":
      result.sort((a, b) => b.amount_raised - a.amount_raised);
      break;
    default:
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return result;
}

/** Admin: every campaign in every status, newest first. */
export async function mockGetAllCampaigns(): Promise<Campaign[]> {
  await delay();
  return [...db.campaigns].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Top 6 approved campaigns by amount raised — home page section. */
export async function mockGetTopFunded(): Promise<Campaign[]> {
  await delay();
  return db.campaigns
    .filter((c) => c.status === "approved")
    .sort((a, b) => b.amount_raised - a.amount_raised)
    .slice(0, 6);
}

export async function mockGetCampaign(id: string): Promise<Campaign> {
  await delay();
  return requireCampaign(id);
}

export async function mockCreateCampaign(
  email: string,
  input: {
    title: string;
    category: CampaignCategory;
    story: string;
    reward: string;
    image: string;
    funding_goal: number;
    deadline: string;
  }
): Promise<Campaign> {
  await delay();
  const creator = requireUser(email);
  if (input.funding_goal <= 0) throw new ApiError("Funding goal must be positive");
  const campaign: Campaign = {
    id: nextId("camp"),
    ...input,
    amount_raised: 0,
    status: "pending",
    creatorEmail: creator.email,
    creatorName: creator.name,
    createdAt: now(),
  };
  db.campaigns.push(campaign);
  notifyAdmins(
    `New campaign "${campaign.title}" by ${creator.name} is awaiting approval.`,
    "/dashboard/manage-campaigns"
  );
  return campaign;
}

/** Creator's own campaigns, sorted by deadline descending. */
export async function mockGetMyCampaigns(email: string): Promise<Campaign[]> {
  await delay();
  const creator = requireUser(email);
  return db.campaigns
    .filter((c) => c.creatorEmail === creator.email)
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
}

/** Only title / story / reward are editable after creation. */
export async function mockUpdateCampaign(
  email: string,
  id: string,
  patch: Partial<Pick<Campaign, "title" | "story" | "reward">>
): Promise<Campaign> {
  await delay();
  const user = requireUser(email);
  const campaign = requireCampaign(id);
  if (campaign.creatorEmail !== user.email && user.role !== "admin") {
    throw new ApiError("You can only edit your own campaigns", 403);
  }
  if (patch.title !== undefined) campaign.title = patch.title;
  if (patch.story !== undefined) campaign.story = patch.story;
  if (patch.reward !== undefined) campaign.reward = patch.reward;
  return campaign;
}

/** Deleting refunds every approved contributor (transaction on the real server). */
export async function mockDeleteCampaign(id: string): Promise<{ deleted: true }> {
  await delay();
  const campaign = requireCampaign(id);
  db.contributions
    .filter((c) => c.campaignId === id && c.status === "approved")
    .forEach((contribution) => {
      const supporter = findUser(contribution.supporterEmail);
      if (supporter) supporter.credits += contribution.amount;
      notify(
        contribution.supporterEmail,
        `"${campaign.title}" was removed. Your ${contribution.amount}-credit contribution has been refunded.`,
        "/dashboard/my-contributions"
      );
    });
  db.contributions = db.contributions.filter((c) => c.campaignId !== id);
  db.campaigns = db.campaigns.filter((c) => c.id !== id);
  notify(
    campaign.creatorEmail,
    `Your campaign "${campaign.title}" was deleted by an administrator.`,
    "/dashboard/my-campaigns"
  );
  return { deleted: true };
}

export async function mockApproveCampaign(id: string): Promise<Campaign> {
  await delay();
  const campaign = requireCampaign(id);
  campaign.status = "approved";
  notify(
    campaign.creatorEmail,
    `Your campaign "${campaign.title}" has been approved and is now live.`,
    `/campaigns/${campaign.id}`
  );
  return campaign;
}

export async function mockRejectCampaign(id: string): Promise<Campaign> {
  await delay();
  const campaign = requireCampaign(id);
  campaign.status = "rejected";
  notify(
    campaign.creatorEmail,
    `Your campaign "${campaign.title}" was not approved. Review the guidelines and resubmit.`,
    "/dashboard/my-campaigns"
  );
  return campaign;
}

export async function mockSuspendCampaign(id: string): Promise<Campaign> {
  await delay();
  const campaign = requireCampaign(id);
  campaign.status = "suspended";
  notify(
    campaign.creatorEmail,
    `Your campaign "${campaign.title}" has been suspended following a review of user reports.`,
    "/dashboard/my-campaigns"
  );
  return campaign;
}

// ---------------------------------------------------------------------------
// Contributions
// ---------------------------------------------------------------------------

export async function mockCreateContribution(
  email: string,
  input: { campaignId: string; amount: number }
): Promise<Contribution> {
  await delay();
  const supporter = requireUser(email);
  const campaign = requireCampaign(input.campaignId);
  if (campaign.status !== "approved") {
    throw new ApiError("This campaign is not accepting contributions");
  }
  if (new Date(campaign.deadline).getTime() < Date.now()) {
    throw new ApiError("This campaign's deadline has passed");
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new ApiError("Contribution amount must be positive");
  }
  if (supporter.credits < input.amount) {
    throw new ApiError(
      `Insufficient credits — you have ${supporter.credits}, tried to contribute ${input.amount}`
    );
  }
  supporter.credits -= input.amount;
  const contribution: Contribution = {
    id: nextId("contrib"),
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    supporterEmail: supporter.email,
    supporterName: supporter.name,
    amount: input.amount,
    status: "pending",
    createdAt: now(),
  };
  db.contributions.push(contribution);
  notify(
    campaign.creatorEmail,
    `${supporter.name} contributed ${input.amount} credits to "${campaign.title}" — review it in your dashboard.`,
    "/dashboard"
  );
  return contribution;
}

export async function mockGetMyContributions(
  email: string,
  page = 1,
  limit = 10
): Promise<Paginated<Contribution>> {
  await delay();
  const supporter = requireUser(email);
  const all = db.contributions
    .filter((c) => c.supporterEmail === supporter.email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: all.slice((safePage - 1) * limit, safePage * limit),
    page: safePage,
    limit,
    total,
    totalPages,
  };
}

/** Contributions on the creator's campaigns, pending first, newest first. */
export async function mockGetContributionsForCreator(email: string): Promise<Contribution[]> {
  await delay();
  const creator = requireUser(email);
  const myCampaignIds = new Set(
    db.campaigns.filter((c) => c.creatorEmail === creator.email).map((c) => c.id)
  );
  return db.contributions
    .filter((c) => myCampaignIds.has(c.campaignId))
    .sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function mockApproveContribution(id: string): Promise<Contribution> {
  await delay();
  const contribution = db.contributions.find((c) => c.id === id);
  if (!contribution) throw new ApiError("Contribution not found", 404);
  if (contribution.status !== "pending") {
    throw new ApiError("This contribution has already been reviewed");
  }
  contribution.status = "approved";
  const campaign = requireCampaign(contribution.campaignId);
  campaign.amount_raised += contribution.amount;
  notify(
    contribution.supporterEmail,
    `Your ${contribution.amount}-credit contribution to "${campaign.title}" was approved by the creator.`,
    "/dashboard/my-contributions"
  );
  return contribution;
}

/** Rejecting refunds the supporter's credits (transaction on the real server). */
export async function mockRejectContribution(id: string): Promise<Contribution> {
  await delay();
  const contribution = db.contributions.find((c) => c.id === id);
  if (!contribution) throw new ApiError("Contribution not found", 404);
  if (contribution.status !== "pending") {
    throw new ApiError("This contribution has already been reviewed");
  }
  contribution.status = "rejected";
  const supporter = findUser(contribution.supporterEmail);
  if (supporter) supporter.credits += contribution.amount;
  notify(
    contribution.supporterEmail,
    `Your ${contribution.amount}-credit contribution to "${contribution.campaignTitle}" was rejected and the credits were refunded to your wallet.`,
    "/dashboard/my-contributions"
  );
  return contribution;
}

// ---------------------------------------------------------------------------
// Withdrawals
// ---------------------------------------------------------------------------

const WITHDRAW_RATE = 20; // credits per $1
const MIN_WITHDRAWAL_CREDITS = 200;

/** Credits a creator has raised (approved) minus credits already requested. */
const availableCredits = (creatorEmail: string): number => {
  const raised = db.campaigns
    .filter((c) => c.creatorEmail === creatorEmail)
    .reduce((sum, c) => sum + c.amount_raised, 0);
  const requested = db.withdrawals
    .filter((w) => w.creatorEmail === creatorEmail)
    .reduce((sum, w) => sum + w.credits, 0);
  return raised - requested;
};

export async function mockCreateWithdrawal(
  email: string,
  input: { credits: number; paymentSystem: string; accountNumber: string }
): Promise<Withdrawal> {
  await delay();
  const creator = requireUser(email);
  if (input.credits < MIN_WITHDRAWAL_CREDITS) {
    throw new ApiError(`Minimum withdrawal is ${MIN_WITHDRAWAL_CREDITS} credits`);
  }
  if (input.credits > availableCredits(creator.email)) {
    throw new ApiError("Requested amount exceeds your available raised credits");
  }
  const withdrawal: Withdrawal = {
    id: nextId("wd"),
    creatorEmail: creator.email,
    creatorName: creator.name,
    credits: input.credits,
    amountUsd: input.credits / WITHDRAW_RATE,
    paymentSystem: input.paymentSystem,
    accountNumber: input.accountNumber,
    status: "pending",
    createdAt: now(),
  };
  db.withdrawals.push(withdrawal);
  notifyAdmins(
    `${creator.name} requested a withdrawal of ${input.credits} credits ($${withdrawal.amountUsd.toFixed(2)}).`,
    "/dashboard/withdrawal-requests"
  );
  return withdrawal;
}

export async function mockGetMyWithdrawals(email: string): Promise<Withdrawal[]> {
  await delay();
  const creator = requireUser(email);
  return db.withdrawals
    .filter((w) => w.creatorEmail === creator.email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Admin list — pending requests first. */
export async function mockGetWithdrawalRequests(): Promise<Withdrawal[]> {
  await delay();
  return [...db.withdrawals].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (b.status === "pending" && a.status !== "pending") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function mockApproveWithdrawal(id: string): Promise<Withdrawal> {
  await delay();
  const withdrawal = db.withdrawals.find((w) => w.id === id);
  if (!withdrawal) throw new ApiError("Withdrawal not found", 404);
  if (withdrawal.status === "paid") throw new ApiError("Already marked paid");
  withdrawal.status = "paid";
  notify(
    withdrawal.creatorEmail,
    `Your withdrawal of ${withdrawal.credits} credits ($${withdrawal.amountUsd.toFixed(2)}) has been marked paid.`,
    "/dashboard/withdrawals"
  );
  return withdrawal;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function mockGetNotifications(email: string): Promise<AppNotification[]> {
  await delay();
  const user = requireUser(email);
  return db.notifications
    .filter((n) => n.toEmail === user.email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);
}

export async function mockMarkNotificationsRead(email: string): Promise<{ updated: number }> {
  await delay();
  const user = requireUser(email);
  let updated = 0;
  db.notifications.forEach((n) => {
    if (n.toEmail === user.email && !n.read) {
      n.read = true;
      updated++;
    }
  });
  return { updated };
}

export async function mockGetUnreadCount(email: string): Promise<{ count: number }> {
  await delay();
  const user = requireUser(email);
  return { count: db.notifications.filter((n) => n.toEmail === user.email && !n.read).length };
}

// ---------------------------------------------------------------------------
// Payments — mirrors the Stripe Checkout architecture:
// create session → redirect → webhook credits wallet (idempotent).
// In mock mode /mock-checkout stands in for Stripe's hosted page and
// mockConfirmCheckout stands in for the webhook.
// ---------------------------------------------------------------------------

const BUY_RATE = 10; // credits per $1

const checkoutSessions: CheckoutSession[] = [];

const findCheckoutSession = (sessionId: string): CheckoutSession => {
  const session = checkoutSessions.find((s) => s.id === sessionId);
  // Sessions live in memory only — a full page reload starts a fresh mock DB.
  if (!session) throw new ApiError("Checkout session not found or expired", 404);
  return session;
};

/** POST /payments — the real server creates a Stripe Checkout Session here. */
export async function mockCreateCheckoutSession(
  email: string,
  input: { credits: number }
): Promise<CheckoutSession> {
  await delay();
  const supporter = requireUser(email);
  if (!Number.isFinite(input.credits) || input.credits <= 0) {
    throw new ApiError("Credit amount must be positive");
  }
  const id = `cs_mock_${Math.random().toString(36).slice(2, 12)}`;
  const session: CheckoutSession = {
    id,
    supporterEmail: supporter.email,
    credits: input.credits,
    amountUsd: input.credits / BUY_RATE,
    status: "pending",
    url: `/mock-checkout?session_id=${id}`, // Stripe-hosted URL in production
    createdAt: now(),
  };
  checkoutSessions.push(session);
  return session;
}

export async function mockGetCheckoutSession(sessionId: string): Promise<CheckoutSession> {
  await delay();
  return findCheckoutSession(sessionId);
}

/**
 * Stands in for the Stripe webhook: credits the wallet exactly once per
 * session (idempotent by session id), records the payment, notifies.
 */
export async function mockConfirmCheckout(sessionId: string): Promise<Payment> {
  await delay();
  const session = findCheckoutSession(sessionId);
  const existing = db.payments.find((p) => p.sessionId === sessionId);
  if (session.status === "completed" && existing) return existing;
  if (session.status === "cancelled") {
    throw new ApiError("This checkout session was cancelled");
  }
  const supporter = requireUser(session.supporterEmail);
  session.status = "completed";
  supporter.credits += session.credits;
  const payment: Payment = {
    id: nextId("pay"),
    supporterEmail: supporter.email,
    credits: session.credits,
    amountUsd: session.amountUsd,
    sessionId: session.id,
    createdAt: now(),
  };
  db.payments.push(payment);
  notify(
    supporter.email,
    `Payment received — ${session.credits} credits ($${session.amountUsd.toFixed(2)}) added to your wallet.`,
    "/dashboard/payment-history"
  );
  return payment;
}

export async function mockCancelCheckout(sessionId: string): Promise<CheckoutSession> {
  await delay();
  const session = findCheckoutSession(sessionId);
  if (session.status === "pending") {
    session.status = "cancelled";
  }
  return session;
}

export async function mockGetPaymentHistory(email: string): Promise<Payment[]> {
  await delay();
  const user = requireUser(email);
  return db.payments
    .filter((p) => p.supporterEmail === user.email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ---------------------------------------------------------------------------
// Users (admin)
// ---------------------------------------------------------------------------

export async function mockGetUsers(): Promise<User[]> {
  await delay();
  return db.users.map(sanitizeUser);
}

export async function mockUpdateUserRole(id: string, role: UserRole): Promise<User> {
  await delay();
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new ApiError("User not found", 404);
  user.role = role;
  notify(user.email, `An administrator changed your account role to ${role}.`, "/dashboard");
  return sanitizeUser(user);
}

export async function mockDeleteUser(id: string): Promise<{ deleted: true }> {
  await delay();
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new ApiError("User not found", 404);
  if (user.role === "admin") throw new ApiError("Admin accounts cannot be deleted", 403);
  db.users = db.users.filter((u) => u.id !== id);
  return { deleted: true };
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export async function mockCreateReport(
  email: string,
  input: { campaignId: string; reason: string; details: string }
): Promise<Report> {
  await delay();
  const reporter = requireUser(email);
  const campaign = requireCampaign(input.campaignId);
  const report: Report = {
    id: nextId("report"),
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    reporterEmail: reporter.email,
    reason: input.reason,
    details: input.details,
    status: "open",
    createdAt: now(),
  };
  db.reports.push(report);
  notifyAdmins(
    `A new report was filed against "${campaign.title}": ${input.reason}.`,
    "/dashboard/reports"
  );
  return report;
}

/** Admin list — open reports first. */
export async function mockGetReports(): Promise<Report[]> {
  await delay();
  return [...db.reports].sort((a, b) => {
    if (a.status === "open" && b.status !== "open") return -1;
    if (b.status === "open" && a.status !== "open") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function mockUpdateReport(
  id: string,
  status: "resolved" | "dismissed"
): Promise<Report> {
  await delay();
  const report = db.reports.find((r) => r.id === id);
  if (!report) throw new ApiError("Report not found", 404);
  report.status = status;
  notify(
    report.reporterEmail,
    `Your report on "${report.campaignTitle}" has been reviewed and marked ${status}.`,
    "/dashboard/notifications"
  );
  return report;
}

// ---------------------------------------------------------------------------
// Stats (dashboard home pages)
// ---------------------------------------------------------------------------

export async function mockGetPlatformStats(): Promise<PlatformStats> {
  await delay();
  return {
    totalSupporters: db.users.filter((u) => u.role === "supporter").length,
    totalCreators: db.users.filter((u) => u.role === "creator").length,
    totalCreditsInWallets: db.users.reduce((sum, u) => sum + u.credits, 0),
    totalPaymentsUsd: db.payments.reduce((sum, p) => sum + p.amountUsd, 0),
  };
}

export async function mockGetCreatorStats(email: string): Promise<CreatorStats> {
  await delay();
  const creator = requireUser(email);
  const mine = db.campaigns.filter((c) => c.creatorEmail === creator.email);
  const myCampaignIds = new Set(mine.map((c) => c.id));
  return {
    totalCampaigns: mine.length,
    activeCampaigns: mine.filter(
      (c) => c.status === "approved" && new Date(c.deadline).getTime() > Date.now()
    ).length,
    totalRaised: mine.reduce((sum, c) => sum + c.amount_raised, 0),
    pendingReviewCount: db.contributions.filter(
      (c) => myCampaignIds.has(c.campaignId) && c.status === "pending"
    ).length,
  };
}

export async function mockGetSupporterStats(email: string): Promise<SupporterStats> {
  await delay();
  const supporter = requireUser(email);
  const mine = db.contributions.filter((c) => c.supporterEmail === supporter.email);
  const sumWhere = (status: Contribution["status"]) =>
    mine.filter((c) => c.status === status).reduce((sum, c) => sum + c.amount, 0);
  return {
    totalContributed: mine.reduce((sum, c) => sum + c.amount, 0),
    pendingAmount: sumWhere("pending"),
    approvedAmount: sumWhere("approved"),
    campaignsBacked: new Set(mine.map((c) => c.campaignId)).size,
  };
}
