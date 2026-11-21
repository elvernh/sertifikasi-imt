// Small date helpers. All dates are "date only" (time is 00:00 UTC),
// which matches the DATE columns in the database.

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Today's date (local calendar day) as a date-only value. */
export function today(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/** Turns "2026-11-21" into a date-only value. */
export function parseDate(text: string): Date {
  return new Date(`${text}T00:00:00.000Z`);
}

/** Returns a new date that is `days` days after `date`. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * ONE_DAY_MS);
}

/** How many days the month of `date` has (28, 29, 30 or 31). */
export function daysInMonth(date: Date): number {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
}

/**
 * Same day of the month, `months` months later.
 * If that month is shorter, it stops at its last day (2026-01-31 + 1 month = 2026-02-28).
 */
export function addMonths(date: Date, months: number): Date {
  const firstOfTarget = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const day = Math.min(date.getUTCDate(), daysInMonth(firstOfTarget));
  return new Date(Date.UTC(firstOfTarget.getUTCFullYear(), firstOfTarget.getUTCMonth(), day));
}

/** Number of whole days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / ONE_DAY_MS);
}

/** Formats a date as "2026-11-21" (used in forms and tables). */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
