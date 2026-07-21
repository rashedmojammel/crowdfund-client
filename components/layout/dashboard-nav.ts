// Role-specific dashboard navigation — the single source used by both
// DashboardSidebar (desktop) and MobileNav (drawer). Routes match the
// folder plan in ARCHITECTURE.md.

import {
  Bell,
  CircleDollarSign,
  CirclePlus,
  CreditCard,
  Flag,
  Heart,
  History,
  House,
  Layers,
  List,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const supporterNav: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: House },
  { href: "/dashboard/explore-campaigns", label: "Explore Campaigns", icon: Search },
  { href: "/dashboard/my-contributions", label: "My Contributions", icon: Heart },
  { href: "/dashboard/purchase-credit", label: "Purchase Credit", icon: CreditCard },
  { href: "/dashboard/payment-history", label: "Payment History", icon: History },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const creatorNav: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: House },
  { href: "/dashboard/add-campaign", label: "Add Campaign", icon: CirclePlus },
  { href: "/dashboard/my-campaigns", label: "My Campaigns", icon: List },
  { href: "/dashboard/withdrawals", label: "Withdrawals", icon: CircleDollarSign },
  { href: "/dashboard/payment-history", label: "Payment History", icon: History },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const adminNav: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: House },
  { href: "/dashboard/manage-users", label: "Manage Users", icon: Users },
  { href: "/dashboard/manage-campaigns", label: "Manage Campaigns", icon: Layers },
  { href: "/dashboard/withdrawal-requests", label: "Withdrawal Requests", icon: CircleDollarSign },
  { href: "/dashboard/reports", label: "Reports", icon: Flag },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

export function getDashboardNav(role: UserRole): DashboardNavItem[] {
  switch (role) {
    case "creator":
      return creatorNav;
    case "admin":
      return adminNav;
    default:
      return supporterNav;
  }
}

/** Exact match for the overview, prefix match for subpages. */
export function isNavItemActive(href: string, pathname: string): boolean {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}
