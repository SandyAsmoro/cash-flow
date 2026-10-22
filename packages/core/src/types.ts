export type Direction = "in" | "out";

export type UnitKind = "desa" | "kelompok";

export interface Unit {
  id: string;
  name: string;
  kind: UnitKind;
  /** Saldo awal sebelum bulan pertama yang dicatat (dari saldo akhir sebelumnya). */
  initialBalance: number;
  signatories: Signatories;
}

export interface Category {
  id: string;
  name: string;
  direction: Direction;
  /** true untuk setoran persenan ke daerah; dikeluarkan dari "pemasukan bersih". */
  isTransfer: boolean;
}

export interface Transaction {
  /** UUID, dibuat sekali saat input dan tidak pernah berubah. */
  id: string;
  unitId: string;
  /** Format "YYYY-MM-DD". Bisa null jika tanggal belum diketahui (perlu ditinjau). */
  date: string | null;
  direction: Direction;
  categoryId: string;
  description: string;
  /** Bilangan bulat rupiah. */
  amount: number;
  /** ISO 8601, zona waktu UTC. */
  createdAt: string;
  /** ISO 8601, zona waktu UTC. Dipakai saat merge. */
  updatedAt: string;
  /** ISO 8601 atau null. Soft delete agar penghapusan ikut terbawa saat impor. */
  deletedAt: string | null;
}

export interface Signatories {
  kyaiDesa: string;
  wakilKyaiDesa: string;
  penerobosDesa: string;
  mubalegDesa: string;
  kuDesa: string;
}

export interface MonthLock {
  unitId: string;
  year: number;
  /** 1-12 */
  month: number;
  lockedAt: string;
  /** Snapshot pejabat saat bulan dikunci. */
  signatories: Signatories;
}
