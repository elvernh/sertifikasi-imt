// Garage controller: create garages, list them and keep their status up to date.
import { formatDate, today } from "@/lib/dates";
import { toGarage } from "@/lib/mappers";
import prisma from "@/lib/prisma";
import { Garage } from "@/models/garage";
import type { GarageType } from "@/models/types";

/**
 * Use case "Create garages": make `count` garages of one type at once.
 * The IDs continue after the last garage of that type (C009 -> C010, C011).
 * Returns how many garages were made.
 */
export async function createGarages(
  type: GarageType,
  count: number,
  dailyPrice: number,
  kwhPrice: number | null,
): Promise<number> {
  // 1. Check the form values
  if (!Number.isInteger(count)) throw new Error("Jumlah garasi harus bilangan bulat.");
  if (!(dailyPrice > 0)) throw new Error("Harga sewa harian harus lebih dari 0.");
  if (type === "EV" && !(kwhPrice && kwhPrice > 0)) {
    throw new Error("Garasi mobil listrik wajib punya harga per kWh.");
  }

  // 2. Find the biggest number used so far for this type, e.g. C009 -> 9
  const existing = await prisma.garage.findMany({ where: { type }, select: { id: true } });
  const lastNumber = Math.max(0, ...existing.map((g) => Number(g.id.slice(1))));

  // 3. Make the new IDs (the Garage class checks the 1..999 limit)
  const ids = Garage.generateIds(type, lastNumber, count);

  // 4. Save all of them
  await prisma.garage.createMany({
    data: ids.map((id) => ({
      id,
      type,
      dailyPrice,
      kwhPrice: type === "EV" ? kwhPrice : null,
      status: "AVAILABLE",
    })),
  });
  return ids.length;
}

/**
 * Sets each garage to USED while one of its rentals is running today, otherwise AVAILABLE.
 * (A rental booked for a later date only makes the garage USED once it starts.)
 */
export async function updateGarageStatuses(): Promise<void> {
  const now = today();
  const rows = await prisma.garage.findMany({
    include: { rentals: { select: { startDate: true, endDate: true } } },
  });

  for (const row of rows) {
    const garage = toGarage(row);
    const usedToday = row.rentals.some((r) => r.startDate <= now && now < r.endDate);
    if (usedToday) garage.markUsed();
    else garage.markAvailable();

    if (garage.status !== row.status) {
      await prisma.garage.update({ where: { id: garage.id }, data: { status: garage.status } });
    }
  }
}

/** All garages with an up-to-date status (admin garage page). */
export async function listGarages() {
  await updateGarageStatuses();
  return prisma.garage.findMany({ orderBy: { id: "asc" } });
}

/**
 * Garages for the new rental form, each with its upcoming bookings,
 * so the form can show only the garages that are free for the chosen period.
 */
export async function listGaragesForRentForm() {
  await updateGarageStatuses();
  const rows = await prisma.garage.findMany({
    orderBy: { id: "asc" },
    include: {
      rentals: {
        where: { endDate: { gt: today() } }, // finished rentals don't matter any more
        select: { startDate: true, endDate: true },
      },
    },
  });

  return rows.map((g) => ({
    id: g.id,
    type: g.type,
    dailyPrice: g.dailyPrice,
    kwhPrice: g.kwhPrice ?? 0,
    bookings: g.rentals.map((r) => ({ start: formatDate(r.startDate), end: formatDate(r.endDate) })),
  }));
}
