import { describe, expect, it } from "vitest";
import { Garage } from "@/domain/garage";
import { Rental } from "@/domain/rental";
import { RentalExtension } from "@/domain/rental-extension";
import { Car } from "@/domain/vehicle";
import { parseDate } from "@/lib/dates";

// A daily rental of 3 days from 2026-11-21, so it ends on 2026-11-24.
function makeRental(): Rental {
  const garage = new Garage("C001", "CAR", 10000, 0, "USED");
  return new Rental(1, "DAILY", 3, parseDate("2026-11-21"), garage, new Car(1, "B 1 A", "Honda Jazz"));
}

describe("RentalExtension.calculateRemainingCost", () => {
  it("UT-09 extend 2 days: 2 x Rp10.000 = Rp20.000", () => {
    const extension = new RentalExtension(1, makeRental(), parseDate("2026-11-26"));
    expect(extension.calculateRemainingCost()).toBe(20000);
    expect(extension.amountDue).toBe(20000);
  });

  it("UT-10 the same end date is rejected", () => {
    const extension = new RentalExtension(1, makeRental(), parseDate("2026-11-24"));
    expect(() => extension.calculateRemainingCost()).toThrow();
  });

  it("UT-11 an earlier end date is rejected, so the amount is never negative", () => {
    const extension = new RentalExtension(1, makeRental(), parseDate("2026-11-22"));
    expect(() => extension.calculateRemainingCost()).toThrow();
    expect(extension.amountDue).toBe(0);
  });
});
