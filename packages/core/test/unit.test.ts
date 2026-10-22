import { describe, expect, it } from "vitest";
import { buildUnit, validateUnitInput, type UnitInput } from "../src/unit";

const valid: UnitInput = {
  name: "DESA MRICAN KEDIRI BARAT",
  kind: "desa",
  initialBalance: 1_886_500,
  signatories: {
    kyaiDesa: "H. Ali Baba",
    wakilKyaiDesa: "H. Muryanto",
    penerobosDesa: "Suko Waluyo",
    mubalegDesa: "Ahmad Rifa'i",
    kuDesa: "Muslimin",
  },
};

describe("validateUnitInput", () => {
  it("input lengkap dan benar tidak menghasilkan error", () => {
    expect(validateUnitInput(valid)).toEqual({});
  });

  it("nama kosong atau hanya spasi ditolak", () => {
    expect(validateUnitInput({ ...valid, name: "   " })).toHaveProperty("name");
  });

  it("nama lebih dari 100 karakter ditolak", () => {
    expect(validateUnitInput({ ...valid, name: "A".repeat(101) })).toHaveProperty("name");
  });

  it("saldo awal negatif ditolak", () => {
    expect(validateUnitInput({ ...valid, initialBalance: -1 })).toHaveProperty("initialBalance");
  });

  it("saldo awal pecahan ditolak", () => {
    expect(validateUnitInput({ ...valid, initialBalance: 10.5 })).toHaveProperty("initialBalance");
  });

  it("saldo awal nol diterima", () => {
    expect(validateUnitInput({ ...valid, initialBalance: 0 })).toEqual({});
  });

  it("setiap pejabat yang kosong ditandai dengan kuncinya", () => {
    const errors = validateUnitInput({
      ...valid,
      signatories: { ...valid.signatories, kuDesa: "  " },
    });
    expect(errors).toEqual({ "signatories.kuDesa": "Wajib diisi" });
  });
});

describe("buildUnit", () => {
  it("merapikan spasi pada nama dan semua pejabat", () => {
    const unit = buildUnit(
      {
        ...valid,
        name: "  KELOMPOK TEMPLEK  ",
        signatories: { ...valid.signatories, kyaiDesa: " M. Nursalim " },
      },
      "id-1",
    );

    expect(unit.id).toBe("id-1");
    expect(unit.name).toBe("KELOMPOK TEMPLEK");
    expect(unit.signatories.kyaiDesa).toBe("M. Nursalim");
  });
});
