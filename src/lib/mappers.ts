// Turns database rows (from Prisma) into model objects (from the class diagram).
import type {
  Garage as GarageRow,
  Rental as RentalRow,
  User as UserRow,
  Vehicle as VehicleRow,
} from "@/generated/prisma/client";
import { Garage } from "@/models/garage";
import { Rental } from "@/models/rental";
import type { GarageStatus, GarageType, RentalType, Role, UserStatus, VehicleType } from "@/models/types";
import { User } from "@/models/user";
import { createVehicle, type Vehicle } from "@/models/vehicle";

export function toUser(row: UserRow): User {
  return new User(
    row.id,
    row.nik,
    row.fullName,
    row.phone,
    row.email,
    row.passwordHash,
    row.role as Role,
    row.status as UserStatus,
  );
}

export function toGarage(row: GarageRow): Garage {
  return new Garage(row.id, row.type as GarageType, row.dailyPrice, row.kwhPrice ?? 0, row.status as GarageStatus);
}

export function toVehicle(row: VehicleRow): Vehicle {
  return createVehicle(
    row.type as VehicleType,
    row.id,
    row.plateNumber,
    row.brandModel,
    row.batteryKwh,
    row.batteryPercent,
  );
}

/** A rental row together with its garage and vehicle rows. */
export function toRental(row: RentalRow & { garage: GarageRow; vehicle: VehicleRow }): Rental {
  const rental = new Rental(
    row.id,
    row.rentalType as RentalType,
    row.days,
    row.startDate,
    toGarage(row.garage),
    toVehicle(row.vehicle),
    row.paymentProofUrl,
  );
  rental.endDate = row.endDate; // the saved end date (it may have been extended)
  return rental;
}
