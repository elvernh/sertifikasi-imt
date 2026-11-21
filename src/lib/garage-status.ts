// Makes garages available again when their rentals are finished.
import prisma from "./prisma";
import { today } from "./dates";
import { toGarage, toRental } from "./mappers";

export async function releaseFinishedGarages(): Promise<void> {
  const usedGarages = await prisma.garage.findMany({
    where: { status: "USED" },
    include: { rentals: { include: { garage: true, vehicle: true } } },
  });

  for (const row of usedGarages) {
    const stillRented = row.rentals.some((r) => toRental(r).isActiveOn(today()));
    if (!stillRented) {
      const garage = toGarage(row);
      garage.markAvailable();
      await prisma.garage.update({ where: { id: garage.id }, data: { status: garage.status } });
    }
  }
}
