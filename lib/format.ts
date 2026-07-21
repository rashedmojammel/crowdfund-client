// Shared display formatting — keep all number/date presentation here so
// credit-rate math (10 buy / 20 withdraw per $1) never drifts per-component.

export const formatNumber = (n: number): string => n.toLocaleString("en-US");

export const formatCredits = (n: number): string => `${formatNumber(n)} credits`;

export const formatUsd = (n: number): string =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));

/** Whole days until the ISO date, never negative. */
export const daysLeft = (iso: string): number =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

/** "just now" / "5m ago" / "3h ago" / "2d ago", falling back to a date. */
export const formatTimeAgo = (iso: string): string => {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
};
