// An extension of an existing rental (done by the admin).
import { addMonths, daysBetween } from "@/lib/dates";
import { MONTHLY_PRICE_MULTIPLIER, type Rental } from "./rental";

/** The extra period split into whole months and leftover days, and what it costs. */
export type ExtensionCost = { months: number; days: number; amount: number };

export class RentalExtension {
  readonly oldEndDate: Date;
  amountDue = 0;

  constructor(
    readonly id: number,
    readonly rental: Rental,
    readonly newEndDate: Date,
    readonly paymentProofUrl: string = "",
  ) {
    this.oldEndDate = rental.endDate;
  }

  /**
   * Cost of extending from oldEndDate to newEndDate.
   * - Whole months (same date next month, like a monthly rental) cost 25 x daily price each.
   * - The days left over cost the daily price each, but never more than one month.
   * Example: 22 Nov -> 23 Dec = 1 month (22 Nov -> 22 Dec) + 1 day = 26 x daily price.
   */
  static costFor(oldEndDate: Date, newEndDate: Date, dailyPrice: number): ExtensionCost {
    // 1. Count whole months: add one month at a time while it still fits
    let months = 0;
    while (addMonths(oldEndDate, months + 1) <= newEndDate) months++;

    // 2. The days left after those months
    const days = daysBetween(addMonths(oldEndDate, months), newEndDate);

    // 3. Months at the monthly price + days at the daily price (days capped at one month)
    const monthlyPrice = MONTHLY_PRICE_MULTIPLIER * dailyPrice;
    const amount = months * monthlyPrice + Math.min(days * dailyPrice, monthlyPrice);
    return { months, days, amount };
  }

  /** Remaining cost to pay. The new end date must be after the old one. */
  calculateRemainingCost(): number {
    if (daysBetween(this.oldEndDate, this.newEndDate) < 1) {
      throw new Error("Tanggal selesai baru harus setelah tanggal selesai lama.");
    }
    const cost = RentalExtension.costFor(this.oldEndDate, this.newEndDate, this.rental.garage.dailyPrice);
    this.amountDue = cost.amount;
    return this.amountDue;
  }
}
