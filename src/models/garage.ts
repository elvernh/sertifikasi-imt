// A garage that can be rented.
import type { GarageStatus, GarageType } from "./types";
import type { Vehicle } from "./vehicle";

const PREFIX: Record<GarageType, string> = { BICYCLE: "S", CAR: "C", EV: "E" };
const MAX_PER_TYPE = 999;

/** A period a garage is already booked for. The end date itself is free again. */
export type Booking = { startDate: Date; endDate: Date };

export class Garage {
  constructor(
    readonly id: string,
    readonly type: GarageType,
    readonly dailyPrice: number,
    readonly kwhPrice: number,
    public status: GarageStatus,
  ) {}

  /**
   * Makes new IDs for `count` garages of one type, continuing after `lastNumber`.
   * Example: generateIds("CAR", 9, 2) -> ["C010", "C011"]
   */
  static generateIds(type: GarageType, lastNumber: number, count: number): string[] {
    if (count < 1) throw new Error("Jumlah garasi minimal 1.");
    if (lastNumber + count > MAX_PER_TYPE) {
      throw new Error(`Maksimum ${MAX_PER_TYPE} garasi per tipe.`);
    }
    const ids: string[] = [];
    for (let i = 1; i <= count; i++) {
      const number = String(lastNumber + i).padStart(3, "0");
      ids.push(PREFIX[type] + number);
    }
    return ids;
  }

  /** True if this vehicle is allowed to park in this garage. */
  isCompatibleWith(vehicle: Vehicle): boolean {
    return vehicle.allowedGarageTypes().includes(this.type);
  }

  /**
   * True if none of the garage's bookings share a day with [start, end).
   * Example: booked 1-5 Dec (ends 5 Dec) and a new rental from 5 Dec is fine.
   */
  static isFreeBetween(bookings: Booking[], start: Date, end: Date): boolean {
    return bookings.every((b) => b.endDate <= start || end <= b.startDate);
  }

  /** True if nobody is renting this garage today. */
  isAvailable(): boolean {
    return this.status === "AVAILABLE";
  }

  /** Called after a rental is saved. */
  markUsed(): void {
    this.status = "USED";
  }

  /** Called when the rental period is over. */
  markAvailable(): void {
    this.status = "AVAILABLE";
  }
}
