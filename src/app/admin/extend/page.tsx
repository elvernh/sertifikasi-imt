import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate, today } from "@/lib/dates";
import { toRental } from "@/lib/mappers";
import prisma from "@/lib/prisma";

// Use case "Extend rental", step 1: list the garages that are rented today.
export default async function ExtendListPage({ searchParams }: PageProps<"/admin/extend">) {
  await requireAdmin();
  const { saved } = await searchParams;

  const rows = await prisma.rental.findMany({
    include: { garage: true, vehicle: true, user: true },
    orderBy: { endDate: "asc" },
  });
  const activeToday = rows.filter((row) => toRental(row).isActiveOn(today()));

  return (
    <main className="page">
      <h1 className="text-2xl font-bold">Perpanjang Status Garasi</h1>
      {saved && <p className="success">Perpanjangan sewa berhasil disimpan.</p>}

      <section className="card">
        <h2 className="font-bold">Garasi yang sedang disewa hari ini ({formatDate(today())})</h2>
        {activeToday.length === 0 ? (
          <p>Tidak ada garasi yang sedang disewa.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Garasi</th><th>Penyewa</th><th>Kendaraan</th><th>Mulai</th><th>Selesai</th><th></th></tr>
            </thead>
            <tbody>
              {activeToday.map((r) => (
                <tr key={r.id}>
                  <td>{r.garageId}</td>
                  <td>{r.user.fullName}</td>
                  <td>{r.vehicle.brandModel} {r.vehicle.plateNumber ?? ""}</td>
                  <td>{formatDate(r.startDate)}</td>
                  <td>{formatDate(r.endDate)}</td>
                  <td><Link href={`/admin/extend/${r.id}`} className="underline">Perpanjang</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
