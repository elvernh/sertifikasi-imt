// An extension of an existing rental (done by the admin).
import { daysBetween } from "@/lib/dates";
import type { Rental } from "./rental";

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

  /** Extra days x daily price. The new end date must be after the old one. */
  calculateRemainingCost(): number {
    const extraDays = daysBetween(this.oldEndDate, this.newEndDate);
    if (extraDays < 1) {
      throw new Error("Tanggal selesai baru harus setelah tanggal selesai lama.");
    }
    this.amountDue = extraDays * this.rental.garage.dailyPrice;
    return this.amountDue;
  }
}
