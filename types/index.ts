// Shared domain types for FundSpark (client).
// Mirrors the server's Mongoose models — keep field names in sync with
// ../crowdfund-server/types/index.ts when the server comes online.

export type UserRole = "supporter" | "creator" | "admin";

export type CampaignStatus = "pending" | "approved" | "rejected" | "suspended";

export type ContributionStatus = "pending" | "approved" | "rejected";

export type WithdrawalStatus = "pending" | "paid";

export type ReportStatus = "open" | "resolved" | "dismissed";

export type CampaignCategory =
  | "technology"
  | "education"
  | "health"
  | "environment"
  | "community"
  | "creative";

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

export interface Campaign {
  id: string;
  title: string;
  category: CampaignCategory;
  /** Long-form pitch shown on the campaign details page. */
  story: string;
  /** What backers get in return (perk / acknowledgement). */
  reward: string;
  /** Cover image URL. */
  image: string;
  /** Target amount in credits. */
  funding_goal: number;
  /** Sum of approved contributions in credits. */
  amount_raised: number;
  /** ISO date — campaign stops accepting contributions after this. */
  deadline: string;
  status: CampaignStatus;
  creatorEmail: string;
  creatorName: string;
  createdAt: string;
}

export interface Contribution {
  id: string;
  campaignId: string;
  campaignTitle: string;
  supporterEmail: string;
  supporterName: string;
  /** Amount in credits, deducted from the supporter's wallet at creation. */
  amount: number;
  status: ContributionStatus;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  creatorEmail: string;
  creatorName: string;
  /** Credits being cashed out (minimum 200). */
  credits: number;
  /** credits / 20 — the payout rate is 20 credits = $1. */
  amountUsd: number;
  paymentSystem: string;
  accountNumber: string;
  status: WithdrawalStatus;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  toEmail: string;
  message: string;
  /** In-app route the notification links to, e.g. /dashboard/my-contributions. */
  actionRoute: string;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  campaignId: string;
  campaignTitle: string;
  reporterEmail: string;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  supporterEmail: string;
  /** Credits purchased. */
  credits: number;
  /** credits / 10 — the purchase rate is 10 credits = $1. */
  amountUsd: number;
  /** Stripe Checkout session id (mocked for now). */
  sessionId: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PlatformStats {
  totalSupporters: number;
  totalCreators: number;
  totalCreditsInWallets: number;
  totalPaymentsUsd: number;
}

export interface CreatorStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: number;
  pendingReviewCount: number;
}

export interface SupporterStats {
  totalContributed: number;
  pendingAmount: number;
  approvedAmount: number;
  campaignsBacked: number;
}
