import { describe, expect, it } from "vitest";
import { Garage } from "@/models/garage";
import { Rental } from "@/models/rental";
import { Car, ElectricCar } from "@/models/vehicle";
import { formatDate, parseDate } from "@/lib/dates";

const START = parseDate("2026-11-21");
const carGarage = (price: number) => new Garage("C001", "CAR", price, 0, "AVAILABLE");
const evGarage = (price: number, kwh: number) => new Garage("E001", "EV", price, kwh, "AVAILABLE");
const car = new Car(1, "B 1234 CD", "Toyota Avanza");
const ev = new ElectricCar(2, "B 5678 EF", "Hyundai Ioniq 5", 60, 0);

describe("Rental.calculateTotal", () => {
  it("UT-01 daily rental: 3 days x Rp10.000 = Rp30.000", () => {
    const rental = new Rental(1, "DAILY", 3, START, carGarage(10000), car);
    expect(rental.calculateTotal()).toBe(30000);
    expect(rental.rentalCost).toBe(30000);
    expect(rental.chargingCost).toBe(0);
  });

  it("UT-02 monthly rental: 25 x Rp10.000 = Rp250.000", () => {
    const rental = new Rental(1, "MONTHLY", null, START, carGarage(10000), car);
    expect(rental.calculateTotal()).toBe(250000);
  });

  it("UT-03 electric car in EV garage: Rp15.000 + 60 kWh x Rp2.000 = Rp135.000", () => {
    const rental = new Rental(1, "DAILY", 1, START, evGarage(15000, 2000), ev);
    expect(rental.calculateTotal()).toBe(135000);
    expect(rental.rentalCost).toBe(15000);
    expect(rental.chargingCost).toBe(120000);
  });

  it("UT-04 electric car in normal car garage is not charged", () => {
    const rental = new Rental(1, "DAILY", 1, START, carGarage(15000), ev);
    expect(rental.calculateTotal()).toBe(15000);
    expect(rental.chargingCost).toBe(0);
  });

  it("UT-05 November start: 0 or 31 days is rejected, 30 days is allowed", () => {
    expect(() => new Rental(1, "DAILY", 0, START, carGarage(10000), car)).toThrow();
    expect(() => new Rental(1, "DAILY", 31, START, carGarage(10000), car)).toThrow();
    expect(new Rental(1, "DAILY", 30, START, carGarage(10000), car).calculateTotal()).toBe(300000);
  });

  it("UT-32 max daily days follows the start month (Feb 28, leap Feb 29, Dec 31)", () => {
    const feb = parseDate("2027-02-10");
    expect(() => new Rental(1, "DAILY", 29, feb, carGarage(10000), car)).toThrow("1 sampai 28");
    expect(new Rental(1, "DAILY", 28, feb, carGarage(10000), car).calculateTotal()).toBe(280000);
    expect(Rental.maxDailyDays(parseDate("2028-02-01"))).toBe(29);
    expect(Rental.maxDailyDays(parseDate("2026-12-05"))).toBe(31);
  });
});

describe("Rental.calculateEndDate", () => {
  it("UT-06 daily: start 2026-11-21 + 3 days = 2026-11-24", () => {
    const rental = new Rental(1, "DAILY", 3, START, carGarage(10000), car);
    expect(formatDate(rental.calculateEndDate())).toBe("2026-11-24");
  });

  it("UT-07 monthly: start 2026-11-21 ends same date next month = 2026-12-21", () => {
    const rental = new Rental(1, "MONTHLY", null, START, carGarage(10000), car);
    expect(formatDate(rental.calculateEndDate())).toBe("2026-12-21");
  });

  it("UT-33 monthly follows the month length: Feb is 28 days, 31 Jan ends 28 Feb", () => {
    const feb = new Rental(1, "MONTHLY", null, parseDate("2027-02-10"), carGarage(10000), car);
    expect(formatDate(feb.endDate)).toBe("2027-03-10"); // 28 days
    const jan31 = new Rental(1, "MONTHLY", null, parseDate("2027-01-31"), carGarage(10000), car);
    expect(formatDate(jan31.endDate)).toBe("2027-02-28");
  });
});

describe("Rental start date chosen by the tenant", () => {
  it("UT-34 start date can be today or later, not in the past", () => {
    expect(Rental.isValidStartDate(START, START)).toBe(true);
    expect(Rental.isValidStartDate(parseDate("2026-12-25"), START)).toBe(true);
    expect(Rental.isValidStartDate(parseDate("2026-11-20"), START)).toBe(false);
    expect(Rental.isValidStartDate(parseDate(""), START)).toBe(false);
  });

  it("UT-35 future start: end date and max days follow the chosen start month", () => {
    expect(formatDate(Rental.endDateFor("DAILY", 5, parseDate("2027-02-25")))).toBe("2027-03-02");
    expect(formatDate(Rental.endDateFor("MONTHLY", null, parseDate("2027-02-25")))).toBe("2027-03-25");
    expect(() => Rental.endDateFor("DAILY", 29, parseDate("2027-02-01"))).toThrow("1 sampai 28");
  });
});

describe("Rental.isActiveOn", () => {
  it("UT-08 active from the start date until the day before the end date", () => {
    const rental = new Rental(1, "DAILY", 3, START, carGarage(10000), car); // ends 2026-11-24
    expect(rental.isActiveOn(parseDate("2026-11-20"))).toBe(false);
    expect(rental.isActiveOn(parseDate("2026-11-21"))).toBe(true);
    expect(rental.isActiveOn(parseDate("2026-11-23"))).toBe(true);
    expect(rental.isActiveOn(parseDate("2026-11-24"))).toBe(false);
  });
});
