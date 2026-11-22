// Filters rentals for the admin reports.
import type { GarageType } from "./types";

/** The rental data a report needs (a row from the database). */
export type ReportRental = {
  id: number;
  userId: number;
  garageId: string;
  startDate: Date;
  totalCost: number;
  garage: { type: string };
  extensions: { amountDue: number }[]; // payments made when the admin extended the rental
};

export class RentalReport {
  constructor(private rentals: ReportRental[]) {}

  /** All rentals that started in this year (the page groups them per month). */
  perMonth(year: number): ReportRental[] {
    return this.rentals.filter((r) => r.startDate.getUTCFullYear() === year);
  }

  /** All rentals that started in this month (the page groups them per day). month: 1-12 */
  perDay(year: number, month: number): ReportRental[] {
    return this.perMonth(year).filter((r) => r.startDate.getUTCMonth() + 1 === month);
  }

  /** All rentals of one garage type. */
  perGarageType(type: GarageType): ReportRental[] {
    return this.rentals.filter((r) => r.garage.type === type);
  }

  /** All rentals of one tenant. */
  perTenant(tenantId: number): ReportRental[] {
    return this.rentals.filter((r) => r.userId === tenantId);
  }
}

/** Adds up the total cost of a list of rentals (what was paid when each rental was made). */
export function sumTotal(rentals: ReportRental[]): number {
  return rentals.reduce((sum, r) => sum + r.totalCost, 0);
}

/** Adds up the extension payments of a list of rentals. */
export function sumExtensions(rentals: ReportRental[]): number {
  return rentals.reduce((sum, r) => sum + r.extensions.reduce((s, e) => s + e.amountDue, 0), 0);
}
