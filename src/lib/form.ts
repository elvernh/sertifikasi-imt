// Small helpers to read values from a submitted form.

/** Reads a text field, without spaces at the start or end ("" if it is missing). */
export function readText(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

/** Reads a number field ("" becomes 0, text that is not a number becomes NaN). */
export function readNumber(formData: FormData, name: string): number {
  return Number(formData.get(name) ?? "");
}

/** Error message to show to the user. */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan.";
}
