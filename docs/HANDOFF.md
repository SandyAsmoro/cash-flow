# HANDOFF: Aplikasi Pencatatan Keuangan Desa & Kelompok (Mrican)

> **Baca file ini dulu sebelum mengerjakan apa pun.**
> Dokumen ini adalah sumber kebenaran untuk keputusan proyek. Jika ada keputusan
> yang berubah, perbarui bagian "Log Keputusan" di bagian bawah, jangan hanya
> mengubah kode.

---

## 1. Ringkasan Proyek

Aplikasi offline untuk mencatat pemasukan dan pengeluaran setiap bulan, lalu
menghasilkan laporan yang formatnya meniru file Excel asli
`LAPORAN_KEUANGAN_DESA_MRICAN.xlsx`.

- Dipakai oleh banyak **desa** dan **kelompok**.
- Sepenuhnya **offline**. Tidak ada server dan tidak ada akun online.
- Data disimpan **lokal** di perangkat. Pemindahan data dilakukan lewat **file backup**.
- Ada **2 versi**: HP dan laptop/PC. Keduanya berbagi kode inti yang sama.
- Ekspor **Excel** dan **PDF** dengan format sama persis dengan lampiran, dibuat untuk
  kertas **F4** (330 × 215 mm).

---

## 2. Status Saat Ini

| Area | Status |
|---|---|
| Analisis file Excel | Selesai |
| Rancangan arsitektur | Selesai |
| Model data (`packages/core/src/types.ts`) | Selesai |
| Logika saldo (`saldo.ts`) | Selesai, 5 unit test lolos (termasuk cocok dengan saldo Januari 2025) |
| Logika merge (`merge.ts`) | Selesai, 6 unit test lolos |
| Setup monorepo (pnpm workspace, packages/core, Vitest, TypeScript) | Selesai |
| Kerangka `apps/web` (Vite + React + TS + Dexie) | Selesai, typecheck dan build lolos |
| Repo GitHub | Belum diperiksa oleh agent (repo privat) |
| Layer penyimpanan (Dexie) | Skema v1 dibuat di `apps/web/src/db.ts`, belum dipakai UI |
| UI input transaksi | Belum dimulai |
| Ekspor Excel (ExcelJS) | Belum dimulai |
| Ekspor PDF (pdfmake, F4) | Belum dimulai |
| Backup & import | Belum dimulai |
| Kunci bulan | Belum dimulai |
| Pengaturan unit & tanda tangan | Belum dimulai |

**Langkah berikutnya yang disarankan (urut):**
1. Jawab pertanyaan A (platform) dan D (pnpm/npm, React+Vite/Next.js) di bagian 4.
2. Buat `apps/web` atau `apps/desktop` sesuai jawaban.
3. Bangun layer penyimpanan dan halaman input di `apps/web`.
4. Ekspor Excel, lalu PDF.
5. Backup, import, dan merge.
6. Kunci bulan dan snapshot tanda tangan.

---

## 3. Keputusan yang Sudah Disepakati

1. **Offline penuh.** Tidak ada server, sinkronisasi real-time, atau login online.
2. **Penyimpanan lokal** per perangkat. Pindah perangkat lewat backup.
3. **Dua versi** (HP dan laptop). Keduanya bisa impor file backup yang sama.
4. **Backup dan import** dengan merge berdasarkan UUID. Impor tidak menimpa data,
   hanya menggabungkan.
5. **Setiap transaksi** memiliki: `id` (UUID, dibuat sekali), `updatedAt`, dan
   `deletedAt` (soft delete).
6. **Versi yang lebih baru** (`updatedAt` terbesar) dipakai saat merge.
7. **Saldo tidak disimpan**, selalu dihitung ulang dari transaksi. Saldo awal bulan
   diambil dari saldo akhir bulan sebelumnya.
8. **Total pemasukan menyertakan saldo awal** sebagai baris pertama, sesuai file Excel.
9. **Kunci bulan** mencegah perubahan. Status kunci ikut terbawa saat backup.
10. **Snapshot tanda tangan** disimpan saat bulan dikunci, sehingga laporan lama tidak
    berubah jika ada pergantian jabatan.
11. **Tanda tangan dan jabatan** disimpan per **unit** (desa atau kelompok), bukan di kode.
12. **Kategori** punya penanda `isTransfer`. Setoran persenan ke daerah ditandai sebagai
    transfer, dan laporan menampilkan "pemasukan bersih" tanpa transfer.
13. **Nominal** disimpan sebagai bilangan bulat rupiah, bukan float.
14. **Nama kode** memakai bahasa Inggris. **Label di laporan** memakai bahasa Indonesia.
15. **Ekspor PDF dan Excel** dilakukan di perangkat (tanpa server), agar bisa offline.
16. **Ukuran kertas F4** (330 × 215 mm) untuk Excel dan PDF.
17. **Jumlah baris dinamis.** Jika data melebihi satu halaman, halaman berikutnya
    otomatis dibuat dengan header diulang. Tanda tangan ditampilkan di halaman terakhir.
18. **Font laporan: Carlito** (pengganti Calibri, lisensi SIL OFL). Dibundel untuk PDF dan tampilan aplikasi. Excel tetap memakai nama font Carlito di file, sehingga bisa tampil berbeda di komputer yang tidak memasang Carlito.

---

## 4. Keputusan yang MASIH TERBUKA

Agent berikutnya **harus menanyakan** hal-hal ini kepada pengguna sebelum
mengimplementasikannya:

| No | Pertanyaan | Dampak |
|---|---|---|
| A | Platform utama: PWA saja, Tauri (desktop) saja, atau PWA untuk HP + Tauri untuk laptop? | Struktur `apps/` dan cara distribusi |
| B | Backup perlu dienkripsi dengan password atau cukup file biasa? | Desain format file `.mrican` dan UX impor |
| C | Pengguna lebih banyak memakai HP Android, iPhone, atau laptop/PC? | Prioritas PWA dan perilaku penyimpanan di iOS |
| D | Stack: pnpm atau npm? React + Vite atau Next.js? | Konfigurasi monorepo |
| E | Apakah transaksi bulan yang sudah dikunci boleh dibuka oleh admin dengan PIN? | Alur "buka kunci" |

---

## 5. Arsitektur Teknis (Rancangan)

```
mrican-keuangan/
├── docs/
│   └── HANDOFF.md            # file ini
├── packages/
│   └── core/                 # logika murni, tanpa UI dan tanpa penyimpanan
│       ├── src/
│       │   ├── types.ts      # Unit, Category, Transaction, Signatories, MonthLock
│       │   ├── saldo.ts      # computeMonthlySummaries()
│       │   ├── merge.ts      # mergeTransactions()
│       │   ├── backup.ts     # (belum) format file, enkripsi, checksum
│       │   └── report/       # (belum) model laporan bersama untuk Excel & PDF
│       └── test/
├── apps/
│   ├── web/                  # PWA: React + Vite + TypeScript + Dexie (IndexedDB)
│   └── desktop/              # (nanti) Tauri, memakai UI dari apps/web
├── package.json
└── pnpm-workspace.yaml
```

**Prinsip:**
- `core` tidak boleh mengimpor React, Dexie, atau API browser. Semua logika bisnis
  di sini agar bisa diuji dengan unit test.
- Ekspor Excel dan PDF memakai **satu model laporan** di `core/report/`, lalu dirender
  oleh ExcelJS atau pdfmake. Dengan begitu hasil keduanya konsisten.

**Library yang direncanakan:**
- Penyimpanan: Dexie.js (PWA) atau SQLite (Tauri)
- Excel: ExcelJS
- PDF: pdfmake
- Test: Vitest

---

## 6. Data Uji (Target Verifikasi)

Angka berikut diambil langsung dari file Excel asli. Gunakan untuk memverifikasi
`computeMonthlySummaries()`. Semua angka dalam rupiah.

| Bulan | Saldo Awal | Total Pemasukan (termasuk saldo awal) | Total Pengeluaran | Saldo Akhir |
|---|---|---|---|---|
| Januari 2025 | 1.886.500 | 20.854.500 | 18.448.000 | 2.406.500 |
| Februari 2025 | 2.406.500 | 22.139.500 | 20.500.000 | 1.639.500 |
| Maret 2025 | 1.639.500 | 33.823.000 | 26.184.500 | 7.638.500 |
| April 2025 | 7.638.500 | 31.230.000 | 24.174.000 | 7.056.000 |
| Mei 2025 | 7.056.000 | 28.520.500 | 21.795.500 | 6.725.000 |
| Juni 2025 | 6.725.000 | 30.451.700 | 22.999.700 | 7.452.000 |
| Juli 2025 | 7.452.000 | 30.205.500 | 24.548.000 | 5.657.500 |
| Agustus 2025 | 5.657.500 | 29.005.500 | 24.327.000 | 4.678.500 |
| September 2025 | 4.678.500 | 5.549.500 | 1.230.000 | 4.319.500 |
| Oktober 2025 | 4.319.500 | 4.702.500 | 1.718.000 | 2.984.500 |
| November 2025 | 2.984.500 | 3.554.500 | 1.236.000 | 2.318.500 |
| Desember 2025 | 2.318.500 | 2.910.500 | 350.000 | 2.560.500 |
| Januari 2026 | 2.560.500 | 3.338.500 | 1.847.000 | 1.491.500 |
| Februari 2026 | 1.491.500 | 3.521.500 | 2.465.000 | 1.056.500 |
| Maret 2026 | 1.056.500 | 1.966.500 | 565.000 | 1.401.500 |
| April 2026 | 1.401.500 | 9.417.500 | 3.019.000 | 6.398.500 |

**Catatan verifikasi:**
- Saldo awal Januari 2025 adalah **1.886.500**, yaitu saldo akhir 31 Desember 2024.
- Saldo akhir setiap bulan harus sama dengan saldo awal bulan berikutnya.
- Total pemasukan = saldo awal + semua baris pemasukan.
- Sheet `Rekapan Cawu` memakai angka yang sama dengan sheet bulanan. Pastikan
  ekspor rekap cawu cocok dengan angka di atas.
- Sheet `Sheet3` adalah template kosong untuk Kelompok Templek. Jangan dipakai sebagai data uji.

**Catatan data:**
- Beberapa nilai di Excel tersimpan sebagai notasi ilmiah (misalnya `1.7056E7`). Saat
  import data lama, nilai harus dibulatkan ke rupiah utuh.
- Tanggal di Excel sebagian berupa serial number (misalnya `45658` = 1 Januari 2025).
  Beberapa baris tidak punya tanggal. Saat import, baris tanpa tanggal diberi tanda
  untuk ditinjau.

---

## 7. Format Laporan (Acuan Visual)

Dari file Excel asli:
- **Judul:** LAPORAN KEUANGAN / [NAMA PENGGUNA] / BULAN : [NAMA BULAN] [TAHUN]
  - `[NAMA PENGGUNA]` diisi dari nama unit aktif (misalnya "DESA MRICAN KEDIRI BARAT" atau "KELOMPOK TEMPLEK"), yang diambil dari pengaturan unit, bukan ditulis tetap di kode.
- **Dua kolom:** PEMASUKAN (kiri) dan PENGELUARAN (kanan).
- **Kolom tiap sisi:** Nomor, Tanggal, Uraian, Jumlah.
- **Baris paling atas pemasukan:** Saldo Awal.
- **Di bawah tabel:** TOTAL PEMASUKAN, TOTAL PENGELUARAN, SALDO AKHIR BULAN [NAMA BULAN].
- **Tanggal dan kota:** "Kediri, [tanggal] [bulan] [tahun]".
- **Tanda tangan:** "Mengetahui," lalu Kyai Desa dan Wakil Kyai Desa di baris pertama,
  Penerobos Desa dan Mubalegh Desa di baris kedua, dan KU Desa di baris ketiga.
  Nama ditulis di bawah jabatan dalam tanda kurung.
- **Gaya:** Carlito 11, judul tebal, tanpa warna, tanpa grafik. Carlito dipakai menggantikan Calibri karena lisensinya SIL OFL (bisa dibundel), dan lebarnya identik dengan Calibri.
- **Ukuran:** F4, landscape.

**Laporan Cawu (per 4 bulan):** tabel NO, BULAN, PEMASUKKAN, PENGELUARAN, SALDO,
dengan baris "Saldo Awal" di atas dan "SALDO AKHIR" di bawah. Blok tanda tangan sama
dengan laporan bulanan.

**Laporan Tahunan:** belum ada di file asli. Usulkan setelah fitur bulanan dan cawu selesai.

---

## 8. Alur Pengguna (Ringkas)

1. Buka aplikasi, pilih **unit** (desa atau kelompok).
2. Input transaksi (tanggal, arah, kategori, uraian, nominal).
3. Lihat laporan bulan berjalan (saldo dihitung otomatis).
4. Ekspor Excel atau PDF.
5. Setelah bulan final: **kunci bulan** (snapshot tanda tangan tersimpan).
6. Backup berkala ke file `.mrican`.
7. Di perangkat lain: **import** file backup, lihat ringkasan, lalu konfirmasi.

---

## 9. Pedoman untuk Agent Berikutnya

- **Jangan ubah keputusan di bagian 3** tanpa persetujuan pengguna. Catat perubahan
  di log keputusan.
- **Tanyakan pertanyaan di bagian 4** sebelum membuat kode yang bergantung padanya.
- **Logika saldo dan merge harus punya unit test** sebelum UI dibuat.
- **Gunakan angka di bagian 6** sebagai acuan. Jika hasil kode tidak cocok, cari penyebabnya.
- **Jangan menyimpan saldo sebagai data tetap.** Hitung ulang dari transaksi.
- **Jangan menulis tanda tangan atau nama pejabat di kode.** Ambil dari pengaturan unit.
- Jika repo GitHub berisi kode yang sudah ada, **periksa dulu** sebelum membuat struktur
  baru, dan catat perbedaannya di bagian ini.

---

## 10. Prompt Pembuka untuk Agent Baru

Salin teks berikut saat memulai sesi baru dengan agent lain:

```
Saya sedang membangun aplikasi pencatatan keuangan offline untuk desa dan kelompok.
Baca docs/HANDOFF.md di repo ini terlebih dahulu, lalu:
1. Ringkas keputusan yang sudah disepakati (bagian 3).
2. Tanyakan pertanyaan terbuka yang relevan dengan tugas saya (bagian 4).
3. Lanjutkan dari langkah berikutnya di bagian 2.
Jangan mengubah keputusan tanpa menanyakan saya terlebih dahulu.
```

---

## 11. Log Keputusan

| Tanggal | Perubahan | Oleh |
|---|---|---|
| 2026-10-22 | Dokumen handoff dibuat. Keputusan awal dari brainstorming. | Agent 1 |
| 2026-10-22 | Judul laporan (bagian 7) diubah menjadi "LAPORAN KEUANGAN / [NAMA PENGGUNA] / BULAN : [NAMA BULAN] [TAHUN]". Nama diambil dari pengaturan unit aktif. | Pengguna |
| 2026-10-22 | Setup awal: monorepo pnpm, packages/core (types, saldo, merge) dengan 11 unit test lolos. Folder apps/ belum dibuat karena menunggu keputusan A dan D di bagian 4. | Agent 2 |
| 2026-10-22 | Keputusan A: satu PWA untuk HP dan laptop. Keputusan D: pnpm dan React + Vite (tanpa Next.js). Kerangka apps/web dibuat. | Pengguna |
| 2026-10-22 | Font laporan diganti dari Calibri menjadi Carlito (bagian 3 nomor 18 dan bagian 7). | Pengguna |
