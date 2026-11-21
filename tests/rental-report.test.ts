import { describe, expect, it } from "vitest";
import { RentalReport, sumTotal, type ReportRental } from "@/domain/rental-report";
import { parseDate } from "@/lib/dates";

const rentals: ReportRental[] = [
  { id: 1, userId: 1, garageId: "C001", startDate: parseDate("2026-11-01"), totalCost: 30000, garage: { type: "CAR" } },
  { id: 2, userId: 2, garageId: "E001", startDate: parseDate("2026-11-15"), totalCost: 135000, garage: { type: "EV" } },
  { id: 3, userId: 1, garageId: "S001", startDate: parseDate("2026-10-05"), totalCost: 5000, garage: { type: "BICYCLE" } },
  { id: 4, userId: 2, garageId: "C002", startDate: parseDate("2025-11-01"), totalCost: 20000, garage: { type: "CAR" } },
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
});
