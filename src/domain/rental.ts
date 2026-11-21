// One garage rental made by a tenant.
import { addDays } from "@/lib/dates";
import type { Garage } from "./garage";
import type { RentalType } from "./types";
import type { Vehicle } from "./vehicle";

const MAX_DAILY_DAYS = 30;
const MONTHLY_PRICE_MULTIPLIER = 25; // monthly price = 25 x daily price
const MONTHLY_LENGTH_DAYS = 30;

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

  /** DAILY: start + number of days. MONTHLY: start + 30 days. */
  calculateEndDate(): Date {
    if (this.rentalType === "MONTHLY") {
      return addDays(this.startDate, MONTHLY_LENGTH_DAYS);
    }
    return addDays(this.startDate, this.checkedDays());
  }

  /** Rental cost + charging cost. Also stores each part on the object. */
  calculateTotal(): number {
    if (this.rentalType === "MONTHLY") {
      this.rentalCost = MONTHLY_PRICE_MULTIPLIER * this.garage.dailyPrice;
    } else {
      this.rentalCost = this.garage.dailyPrice * this.checkedDays();
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

  /** Daily rentals must be between 1 and 30 days. */
  private checkedDays(): number {
    const days = this.days ?? 0;
    if (days < 1 || days > MAX_DAILY_DAYS) {
      throw new Error(`Jumlah hari harus 1 sampai ${MAX_DAILY_DAYS}.`);
    }
    return days;
  }
}
