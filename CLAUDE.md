# Project context

This is the CLIENT side of a two-repo crowdfunding platform.
The server repo lives at ../crowdfund-server and runs on port 4000.
Read ARCHITECTURE.md for the full folder plan and business rules.

## Non-negotiable rules
- Do NOT use Lorem Ipsum anywhere.
- Reload on a private route must NOT redirect to login while session is loading.
- Credit rates: 10 credits = $1 (buy), 20 credits = $1 (withdraw).
- Signup bonuses (50 supporter, 20 creator) are granted exactly once — server enforces.
- All API calls to the server go through lib/api-client.ts (attaches JWT).
- Use Tailwind CSS v4 + shadcn/ui components (New York style) for UI — richer blocks may come from the 21st.dev registry. Use motion for all animation (including sliders/carousels — built on motion or plain CSS, not Swiper), lucide-react for icons, sonner for toasts.
- Every state change on the server should trigger a notification for the affected user.

## Tech stack
Next.js App Router, TypeScript, BetterAuth, Tailwind CSS v4 + shadcn/ui (+ 21st.dev
registry), lucide-react, sonner, Framer Motion (motion) for all animation and
carousels/marquees, TanStack Query, React Hook Form + Zod, Stripe.js, ImgBB for
uploads.

## Commit style
Small, focused commits. Prefix with feat: / fix: / chore: / refactor:.

## Global UI & animation rules

Every component, page, and screen you build must follow these rules. No exceptions.

### Visual language

- **Design system:** Tailwind CSS v4 + shadcn/ui (New York style, `components/ui/`) is the source of truth for buttons, inputs, modals, tables, and typography. Use shadcn primitives (or 21st.dev registry blocks) before reaching for custom ones. Icons come from lucide-react; toasts from sonner.
- **Colors:** Use the FundSpark tokens through Tailwind's semantic classes (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`, `bg-primary`, `text-destructive`, …) which map to the `--fs-*` variables in globals.css. Never hardcode hex values in components — new swatches go into the `--fs-*` palette first.
- **Accent color:** The warm coral `--fs-accent` is `primary` — used for text, icons, and borders (bright enough for AA contrast against its own theme's background). Solid fills with text/icons on top (buttons, badges) use the separate `bg-primary-solid` / `bg-destructive-solid` tokens instead, tuned specifically for AA contrast under white text — see the contrast audit in MIGRATION.md for why the two can't share one value in dark mode. Use the default shadcn `<Button>` variant for primary CTAs. Never invent brand colors inline.
- **Dark mode:** Toggled by adding/removing the `.dark` class on `<html>` (persisted in `localStorage("fundspark-theme")` via `hooks/useTheme.ts`) — NOT a data-theme attribute. Every component must look right in both themes.
- **Fonts:** Inter (`--font-sans`) for UI and body, Fraunces (`--font-display`) for h1/display headlines — both loaded via next/font.
- **Spacing:** Use a 4px base unit — 4, 8, 12, 16, 24, 32, 48, 64. No arbitrary values like 13px or 27px.
- **Border radius:** Cards and modals use `rounded-xl` (12px). Inputs use `rounded-lg`/`rounded-md` (shadcn defaults). Buttons use shadcn defaults.
- **Shadows:** Use native Tailwind utilities, one of three levels only:
  - Cards at rest: `shadow-sm`
  - Cards on hover: `hover:shadow-md` (with `transition-shadow`)
  - Floating surfaces — modals, dropdowns, popovers, the mobile drawer: `shadow-xl`
  - Don't reach for arbitrary `box-shadow` values or the legacy `card-elevate`/`shadow-modal`/`shadow-card` CSS classes — those only remain for files still on the Gravity migration backlog (MIGRATION.md) and get deleted once that clears.
- **Typography scale:** h1 = 40px/1.2, h2 = 32px/1.25, h3 = 24px/1.3, h4 = 20px/1.4, body = 16px/1.6, caption = 14px/1.5. Weights: 700 for headings, 600 for buttons and card titles, 500 for labels, 400 for body.
- **Content density:** Cards get 24px internal padding on desktop, 16px on mobile. Section vertical rhythm is 96px desktop / 64px tablet / 48px mobile between major sections.

### Layout

- **Container width:** Max 1200px, horizontal padding 20px mobile / 32px tablet+ (use the `.container-fs` utility).
- **Grids:** Campaign grids are 1 column under 640px, 2 columns 640–1024px, 3 columns 1024px+. Stats grids are 2 columns mobile, 4 columns desktop.
- **Responsive-first:** Every new component must be tested mentally at 375px (mobile), 768px (tablet), and 1280px (desktop). If it breaks at any of these, redesign — don't ship it broken and fix later.
- **Whitespace over borders:** Prefer padding and margin over visible borders to separate content. Use borders only where structurally necessary (input fields, table cells, section dividers).

### Motion — use the `motion` package (Framer Motion)

- **Every page transition:** Wrap page content in a `motion.div` with `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}`. Use this exact easing curve everywhere — it's the app's signature motion.
- **Every list or grid:** Stagger children entry by 60ms. Wrap the container with `motion.div` and `variants` for `container` and `item`. Cards fade + slide up 16px into place.
- **Hover states:** All interactive cards get `whileHover={{ y: -4, transition: { duration: 0.2 } }}` and shadow upgrade on hover.
- **Buttons:** All primary buttons get `whileTap={{ scale: 0.97 }}`.
- **Modals and popovers:** Enter with `initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}` over 200ms. Exit reverses. Use `AnimatePresence`.
- **Numbers that change:** Use `CountUp` for stats (total credits, total supporters, amount raised). Animate over 1.2s with ease-out.
- **Progress bars:** Animate width on mount from 0 to actual percentage over 800ms with ease-out.
- **No motion for:** form errors (instant so user notices), input focus states, table sorts, disabled states. Motion should feel purposeful — don't animate what doesn't need it.
- **Duration budget:** Never exceed 400ms for UI feedback, 800ms for hero/entrance effects. Anything longer feels slow.
- **Reduced motion:** Respect `prefers-reduced-motion`. When set, disable all non-essential animation via a `useReducedMotion()` hook check. Opacity fades are OK; movement and scale are off.

### Loading and empty states

- **Never show a blank page while loading.** Every route with data uses a skeleton loader that matches the final layout's shape. Use the shadcn `<Skeleton>` (`components/ui/skeleton.tsx`) sized via className to the final content's dimensions.
- **Never show "No data" without design.** Empty states get an illustration or large icon, a heading ("No campaigns yet"), a helpful subtitle explaining what to do, and a CTA button when there's an obvious next action.
- **Optimistic UI:** For contribution submission, form saves, and toggles, update the UI immediately and roll back on error. Show a `react-hot-toast` success or error toast to confirm.

### Forms

- **Field labels:** Always visible above the input, never as placeholder-only. Placeholder text is for examples, not labels.
- **Validation feedback:** Errors show under the field in red with a small icon. Success states are silent (don't celebrate successful validation — only celebrate successful submission).
- **Submit buttons:** Show a spinner and disable during submission. Never let a user double-submit.
- **Field spacing:** 16px between fields. Groups of related fields get 24px between groups.
- **Required indicators:** Use a subtle asterisk after the label, not the word "required".

### Tables

- **Row hover:** Subtle background color change (`hover:bg-muted/50`), no animation.
- **Sortable headers:** Small arrow indicator, cursor pointer on hover.
- **Row actions:** Right-aligned in the last column. Use icon buttons with tooltips, not full-width labels.
- **Empty rows:** When a table has fewer than 5 rows, don't pad it out with empty rows. Just show what's there.
- **Mobile tables:** Horizontal scroll on mobile is acceptable if the table has more than 3 columns. Alternative: collapse to a card list under 640px.

### Images

- **Always use `next/image`** for optimization and lazy loading.
- **Aspect ratios:** Campaign cover images are 16:9. User avatars are 1:1 circular. Testimonial photos are 1:1 circular.
- **Loading:** Blur placeholder for all images. Never let images pop in.
- **Alt text:** Every image gets meaningful alt text. Never leave alt empty except for pure decoration.

### Accessibility

- **Keyboard nav:** Every interactive element must be reachable and usable via Tab / Enter / Space / Escape.
- **Focus rings:** Visible focus indicators on all interactive elements. Never `outline: none` without a replacement. shadcn primitives (Button, Input, Select, …) already ship their own `focus-visible:ring-[3px] focus-visible:ring-ring/50` treatment — leave those alone. Any hand-rolled `<Link>`/`<button>` that isn't wrapped in a shadcn component must get the shared `FOCUS_RING` constant from `lib/utils.ts` (`ring-2 ring-ring ring-offset-2`).
- **Contrast:** All text must pass WCAG AA (4.5:1 for body, 3:1 for large text).
- **ARIA:** Modals get `role="dialog"` and `aria-labelledby`. Toasts get `role="status"`. Buttons that only show icons get `aria-label`.

### What "professional" means in practice

- **Nothing shifts on load.** Reserve space for images and data with skeletons that match final dimensions.
- **Nothing looks accidental.** Every gap, padding, color, and border-radius comes from the scale above.
- **Nothing surprises the user.** Actions with consequences (delete, reject, withdraw) get confirmation dialogs.
- **Nothing feels slow.** Interactive feedback under 100ms, animations under 400ms, page transitions under 500ms.
- **Everything feels intentional.** If you can't explain why a spacing or animation exists, remove it.

### When in doubt

- Prefer restraint over decoration.
- Prefer whitespace over borders.
- Prefer subtle motion over dramatic motion.
- Prefer the shadcn/ui default over custom styling.
- Prefer one strong animation over five weak ones.

