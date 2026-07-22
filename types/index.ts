// Shared domain types for FundSpark (client). These mirror the REAL server's
// response shapes exactly (../crowdfund-server/lib/models/*.ts + app/api/**
// route.ts) — Mongo documents come back with `_id`, camelCase field names
// matching the Mongoose schemas, and list endpoints wrapped in
// { items|campaigns|notifications|reports, total, page, limit }.
//
// Session-user shape (role/credits/signupBonusGranted) comes from BetterAuth
// (lib/auth.ts additionalFields) and uses `id`, not `_id` — that's a
// different system from the Mongo documents below and intentionally keeps
// its own shape.

export type UserRole = "supporter" | "creator" | "admin";

export type CampaignStatus = "pending" | "approved" | "rejected" | "suspended";

export type ContributionStatus = "pending" | "approved" | "rejected";

export type WithdrawalStatus = "pending" | "approved";

export type ReportStatus = "open" | "resolved" | "dismissed";

export type ReportAction = "resolve" | "dismiss" | "suspend_campaign" | "delete_campaign";

// Matches CAMPAIGN_CATEGORIES in ../crowdfund-server/types/index.ts exactly.
export type CampaignCategory =
  | "technology"
  | "art"
  | "education"
  | "health"
  | "community"
  | "environment";

// Matches PAYMENT_SYSTEMS in ../crowdfund-server/types/index.ts exactly.
export type PaymentSystem = "bkash" | "nagad" | "rocket" | "bank";

/** The authenticated session user — from BetterAuth, not a Mongo document. */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Wallet balance in credits. 10 credits = $1 (buy), 20 credits = $1 (withdraw). */
  credits: number;
  image?: string;
  signupBonusGranted: boolean;
  createdAt: string;
}

/** A row from GET /users (admin directory) — a raw Mongo User document. */
export interface AdminUserRow {
  _id: string;
  name: string | null;
  email: string;
  role: UserRole;
  credits: number;
  image?: string;
  createdAt: string;
}

export interface Campaign {
  _id: string;
  title: string;
  category: CampaignCategory;
  story: string;
  coverImage: string;
  fundingGoal: number;
  minimumContribution: number;
  amountRaised: number;
  deadline: string;
  reward: string;
  creatorEmail: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Contribution {
  _id: string;
  campaignId: string;
  supporterEmail: string;
  /** Denormalized from the user doc at creation time — always present. */
  supporterName: string;
  amount: number;
  status: ContributionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Withdrawal {
  _id: string;
  creatorEmail: string;
  /** Credits being cashed out (minimum 200). */
  credits: number;
  /** USD payout — credits / 20, computed server-side. */
  amount: number;
  paymentSystem: PaymentSystem;
  accountNumber: string;
  status: WithdrawalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  supporterEmail: string;
  credits: number;
  amountUsd: number;
  stripeSessionId?: string;
  stripePaymentIntent?: string;
  status: "pending" | "succeeded";
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  _id: string;
  toEmail: string;
  message: string;
  actionRoute: string;
  read: boolean;
  createdAt: string;
}

export interface Report {
  _id: string;
  campaignId: string;
  reporterEmail: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PlatformStats {
  totalSupporters: number;
  totalCreators: number;
  totalCredits: number;
  /** Count of succeeded payments — NOT a dollar amount. */
  totalPayments: number;
}

export interface CreatorStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: number;
}

export interface SupporterStats {
  totalContributions: number;
  pendingContributions: number;
  totalContributed: number;
}
