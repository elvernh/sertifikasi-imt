// Auth controller: register a tenant and check a login.
// Each function throws an Error with an Indonesian message when something is wrong.
import bcrypt from "bcryptjs";
import { toUser } from "@/lib/mappers";
import prisma from "@/lib/prisma";
import type { User } from "@/models/user";

export type RegisterInput = {
  nik: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
};

/** Use case "Register": save a new tenant with status PENDING (waits for the admin). */
export async function registerTenant(input: RegisterInput): Promise<void> {
  // 1. Check the form values
  if (!/^[0-9]{16}$/.test(input.nik)) throw new Error("NIK harus 16 digit angka.");
  if (!input.fullName || !input.phone) throw new Error("Nama dan nomor telepon wajib diisi.");
  if (input.password.length < 6) throw new Error("Password minimal 6 karakter.");

  // 2. Email and NIK must not be used yet
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { nik: input.nik }] },
  });
  if (existing) throw new Error("Email atau NIK sudah terdaftar.");

  // 3. Save the user (the password is stored as a hash, never as plain text)
  await prisma.user.create({
    data: {
      nik: input.nik,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10),
      role: "TENANT",
      status: "PENDING",
    },
  });
}

/** Use case "Log in": returns the user if the email and password are right. */
export async function checkLogin(email: string, password: string): Promise<User> {
  const row = await prisma.user.findUnique({ where: { email } });
  if (!row) throw new Error("Email atau password salah.");

  const user = toUser(row);
  if (!(await user.checkPassword(password))) throw new Error("Email atau password salah.");
  return user;
}
