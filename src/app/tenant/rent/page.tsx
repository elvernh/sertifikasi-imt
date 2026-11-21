import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/auth";
import { releaseFinishedGarages } from "@/lib/garage-status";
import prisma from "@/lib/prisma";
import RentForm from "./rent-form";

// Use case "New rental": the page loads the free garages, the form does the rest.
export default async function RentPage() {
  const session = await requireTenant();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
  if (user.status !== "APPROVED") redirect("/tenant");

  await releaseFinishedGarages();
  const garages = await prisma.garage.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { id: "asc" },
  });

  return (
    <main className="page">
      <h1 className="text-2xl font-bold">Sewa Garasi Baru</h1>
      <RentForm
        garages={garages.map((g) => ({
          id: g.id,
          type: g.type,
          dailyPrice: g.dailyPrice,
          kwhPrice: g.kwhPrice ?? 0,
        }))}
      />
    </main>
  );
}
