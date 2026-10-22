import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";

export default function App() {
  const unitCount = useLiveQuery(() => db.units.count(), [], 0);

  return (
    <main style={{ fontFamily: "Carlito, Calibri, sans-serif", padding: 16 }}>
      <h1>Mrican Keuangan</h1>
      <p>Kerangka aplikasi siap. Jumlah unit tersimpan: {unitCount}</p>
    </main>
  );
}
