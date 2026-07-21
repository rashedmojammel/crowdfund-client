// Role-specific dashboard navigation — the single source used by both
// DashboardSidebar (desktop) and MobileNav (drawer). Routes match the
// folder plan in ARCHITECTURE.md.

import {
  Bell,
  CircleDollar,
  CirclePlus,
  ClockArrowRotateLeft,
  CreditCard,
  Flag,
  Heart,
  House,
  Layers,
  ListUl,
  Magnifier,
  Persons,
} from "@gravity-ui/icons";
import type { IconData } from "@gravity-ui/uikit";
import type { UserRole } from "@/types";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: IconData;
}

const supporterNav: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: House },
  { href: "/dashboard/explore-campaigns", label: "Explore Campaigns", icon: Magnifier },
  { href: "/dashboard/my-contributions", label: "My Contributions", icon: Heart },
  { href: "/dashboard/purchase-credit", label: "Purchase Credit", icon: CreditCard },
  { href: "/dashboard/payment-history", label: "Payment History", icon: ClockArrowRotateLeft },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const creatorNav: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: House },
  { href: "/dashboard/add-campaign", label: "Add Campaign", icon: CirclePlus },
  { href: "/dashboard/my-campaigns", label: "My Campaigns", icon: ListUl },
  { href: "/dashboard/withdrawals", label: "Withdrawals", icon: CircleDollar },
  { href: "/dashboard/payment-history", label: "Payment History", icon: ClockArrowRotateLeft },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const adminNav: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: House },
  { href: "/dashboard/manage-users", label: "Manage Users", icon: Persons },
  { href: "/dashboard/manage-campaigns", label: "Manage Campaigns", icon: Layers },
  { href: "/dashboard/withdrawal-requests", label: "Withdrawal Requests", icon: CircleDollar },
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
