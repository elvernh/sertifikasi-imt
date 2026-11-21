import { register } from "./actions";

// Page /register (public): a new tenant signs up.
export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { error } = await searchParams;

  return (
    <main className="page max-w-md">
      <h1 className="text-2xl font-bold">Daftar sebagai Penyewa</h1>
      {error && <p className="error">{error}</p>}

      <form action={register} className="card">
        <label className="label">
          NIK (Nomor KTP, 16 digit)
          <input name="nik" required pattern="[0-9]{16}" className="input" />
        </label>
        <label className="label">
          Nama lengkap
          <input name="fullName" required className="input" />
        </label>
        <label className="label">
          Nomor telepon
          <input name="phone" required className="input" />
        </label>
        <label className="label">
          Email (sebagai username)
          <input name="email" type="email" required className="input" />
        </label>
        <label className="label">
          Password (minimal 6 karakter)
          <input name="password" type="password" required minLength={6} className="input" />
        </label>
        <button className="btn">Daftar</button>
      </form>
    </main>
  );
}
