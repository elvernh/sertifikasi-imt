// Saves an uploaded payment proof image into public/uploads.
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Saves the image and returns its URL, e.g. "/uploads/1700000000-bukti.png". */
export async function saveUpload(file: FormDataEntryValue | null): Promise<string> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Bukti pembayaran wajib diupload.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Bukti pembayaran harus berupa gambar.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const fileName = `${Date.now()}-${safeName}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${fileName}`;
}
