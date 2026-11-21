"use server";

import { redirect } from "next/navigation";
import { Rental } from "@/domain/rental";
import type { RentalType, VehicleType } from "@/domain/types";
import { createVehicle } from "@/domain/vehicle";
import { requireTenant } from "@/lib/auth";
import { today } from "@/lib/dates";
import { toGarage } from "@/lib/mappers";
import prisma from "@/lib/prisma";
import { saveUpload } from "@/lib/upload";

type FormState = { error: string };

/** Use case "New rental": validate, calculate the total on the server, then save. */
export async function createRental(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireTenant();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
  if (user.status !== "APPROVED") return { error: "Akun belum diverifikasi admin." };

  // 1. Read the form
  const vehicleType = String(formData.get("vehicleType")) as VehicleType;
  const plateNumber = vehicleType === "BICYCLE" ? null : String(formData.get("plateNumber") ?? "").trim();
  const brandModel = String(formData.get("brandModel") ?? "").trim();
  const batteryKwh = vehicleType === "EV" ? Number(formData.get("batteryKwh")) : null;
  const rentalType = String(formData.get("rentalType")) as RentalType;
  const days = rentalType === "DAILY" ? Number(formData.get("days")) : null;
  const garageId = String(formData.get("garageId"));

  if (!brandModel) return { error: "Merek dan tipe kendaraan wajib diisi." };
  if (vehicleType !== "BICYCLE" && !plateNumber) return { error: "Nomor plat wajib diisi." };
  if (vehicleType === "EV" && !(batteryKwh && batteryKwh > 0)) {
    return { error: "Kapasitas baterai wajib diisi." };
  }

  // 2. Check the garage with the domain classes
  const garageRow = await prisma.garage.findUnique({ where: { id: garageId } });
  if (!garageRow) return { error: "Garasi tidak ditemukan." };
  const garage = toGarage(garageRow);
  const vehicle = createVehicle(vehicleType, 0, plateNumber, brandModel, batteryKwh);

  if (!garage.isAvailable()) return { error: "Garasi sudah disewa. Pilih garasi lain." };
  if (!garage.isCompatibleWith(vehicle)) return { error: "Kendaraan ini tidak boleh di garasi tersebut." };

  // 3. Calculate end date and total (never trust numbers sent by the browser)
  let rental: Rental;
  let paymentProofUrl: string;
  try {
    rental = new Rental(0, rentalType, days, today(), garage, vehicle);
    rental.calculateTotal();
    paymentProofUrl = await saveUpload(formData.get("paymentProof"));
  } catch (e) {
    return { error: (e as Error).message };
  }

  // 4. Save vehicle + rental, and mark the garage as used, all together
  garage.markUsed();
  await prisma.$transaction(async (tx) => {
    const savedVehicle = await tx.vehicle.create({
      data: { userId: user.id, type: vehicleType, plateNumber, brandModel, batteryKwh },
    });
    await tx.rental.create({
      data: {
        userId: user.id,
        vehicleId: savedVehicle.id,
        garageId: garage.id,
        rentalType,
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

  redirect("/tenant?saved=1");
}
