import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { formatRupiah } from "@/lib/format";
import prisma from "@/lib/prisma";
import ExtendForm from "./extend-form";

// Use case "Extend rental", step 2: pick a new end date and upload the payment proof.
export default async function ExtendPage({ params }: PageProps<"/admin/extend/[id]">) {
  await requireAdmin();
  const { id } = await params;

  const rental = await prisma.rental.findUnique({
    where: { id: Number(id) },
    include: { garage: true, vehicle: true, user: true },
  });
  if (!rental) notFound();

  return (
    <main className="page max-w-xl">
      <h1 className="text-2xl font-bold">Perpanjang Sewa Garasi {rental.garageId}</h1>
      <section className="card">
        <p>Penyewa: <b>{rental.user.fullName}</b></p>
        <p>Kendaraan: {rental.vehicle.brandModel} {rental.vehicle.plateNumber ?? ""}</p>
        <p>Harga sewa harian: {formatRupiah(rental.garage.dailyPrice)}</p>
        <p>Tanggal selesai sekarang: <b>{formatDate(rental.endDate)}</b></p>
      </section>
      <ExtendForm
        rentalId={rental.id}
        oldEndDate={formatDate(rental.endDate)}
        dailyPrice={rental.garage.dailyPrice}
      />
    </main>
  );
}
