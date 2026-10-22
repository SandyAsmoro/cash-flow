// Unit yang sedang dipilih disimpan di localStorage (bukan data keuangan).
const KEY = "mrican.activeUnitId";

export function getActiveUnitId(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setActiveUnitId(id: string): void {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // Penyimpanan tidak tersedia: aplikasi tetap berjalan, unit dipilih ulang saat dibuka.
  }
}
