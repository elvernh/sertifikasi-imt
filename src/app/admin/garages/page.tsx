import * as garageController from "@/controllers/garage-controller";
import { formatRupiah } from "@/lib/format";
import { GARAGE_TYPE_LABEL, GARAGE_TYPES, type GarageType } from "@/models/types";
import { createGarages } from "./actions";

// Page /admin/garages (admin only): create garages and see all garages.
export default async function GaragesPage({ searchParams }: PageProps<"/admin/garages">) {
  const { error, created } = await searchParams;
  const garages = await garageController.listGarages();

  return (
    <main className="page">
      <h1 className="text-2xl font-bold">Garasi</h1>
      {error && <p className="error">{error}</p>}
      {created && <p className="success">{created} garasi baru berhasil dibuat.</p>}

      <form action={createGarages} className="card">
        <h2 className="font-bold">Buat Garasi Baru</h2>
        <label className="label">
          Tipe garasi
          <select name="type" className="input">
            {GARAGE_TYPES.map((t) => (
              <option key={t} value={t}>{GARAGE_TYPE_LABEL[t]}</option>
            ))}
          </select>
        </label>
        <label className="label">
          Jumlah garasi (maksimum 999 per tipe)
          <input name="count" type="number" min={1} max={999} required className="input" />
        </label>
        <label className="label">
          Harga sewa harian (Rp)
          <input name="dailyPrice" type="number" min={1} required className="input" />
        </label>
        <label className="label">
          Harga isi listrik per kWh (Rp) - hanya untuk Garasi Mobil Listrik
          <input name="kwhPrice" type="number" min={1} className="input" />
        </label>
        <button className="btn">Buat Garasi</button>
      </form>

      <section className="card">
        <h2 className="font-bold">Daftar Garasi ({garages.length})</h2>
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Tipe</th><th>Harga / hari</th><th>Harga / kWh</th><th>Status</th></tr>
          </thead>
          <tbody>
            {garages.map((g) => (
              <tr key={g.id}>
                <td>{g.id}</td>
                <td>{GARAGE_TYPE_LABEL[g.type as GarageType]}</td>
                <td>{formatRupiah(g.dailyPrice)}</td>
                <td>{g.kwhPrice ? formatRupiah(g.kwhPrice) : "-"}</td>
                <td>{g.status === "USED" ? "Dipakai" : "Tersedia"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
