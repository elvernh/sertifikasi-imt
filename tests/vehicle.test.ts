import { describe, expect, it } from "vitest";
import { Bicycle, Car, ElectricCar, Motorcycle, createVehicle } from "@/domain/vehicle";

describe("Vehicle.chargingCost", () => {
  it("UT-20 normal vehicles cost nothing to charge", () => {
    expect(new Car(1, "B 1 A", "Toyota Avanza").chargingCost(2000)).toBe(0);
    expect(new Motorcycle(2, "B 2 A", "Honda Beat").chargingCost(2000)).toBe(0);
  });

  it("UT-21 electric car: 60 kWh x Rp2.000 = Rp120.000", () => {
    expect(new ElectricCar(3, "B 3 A", "Hyundai Ioniq 5", 60).chargingCost(2000)).toBe(120000);
  });
});

describe("createVehicle", () => {
  it("UT-22 builds the right child class from the vehicle type", () => {
    expect(createVehicle("BICYCLE", 1, "X", "Polygon", null)).toBeInstanceOf(Bicycle);
    expect(createVehicle("MOTORCYCLE", 1, "B 1 A", "Honda Beat", null)).toBeInstanceOf(Motorcycle);
    expect(createVehicle("CAR", 1, "B 1 A", "Toyota Avanza", null)).toBeInstanceOf(Car);
    expect(createVehicle("EV", 1, "B 1 A", "Hyundai Ioniq 5", 60)).toBeInstanceOf(ElectricCar);
  });

  it("UT-23 a bicycle never keeps a plate number", () => {
    expect(createVehicle("BICYCLE", 1, "B 1 A", "Polygon", null).plateNumber).toBeNull();
  });
});
