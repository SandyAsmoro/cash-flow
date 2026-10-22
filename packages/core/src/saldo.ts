import type { Direction, Transaction } from "./types";

export interface MonthSummary {
  year: number;
  month: number;
  /** Saldo awal bulan, diambil dari saldo akhir bulan sebelumnya. */
  openingBalance: number;
  /** Total pemasukan TIDAK termasuk saldo awal. */
  totalIn: number;
  totalOut: number;
  closingBalance: number;
}

export interface MonthRef {
  year: number;
  month: number;
}

const isActive = (t: Transaction): boolean => t.deletedAt === null;

const monthKey = ({ year, month }: MonthRef): string =>
  `${year}-${String(month).padStart(2, "0")}`;

/**
 * Menghitung ringkasan bulanan secara berantai.
 * Saldo tidak disimpan; selalu dihitung ulang dari transaksi.
 *
 * @param months daftar bulan, urut kronologis
 */
export function computeMonthlySummaries(
  transactions: Transaction[],
  unitId: string,
  initialBalance: number,
  months: MonthRef[],
): MonthSummary[] {
  let carry = initialBalance;
  const result: MonthSummary[] = [];

  for (const ref of months) {
    const key = monthKey(ref);
    const monthTx = transactions.filter(
      (t) => isActive(t) && t.unitId === unitId && t.date !== null && t.date.startsWith(key),
    );

    const sumBy = (dir: Direction): number =>
      monthTx.filter((t) => t.direction === dir).reduce((acc, t) => acc + t.amount, 0);

    const totalIn = sumBy("in");
    const totalOut = sumBy("out");
    const closingBalance = carry + totalIn - totalOut;

    result.push({
      year: ref.year,
      month: ref.month,
      openingBalance: carry,
      totalIn,
      totalOut,
      closingBalance,
    });
    carry = closingBalance;
  }

  return result;
}
