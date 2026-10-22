# Mrican Keuangan

Aplikasi pencatatan keuangan offline untuk desa dan kelompok. Data disimpan di perangkat masing-masing dan dipindahkan lewat file backup.

Baca [docs/HANDOFF.md](docs/HANDOFF.md) untuk keputusan proyek, status, dan langkah berikutnya.

## Struktur

- `packages/core`: logika bisnis murni (model, saldo, merge). Tidak bergantung pada UI atau penyimpanan.
- `apps/web`: PWA (Vite + React + Dexie). Penyimpanan lokal di IndexedDB.

## Perintah

```bash
pnpm install
pnpm test
pnpm typecheck
```
