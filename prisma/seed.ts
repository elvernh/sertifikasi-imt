// Fills the database with an admin account and a few sample garages.
// Run with: npm run seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { Garage } from "../src/domain/garage";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@garasi.test";
  const password = process.env.ADMIN_PASSWORD ?? "change-me";

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      nik: "0000000000000000",
      fullName: "Admin",
      phone: "0000",
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN",
      status: "APPROVED",
    },
  });

  // Sample garages, only if there are none yet.
  if ((await prisma.garage.count()) === 0) {
    const samples = [
      { ids: Garage.generateIds("BICYCLE", 0, 3), type: "BICYCLE", dailyPrice: 5000, kwhPrice: null },
      { ids: Garage.generateIds("CAR", 0, 3), type: "CAR", dailyPrice: 20000, kwhPrice: null },
      { ids: Garage.generateIds("EV", 0, 2), type: "EV", dailyPrice: 30000, kwhPrice: 2500 },
    ];
    for (const s of samples) {
      await prisma.garage.createMany({
        data: s.ids.map((id) => ({ id, type: s.type, dailyPrice: s.dailyPrice, kwhPrice: s.kwhPrice, status: "AVAILABLE" })),
      });
    }
  }

  console.log(`Seed done. Admin login: ${email} (password is ADMIN_PASSWORD in .env)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
