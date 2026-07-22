# FundSpark — Client

The web app for **FundSpark**, a credit-based crowdfunding platform: supporters
back campaigns with credits, creators launch campaigns and cash out what they
raise, admins moderate the platform. Built with Next.js (App Router) and
TypeScript, talking to a separate API-only backend
([`../crowdfund-server`](../crowdfund-server), port `4000`) — this repo has no
database access of its own.

See [`Architecture.md`](./Architecture.md) for the full two-repo folder plan
and [`CLAUDE.md`](./CLAUDE.md) for the UI/animation rules every page follows.

**Live demo:** not deployed yet — run locally following the steps below.

## Admin login (grading)

A dedicated admin account, not tied to anyone's personal login:

| Email | Password |
|---|---|
| `grader@fundspark.dev` | `GraderAccess@2026` |

Register your own supporter/creator accounts through the app to see the
signup-bonus flow — every new supporter starts with 50 credits, every new
creator with 20.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **BetterAuth** — email/password + Google OAuth, MongoDB-backed sessions
- **Tailwind CSS v4** + **shadcn/ui** (New York style) for the primary UI;
  a handful of dashboard tables are still mid-migration off an older
  Gravity UI layer (see `MIGRATION.md`)
- **motion** (Framer Motion) for all animation, including the signature
  page-entrance easing and stagger-in grids
- **TanStack Query** for all server state — every fetch has a loading
  skeleton, an error state with retry, and an empty state
- **React Hook Form + Zod** for every form
- **Stripe Checkout** (hosted, redirect-based) for credit purchases
- **ImgBB** for campaign cover / profile photo uploads
- **sonner** for toasts, **lucide-react** for icons

## Features

- Real auth: email/password and Google OAuth (BetterAuth), with a signup
  bonus granted exactly once per account
- Public campaign browsing with category filters, and a campaign details
  page with a live funding progress bar
- Contribute credits to a campaign, with optimistic UI (the confirmation
  shows immediately, rolls back with a toast if the request fails)
- Creator: launch a campaign (ImgBB cover upload, admin review required
  before it goes live), edit title/story/reward, delete with automatic
  backer refunds
- Creator: review incoming contributions (approve/reject), optimistic
  row updates
- Creator: request a payout of raised credits; admin marks it paid
- Credit purchases through real Stripe Checkout, credited via a signed
  webhook (idempotent — a Stripe retry can't double-credit)
- Admin: approve/reject campaigns, delete any campaign, manage user roles,
  resolve/dismiss reports (suspend or delete the reported campaign in the
  same action), mark withdrawals paid
- Notification bell (polls unread count) for every state change that
  affects another user — approvals, rejections, payouts, refunds
- Role-scoped dashboard home with live stats (supporter/creator/admin each
  see different numbers, pulled from the real database)
- Dark mode, persisted, no flash on load

## Getting started

Requires `../crowdfund-server` running on port 4000 (see that repo's
README) — this app has no working data without it.

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_API_URL` | The server's URL — every API call goes through `lib/api-client.ts` to here. `http://localhost:4000` in dev. |
| `NEXT_PUBLIC_IMGBB_KEY` | Optional — without it, image upload fields fall back to a plain URL input. |
| `BETTER_AUTH_SECRET` | Must be byte-for-byte identical to the server's copy — this app signs JWTs with it, the server verifies with it. |
| `BETTER_AUTH_URL` | This app's own URL (`http://localhost:3000` in dev) — BetterAuth's base URL for callbacks. |
| `MONGODB_URI` | Same database the server uses. BetterAuth owns the `user` collection; the server reads and mutates it (credits, role). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional — leave blank and Google sign-in is skipped, email/password still works. Redirect URI: `http://localhost:3000/api/auth/callback/google`. |

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server on port 3000 (Turbopack). |
| `npm run build` | Production build. |
| `npm run start` | Start the production server. |
| `npm run lint` | ESLint. |

## Credit system

Same rules the server enforces — this app never computes credits itself,
only displays what the server returns:

- Buying: **10 credits = $1**, four fixed packages only (100/$10, 300/$25,
  800/$60, 1500/$110).
- Withdrawing: **20 credits = $1**, 200-credit minimum.
- Signup bonus: **50 credits** (supporter) / **20 credits** (creator),
  granted exactly once.

## How auth works

BetterAuth runs inside this app (`lib/auth.ts`, `app/api/auth/[...all]/`),
backed by the same MongoDB the server uses. For calls to the server,
`app/api/auth/token/route.ts` mints a short-lived JWT signed with
`BETTER_AUTH_SECRET` — `lib/api-client.ts` attaches it as
`Authorization: Bearer <jwt>` on every request. The server never sees a
session cookie, only that JWT.

Most feature components read the current user from `lib/store.ts`, a thin
mirror kept in sync with the real BetterAuth session by
`components/auth/SessionSync.tsx` — see that file for why the mirror exists
instead of every component calling `useSession()` directly.

## Folder structure

```
app/                    Routes. Page components are thin — they compose
                         components/, data fetching lives in those components.
  api/auth/              BetterAuth's catch-all handler + the JWT-minting route.
components/
  ui/                    shadcn primitives only (button, input, card, …) —
                         never hand-edited beyond what the app's design
                         tokens (see CLAUDE.md) require.
  forms/                 Auth + campaign forms (React Hook Form + Zod).
  auth/                  SessionSync, the shared auth-page layout.
  campaigns/              Campaign card/grid/contribute/report — public-facing.
  dashboard/
    supporter/, creator/, admin/
                         Role-specific dashboard tables and home pages.
                         Each one owns its own useQuery/useMutation calls.
  animations/            FadeIn, Pressable, StaggerChildren — the only
                         places motion values are hardcoded (CLAUDE.md's
                         signature easing curve, tap-scale, stagger delay).
lib/
  api-client.ts          apiFetch() — the ONLY way any component talks to
                         the server. Attaches the JWT, throws ApiError with
                         the server's real message on failure.
  auth.ts, auth-client.ts BetterAuth server config / React client.
  store.ts               The session mirror (see "How auth works" above).
  validators.ts          Zod schemas — one per form, field names matching
                         the server's real request shape exactly.
  campaign-guards.ts      Filters out legacy/malformed campaign records
                         (a handful of pre-migration documents still sit in
                         the database) so one bad record can't crash a list.
types/index.ts           Shared types — mirrors the server's REAL response
                         shapes exactly (Mongo _id, camelCase fields,
                         {items,total,page,limit} envelopes), not a guess.
```

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Reload on `/dashboard/*` bounces to `/login` | Should never happen — the layout guard waits for `isPending` to resolve before redirecting. If it does, check `BETTER_AUTH_SECRET` matches between this repo and the server, and that `MONGODB_URI` is reachable. |
| A dashboard table shows "Couldn't load…" with a retry button | The server call failed — open the Network tab, the response body's `message` field says exactly why (see the server README's status-code table). |
| Credits don't move after an action | Confirm both dev servers are running and `NEXT_PUBLIC_API_URL` points at the right port. For purchases specifically: the server's Stripe webhook has to actually fire — see the server README's webhook setup. |
| Google sign-in button errors immediately | `GOOGLE_CLIENT_ID`/`SECRET` are blank or wrong — check `.env.local`, and that the redirect URI is registered exactly in Google Cloud Console. |
| A campaign/card/table crashes instead of rendering | Almost certainly a malformed legacy database record slipping past `lib/campaign-guards.ts` in a place that doesn't use it yet — check whether the crashing component filters its list through `isRenderableCampaign` before rendering. |
