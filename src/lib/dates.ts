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

/** Number of whole days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / ONE_DAY_MS);
}

/** Formats a date as "2026-11-21" (used in forms and tables). */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
