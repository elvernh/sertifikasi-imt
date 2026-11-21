import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, registered } = await searchParams;

  return (
    <main className="page max-w-md">
      <h1 className="text-2xl font-bold">Masuk</h1>
      {registered && (
        <p className="success">Pendaftaran berhasil. Tunggu verifikasi admin, lalu masuk.</p>
      )}
      {error && <p className="error">{error}</p>}

      <form action={login} className="card">
        <label className="label">
          Email
          <input name="email" type="email" required className="input" />
        </label>
        <label className="label">
          Password
          <input name="password" type="password" required className="input" />
        </label>
        <button className="btn">Masuk</button>
      </form>

      <p>
        Belum punya akun? <Link href="/register" className="underline">Daftar sebagai penyewa</Link>
      </p>
    </main>
  );
}
