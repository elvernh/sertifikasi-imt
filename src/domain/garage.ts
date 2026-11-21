// A garage that can be rented.
import type { GarageStatus, GarageType } from "./types";
import type { Vehicle } from "./vehicle";

const PREFIX: Record<GarageType, string> = { BICYCLE: "S", CAR: "C", EV: "E" };
const MAX_PER_TYPE = 999;

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

  /** True if nobody is renting this garage. */
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
