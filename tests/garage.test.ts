import { describe, expect, it } from "vitest";
import { Garage } from "@/models/garage";
import { Bicycle, Car, ElectricCar, Motorcycle } from "@/models/vehicle";
import { parseDate } from "@/lib/dates";

describe("Garage.generateIds", () => {
  it("UT-12 first 3 bicycle garages are S001, S002, S003", () => {
    expect(Garage.generateIds("BICYCLE", 0, 3)).toEqual(["S001", "S002", "S003"]);
  });

  it("UT-13 car garages continue after the last one: C009 -> C010, C011", () => {
    expect(Garage.generateIds("CAR", 9, 2)).toEqual(["C010", "C011"]);
  });

  it("UT-14 maximum is 999 per type (E999 allowed, E1000 rejected)", () => {
    expect(Garage.generateIds("EV", 998, 1)).toEqual(["E999"]);
    expect(() => Garage.generateIds("EV", 998, 2)).toThrow();
  });

  it("UT-15 creating 0 garages is rejected", () => {
    expect(() => Garage.generateIds("CAR", 0, 0)).toThrow();
  });
});

describe("Garage.isCompatibleWith", () => {
  const bicycleGarage = new Garage("S001", "BICYCLE", 5000, 0, "AVAILABLE");
  const carGarage = new Garage("C001", "CAR", 20000, 0, "AVAILABLE");
  const evGarage = new Garage("E001", "EV", 30000, 2500, "AVAILABLE");

  it("UT-16 bicycle and motorcycle only fit the bicycle garage", () => {
    for (const vehicle of [new Bicycle(1, null, "Polygon"), new Motorcycle(2, "B 1 A", "Honda Beat")]) {
      expect(bicycleGarage.isCompatibleWith(vehicle)).toBe(true);
      expect(carGarage.isCompatibleWith(vehicle)).toBe(false);
      expect(evGarage.isCompatibleWith(vehicle)).toBe(false);
    }
  });

  it("UT-17 car only fits the car garage", () => {
    const car = new Car(1, "B 1 A", "Toyota Avanza");
    expect(carGarage.isCompatibleWith(car)).toBe(true);
    expect(evGarage.isCompatibleWith(car)).toBe(false);
    expect(bicycleGarage.isCompatibleWith(car)).toBe(false);
  });

  it("UT-18 electric car fits the car garage and the EV garage", () => {
    const ev = new ElectricCar(1, "B 1 A", "Wuling Air ev", 30, 0);
    expect(carGarage.isCompatibleWith(ev)).toBe(true);
    expect(evGarage.isCompatibleWith(ev)).toBe(true);
    expect(bicycleGarage.isCompatibleWith(ev)).toBe(false);
  });
});

describe("Garage.isFreeBetween", () => {
  // Booked 2026-12-01 until 2026-12-05 (the 5th is free again)
  const bookings = [{ startDate: parseDate("2026-12-01"), endDate: parseDate("2026-12-05") }];

  it("UT-36 a period that shares any day with a booking is not free", () => {
    expect(Garage.isFreeBetween(bookings, parseDate("2026-11-28"), parseDate("2026-12-02"))).toBe(false);
    expect(Garage.isFreeBetween(bookings, parseDate("2026-12-02"), parseDate("2026-12-03"))).toBe(false);
    expect(Garage.isFreeBetween(bookings, parseDate("2026-11-20"), parseDate("2026-12-20"))).toBe(false);
  });

  it("UT-37 a period right before or right after a booking is free", () => {
    expect(Garage.isFreeBetween(bookings, parseDate("2026-11-25"), parseDate("2026-12-01"))).toBe(true);
    expect(Garage.isFreeBetween(bookings, parseDate("2026-12-05"), parseDate("2026-12-10"))).toBe(true);
    expect(Garage.isFreeBetween([], parseDate("2026-12-01"), parseDate("2026-12-05"))).toBe(true);
  });
});

describe("Garage status", () => {
  it("UT-19 markUsed makes it unavailable, markAvailable makes it free again", () => {
    const garage = new Garage("C001", "CAR", 20000, 0, "AVAILABLE");
    expect(garage.isAvailable()).toBe(true);
    garage.markUsed();
    expect(garage.isAvailable()).toBe(false);
    garage.markAvailable();
    expect(garage.isAvailable()).toBe(true);
  });
});
