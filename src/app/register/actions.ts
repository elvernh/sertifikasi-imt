"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

function fail(message: string): never {
  redirect("/register?error=" + encodeURIComponent(message));
}

/** Use case "Register": a new tenant signs up and waits for admin approval. */
export async function register(formData: FormData): Promise<void> {
  const nik = String(formData.get("nik")).trim();
  const fullName = String(formData.get("fullName")).trim();
  const phone = String(formData.get("phone")).trim();
  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password"));

  if (!/^[0-9]{16}$/.test(nik)) fail("NIK harus 16 digit angka.");
  if (!fullName || !phone) fail("Nama dan nomor telepon wajib diisi.");
  if (password.length < 6) fail("Password minimal 6 karakter.");

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { nik }] } });
  if (existing) fail("Email atau NIK sudah terdaftar.");

  await prisma.user.create({
    data: {
      nik,
      fullName,
      phone,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "TENANT",
      status: "PENDING",
    },
  });

  redirect("/login?registered=1");
}
