import { describe, expect, it } from "vitest";
import { RentalReport, sumExtensions, sumTotal, type ReportRental } from "@/models/rental-report";
import { parseDate } from "@/lib/dates";

// Rental 1 was extended twice (Rp 40.000 and Rp 20.000).
const rentals: ReportRental[] = [
  { id: 1, userId: 1, garageId: "C001", startDate: parseDate("2026-11-01"), totalCost: 30000, garage: { type: "CAR" }, extensions: [{ amountDue: 40000 }, { amountDue: 20000 }] },
  { id: 2, userId: 2, garageId: "E001", startDate: parseDate("2026-11-15"), totalCost: 135000, garage: { type: "EV" }, extensions: [] },
  { id: 3, userId: 1, garageId: "S001", startDate: parseDate("2026-10-05"), totalCost: 5000, garage: { type: "BICYCLE" }, extensions: [] },
  { id: 4, userId: 2, garageId: "C002", startDate: parseDate("2025-11-01"), totalCost: 20000, garage: { type: "CAR" }, extensions: [] },
];
const report = new RentalReport(rentals);
const ids = (list: ReportRental[]) => list.map((r) => r.id);

describe("RentalReport", () => {
  it("UT-28 perMonth(2026) returns only rentals of 2026", () => {
    expect(ids(report.perMonth(2026))).toEqual([1, 2, 3]);
  });

  it("UT-29 perDay(2026, 11) returns only rentals of November 2026", () => {
    expect(ids(report.perDay(2026, 11))).toEqual([1, 2]);
  });

  it("UT-30 perGarageType('CAR') returns only car garage rentals", () => {
    expect(ids(report.perGarageType("CAR"))).toEqual([1, 4]);
  });

  it("UT-31 perTenant(2) returns only that tenant's rentals and sums them", () => {
    const list = report.perTenant(2);
    expect(ids(list)).toEqual([2, 4]);
    expect(sumTotal(list)).toBe(155000);
  });

  it("UT-44 perTenant(1) counts extension payments: new rentals Rp35.000 + extensions Rp60.000 = Rp95.000", () => {
    const list = report.perTenant(1);
    expect(sumTotal(list)).toBe(35000);
    expect(sumExtensions(list)).toBe(60000);
    expect(sumTotal(list) + sumExtensions(list)).toBe(95000);
  });
});
