"use server";

import { redirect } from "next/navigation";
import * as garageController from "@/controllers/garage-controller";
import { requireAdmin } from "@/lib/auth";
import { errorMessage, readNumber, readText } from "@/lib/form";
import type { GarageType } from "@/models/types";

/** "Buat Garasi" form: the controller makes the garages and their IDs. */
export async function createGarages(formData: FormData): Promise<void> {
  await requireAdmin();
  const type = readText(formData, "type") as GarageType;

  let created: number;
  try {
    created = await garageController.createGarages(
      type,
      readNumber(formData, "count"),
      readNumber(formData, "dailyPrice"),
      type === "EV" ? readNumber(formData, "kwhPrice") : null,
    );
  } catch (e) {
    redirect("/admin/garages?error=" + encodeURIComponent(errorMessage(e)));
  }

  redirect(`/admin/garages?created=${created}`);
}
