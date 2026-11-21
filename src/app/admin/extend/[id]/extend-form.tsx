"use client";

// The extend form. Shows the remaining cost while the admin picks the new end date.

import { useActionState, useState } from "react";
import { addDays, daysBetween, formatDate, parseDate } from "@/lib/dates";
import { formatRupiah } from "@/lib/format";
import { MONTHLY_PRICE_MULTIPLIER } from "@/models/rental";
import { RentalExtension } from "@/models/rental-extension";
import { extendRental } from "./actions";

type Props = { rentalId: number; oldEndDate: string; dailyPrice: number };

export default function ExtendForm({ rentalId, oldEndDate, dailyPrice }: Props) {
  const [state, formAction, pending] = useActionState(extendRental, { error: "" });
  const [newEndDate, setNewEndDate] = useState("");

  // Live preview with the same model method the server uses when saving.
  const extraDays = newEndDate ? daysBetween(parseDate(oldEndDate), parseDate(newEndDate)) : 0;
  const earliest = formatDate(addDays(parseDate(oldEndDate), 1));
  const cost = extraDays > 0 ? RentalExtension.costFor(parseDate(oldEndDate), parseDate(newEndDate), dailyPrice) : null;
  const monthlyPrice = MONTHLY_PRICE_MULTIPLIER * dailyPrice;
  const daysCapped = cost !== null && cost.days * dailyPrice > monthlyPrice;

  return (
    <form action={formAction} className="card">
      {state.error && <p className="error">{state.error}</p>}
      <input type="hidden" name="rentalId" value={rentalId} />

      <label className="label">
        Tanggal selesai sewa yang baru
        <input
          name="newEndDate"
          type="date"
          min={earliest}
          required
          className="input"
          value={newEndDate}
          onChange={(e) => setNewEndDate(e.target.value)}
        />
      </label>

      {cost && (
        <div className="success">
          <p>Tambahan {extraDays} hari = {cost.months} bulan + {cost.days} hari</p>
          <p>
            {cost.months} bulan x {formatRupiah(monthlyPrice)} + {cost.days} hari x {formatRupiah(dailyPrice)}
            {daysCapped && ` (sisa ${cost.days} hari dihitung maksimal 1 bulan = ${formatRupiah(monthlyPrice)})`}
          </p>
          <p>Sisa biaya yang harus dibayar: <b>{formatRupiah(cost.amount)}</b></p>
        </div>
      )}

      <label className="label">
        Bukti pembayaran (gambar)
        <input name="paymentProof" type="file" accept="image/*" required className="input" />
      </label>

      <button className="btn" disabled={pending || !cost}>{pending ? "Menyimpan..." : "Simpan Perpanjangan"}</button>
    </form>
  );
}
