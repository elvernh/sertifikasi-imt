"use server";

import { redirect } from "next/navigation";
import { Garage } from "@/domain/garage";
import type { GarageType } from "@/domain/types";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

function fail(message: string): never {
  redirect("/admin/garages?error=" + encodeURIComponent(message));
}

/** Use case "Create garages": IDs continue from the last garage of the same type. */
export async function createGarages(formData: FormData): Promise<void> {
  await requireAdmin();

  const type = String(formData.get("type")) as GarageType;
  const count = Number(formData.get("count"));
  const dailyPrice = Number(formData.get("dailyPrice"));
  const kwhPrice = type === "EV" ? Number(formData.get("kwhPrice")) : null;

  if (!(dailyPrice > 0)) fail("Harga sewa harian harus lebih dari 0.");
  if (type === "EV" && !(kwhPrice && kwhPrice > 0)) fail("Garasi mobil listrik wajib punya harga per kWh.");

  // Find the biggest number used so far for this type, e.g. C009 -> 9
  const existing = await prisma.garage.findMany({ where: { type }, select: { id: true } });
  const lastNumber = Math.max(0, ...existing.map((g) => Number(g.id.slice(1))));

  let ids: string[] = [];
  try {
    ids = Garage.generateIds(type, lastNumber, count);
  } catch (e) {
    fail((e as Error).message);
  }

  await prisma.garage.createMany({
    data: ids.map((id) => ({ id, type, dailyPrice, kwhPrice, status: "AVAILABLE" })),
  });

  redirect(`/admin/garages?created=${ids.length}`);
}
