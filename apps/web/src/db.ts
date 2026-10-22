import Dexie, { type EntityTable } from "dexie";
import type { Category, MonthLock, Transaction, Unit } from "@mrican/core";

/**
 * Penyimpanan lokal (IndexedDB). Semua data tetap di perangkat.
 * Saldo TIDAK disimpan di sini; dihitung ulang dengan @mrican/core.
 */
export class MricanDb extends Dexie {
  units!: EntityTable<Unit, "id">;
  categories!: EntityTable<Category, "id">;
  transactions!: EntityTable<Transaction, "id">;
  monthLocks!: EntityTable<MonthLock, "unitId">;

  constructor() {
    super("mrican-keuangan");

    this.version(1).stores({
      units: "id",
      categories: "id",
      // Indeks: pencarian per unit, per tanggal, dan per unit+tanggal (laporan bulanan).
      transactions: "id, unitId, date, [unitId+date]",
      // Kunci primer gabungan unitId + year + month.
      monthLocks: "[unitId+year+month], unitId",
    });
  }
}

export const db = new MricanDb();
