/**
 * Timezone and Date utilities for B-Tracker.
 * Standardized on Asia/Jakarta (WIB, UTC+7).
 */

export const APP_TIMEZONE = "Asia/Jakarta";

/**
 * Returns 'YYYY-MM-DD' formatted in Asia/Jakarta timezone.
 * Guarantees correct calendar day regardless of server UTC time.
 */
export function getAppDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Parses 'YYYY-MM-DD' into a UTC midnight Date object suitable for Prisma @db.Date.
 */
export function parseDateToUtc(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Formats a Date object or ISO string into localized Indonesian format with time.
 * e.g. "14:35"
 */
export function formatTimeJakarta(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Formats a Date object or ISO string into localized Indonesian full date.
 * e.g. "Rabu, 23 September 2026"
 */
export function formatDateJakarta(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: APP_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Formats a Date object or ISO string into localized Indonesian short date.
 * e.g. "Rab, 23 Sep 2026"
 */
export function formatShortDateJakarta(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: APP_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}
