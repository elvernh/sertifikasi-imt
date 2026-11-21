// One garage rental made by a tenant.
import { addDays, addMonths, daysInMonth } from "@/lib/dates";
import type { Garage } from "./garage";
import type { RentalType } from "./types";
import type { Vehicle } from "./vehicle";

export const MONTHLY_PRICE_MULTIPLIER = 25; // monthly price = 25 x daily price

export class Rental {
  rentalCost = 0;
  chargingCost = 0;
  totalCost = 0;
  endDate: Date;

  constructor(
    readonly id: number,
    readonly rentalType: RentalType,
    readonly days: number | null,
    readonly startDate: Date,
    readonly garage: Garage,
    readonly vehicle: Vehicle,
    readonly paymentProofUrl: string = "",
  ) {
    this.endDate = this.calculateEndDate();
  }

  /** Max days for a daily rental = number of days in the start month (Feb = 28, Nov = 30). */
  static maxDailyDays(startDate: Date): number {
    return daysInMonth(startDate);
  }

  /** The start date may be today or later, never in the past. */
  static isValidStartDate(startDate: Date, today: Date): boolean {
    return !Number.isNaN(startDate.getTime()) && startDate >= today;
  }

  /**
   * End date for a rental that has not been made yet (used to find free garages).
   * DAILY: start + number of days. MONTHLY: same date next month (28-31 days).
   */
  static endDateFor(rentalType: RentalType, days: number | null, startDate: Date): Date {
    if (rentalType === "MONTHLY") {
      return addMonths(startDate, 1);
    }
    return addDays(startDate, Rental.checkedDays(days, startDate));
  }

  calculateEndDate(): Date {
    return Rental.endDateFor(this.rentalType, this.days, this.startDate);
  }

  /** Rental cost + charging cost. Also stores each part on the object. */
  calculateTotal(): number {
    if (this.rentalType === "MONTHLY") {
      this.rentalCost = MONTHLY_PRICE_MULTIPLIER * this.garage.dailyPrice;
    } else {
      this.rentalCost = this.garage.dailyPrice * Rental.checkedDays(this.days, this.startDate);
    }

    // Only an electric car in an EV garage is charged to full.
    this.chargingCost =
      this.garage.type === "EV" ? this.vehicle.chargingCost(this.garage.kwhPrice) : 0;

    this.totalCost = this.rentalCost + this.chargingCost;
    return this.totalCost;
  }

  /** True if the rental covers this date (the end date itself is free again). */
  isActiveOn(date: Date): boolean {
    return this.startDate <= date && date < this.endDate;
  }

  /** Daily rentals must be between 1 and the number of days in the start month. */
  private static checkedDays(days: number | null, startDate: Date): number {
    const value = days ?? 0;
    const max = Rental.maxDailyDays(startDate);
    if (value < 1 || value > max) {
      throw new Error(`Jumlah hari harus 1 sampai ${max}.`);
    }
    return value;
  }
}
