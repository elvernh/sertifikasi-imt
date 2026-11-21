"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { toUser } from "@/lib/mappers";
import prisma from "@/lib/prisma";

/** Approve a new tenant so they can start renting. */
export async function approveTenant(formData: FormData): Promise<void> {
  await requireAdmin();
  const row = await prisma.user.findUniqueOrThrow({ where: { id: Number(formData.get("userId")) } });
  const user = toUser(row);
  user.approve();
  await prisma.user.update({ where: { id: user.id }, data: { status: user.status } });
  revalidatePath("/admin");
}

/** Reject a new tenant (for example the KTP number is not valid). */
export async function rejectTenant(formData: FormData): Promise<void> {
  await requireAdmin();
  const row = await prisma.user.findUniqueOrThrow({ where: { id: Number(formData.get("userId")) } });
  const user = toUser(row);
  user.reject();
  await prisma.user.update({ where: { id: user.id }, data: { status: user.status } });
  revalidatePath("/admin");
}
