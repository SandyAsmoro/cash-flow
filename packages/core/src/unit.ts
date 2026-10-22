import type { Signatories, Unit, UnitKind } from "./types";

export const SIGNATORY_KEYS: readonly (keyof Signatories)[] = [
  "kyaiDesa",
  "wakilKyaiDesa",
  "penerobosDesa",
  "mubalegDesa",
  "kuDesa",
];

export interface UnitInput {
  name: string;
  kind: UnitKind;
  /** Saldo awal dalam rupiah, bilangan bulat >= 0. */
  initialBalance: number;
  signatories: Signatories;
}

/** Kunci error: "name", "initialBalance", atau "signatories.<kunci>". */
export type UnitErrors = Record<string, string>;

export const MAX_UNIT_NAME_LENGTH = 100;

/** Mengembalikan objek kosong jika input valid. */
export function validateUnitInput(input: UnitInput): UnitErrors {
  const errors: UnitErrors = {};
  const name = input.name.trim();

  if (name.length === 0) {
    errors.name = "Nama unit wajib diisi";
  } else if (name.length > MAX_UNIT_NAME_LENGTH) {
    errors.name = `Nama unit maksimal ${MAX_UNIT_NAME_LENGTH} karakter`;
  }

  if (!Number.isInteger(input.initialBalance) || input.initialBalance < 0) {
    errors.initialBalance = "Saldo awal harus bilangan bulat, minimal 0";
  }

  for (const key of SIGNATORY_KEYS) {
    if (input.signatories[key].trim().length === 0) {
      errors[`signatories.${key}`] = "Wajib diisi";
    }
  }

  return errors;
}

/** Membentuk Unit dengan nilai yang sudah dirapikan (spasi di awal dan akhir dihapus). */
export function buildUnit(input: UnitInput, id: string): Unit {
  const s = input.signatories;
  const trimmedSignatories: Signatories = {
    kyaiDesa: s.kyaiDesa.trim(),
    wakilKyaiDesa: s.wakilKyaiDesa.trim(),
    penerobosDesa: s.penerobosDesa.trim(),
    mubalegDesa: s.mubalegDesa.trim(),
    kuDesa: s.kuDesa.trim(),
  };

  return {
    id,
    name: input.name.trim(),
    kind: input.kind,
    initialBalance: input.initialBalance,
    signatories: trimmedSignatories,
  };
}
