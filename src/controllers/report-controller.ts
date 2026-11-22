// Report controller: builds the four rental report tables for the admin.
import { formatDate } from "@/lib/dates";
import prisma from "@/lib/prisma";
import { RentalReport, sumExtensions, sumTotal, type ReportRental } from "@/models/rental-report";
import { GARAGE_TYPE_LABEL, GARAGE_TYPES } from "@/models/types";

export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/**
 * One line of a report table: a label, how many rentals, income from new rentals,
 * income from extensions, and both together.
 */
export type ReportRow = { label: string; count: number; rentalTotal: number; extensionTotal: number; total: number };

/** Turns a label and a list of rentals into one report line. */
function toRow(label: string, rentals: ReportRental[]): ReportRow {
  const rentalTotal = sumTotal(rentals);
  const extensionTotal = sumExtensions(rentals);
  return { label, count: rentals.length, rentalTotal, extensionTotal, total: rentalTotal + extensionTotal };
}

/** Use case "View rental report": per month (in a year), per day (in a month), per garage type, per tenant. */
export async function getRentalReport(year: number, month: number) {
  const rentals = await prisma.rental.findMany({
    include: { garage: true, extensions: { select: { amountDue: true } } },
    orderBy: { startDate: "asc" },
  });
  const tenants = await prisma.user.findMany({ where: { role: "TENANT" }, orderBy: { fullName: "asc" } });
  const report = new RentalReport(rentals);

  // Per month: the rentals of the chosen year, grouped by month
  const yearRentals = report.perMonth(year);
  const perMonth = MONTH_NAMES.map((name, i) =>
    toRow(name, yearRentals.filter((r) => r.startDate.getUTCMonth() === i)),
  );

  // Per day: the rentals of the chosen month, grouped by start date
  const monthRentals = report.perDay(year, month);
  const dates = [...new Set(monthRentals.map((r) => formatDate(r.startDate)))];
  const perDay = dates.map((date) =>
    toRow(date, monthRentals.filter((r) => formatDate(r.startDate) === date)),
  );

  // Per garage type and per tenant
  const perGarageType = GARAGE_TYPES.map((type) => toRow(GARAGE_TYPE_LABEL[type], report.perGarageType(type)));
  const perTenant = tenants.map((t) => toRow(t.fullName, report.perTenant(t.id)));

  return { perMonth, perDay, perGarageType, perTenant };
}
