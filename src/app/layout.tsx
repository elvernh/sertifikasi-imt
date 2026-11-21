import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { logout } from "./actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sewa Garasi",
  description: "Aplikasi penyewaan garasi kendaraan",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();

  return (
    <html lang="id">
      <body className="min-h-screen">
        <nav className="bg-black text-white px-6 py-3 flex flex-wrap gap-4 items-center">
          <Link href="/" className="font-bold">Sewa Garasi</Link>

          {session?.role === "ADMIN" && (
            <>
              <Link href="/admin">Verifikasi Pendaftar</Link>
              <Link href="/admin/garages">Garasi</Link>
              <Link href="/admin/extend">Perpanjang Sewa</Link>
              <Link href="/admin/reports">Laporan</Link>
            </>
          )}

          {session?.role === "TENANT" && (
            <>
              <Link href="/tenant">Sewa Saya</Link>
              <Link href="/tenant/rent">Sewa Baru</Link>
            </>
          )}

          <div className="ml-auto">
            {session ? (
              <form action={logout}>
                <button className="underline">Keluar</button>
              </form>
            ) : (
              <div className="flex gap-4">
                <Link href="/login">Masuk</Link>
                <Link href="/register">Daftar</Link>
              </div>
            )}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
