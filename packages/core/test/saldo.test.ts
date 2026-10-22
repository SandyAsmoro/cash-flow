import { describe, expect, it } from "vitest";
import { computeMonthlySummaries } from "../src/saldo";
import type { Transaction } from "../src/types";

const base = {
  unitId: "mrican",
  categoryId: "c",
  description: "",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  deletedAt: null,
};

const tx = (over: Partial<Transaction> & Pick<Transaction, "id" | "date" | "direction" | "amount">): Transaction => ({
  ...base,
  ...over,
});

describe("computeMonthlySummaries", () => {
  it("mencocokkan saldo akhir Januari 2025 dengan file Excel asli", () => {
    // Saldo awal 1.886.500 (saldo akhir 31 Des 2024).
    // Total pemasukan di Excel 20.854.500 sudah termasuk saldo awal,
    // jadi pemasukan tanpa saldo awal = 18.968.000.
    const transactions = [
      tx({ id: "1", date: "2025-01-05", direction: "in", amount: 18_968_000 }),
      tx({ id: "2", date: "2025-01-20", direction: "out", amount: 18_448_000 }),
    ];

    const [jan] = computeMonthlySummaries(transactions, "mrican", 1_886_500, [{ year: 2025, month: 1 }]);

    expect(jan).toMatchObject({
      openingBalance: 1_886_500,
      totalIn: 18_968_000,
      totalOut: 18_448_000,
      closingBalance: 2_406_500,
    });
  });

  it("saldo awal bulan berikutnya mengikuti saldo akhir bulan sebelumnya", () => {
    const transactions = [
      tx({ id: "1", date: "2025-01-05", direction: "in", amount: 1_000 }),
      tx({ id: "2", date: "2025-02-05", direction: "out", amount: 300 }),
    ];

    const summaries = computeMonthlySummaries(transactions, "mrican", 500, [
      { year: 2025, month: 1 },
      { year: 2025, month: 2 },
    ]);

    expect(summaries[0]?.closingBalance).toBe(1_500);
    expect(summaries[1]?.openingBalance).toBe(1_500);
    expect(summaries[1]?.closingBalance).toBe(1_200);
  });

  it("mengabaikan transaksi yang dihapus (soft delete)", () => {
    const transactions = [
      tx({ id: "1", date: "2025-01-05", direction: "in", amount: 1_000 }),
      tx({ id: "2", date: "2025-01-06", direction: "in", amount: 500, deletedAt: "2025-01-07T00:00:00Z" }),
    ];

    const [jan] = computeMonthlySummaries(transactions, "mrican", 0, [{ year: 2025, month: 1 }]);
    expect(jan?.totalIn).toBe(1_000);
  });

  it("mengabaikan transaksi dari unit lain", () => {
    const transactions = [
      tx({ id: "1", unitId: "mrican", date: "2025-01-05", direction: "in", amount: 1_000 }),
      tx({ id: "2", unitId: "templek", date: "2025-01-05", direction: "in", amount: 9_000 }),
    ];

    const [jan] = computeMonthlySummaries(transactions, "mrican", 0, [{ year: 2025, month: 1 }]);
    expect(jan?.totalIn).toBe(1_000);
  });

  it("transaksi tanpa tanggal tidak dihitung ke bulan mana pun", () => {
    const transactions = [tx({ id: "1", date: null, direction: "in", amount: 1_000 })];

    const [jan] = computeMonthlySummaries(transactions, "mrican", 0, [{ year: 2025, month: 1 }]);
    expect(jan?.totalIn).toBe(0);
  });
});
