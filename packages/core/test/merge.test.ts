import { describe, expect, it } from "vitest";
import { mergeTransactions } from "../src/merge";
import type { Transaction } from "../src/types";

const make = (over: Partial<Transaction> & Pick<Transaction, "id">): Transaction => ({
  unitId: "mrican",
  date: "2025-01-05",
  direction: "in",
  categoryId: "c",
  description: "",
  amount: 1_000,
  createdAt: "2025-01-05T00:00:00Z",
  updatedAt: "2025-01-05T00:00:00Z",
  deletedAt: null,
  ...over,
});

const notLocked = () => false;

describe("mergeTransactions", () => {
  it("menambahkan transaksi baru dari impor", () => {
    const report = mergeTransactions([make({ id: "a" })], [make({ id: "b" })], notLocked);
    expect(report.added).toBe(1);
    expect(report.merged.map((t) => t.id).sort()).toEqual(["a", "b"]);
  });

  it("tidak menggandakan transaksi yang sama (UUID sama)", () => {
    const t = make({ id: "a" });
    const report = mergeTransactions([t], [{ ...t }], notLocked);
    expect(report.added).toBe(0);
    expect(report.updated).toBe(0);
    expect(report.merged).toHaveLength(1);
  });

  it("memakai versi dengan updatedAt yang lebih baru", () => {
    const local = make({ id: "a", amount: 1_000, updatedAt: "2025-01-10T00:00:00Z" });
    const incoming = make({ id: "a", amount: 2_000, updatedAt: "2025-01-12T00:00:00Z" });

    const report = mergeTransactions([local], [incoming], notLocked);
    expect(report.updated).toBe(1);
    expect(report.merged[0]?.amount).toBe(2_000);
  });

  it("mempertahankan versi lokal jika lebih baru", () => {
    const local = make({ id: "a", amount: 1_000, updatedAt: "2025-01-15T00:00:00Z" });
    const incoming = make({ id: "a", amount: 2_000, updatedAt: "2025-01-12T00:00:00Z" });

    const report = mergeTransactions([local], [incoming], notLocked);
    expect(report.updated).toBe(0);
    expect(report.merged[0]?.amount).toBe(1_000);
  });

  it("menandai konflik jika bulan sudah terkunci", () => {
    const local = make({ id: "a", updatedAt: "2025-01-10T00:00:00Z" });
    const incoming = make({ id: "a", amount: 5_000, updatedAt: "2025-01-12T00:00:00Z" });

    const report = mergeTransactions([local], [incoming], () => true);
    expect(report.conflicts).toEqual([{ id: "a", reason: "bulan terkunci" }]);
    expect(report.merged[0]?.amount).toBe(1_000);
  });

  it("soft delete dari impor ikut terbawa", () => {
    const local = make({ id: "a", updatedAt: "2025-01-10T00:00:00Z" });
    const incoming = make({ id: "a", deletedAt: "2025-01-12T00:00:00Z", updatedAt: "2025-01-12T00:00:00Z" });

    const report = mergeTransactions([local], [incoming], notLocked);
    expect(report.merged[0]?.deletedAt).toBe("2025-01-12T00:00:00Z");
  });
});
