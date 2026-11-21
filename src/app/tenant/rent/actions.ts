"use server";

import { redirect } from "next/navigation";
import * as rentalController from "@/controllers/rental-controller";
import { requireTenant } from "@/lib/auth";
import { errorMessage, readNumber, readText } from "@/lib/form";
import type { RentalType, VehicleType } from "@/models/types";

type FormState = { error: string };

/** "Simpan Sewa" button: read the form, the controller checks, calculates and saves. */
export async function createRental(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireTenant();
  const vehicleType = readText(formData, "vehicleType") as VehicleType;
  const rentalType = readText(formData, "rentalType") as RentalType;

  try {
    await rentalController.createRental(
      session.userId,
      {
        vehicleType,
        plateNumber: readText(formData, "plateNumber"),
        brandModel: readText(formData, "brandModel"),
        batteryKwh: vehicleType === "EV" ? readNumber(formData, "batteryKwh") : null,
        batteryPercent: vehicleType === "EV" ? readNumber(formData, "batteryPercent") : null,
        rentalType,
        days: rentalType === "DAILY" ? readNumber(formData, "days") : null,
        startDate: readText(formData, "startDate"),
        garageId: readText(formData, "garageId"),
      },
      formData.get("paymentProof"),
    );
  } catch (e) {
    return { error: errorMessage(e) };
  }

  redirect("/tenant?saved=1");
}
