"use client";

import { useActionState, useState } from "react";
import { Garage } from "@/domain/garage";
import { Rental } from "@/domain/rental";
import {
  GARAGE_TYPE_LABEL,
  VEHICLE_TYPE_LABEL,
  VEHICLE_TYPES,
  type GarageType,
  type RentalType,
  type VehicleType,
} from "@/domain/types";
import { createVehicle } from "@/domain/vehicle";
import { formatDate, today } from "@/lib/dates";
import { formatRupiah } from "@/lib/format";
import { createRental } from "./actions";

type GarageOption = { id: string; type: string; dailyPrice: number; kwhPrice: number };

export default function RentForm({ garages }: { garages: GarageOption[] }) {
  const [state, formAction, pending] = useActionState(createRental, { error: "" });

  const [vehicleType, setVehicleType] = useState<VehicleType>("CAR");
  const [rentalType, setRentalType] = useState<RentalType>("DAILY");
  const [days, setDays] = useState(1);
  const [batteryKwh, setBatteryKwh] = useState(0);
  const [garageId, setGarageId] = useState("");

  // Which garage types fit this vehicle (rule comes from the Vehicle classes).
  const vehicle = createVehicle(vehicleType, 0, "", "", batteryKwh);
  const allowedTypes = vehicle.allowedGarageTypes();
  const freeGarages = garages.filter((g) => allowedTypes.includes(g.type as GarageType));
  const chosen = freeGarages.find((g) => g.id === garageId);

  // Live preview of the end date and total, using the same Rental class as the server.
  let endDate = "";
  let total = "";
  let previewError = "";
  if (chosen) {
    try {
      const garage = new Garage(chosen.id, chosen.type as GarageType, chosen.dailyPrice, chosen.kwhPrice, "AVAILABLE");
      const rental = new Rental(0, rentalType, rentalType === "DAILY" ? days : null, today(), garage, vehicle);
      total = formatRupiah(rental.calculateTotal());
      endDate = formatDate(rental.endDate);
    } catch (e) {
      previewError = (e as Error).message;
    }
  }

  return (
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
          Jumlah hari (maksimal 30)
          <input
            name="days"
            type="number"
            min={1}
            max={30}
            value={days}
            className="input"
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </label>
      )}

      <p>Tanggal mulai sewa: <b>{formatDate(today())}</b> (hari ini)</p>

      <label className="label">
        Garasi yang tersedia hari ini
        <select name="garageId" required className="input" value={garageId} onChange={(e) => setGarageId(e.target.value)}>
          <option value="">-- pilih garasi --</option>
          {freeGarages.map((g) => (
            <option key={g.id} value={g.id}>
              {g.id} - {GARAGE_TYPE_LABEL[g.type as GarageType]} - {formatRupiah(g.dailyPrice)}/hari
            </option>
          ))}
        </select>
      </label>
      {freeGarages.length === 0 && <p className="error">Tidak ada garasi tersedia untuk kendaraan ini.</p>}

      {previewError && <p className="error">{previewError}</p>}
      {total && (
        <div className="success">
          <p>Tanggal selesai sewa: <b>{endDate}</b></p>
          <p>Total biaya sewa: <b>{total}</b></p>
        </div>
      )}

      <label className="label">
        Bukti pelunasan biaya (gambar)
        <input name="paymentProof" type="file" accept="image/*" required className="input" />
      </label>

      <button className="btn" disabled={pending}>{pending ? "Menyimpan..." : "Simpan Sewa"}</button>
    </form>
  );
}
