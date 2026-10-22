import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import type { Unit } from "@mrican/core";
import { getActiveUnitId, setActiveUnitId } from "./activeUnit";
import { db } from "./db";
import { UnitSettingsPage } from "./pages/UnitSettings";

type View = "home" | "settings";

export default function App() {
  const units = useLiveQuery(
    async () => (await db.units.toArray()).sort((a, b) => a.name.localeCompare(b.name, "id")),
    [],
    undefined,
  );
  const [activeId, setActiveId] = useState<string | null>(() => getActiveUnitId());
  const [view, setView] = useState<View>("home");

  if (units === undefined) return <main>Memuat…</main>;

  // Unit aktif: yang dipilih, atau unit pertama jika pilihan tidak ditemukan.
  const activeUnit: Unit | null =
    units.find((u) => u.id === activeId) ?? units[0] ?? null;

  function select(unit: Unit) {
    setActiveId(unit.id);
    setActiveUnitId(unit.id);
  }

  if (activeUnit === null || view === "settings") {
    return (
      <main>
        <UnitSettingsPage
          units={units}
          onSaved={(unit) => {
            select(unit);
            setView("home");
          }}
          onBack={activeUnit ? () => setView("home") : undefined}
        />
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Mrican Keuangan</h1>
        <label>
          Unit{" "}
          <select value={activeUnit.id} onChange={(e) => {
            const unit = units.find((u) => u.id === e.target.value);
            if (unit) select(unit);
          }}>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>{" "}
        <button type="button" onClick={() => setView("settings")}>
          Pengaturan
        </button>
      </header>
      <p>
        Unit aktif: <strong>{activeUnit.name}</strong>. Input transaksi dan laporan
        akan ditambahkan di langkah berikutnya.
      </p>
    </main>
  );
}
