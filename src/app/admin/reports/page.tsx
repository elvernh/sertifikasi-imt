import * as reportController from "@/controllers/report-controller";
import { MONTH_NAMES, type ReportRow } from "@/controllers/report-controller";
import { today } from "@/lib/dates";
import { formatRupiah } from "@/lib/format";

// Page /admin/reports (admin only): per month, per day, per garage type, per tenant.
export default async function ReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  const params = await searchParams;
  const year = Number(params.year) || today().getUTCFullYear();
  const month = Number(params.month) || today().getUTCMonth() + 1;
  const report = await reportController.getRentalReport(year, month);

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

      <p className="text-sm">
        Biaya perpanjangan dihitung bersama sewanya (bulan dan tanggal mengikuti tanggal mulai sewa).
      </p>
      <ReportTable title={`Per bulan dalam tahun ${year}`} header="Bulan" rows={report.perMonth} />
      <ReportTable title={`Per hari dalam bulan ${MONTH_NAMES[month - 1]} ${year}`} header="Tanggal" rows={report.perDay} />
      <ReportTable title="Per tipe garasi" header="Tipe garasi" rows={report.perGarageType} />
      <ReportTable title="Per penyewa" header="Penyewa" rows={report.perTenant} />
    </main>
  );
}

/** One report table: label, number of rentals, income from new rentals and extensions, total income. */
function ReportTable({ title, header, rows }: { title: string; header: string; rows: ReportRow[] }) {
  return (
    <section className="card">
      <h2 className="font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p>Tidak ada data.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>{header}</th><th>Jumlah sewa</th><th>Sewa baru</th>
              <th>Perpanjangan</th><th>Total pendapatan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td>{r.count}</td>
                <td>{formatRupiah(r.rentalTotal)}</td>
                <td>{formatRupiah(r.extensionTotal)}</td>
                <td>{formatRupiah(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
