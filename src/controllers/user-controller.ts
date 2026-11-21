// User controller: read users and let the admin approve or reject new tenants.
import { toUser } from "@/lib/mappers";
import prisma from "@/lib/prisma";
import type { User } from "@/models/user";

/** One user by id. */
export async function getUser(userId: number): Promise<User> {
  const row = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return toUser(row);
}

/** Tenants that registered and wait for the admin (use case "Verify registration"). */
export async function listPendingTenants() {
  return prisma.user.findMany({
    where: { role: "TENANT", status: "PENDING" },
    orderBy: { id: "asc" },
  });
}

/** Admin accepts a new tenant, so the tenant can start renting. */
export async function approveTenant(userId: number): Promise<void> {
  const user = await getUser(userId);
  user.approve();
  await prisma.user.update({ where: { id: user.id }, data: { status: user.status } });
}

/** Admin rejects a new tenant (for example the KTP number is not valid). */
export async function rejectTenant(userId: number): Promise<void> {
  const user = await getUser(userId);
  user.reject();
  await prisma.user.update({ where: { id: user.id }, data: { status: user.status } });
}
