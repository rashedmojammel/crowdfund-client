// Frozen copy of the pre-migration mock shapes, used only by lib/mock-api.ts
// and lib/mock-data.ts. Those two files are unused now that api-client.ts
// talks to the real server (types/index.ts describes the REAL shapes) — kept
// only until a final cleanup pass deletes them. Decoupled from @/types so
// this dead code doesn't block the real build.

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
  credits: number;
  image?: string;
  signupBonusGranted: boolean;
  createdAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  category: CampaignCategory;
  story: string;
  reward: string;
  image: string;
  funding_goal: number;
  amount_raised: number;
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
  amount: number;
  status: ContributionStatus;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  creatorEmail: string;
  creatorName: string;
  credits: number;
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

export type CheckoutSessionStatus = "pending" | "completed" | "cancelled";

export interface CheckoutSession {
  id: string;
  supporterEmail: string;
  credits: number;
  amountUsd: number;
  status: CheckoutSessionStatus;
  url: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  supporterEmail: string;
  credits: number;
  amountUsd: number;
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
