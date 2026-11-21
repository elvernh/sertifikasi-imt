import { RentalReport, sumTotal } from "@/domain/rental-report";
import { GARAGE_TYPE_LABEL, GARAGE_TYPES } from "@/domain/types";
import { requireAdmin } from "@/lib/auth";
import { formatDate, today } from "@/lib/dates";
import { formatRupiah } from "@/lib/format";
import prisma from "@/lib/prisma";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// Use case "View rental report": per month, per day, per garage type, per tenant.
export default async function ReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  await requireAdmin();
  const params = await searchParams;
  const year = Number(params.year) || today().getUTCFullYear();
  const month = Number(params.month) || today().getUTCMonth() + 1;

  const rentals = await prisma.rental.findMany({ include: { garage: true }, orderBy: { startDate: "asc" } });
  const tenants = await prisma.user.findMany({ where: { role: "TENANT" }, orderBy: { fullName: "asc" } });
  const report = new RentalReport(rentals);

  // Per month: group the rentals of the chosen year by month.
  const yearRentals = report.perMonth(year);
  const monthRows = MONTH_NAMES.map((name, i) => {
    const list = yearRentals.filter((r) => r.startDate.getUTCMonth() === i);
    return { name, count: list.length, total: sumTotal(list) };
  });

  // Per day: group the rentals of the chosen month by date.
  const monthRentals = report.perDay(year, month);
  const dates = [...new Set(monthRentals.map((r) => formatDate(r.startDate)))];
  const dayRows = dates.map((date) => {
    const list = monthRentals.filter((r) => formatDate(r.startDate) === date);
    return { date, count: list.length, total: sumTotal(list) };
  });

  return (
    <main className="page">
      <h1 className="text-2xl font-bold">Laporan Sewa Garasi</h1>

      <form className="card flex gap-3 items-end" method="get">
        <label className="label">
          Tahun
          <input name="year" type="number" defaultValue={year} className="input" />
        </label>
        <label className="label">
          Bulan
          <select name="month" defaultValue={month} className="input">
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>
        </label>
        <button className="btn">Tampilkan</button>
      </form>

      <ReportTable
        title={`Per bulan dalam tahun ${year}`}
        header="Bulan"
        rows={monthRows.map((r) => ({ label: r.name, count: r.count, total: r.total }))}
      />
      <ReportTable
        title={`Per hari dalam bulan ${MONTH_NAMES[month - 1]} ${year}`}
        header="Tanggal"
        rows={dayRows.map((r) => ({ label: r.date, count: r.count, total: r.total }))}
      />
      <ReportTable
        title="Per tipe garasi"
        header="Tipe garasi"
        rows={GARAGE_TYPES.map((type) => {
          const list = report.perGarageType(type);
          return { label: GARAGE_TYPE_LABEL[type], count: list.length, total: sumTotal(list) };
        })}
      />
      <ReportTable
        title="Per penyewa"
        header="Penyewa"
        rows={tenants.map((t) => {
          const list = report.perTenant(t.id);
          return { label: t.fullName, count: list.length, total: sumTotal(list) };
        })}
      />
    </main>
  );
}

type Row = { label: string; count: number; total: number };

/** One report table: label, number of rentals, total income. */
function ReportTable({ title, header, rows }: { title: string; header: string; rows: Row[] }) {
  return (
    <section className="card">
      <h2 className="font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p>Tidak ada data.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>{header}</th><th>Jumlah sewa</th><th>Total pendapatan</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td>{r.count}</td>
                <td>{formatRupiah(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
