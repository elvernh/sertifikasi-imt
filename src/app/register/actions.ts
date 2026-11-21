"use server";

import { redirect } from "next/navigation";
import * as authController from "@/controllers/auth-controller";
import { errorMessage, readText } from "@/lib/form";

/** Register form: the controller checks the values and saves the new tenant. */
export async function register(formData: FormData): Promise<void> {
  try {
    await authController.registerTenant({
      nik: readText(formData, "nik"),
      fullName: readText(formData, "fullName"),
      phone: readText(formData, "phone"),
      email: readText(formData, "email").toLowerCase(),
      password: String(formData.get("password") ?? ""),
    });
  } catch (e) {
    redirect("/register?error=" + encodeURIComponent(errorMessage(e)));
  }

  redirect("/login?registered=1");
}
