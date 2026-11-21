import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Home page: send each user to their own area.
export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(session.role === "ADMIN" ? "/admin" : "/tenant");
}
