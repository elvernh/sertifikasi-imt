"use server";

import { redirect } from "next/navigation";
import { RentalExtension } from "@/domain/rental-extension";
import { requireAdmin } from "@/lib/auth";
import { parseDate } from "@/lib/dates";
import { toRental } from "@/lib/mappers";
import prisma from "@/lib/prisma";
import { saveUpload } from "@/lib/upload";

type FormState = { error: string };

/** Use case "Extend rental": calculate the remaining cost, save it, move the end date. */
export async function extendRental(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const rentalId = Number(formData.get("rentalId"));
  const newEndDateText = String(formData.get("newEndDate") ?? "");
  if (!newEndDateText) return { error: "Tanggal selesai baru wajib diisi." };

  const row = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: { garage: true, vehicle: true },
  });
  if (!row) return { error: "Data sewa tidak ditemukan." };

  const rental = toRental(row);
  const extension = new RentalExtension(0, rental, parseDate(newEndDateText));

  let paymentProofUrl: string;
  try {
    extension.calculateRemainingCost(); // throws if the new date is not after the old one
    paymentProofUrl = await saveUpload(formData.get("paymentProof"));
  } catch (e) {
    return { error: (e as Error).message };
  }

  await prisma.$transaction([
    prisma.rentalExtension.create({
      data: {
        rentalId: rental.id,
        oldEndDate: extension.oldEndDate,
        newEndDate: extension.newEndDate,
        amountDue: extension.amountDue,
        paymentProofUrl,
      },
    }),
    prisma.rental.update({ where: { id: rental.id }, data: { endDate: extension.newEndDate } }),
  ]);

  redirect("/admin/extend?saved=1");
}
