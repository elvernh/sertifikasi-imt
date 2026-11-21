"use server";

import { redirect } from "next/navigation";
import * as authController from "@/controllers/auth-controller";
import { errorMessage, readText } from "@/lib/form";
import { createSession } from "@/lib/session";
import type { User } from "@/models/user";

/** Login form: the controller checks email + password, then we start a session. */
export async function login(formData: FormData): Promise<void> {
  const email = readText(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  let user: User;
  try {
    user = await authController.checkLogin(email, password);
  } catch (e) {
    redirect("/login?error=" + encodeURIComponent(errorMessage(e)));
  }

  await createSession(user.id, user.role);
  redirect(user.isAdmin() ? "/admin" : "/tenant");
}
