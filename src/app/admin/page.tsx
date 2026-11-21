import * as userController from "@/controllers/user-controller";
import { approveTenant, rejectTenant } from "./actions";

// Page /admin (admin only, checked by the middleware): accept or reject new tenants.
export default async function AdminPage() {
  const pending = await userController.listPendingTenants();

  return (
    <main className="page">
      <h1 className="text-2xl font-bold">Verifikasi Pendaftar Baru</h1>

      <section className="card">
        {pending.length === 0 ? (
          <p>Tidak ada pendaftar baru.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>NIK</th><th>Nama</th><th>Telepon</th><th>Email</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u.id}>
                  <td>{u.nik}</td>
                  <td>{u.fullName}</td>
                  <td>{u.phone}</td>
                  <td>{u.email}</td>
                  <td className="flex gap-2">
                    <form action={approveTenant}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button className="btn">Terima</button>
                    </form>
                    <form action={rejectTenant}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button className="btn-light">Tolak</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
