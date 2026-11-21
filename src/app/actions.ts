"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";

/** Log out and go back to the login page. */
export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
