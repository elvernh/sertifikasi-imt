"use server";

import { redirect } from "next/navigation";
import { toUser } from "@/lib/mappers";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/session";

/** Use case "Log in": check email + password, then start a session. */
export async function login(formData: FormData): Promise<void> {
  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password"));

  const row = await prisma.user.findUnique({ where: { email } });
  const user = row ? toUser(row) : null;

  if (!user || !(await user.checkPassword(password))) {
    redirect("/login?error=" + encodeURIComponent("Email atau password salah."));
  }

  await createSession(user.id, user.role);
  redirect(user.isAdmin() ? "/admin" : "/tenant");
}
