// Formatting helpers for the UI.

/** 150000 -> "Rp 150.000" */
export function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}
