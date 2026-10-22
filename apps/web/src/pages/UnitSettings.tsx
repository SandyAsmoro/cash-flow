import { useState, type FormEvent } from "react";
import {
  SIGNATORY_KEYS,
  buildUnit,
  validateUnitInput,
  type Signatories,
  type Unit,
  type UnitErrors,
  type UnitKind,
} from "@mrican/core";
import { db } from "../db";

const SIGNATORY_LABELS: Record<keyof Signatories, string> = {
  kyaiDesa: "Kyai Desa",
  wakilKyaiDesa: "Wakil Kyai Desa",
  penerobosDesa: "Penerobos Desa",
  mubalegDesa: "Mubalegh Desa",
  kuDesa: "KU Desa",
};

const LABEL_KIND: Record<UnitKind, string> = {
  desa: "Desa",
  kelompok: "Kelompok",
};

interface Props {
  units: Unit[];
  onSaved: (unit: Unit) => void;
  onBack?: () => void;
}

export function UnitSettingsPage({ units, onSaved, onBack }: Props) {
  const [editing, setEditing] = useState<Unit | "new" | null>(
    units.length === 0 ? "new" : null,
  );

  if (editing !== null) {
    return (
      <UnitForm
        existing={editing === "new" ? null : editing}
        onSaved={(unit) => {
          setEditing(null);
          onSaved(unit);
        }}
        onCancel={units.length > 0 ? () => setEditing(null) : undefined}
      />
    );
  }

  return (
    <section>
      <h1>Pengaturan Unit</h1>
      <ul>
        {units.map((u) => (
          <li key={u.id}>
            <strong>{u.name}</strong> ({LABEL_KIND[u.kind]}) — saldo awal Rp{" "}
            {u.initialBalance.toLocaleString("id-ID")}{" "}
            <button type="button" onClick={() => setEditing(u)}>
              Ubah
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setEditing("new")}>
        + Unit baru
      </button>
      {onBack && (
        <button type="button" onClick={onBack}>
          Kembali
        </button>
      )}
    </section>
  );
}

interface FormProps {
  existing: Unit | null;
  onSaved: (unit: Unit) => void;
  onCancel?: () => void;
}

function UnitForm({ existing, onSaved, onCancel }: FormProps) {
  const [name, setName] = useState(existing?.name ?? "");
  const [kind, setKind] = useState<UnitKind>(existing?.kind ?? "desa");
  const [balance, setBalance] = useState(
    existing ? String(existing.initialBalance) : "0",
  );
  const [signatories, setSignatories] = useState<Signatories>(
    existing?.signatories ?? {
      kyaiDesa: "",
      wakilKyaiDesa: "",
      penerobosDesa: "",
      mubalegDesa: "",
      kuDesa: "",
    },
  );
  const [errors, setErrors] = useState<UnitErrors>({});
  const [saving, setSaving] = useState(false);

  const parsedBalance = Number(balance.replace(/\D/g, "")) || 0;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = {
      name,
      kind,
      initialBalance: parsedBalance,
      signatories,
    };

    const found = validateUnitInput(input);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const unit = buildUnit(input, existing?.id ?? crypto.randomUUID());
      await db.units.put(unit);
      onSaved(unit);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1>{existing ? "Ubah Unit" : "Unit Baru"}</h1>

      <label>
        Nama unit
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
      </label>
      {errors.name && <p role="alert">{errors.name}</p>}

      <label>
        Jenis
        <select value={kind} onChange={(e) => setKind(e.target.value as UnitKind)}>
          <option value="desa">Desa</option>
          <option value="kelompok">Kelompok</option>
        </select>
      </label>

      <label>
        Saldo awal (Rp)
        <input
          inputMode="numeric"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />
      </label>
      <p>Tampilan: Rp {parsedBalance.toLocaleString("id-ID")}</p>
      {existing && (
        <p>
          Mengubah saldo awal akan mengubah saldo seluruh bulan setelahnya.
        </p>
      )}
      {errors.initialBalance && <p role="alert">{errors.initialBalance}</p>}

      <fieldset>
        <legend>Pejabat (untuk tanda tangan laporan)</legend>
        {SIGNATORY_KEYS.map((key) => (
          <div key={key}>
            <label>
              {SIGNATORY_LABELS[key]}
              <input
                value={signatories[key]}
                onChange={(e) =>
                  setSignatories((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            </label>
            {errors[`signatories.${key}`] && (
              <p role="alert">{errors[`signatories.${key}`]}</p>
            )}
          </div>
        ))}
      </fieldset>

      <button type="submit" disabled={saving}>
        Simpan
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Batal
        </button>
      )}
    </form>
  );
}
