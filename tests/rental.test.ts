import { describe, expect, it } from "vitest";
import { Garage } from "@/domain/garage";
import { Rental } from "@/domain/rental";
import { Car, ElectricCar } from "@/domain/vehicle";
import { formatDate, parseDate } from "@/lib/dates";

const START = parseDate("2026-11-21");
const carGarage = (price: number) => new Garage("C001", "CAR", price, 0, "AVAILABLE");
const evGarage = (price: number, kwh: number) => new Garage("E001", "EV", price, kwh, "AVAILABLE");
const car = new Car(1, "B 1234 CD", "Toyota Avanza");
const ev = new ElectricCar(2, "B 5678 EF", "Hyundai Ioniq 5", 60);

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

  it("UT-05 daily rental of 0 or 31 days is rejected, 30 days is allowed", () => {
    expect(() => new Rental(1, "DAILY", 0, START, carGarage(10000), car)).toThrow();
    expect(() => new Rental(1, "DAILY", 31, START, carGarage(10000), car)).toThrow();
    expect(new Rental(1, "DAILY", 30, START, carGarage(10000), car).calculateTotal()).toBe(300000);
  });
});

describe("Rental.calculateEndDate", () => {
  it("UT-06 daily: start 2026-11-21 + 3 days = 2026-11-24", () => {
    const rental = new Rental(1, "DAILY", 3, START, carGarage(10000), car);
    expect(formatDate(rental.calculateEndDate())).toBe("2026-11-24");
  });

  it("UT-07 monthly: start 2026-11-21 + 30 days = 2026-12-21", () => {
    const rental = new Rental(1, "MONTHLY", null, START, carGarage(10000), car);
    expect(formatDate(rental.calculateEndDate())).toBe("2026-12-21");
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
