// Demo data for the presentation and report screenshots.
// Run after "npm run seed" with: npm run seed:demo
// Prices are calculated with the same model classes the app uses.
import "dotenv/config";
import { copyFile, mkdir } from "fs/promises";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { Garage } from "../src/models/garage";
import { Rental } from "../src/models/rental";
import { RentalExtension } from "../src/models/rental-extension";
import type { GarageStatus, GarageType, RentalType, VehicleType } from "../src/models/types";
import { createVehicle } from "../src/models/vehicle";
import { PrismaClient } from "../src/generated/prisma/client";
import { addDays, today } from "../src/lib/dates";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const DEMO_PASSWORD = "penyewa123"; // test password for the demo tenants only

async function saveProof(name: string): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await copyFile(path.join(process.cwd(), "prisma", "demo-proof.png"), path.join(dir, name));
  return `/uploads/${name}`;
}

async function addTenant(nik: string, fullName: string, phone: string, email: string, status: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      nik, fullName, phone, email, status, role: "TENANT",
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
    },
  });
}

async function addRental(
  userId: number,
  vehicle: { type: VehicleType; plate: string | null; brand: string; battery: number | null; percent: number | null },
  garageId: string,
  rentalType: RentalType,
  days: number | null,
  startDate: Date,
) {
  const g = await prisma.garage.findUniqueOrThrow({ where: { id: garageId } });
  const garage = new Garage(g.id, g.type as GarageType, g.dailyPrice, g.kwhPrice ?? 0, g.status as GarageStatus);
  const vehicleModel = createVehicle(vehicle.type, 0, vehicle.plate, vehicle.brand, vehicle.battery, vehicle.percent);
  const rental = new Rental(0, rentalType, days, startDate, garage, vehicleModel);
  rental.calculateTotal();

  const savedVehicle = await prisma.vehicle.create({
    data: { userId, type: vehicle.type, plateNumber: vehicle.plate, brandModel: vehicle.brand, batteryKwh: vehicle.battery, batteryPercent: vehicle.percent },
  });
  const saved = await prisma.rental.create({
    data: {
      userId, vehicleId: savedVehicle.id, garageId, rentalType, days,
      startDate: rental.startDate, endDate: rental.endDate,
      rentalCost: rental.rentalCost, chargingCost: rental.chargingCost, totalCost: rental.totalCost,
      paymentProofUrl: await saveProof(`demo-sewa-${garageId}.png`),
    },
  });
  if (rental.isActiveOn(today())) {
    garage.markUsed();
    await prisma.garage.update({ where: { id: garageId }, data: { status: garage.status } });
  }
  return { saved, rental };
}

async function main() {
  if ((await prisma.rental.count()) > 0) {
    console.log("Demo data skipped: rentals already exist.");
    return;
  }

  const budi = await addTenant("3171010101900001", "Budi Santoso", "081211110001", "budi@contoh.test", "APPROVED");
  const siti = await addTenant("3171010101900002", "Siti Rahmawati", "081211110002", "siti@contoh.test", "APPROVED");
  await addTenant("3171010101900003", "Andi Wijaya", "081211110003", "andi@contoh.test", "PENDING");

  const now = today();
  const car = { type: "CAR" as VehicleType, plate: "B 1234 KJA", brand: "Toyota Avanza", battery: null, percent: null };
  const ev = { type: "EV" as VehicleType, plate: "B 2025 EVL", brand: "Hyundai Ioniq 5", battery: 72, percent: 25 }; // 25% left: charge 54 kWh
  const bike = { type: "BICYCLE" as VehicleType, plate: null, brand: "Polygon Path", battery: null, percent: null };
  const moto = { type: "MOTORCYCLE" as VehicleType, plate: "B 4321 MTR", brand: "Honda Beat", battery: null, percent: null };

  // Active today (shown on the extension page)
  const { saved, rental } = await addRental(budi.id, car, "C001", "DAILY", 3, now);
  await addRental(siti.id, ev, "E001", "MONTHLY", null, now);
  // Earlier rentals (finished, for the reports)
  await addRental(budi.id, bike, "S001", "DAILY", 2, addDays(now, -40));
  await addRental(siti.id, moto, "S002", "DAILY", 5, addDays(now, -75));

  // One extension of Budi's car rental: +2 days
  const extension = new RentalExtension(0, rental, addDays(rental.endDate, 2));
  extension.calculateRemainingCost();
  await prisma.rentalExtension.create({
    data: {
      rentalId: saved.id, oldEndDate: extension.oldEndDate, newEndDate: extension.newEndDate,
      amountDue: extension.amountDue, paymentProofUrl: await saveProof("demo-perpanjang-C001.png"),
    },
  });
  await prisma.rental.update({ where: { id: saved.id }, data: { endDate: extension.newEndDate } });

  console.log("Demo data added (3 tenants, 4 rentals, 1 extension).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
