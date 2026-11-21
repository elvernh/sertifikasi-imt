import Link from "next/link";
import { requireTenant } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { formatRupiah } from "@/lib/format";
import { toUser } from "@/lib/mappers";
import prisma from "@/lib/prisma";

// Tenant home: shows the approval status and the tenant's rentals.
export default async function TenantPage({ searchParams }: PageProps<"/tenant">) {
  const session = await requireTenant();
  const { saved } = await searchParams;

  const user = toUser(await prisma.user.findUniqueOrThrow({ where: { id: session.userId } }));
  const rentals = await prisma.rental.findMany({
    where: { userId: user.id },
    include: { garage: true, vehicle: true },
    orderBy: { id: "desc" },
  });

  return (
    <main className="page">
      <h1 className="text-2xl font-bold">Halo, {user.fullName}</h1>
      {saved && <p className="success">Sewa garasi berhasil disimpan.</p>}

      {user.status === "PENDING" && (
        <p className="error">Akun Anda belum diverifikasi admin. Anda belum bisa menyewa garasi.</p>
      )}
      {user.status === "REJECTED" && <p className="error">Pendaftaran Anda ditolak admin.</p>}
      {user.isApproved() && (
        <Link href="/tenant/rent" className="btn inline-block">+ Sewa Garasi Baru</Link>
      )}

      <section className="card">
        <h2 className="font-bold">Sewa Saya</h2>
        {rentals.length === 0 ? (
          <p>Belum ada sewa.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Garasi</th><th>Kendaraan</th><th>Tipe Sewa</th>
                <th>Mulai</th><th>Selesai</th><th>Total</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => (
                <tr key={r.id}>
                  <td>{r.garage.id}</td>
                  <td>{r.vehicle.brandModel} {r.vehicle.plateNumber ?? ""}</td>
                  <td>{r.rentalType === "DAILY" ? `Harian (${r.days} hari)` : "Bulanan"}</td>
                  <td>{formatDate(r.startDate)}</td>
                  <td>{formatDate(r.endDate)}</td>
                  <td>{formatRupiah(r.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
