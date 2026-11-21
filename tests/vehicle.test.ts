import { describe, expect, it } from "vitest";
import { Bicycle, Car, ElectricCar, Motorcycle, createVehicle } from "@/models/vehicle";

describe("Vehicle.chargingCost", () => {
  it("UT-20 normal vehicles cost nothing to charge", () => {
    expect(new Car(1, "B 1 A", "Toyota Avanza").chargingCost(2000)).toBe(0);
    expect(new Motorcycle(2, "B 2 A", "Honda Beat").chargingCost(2000)).toBe(0);
  });

  it("UT-21 electric car with 0% left: 60 kWh x Rp2.000 = Rp120.000", () => {
    expect(new ElectricCar(3, "B 3 A", "Hyundai Ioniq 5", 60, 0).chargingCost(2000)).toBe(120000);
  });

  it("UT-38 electric car with 25% left: needs 45 kWh x Rp2.000 = Rp90.000", () => {
    const ev = new ElectricCar(3, "B 3 A", "Hyundai Ioniq 5", 60, 25);
    expect(ev.kwhToFull()).toBe(45);
    expect(ev.chargingCost(2000)).toBe(90000);
  });

  it("UT-39 electric car already full (100%) costs nothing; 55 kWh at 33% left = 36.85 kWh x Rp2.500 = Rp92.125", () => {
    expect(new ElectricCar(3, "B 3 A", "Hyundai Ioniq 5", 60, 100).chargingCost(2000)).toBe(0);
    const ev = new ElectricCar(4, "B 4 A", "Wuling Air ev", 55, 33);
    expect(ev.kwhToFull()).toBeCloseTo(36.85);
    expect(ev.chargingCost(2500)).toBe(92125);
  });
});

describe("createVehicle", () => {
  it("UT-22 builds the right child class from the vehicle type", () => {
    expect(createVehicle("BICYCLE", 1, "X", "Polygon", null, null)).toBeInstanceOf(Bicycle);
    expect(createVehicle("MOTORCYCLE", 1, "B 1 A", "Honda Beat", null, null)).toBeInstanceOf(Motorcycle);
    expect(createVehicle("CAR", 1, "B 1 A", "Toyota Avanza", null, null)).toBeInstanceOf(Car);
    expect(createVehicle("EV", 1, "B 1 A", "Hyundai Ioniq 5", 60, 0)).toBeInstanceOf(ElectricCar);
  });

  it("UT-23 a bicycle never keeps a plate number", () => {
    expect(createVehicle("BICYCLE", 1, "B 1 A", "Polygon", null, null).plateNumber).toBeNull();
  });
});
