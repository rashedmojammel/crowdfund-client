# Gravity UI → shadcn/ui migration checklist

Generated during the stack-migration foundation step. Every file below still
imports from `@gravity-ui/uikit` or `@gravity-ui/icons` (now uninstalled) and
must be rewritten with shadcn/ui primitives + lucide-react icons.
**The app does not build until this list is cleared.** Check items off as
they're migrated; delete this file (and the legacy block in globals.css)
when done.

## Auth & shared forms
- [ ] components/forms/LoginForm.tsx
- [ ] components/forms/RegisterForm.tsx
- [ ] components/forms/GoogleSignInButton.tsx
- [ ] components/forms/ImageUploader.tsx
- [ ] components/forms/DemoAccountsCallout.tsx
  (components/forms/FormField.tsx is Gravity-free — reusable as-is)

## Public layout & home
- [ ] components/layout/Navbar.tsx
- [ ] components/layout/Footer.tsx
- [ ] components/home/HeroSlider.tsx
- [ ] components/home/TopFundedCampaigns.tsx
- [ ] components/home/HowItWorks.tsx
- [ ] components/home/ExploreByCategory.tsx
- [ ] components/home/Testimonials.tsx

## Campaigns (public)
- [ ] components/campaigns/CampaignCard.tsx
- [ ] components/campaigns/CampaignGrid.tsx
- [ ] components/campaigns/CampaignFilters.tsx
- [ ] components/campaigns/CampaignStatusBadge.tsx
- [ ] components/campaigns/ContributeForm.tsx
- [ ] components/campaigns/ReportCampaignButton.tsx
- [ ] app/campaigns/[id]/campaign-details.tsx
- [ ] app/explore/explore-client.tsx

## Dashboard shell & shared blocks
- [ ] app/dashboard/layout.tsx
- [ ] components/layout/DashboardSidebar.tsx
- [ ] components/layout/DashboardTopBar.tsx
- [ ] components/layout/NotificationBell.tsx
- [ ] components/layout/UserMenu.tsx
- [ ] components/layout/MobileNav.tsx
- [ ] components/layout/dashboard-nav.ts (icon imports only)
- [ ] components/dashboard/DataTable.tsx
- [ ] components/dashboard/Pagination.tsx
- [ ] components/dashboard/StatsCard.tsx
- [ ] components/dashboard/RoleBadge.tsx
- [ ] components/dashboard/EmptyState.tsx
- [ ] components/dashboard/ContributionStatusBadge.tsx
- [ ] components/ui/ConfirmDialog.tsx

## Supporter flow
- [ ] components/dashboard/supporter/SupporterHome.tsx
- [ ] components/dashboard/supporter/ApprovedContributionsTable.tsx
- [ ] components/dashboard/supporter/MyContributionsTable.tsx
- [ ] components/dashboard/supporter/CreditPackageCard.tsx
- [ ] components/dashboard/supporter/PaymentHistoryTable.tsx
- [ ] app/dashboard/purchase-credit/page.tsx
- [ ] app/dashboard/purchase-credit/success/success-client.tsx
- [ ] app/dashboard/purchase-credit/cancel/page.tsx
- [ ] app/mock-checkout/checkout-client.tsx

## Creator flow
- [ ] components/dashboard/creator/CreatorHome.tsx
- [ ] components/dashboard/creator/ContributionsToReviewTable.tsx
- [ ] components/dashboard/creator/ViewContributionModal.tsx
- [ ] components/dashboard/creator/AddCampaignForm.tsx
- [ ] components/dashboard/creator/MyCampaignsTable.tsx
- [ ] components/dashboard/creator/UpdateCampaignForm.tsx
- [ ] components/dashboard/creator/WithdrawalForm.tsx
- [ ] components/dashboard/creator/WithdrawalHistoryTable.tsx
- [ ] app/dashboard/add-campaign/page.tsx
- [ ] app/dashboard/my-campaigns/page.tsx
- [ ] app/dashboard/my-campaigns/[id]/edit/page.tsx
- [ ] app/dashboard/withdrawals/page.tsx

## Admin flow
- [ ] components/dashboard/admin/AdminHome.tsx
- [ ] components/dashboard/admin/CampaignApprovalsTable.tsx
- [ ] components/dashboard/admin/ManageCampaignsTable.tsx
- [ ] components/dashboard/admin/ManageUsersTable.tsx
- [ ] components/dashboard/admin/RoleDropdown.tsx
- [ ] components/dashboard/admin/WithdrawalRequestsTable.tsx
- [ ] components/dashboard/admin/ReportsTable.tsx
- [ ] app/dashboard/manage-users/page.tsx
- [ ] app/dashboard/manage-campaigns/page.tsx
- [ ] app/dashboard/withdrawal-requests/page.tsx
- [ ] app/dashboard/reports/page.tsx

Total: 66 files.
