"use server";

import { redirect } from "next/navigation";
import * as extensionController from "@/controllers/extension-controller";
import { requireAdmin } from "@/lib/auth";
import { errorMessage, readNumber, readText } from "@/lib/form";

type FormState = { error: string };

/** "Simpan Perpanjangan" button: the controller calculates the remaining cost and saves. */
export async function extendRental(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  try {
    await extensionController.extendRental(
      readNumber(formData, "rentalId"),
      readText(formData, "newEndDate"),
      formData.get("paymentProof"),
    );
  } catch (e) {
    return { error: errorMessage(e) };
  }

  redirect("/admin/extend?saved=1");
}
