"use client";

import { useActionState, useState } from "react";
import { addDays, daysBetween, formatDate, parseDate } from "@/lib/dates";
import { formatRupiah } from "@/lib/format";
import { extendRental } from "./actions";

type Props = { rentalId: number; oldEndDate: string; dailyPrice: number };

export default function ExtendForm({ rentalId, oldEndDate, dailyPrice }: Props) {
  const [state, formAction, pending] = useActionState(extendRental, { error: "" });
  const [newEndDate, setNewEndDate] = useState("");

  // Live preview: extra days x daily price (the server calculates it again on save).
  const extraDays = newEndDate ? daysBetween(parseDate(oldEndDate), parseDate(newEndDate)) : 0;
  const earliest = formatDate(addDays(parseDate(oldEndDate), 1));

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

      {extraDays > 0 && (
        <p className="success">
          Tambahan {extraDays} hari. Sisa biaya yang harus dibayar: <b>{formatRupiah(extraDays * dailyPrice)}</b>
        </p>
      )}

      <label className="label">
        Bukti pembayaran (gambar)
        <input name="paymentProof" type="file" accept="image/*" required className="input" />
      </label>

      <button className="btn" disabled={pending}>{pending ? "Menyimpan..." : "Simpan Perpanjangan"}</button>
    </form>
  );
}
