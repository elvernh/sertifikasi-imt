// Rental controller: a tenant makes a new rental and sees their rentals.
import { parseDate, today } from "@/lib/dates";
import { toGarage, toRental } from "@/lib/mappers";
import prisma from "@/lib/prisma";
import { saveUpload } from "@/lib/upload";
import { Garage } from "@/models/garage";
import { Rental } from "@/models/rental";
import type { RentalType, VehicleType } from "@/models/types";
import { createVehicle } from "@/models/vehicle";
import { getUser } from "./user-controller";

/** The values typed in the "Sewa Garasi Baru" form. */
export type NewRentalInput = {
  vehicleType: VehicleType;
  plateNumber: string;
  brandModel: string;
  batteryKwh: number | null; // electric car only
  batteryPercent: number | null; // electric car only, 0-100
  rentalType: RentalType;
  days: number | null; // daily rental only
  startDate: string; // "2026-12-01"
  garageId: string;
};

/** Checks the vehicle part of the form. Throws if something is missing. */
function checkVehicleInput(input: NewRentalInput): void {
  if (!input.brandModel) throw new Error("Merek dan tipe kendaraan wajib diisi.");
  if (input.vehicleType !== "BICYCLE" && !input.plateNumber) throw new Error("Nomor plat wajib diisi.");
  if (input.vehicleType !== "EV") return;

  const kwh = input.batteryKwh ?? 0;
  const percent = input.batteryPercent ?? -1;
  if (!(kwh > 0)) throw new Error("Kapasitas baterai wajib diisi.");
  if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
    throw new Error("Sisa baterai harus angka 0 sampai 100 (%).");
  }
}

/**
 * Use case "New rental": check the form, calculate the total on the server,
 * then save the vehicle and the rental. Returns the saved rental's total.
 */
export async function createRental(
  userId: number,
  input: NewRentalInput,
  paymentProof: FormDataEntryValue | null,
): Promise<number> {
  // 1. Only tenants approved by the admin can rent
  const user = await getUser(userId);
  if (!user.isApproved()) throw new Error("Akun belum diverifikasi admin.");

  // 2. Check the form values
  const startDate = parseDate(input.startDate);
  if (!Rental.isValidStartDate(startDate, today())) {
    throw new Error("Tanggal mulai sewa harus hari ini atau setelahnya.");
  }
  checkVehicleInput(input);

  // 3. The garage must exist and fit the vehicle
  const garageRow = await prisma.garage.findUnique({
    where: { id: input.garageId },
    include: { rentals: { select: { startDate: true, endDate: true } } },
  });
  if (!garageRow) throw new Error("Garasi tidak ditemukan.");

  const garage = toGarage(garageRow);
  const plateNumber = input.vehicleType === "BICYCLE" ? null : input.plateNumber;
  const batteryKwh = input.vehicleType === "EV" ? input.batteryKwh : null;
  const batteryPercent = input.vehicleType === "EV" ? input.batteryPercent : null;
  const vehicle = createVehicle(input.vehicleType, 0, plateNumber, input.brandModel, batteryKwh, batteryPercent);
  if (!garage.isCompatibleWith(vehicle)) throw new Error("Kendaraan ini tidak boleh di garasi tersebut.");

  // 4. End date and total are calculated by the Rental class (never trust the browser)
  const days = input.rentalType === "DAILY" ? input.days : null;
  const rental = new Rental(0, input.rentalType, days, startDate, garage, vehicle);
  rental.calculateTotal();

  // 5. Nobody else may have this garage on any day of the period
  if (!Garage.isFreeBetween(garageRow.rentals, rental.startDate, rental.endDate)) {
    throw new Error("Garasi sudah disewa pada periode itu. Pilih garasi atau tanggal lain.");
  }

  // 6. Save the payment proof image
  const paymentProofUrl = await saveUpload(paymentProof);

  // 7. Save vehicle + rental. The garage becomes USED if the rental starts today.
  if (rental.isActiveOn(today())) garage.markUsed();
  await prisma.$transaction(async (tx) => {
    const savedVehicle = await tx.vehicle.create({
      data: { userId: user.id, type: input.vehicleType, plateNumber, brandModel: input.brandModel, batteryKwh, batteryPercent },
    });
    await tx.rental.create({
      data: {
        userId: user.id,
        vehicleId: savedVehicle.id,
        garageId: garage.id,
        rentalType: input.rentalType,
        days,
        startDate: rental.startDate,
        endDate: rental.endDate,
        rentalCost: rental.rentalCost,
        chargingCost: rental.chargingCost,
        totalCost: rental.totalCost,
        paymentProofUrl,
      },
    });
    await tx.garage.update({ where: { id: garage.id }, data: { status: garage.status } });
  });

  return rental.totalCost;
}

/** All rentals of one tenant, newest first ("Sewa Saya" page). */
export async function listTenantRentals(userId: number) {
  return prisma.rental.findMany({
    where: { userId },
    include: { garage: true, vehicle: true },
    orderBy: { id: "desc" },
  });
}

/** Rentals that are running today (step 1 of use case "Extend rental"). */
export async function listRentalsActiveToday() {
  const rows = await prisma.rental.findMany({
    include: { garage: true, vehicle: true, user: true },
    orderBy: { endDate: "asc" },
  });
  return rows.filter((row) => toRental(row).isActiveOn(today()));
}
