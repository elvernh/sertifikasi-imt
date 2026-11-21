// Extension controller: the admin moves a rental's end date and records the payment.
import { parseDate, today } from "@/lib/dates";
import { toRental } from "@/lib/mappers";
import prisma from "@/lib/prisma";
import { saveUpload } from "@/lib/upload";
import { Garage } from "@/models/garage";
import { RentalExtension } from "@/models/rental-extension";

/** One rental with its garage, vehicle and tenant (null if the id does not exist). */
export async function getRentalForExtension(rentalId: number) {
  return prisma.rental.findUnique({
    where: { id: rentalId },
    include: { garage: true, vehicle: true, user: true },
  });
}

/**
 * Use case "Extend rental": calculate the remaining cost, save the extension
 * and move the rental's end date. Returns the amount to pay.
 */
export async function extendRental(
  rentalId: number,
  newEndDateText: string,
  paymentProof: FormDataEntryValue | null,
): Promise<number> {
  // 1. The rental must exist and be running today
  if (!newEndDateText) throw new Error("Tanggal selesai baru wajib diisi.");
  const row = await getRentalForExtension(rentalId);
  if (!row) throw new Error("Data sewa tidak ditemukan.");
  const rental = toRental(row);
  if (!rental.isActiveOn(today())) throw new Error("Sewa ini tidak sedang berjalan hari ini.");

  // 2. Remaining cost = extra days x daily price (throws if the new date is not later)
  const extension = new RentalExtension(0, rental, parseDate(newEndDateText));
  const amountDue = extension.calculateRemainingCost();

  // 3. The extra days must not clash with another booking of the same garage
  const otherBookings = await prisma.rental.findMany({
    where: { garageId: row.garageId, id: { not: row.id } },
    select: { startDate: true, endDate: true },
  });
  if (!Garage.isFreeBetween(otherBookings, extension.oldEndDate, extension.newEndDate)) {
    throw new Error("Garasi sudah dipesan penyewa lain pada tanggal tersebut.");
  }

  // 4. Save the payment proof, the extension and the new end date
  const paymentProofUrl = await saveUpload(paymentProof);
  await prisma.$transaction([
    prisma.rentalExtension.create({
      data: {
        rentalId: rental.id,
        oldEndDate: extension.oldEndDate,
        newEndDate: extension.newEndDate,
        amountDue,
        paymentProofUrl,
      },
    }),
    prisma.rental.update({ where: { id: rental.id }, data: { endDate: extension.newEndDate } }),
  ]);

  return amountDue;
}
