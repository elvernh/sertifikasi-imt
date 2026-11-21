// Page and action guards: send the user to /login if they are not allowed.
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
