// The fixed values used across the app (same values are stored in the database).

export type Role = "ADMIN" | "TENANT";
export type UserStatus = "PENDING" | "APPROVED" | "REJECTED";
export type VehicleType = "BICYCLE" | "MOTORCYCLE" | "CAR" | "EV";
export type GarageType = "BICYCLE" | "CAR" | "EV";
export type GarageStatus = "AVAILABLE" | "USED";
export type RentalType = "DAILY" | "MONTHLY";

export const GARAGE_TYPES: GarageType[] = ["BICYCLE", "CAR", "EV"];
export const VEHICLE_TYPES: VehicleType[] = ["BICYCLE", "MOTORCYCLE", "CAR", "EV"];

/** Indonesian labels shown in the UI. */
export const GARAGE_TYPE_LABEL: Record<GarageType, string> = {
  BICYCLE: "Garasi Sepeda",
  CAR: "Garasi Mobil",
  EV: "Garasi Mobil Listrik",
};

export const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  BICYCLE: "Sepeda",
  MOTORCYCLE: "Sepeda Motor",
  CAR: "Mobil",
  EV: "Mobil Listrik",
};
