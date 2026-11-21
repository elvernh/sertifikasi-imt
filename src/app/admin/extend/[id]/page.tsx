import { notFound } from "next/navigation";
import * as extensionController from "@/controllers/extension-controller";
import { formatDate } from "@/lib/dates";
import { formatRupiah } from "@/lib/format";
import ExtendForm from "./extend-form";

// Page /admin/extend/[id] (admin only): step 2 of "Perpanjang Sewa".
export default async function ExtendPage({ params }: PageProps<"/admin/extend/[id]">) {
  const { id } = await params;
  const rental = await extensionController.getRentalForExtension(Number(id));
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
