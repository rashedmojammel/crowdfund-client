// Shared display formatting — keep all number/date presentation here so
// credit-rate math (10 buy / 20 withdraw per $1) never drifts per-component.
// Every helper is guarded against null/undefined/invalid input and returns a
// safe fallback instead of throwing — bad or missing data must never crash
// a render.

function toValidDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toFiniteNumber(n: number | null | undefined): number | null {
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

export const formatNumber = (n: number | null | undefined): string => {
  const value = toFiniteNumber(n);
  return value === null ? "0" : value.toLocaleString("en-US");
};

export const formatCredits = (n: number | null | undefined): string => {
  const value = toFiniteNumber(n);
  return value === null ? "0 credits" : `${formatNumber(value)} credits`;
};

export const formatUsd = (n: number | null | undefined): string => {
  const value = toFiniteNumber(n) ?? 0;
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
};

export const formatDate = (iso: string | null | undefined): string => {
  const date = toValidDate(iso);
  return date ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date) : "—";
};

export const formatDateTime = (iso: string | null | undefined): string => {
  const date = toValidDate(iso);
  return date
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date)
    : "—";
};

/** Whole days until the ISO date, never negative. */
export const daysLeft = (iso: string | null | undefined): number => {
  const date = toValidDate(iso);
  if (!date) return 0;
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
};

/** "just now" / "5m ago" / "3h ago" / "2d ago", falling back to a date. */
export const formatTimeAgo = (iso: string | null | undefined): string => {
  const date = toValidDate(iso);
  if (!date) return "—";
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
};

/** Day-granularity relative phrasing: "today" / "in 5 days" / "3 days ago". */
export const formatRelative = (iso: string | null | undefined): string => {
  const date = toValidDate(iso);
  if (!date) return "—";
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTarget = new Date(date);
  startOfTarget.setHours(0, 0, 0, 0);
  const days = Math.round(
    (startOfTarget.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (days === 0) return "today";
  if (days > 0) return `in ${days} day${days === 1 ? "" : "s"}`;
  const past = Math.abs(days);
  return `${past} day${past === 1 ? "" : "s"} ago`;
};

/** amountRaised / fundingGoal as a whole number 0–100, never dividing by zero. */
export const percentFunded = (
  raised: number | null | undefined,
  goal: number | null | undefined
): number => {
  const raisedValue = toFiniteNumber(raised) ?? 0;
  const goalValue = toFiniteNumber(goal) ?? 0;
  if (goalValue <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((raisedValue / goalValue) * 100)));
};

export const formatPercent = (
  raised: number | null | undefined,
  goal: number | null | undefined
): string => `${percentFunded(raised, goal)}%`;

/** Masks all but the last 4 characters, e.g. "01712-000045" → "•••• 0045". */
export const maskAccount = (value: string | null | undefined): string => {
  if (!value) return "••••";
  const stripped = value.replace(/[\s-]/g, "");
  if (stripped.length <= 4) return `•••• ${stripped}`;
  return `•••• ${stripped.slice(-4)}`;
};
