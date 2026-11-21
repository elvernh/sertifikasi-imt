// Role checks for Server Actions (the forms that change data). Pages are already
// protected by the middleware in src/proxy.ts; actions check again to be safe.
import { redirect } from "next/navigation";
import { getSession, type Session } from "./session";

export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");
  return session;
}

export async function requireTenant(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "TENANT") redirect("/login");
  return session;
}
