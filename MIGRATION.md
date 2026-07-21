# Gravity UI → shadcn/ui migration checklist

Generated during the stack-migration foundation step. Files below still
import from `@gravity-ui/uikit` or `@gravity-ui/icons` and must be
rewritten with shadcn/ui primitives + lucide-react icons.
**The app does not build until this list is cleared.** Check items off as
they're migrated; delete this file (and the legacy block in globals.css)
when done.

## Auth & shared forms — ✅ done
- [x] components/forms/LoginForm.tsx
- [x] components/forms/RegisterForm.tsx
- [x] components/forms/GoogleSignInButton.tsx
- [x] components/forms/ImageUploader.tsx
- [x] components/forms/DemoAccountsCallout.tsx
  (components/forms/FormField.tsx is Gravity-free — reusable as-is)

## Public layout & home — ✅ done
- [x] components/layout/Navbar.tsx
- [x] components/layout/Footer.tsx — redesigned (icon-circle socials, accent divider)
- [x] components/home/HeroSlider.tsx — **deleted**, replaced by AnimatedHero.tsx (gradient-blob hero, no Swiper)
- [x] components/home/TopFundedCampaigns.tsx
- [x] components/home/HowItWorks.tsx — **deleted**, replaced by BentoFeatureGrid.tsx
- [x] components/home/ExploreByCategory.tsx
- [x] components/home/Testimonials.tsx — rebuilt as a two-row infinite marquee (no Swiper)
- [x] components/home/PlatformImpact.tsx — added icons + Fraunces display numerals

## Campaigns (public) — ✅ done
- [x] components/campaigns/CampaignCard.tsx — modernized (image zoom, gradient scrim, creator avatar)
- [x] components/campaigns/CampaignGrid.tsx
- [x] components/campaigns/CampaignFilters.tsx
- [x] components/campaigns/CampaignStatusBadge.tsx
- [x] components/campaigns/ContributeForm.tsx
- [x] components/campaigns/ReportCampaignButton.tsx
- [x] app/campaigns/[id]/campaign-details.tsx
- [x] app/explore/explore-client.tsx

## Dashboard shell & shared blocks — partially done
- [x] app/dashboard/layout.tsx — also mounts CommandPalette
- [x] components/layout/DashboardSidebar.tsx — now collapsible, icon-first
- [x] components/layout/DashboardTopBar.tsx — added Cmd+K hint
- [x] components/layout/NotificationBell.tsx
- [x] components/layout/UserMenu.tsx
- [x] components/layout/MobileNav.tsx
- [x] components/layout/dashboard-nav.ts (icon imports only)
- [ ] components/dashboard/DataTable.tsx
- [ ] components/dashboard/Pagination.tsx
- [ ] components/dashboard/StatsCard.tsx — still uses `shadow-card` legacy class
- [ ] components/dashboard/RoleBadge.tsx
- [x] components/dashboard/EmptyState.tsx — migrated early (blocking dependency for explore-client)
- [ ] components/dashboard/ContributionStatusBadge.tsx
- [ ] components/ui/ConfirmDialog.tsx

## Supporter flow — not started
- [ ] components/dashboard/supporter/SupporterHome.tsx
- [ ] components/dashboard/supporter/ApprovedContributionsTable.tsx
- [ ] components/dashboard/supporter/MyContributionsTable.tsx
- [ ] components/dashboard/supporter/CreditPackageCard.tsx — still uses `card-elevate` legacy class
- [ ] components/dashboard/supporter/PaymentHistoryTable.tsx
- [ ] app/dashboard/purchase-credit/page.tsx
- [ ] app/dashboard/purchase-credit/success/success-client.tsx
- [ ] app/dashboard/purchase-credit/cancel/page.tsx
- [ ] app/mock-checkout/checkout-client.tsx — still uses `card-elevate` legacy class

## Creator flow — not started
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

## Admin flow — not started
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

Remaining: 36 files (dashboard supporter/creator/admin + 3 shared blocks +
mock-checkout). `@gravity-ui/uikit`/`@gravity-ui/icons` stay installed
until these clear — do not uninstall prematurely, it will break these
pages' builds.

## Foundation sanity check — passed (pre-migration)

Verified on a fresh dev server via a temporary self-contained route
(`/migration-test`, since every existing page still imports Gravity):

- Tailwind v4 tokens compile: `bg-primary` renders the warm coral
- `--fs-*` palette, `.dark` variant, `.container-fs`, and `--font-fraunces`
  all present in compiled CSS
- No-flash theme script served in `<head>`; dark mode = `.dark` on `<html>`
- Zero `@gravity-ui` module errors for routes that don't import it
- 22 shadcn primitives in `components/ui/` (toast retired upstream —
  sonner replaces it)

## 21st.dev component pass

Attempted real registry pulls via the authenticated 21st CLI
(`21st get` / `shadcn add <21st-url>`). Free tier allows only 2
component-code retrievals/day; the one pull attempted (an animated
hero) required a paid marketplace tier and, when it did return code,
didn't fit our warm-neutral/coral aesthetic (black background, rainbow
gradient text, raw DOM `querySelectorAll` animation, no reduced-motion
support). Per user decision, all 8 sections were hand-built instead
using our shadcn + Tailwind + motion stack, with `21st search` (free,
unlimited) used for structural reference only:

| Section | Component | 21st reference searched |
|---|---|---|
| Hero | AnimatedHero.tsx | "animated hero gradient" (minhxthanh, hammamikhairi, youcefbnm) |
| Feature grid | BentoFeatureGrid.tsx | "bento grid features" (avanishverma4, designali-in) |
| Testimonials | Testimonials.tsx + ui/marquee.tsx | "marquee testimonials" (serafimcloud, shadcnspace) |
| Impact numbers | PlatformImpact.tsx | "animated stat counter" (preetsuthar17, danielpetho) |
| Campaign card | CampaignCard.tsx | (hand-designed, no direct search) |
| Sidebar | DashboardSidebar.tsx | "collapsible sidebar icon" (anubra266, manuarora700) |
| Command palette | CommandPalette.tsx | "command palette cmdk" (rafa-porto, jatin-yadav05) — used shadcn's own `command` primitive |
| Footer | Footer.tsx | (hand-designed, no direct search) |

Swiper was fully removed as a dependency — hero and testimonials are
now motion/CSS-driven, matching the updated CLAUDE.md stack description.

## Contrast audit findings (computed WCAG ratios)

Full computation in the `refactor(polish): contrast audit` commit.
Found and fixed 5 AA failures via two new tokens (`--fs-accent-solid`,
`--fs-danger-solid` — solid-fill backgrounds only) plus adjusted
`--fs-text-muted` and light-mode `--fs-accent`. See that commit message
for exact before/after ratios. Audit scope was the shadcn-migrated
surface (home/layout/campaigns/forms/ui) — the 36 still-Gravity
dashboard files above were not audited and may have their own contrast
issues once migrated.
