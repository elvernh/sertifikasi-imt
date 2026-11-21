"use client";

// The "Sewa Garasi Baru" form. It reacts while the tenant types
// (free garages, end date and total), using the same model classes as the server.

import { useActionState, useState } from "react";
import { Garage } from "@/models/garage";
import { Rental } from "@/models/rental";
import {
  GARAGE_TYPE_LABEL,
  VEHICLE_TYPE_LABEL,
  VEHICLE_TYPES,
  type GarageType,
  type RentalType,
  type VehicleType,
} from "@/models/types";
import { createVehicle, ElectricCar } from "@/models/vehicle";
import { addDays, formatDate, parseDate, today } from "@/lib/dates";
import { formatRupiah } from "@/lib/format";
import { createRental } from "./actions";

type GarageOption = {
  id: string;
  type: string;
  dailyPrice: number;
  kwhPrice: number;
  bookings: { start: string; end: string }[];
};

export default function RentForm({ garages }: { garages: GarageOption[] }) {
  const [state, formAction, pending] = useActionState(createRental, { error: "" });

  const todayText = formatDate(today());
  const [vehicleType, setVehicleType] = useState<VehicleType>("CAR");
  const [rentalType, setRentalType] = useState<RentalType>("DAILY");
  const [startText, setStartText] = useState(todayText);
  const [days, setDays] = useState(1);
  const [batteryKwh, setBatteryKwh] = useState(0);
  const [batteryPercent, setBatteryPercent] = useState(0);
  const [garageId, setGarageId] = useState("");

  // Start date chosen by the tenant (today or later).
  const startDate = parseDate(startText);
  const startOk = Rental.isValidStartDate(startDate, today());
  const maxDays = Rental.maxDailyDays(startOk ? startDate : today());

  // Rental period, so we only offer garages that are free for all of it.
  let endDate: Date | null = null;
  let previewError = startOk ? "" : "Tanggal mulai sewa harus hari ini atau setelahnya.";
  if (startOk) {
    try {
      endDate = Rental.endDateFor(rentalType, rentalType === "DAILY" ? days : null, startDate);
    } catch (e) {
      previewError = (e as Error).message;
    }
  }

  // Which garages fit this vehicle (rule from the Vehicle classes) and are free for the period.
  const percentOk = Number.isInteger(batteryPercent) && batteryPercent >= 0 && batteryPercent <= 100;
  if (vehicleType === "EV" && !percentOk) previewError = "Sisa baterai harus angka 0 sampai 100 (%).";
  const vehicle = createVehicle(vehicleType, 0, "", "", batteryKwh, percentOk ? batteryPercent : 0);
  const allowedTypes = vehicle.allowedGarageTypes();
  const periodEnd = endDate ?? addDays(startDate, 1);
  const freeGarages = startOk
    ? garages.filter(
        (g) =>
          allowedTypes.includes(g.type as GarageType) &&
          Garage.isFreeBetween(
            g.bookings.map((b) => ({ startDate: parseDate(b.start), endDate: parseDate(b.end) })),
            startDate,
            periodEnd,
          ),
      )
    : [];
  const chosen = freeGarages.find((g) => g.id === garageId);

  // Live preview of the total, using the same Rental class as the server.
  let total = "";
  let charging = "";
  if (chosen && endDate && !previewError) {
    const garage = new Garage(chosen.id, chosen.type as GarageType, chosen.dailyPrice, chosen.kwhPrice, "AVAILABLE");
    const rental = new Rental(0, rentalType, rentalType === "DAILY" ? days : null, startDate, garage, vehicle);
    total = formatRupiah(rental.calculateTotal());
    if (vehicle instanceof ElectricCar && garage.type === "EV") {
      charging = `${vehicle.kwhToFull()} kWh x ${formatRupiah(garage.kwhPrice)} = ${formatRupiah(rental.chargingCost)}`;
    }
  }

  return (
    <main className="page">
      <h1 className="text-2xl font-bold">Sewa Garasi Baru</h1>
      <form action={formAction} className="card">
        {state.error && <p className="error">{state.error}</p>}

        <h2 className="font-bold">Detail Kendaraan</h2>
        <label className="label">
          Tipe kendaraan
          <select
            name="vehicleType"
            className="input"
            value={vehicleType}
            onChange={(e) => {
              setVehicleType(e.target.value as VehicleType);
              setGarageId("");
            }}
          >
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>{VEHICLE_TYPE_LABEL[t]}</option>
            ))}
          </select>
        </label>

        {vehicleType !== "BICYCLE" && (
          <label className="label">
            Nomor plat kendaraan
            <input name="plateNumber" required className="input" />
          </label>
        )}

        <label className="label">
          Merek dan tipe
          <input name="brandModel" required className="input" placeholder="contoh: Toyota Avanza" />
        </label>

        {vehicleType === "EV" && (
          <label className="label">
            Kapasitas baterai (kWh)
            <input
              name="batteryKwh"
              type="number"
              min={1}
              required
              className="input"
              onChange={(e) => setBatteryKwh(Number(e.target.value))}
            />
          </label>
        )}

        {vehicleType === "EV" && (
          <label className="label">
            Sisa baterai saat ini (%)
            <input
              name="batteryPercent"
              type="number"
              min={0}
              max={100}
              required
              className="input"
              value={batteryPercent}
              onChange={(e) => setBatteryPercent(Number(e.target.value))}
            />
          </label>
        )}

        <h2 className="font-bold">Detail Sewa</h2>
        <label className="label">
          Tipe sewa
          <select
            name="rentalType"
            className="input"
            value={rentalType}
            onChange={(e) => setRentalType(e.target.value as RentalType)}
          >
            <option value="DAILY">Harian</option>
            <option value="MONTHLY">Bulanan</option>
          </select>
        </label>

        {rentalType === "DAILY" && (
          <label className="label">
            Jumlah hari (maksimal {maxDays})
            <input
              name="days"
              type="number"
              min={1}
              max={maxDays}
              value={days}
              className="input"
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </label>
        )}

        <label className="label">
          Tanggal mulai sewa
          <input
            name="startDate"
            type="date"
            min={todayText}
            required
            className="input"
            value={startText}
            onChange={(e) => setStartText(e.target.value)}
            // A past (or empty) date typed by hand is set back to today when leaving the field.
            onBlur={() => {
              if (!Rental.isValidStartDate(parseDate(startText), today())) setStartText(todayText);
            }}
          />
        </label>

        <label className="label">
          Garasi yang tersedia untuk periode ini
          <select name="garageId" required className="input" value={chosen?.id ?? ""} onChange={(e) => setGarageId(e.target.value)}>
            <option value="">-- pilih garasi --</option>
            {freeGarages.map((g) => (
              <option key={g.id} value={g.id}>
                {g.id} - {GARAGE_TYPE_LABEL[g.type as GarageType]} - {formatRupiah(g.dailyPrice)}/hari
              </option>
            ))}
          </select>
        </label>
        {startOk && freeGarages.length === 0 && (
          <p className="error">Tidak ada garasi tersedia untuk kendaraan ini pada periode tersebut.</p>
        )}

        {previewError && <p className="error">{previewError}</p>}
        {total && endDate && (
          <div className="success">
            <p>Tanggal selesai sewa: <b>{formatDate(endDate)}</b></p>
            {charging && <p>Isi listrik sampai penuh: <b>{charging}</b></p>}
            <p>Total biaya sewa: <b>{total}</b></p>
          </div>
        )}

        <label className="label">
          Bukti pelunasan biaya (gambar)
          <input name="paymentProof" type="file" accept="image/*" required className="input" />
        </label>

        <button className="btn" disabled={pending || !startOk}>{pending ? "Menyimpan..." : "Simpan Sewa"}</button>
      </form>
    </main>
  );
}
