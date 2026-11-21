"use server";

import { revalidatePath } from "next/cache";
import * as userController from "@/controllers/user-controller";
import { requireAdmin } from "@/lib/auth";
import { readNumber } from "@/lib/form";

/** "Terima" button: approve a new tenant. */
export async function approveTenant(formData: FormData): Promise<void> {
  await requireAdmin();
  await userController.approveTenant(readNumber(formData, "userId"));
  revalidatePath("/admin");
}

/** "Tolak" button: reject a new tenant. */
export async function rejectTenant(formData: FormData): Promise<void> {
  await requireAdmin();
  await userController.rejectTenant(readNumber(formData, "userId"));
  revalidatePath("/admin");
}
