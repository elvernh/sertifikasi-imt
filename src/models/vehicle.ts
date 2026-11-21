// Vehicle classes: one abstract parent and four child classes (inheritance).
import type { GarageType, VehicleType } from "./types";

export abstract class Vehicle {
  constructor(
    readonly id: number,
    readonly plateNumber: string | null,
    readonly brandModel: string,
  ) {}

  /** Which garage types this vehicle may park in. Each child class decides. */
  abstract allowedGarageTypes(): GarageType[];

  /** Cost to charge the battery to full. Normal vehicles have no battery, so 0. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  chargingCost(kwhPrice: number): number {
    return 0;
  }
}

export class Bicycle extends Vehicle {
  allowedGarageTypes(): GarageType[] {
    return ["BICYCLE"];
  }
}

export class Motorcycle extends Vehicle {
  allowedGarageTypes(): GarageType[] {
    return ["BICYCLE"];
  }
}

export class Car extends Vehicle {
  allowedGarageTypes(): GarageType[] {
    return ["CAR"];
  }
}

export class ElectricCar extends Vehicle {
  constructor(
    id: number,
    plateNumber: string | null,
    brandModel: string,
    private batteryKwh: number,
    private batteryPercent: number, // how much battery is left, 0-100 %
  ) {
    super(id, plateNumber, brandModel);
  }

  allowedGarageTypes(): GarageType[] {
    return ["CAR", "EV"];
  }

  /** kWh needed to charge to full: capacity x (100 - % left) / 100. */
  kwhToFull(): number {
    return (this.batteryKwh * (100 - this.batteryPercent)) / 100;
  }

  /** Charge from the % left up to full: kWh needed x price per kWh (whole rupiah). */
  chargingCost(kwhPrice: number): number {
    return Math.round(this.kwhToFull() * kwhPrice);
  }
}

/** Builds the right Vehicle child class from the vehicle type chosen in the form. */
export function createVehicle(
  type: VehicleType,
  id: number,
  plateNumber: string | null,
  brandModel: string,
  batteryKwh: number | null,
  batteryPercent: number | null,
): Vehicle {
  if (type === "BICYCLE") return new Bicycle(id, null, brandModel);
  if (type === "MOTORCYCLE") return new Motorcycle(id, plateNumber, brandModel);
  if (type === "CAR") return new Car(id, plateNumber, brandModel);
  return new ElectricCar(id, plateNumber, brandModel, batteryKwh ?? 0, batteryPercent ?? 0);
}
