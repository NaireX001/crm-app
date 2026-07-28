import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely (handles conflicting utility classes).
 * Usage: cn("px-2 py-1", condition && "bg-red-500")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats an ISO timestamp as "12m ago", "3h ago", "1d ago", etc. */
export function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

/** Returns a name for display: full_name if set, otherwise the email's local part. */
export function displayName(
  profile: { full_name?: string | null; email?: string | null } | null | undefined
): string {
  if (!profile) return "Someone";
  return profile.full_name || profile.email?.split("@")[0] || "Someone";
}
