import type { Transaction } from "./types";

export interface MergeConflict {
  id: string;
  reason: "bulan terkunci";
}

export interface MergeReport {
  merged: Transaction[];
  added: number;
  updated: number;
  conflicts: MergeConflict[];
}

/**
 * Menggabungkan transaksi lokal dengan hasil impor berdasarkan UUID.
 * Versi dengan updatedAt terbaru dipakai. Perubahan pada bulan yang terkunci
 * tidak diterapkan dan dicatat sebagai konflik.
 *
 * @param isLocked true jika transaksi berada di bulan yang sudah dikunci
 */
export function mergeTransactions(
  local: Transaction[],
  incoming: Transaction[],
  isLocked: (t: Transaction) => boolean,
): MergeReport {
  const byId = new Map<string, Transaction>(local.map((t) => [t.id, t]));
  const conflicts: MergeConflict[] = [];
  let added = 0;
  let updated = 0;

  for (const inc of incoming) {
    const cur = byId.get(inc.id);

    if (cur === undefined) {
      if (isLocked(inc)) {
        conflicts.push({ id: inc.id, reason: "bulan terkunci" });
        continue;
      }
      byId.set(inc.id, inc);
      added++;
      continue;
    }

    // Versi lokal sama atau lebih baru: tidak ada yang berubah.
    if (inc.updatedAt <= cur.updatedAt) continue;

    if (isLocked(cur) || isLocked(inc)) {
      conflicts.push({ id: inc.id, reason: "bulan terkunci" });
      continue;
    }

    byId.set(inc.id, inc);
    updated++;
  }

  return { merged: [...byId.values()], added, updated, conflicts };
}
