import { describe, expect, it } from "vitest";
import { Garage } from "@/models/garage";
import { Rental } from "@/models/rental";
import { RentalExtension } from "@/models/rental-extension";
import { Car } from "@/models/vehicle";
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

describe("RentalExtension month pricing", () => {
  // A daily rental of 1 day from 2026-11-21 (ends 2026-11-22) in a Rp20.000/day garage.
  function oneDayRental(): Rental {
    const garage = new Garage("C001", "CAR", 20000, 0, "USED");
    return new Rental(1, "DAILY", 1, parseDate("2026-11-21"), garage, new Car(1, "B 1 A", "Honda Jazz"));
  }

  it("UT-40 extend 31 days from 22 Nov = 1 month + 1 day = Rp500.000 + Rp20.000 = Rp520.000", () => {
    const extension = new RentalExtension(1, oneDayRental(), parseDate("2026-12-23"));
    expect(RentalExtension.costFor(extension.oldEndDate, extension.newEndDate, 20000)).toEqual({
      months: 1,
      days: 1,
      amount: 520000,
    });
    expect(extension.calculateRemainingCost()).toBe(520000);
  });

  it("UT-41 extend exactly 1 month (22 Nov -> 22 Dec, 30 days) = 25 x Rp20.000 = Rp500.000", () => {
    const extension = new RentalExtension(1, oneDayRental(), parseDate("2026-12-22"));
    expect(extension.calculateRemainingCost()).toBe(500000);
  });

  it("UT-42 months follow the calendar: 31 Jan -> 3 Apr = 2 months (28 Feb, 31 Mar) + 3 days", () => {
    expect(RentalExtension.costFor(parseDate("2027-01-31"), parseDate("2027-04-03"), 10000)).toEqual({
      months: 2,
      days: 3,
      amount: 2 * 250000 + 3 * 10000,
    });
  });

  it("UT-43 leftover days never cost more than 1 month: 24 days = Rp480.000, 27 days = Rp500.000", () => {
    expect(RentalExtension.costFor(parseDate("2026-11-22"), parseDate("2026-12-16"), 20000).amount).toBe(480000);
    expect(RentalExtension.costFor(parseDate("2026-11-22"), parseDate("2026-12-19"), 20000).amount).toBe(500000);
  });
});
