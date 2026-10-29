# 0002 — `engines.node` (`>=26`) dan `@nuxt/vite-server` sebagai dependensi turunan

| Field | Isi |
|---|---|
| **Tanggal** | 29 Okt 2026 |
| **Status** | Bagian A: diputuskan. Bagian B: **USUL, menunggu persetujuan pemilik** |
| **Penilai** | PM |
| **Task** | SET-001 (Low-1, Info-3 dari Laporan QA) |

## A. Low-1: `>=26` vs `>=26.0.0` [diputuskan]
- Fakta [V]: `package.json` memuat `^22.22.3 || ^24.15.0 || >=26`; `nuxt@4.6.3` memuat `... || >=26.0.0`. Teks beda, makna sama (semver `>=26` ≡ `>=26.0.0`).
- Keputusan: **dibiarkan**. Kriteria 2 SET-001 ("sama dengan `engines.node` milik Nuxt") dibaca sebagai sama secara semantik; usulan awal task juga menulis `>=26`. Mengubah ke `>=26.0.0` hanya kosmetik dan memaksa sentuhan `package.json`/lockfile tanpa manfaat.
- Bila Nuxt mengubah `engines` di rilis berikutnya, cocokkan ulang (sudah tercakup DISC-002).

## B. `@nuxt/vite-server` sebagai dependensi turunan `nuxt` [USUL]
- Fakta [V]: `@nuxt/vite-server` ada di pohon dependensi `nuxt@4.6.3` sendiri (terlihat di rantai `npm audit`). Tidak ada di `package.json` maupun `nuxt.config.ts` (T11 kosong), jadi kriteria 6 terpenuhi.
- Masalah [I]: AGENTS.md aturan 7 menulis "tanpa … `@nuxt/vite-server` …". Dibaca harfiah, kehadirannya di `node_modules` bisa dianggap pelanggaran padahal kita tidak bisa (dan tidak perlu) menghapus dependensi internal Nuxt. QA membacanya sebagai larangan memakai langsung.
- **Usul (butuh persetujuan pemilik; AGENTS.md TIDAK diubah oleh PM):** perjelas aturan 7 menjadi:
  > Pakai fitur stabil saja: **jangan mengaktifkan atau mengonfigurasi** `experimental.*`, Vapor, `@nuxt/vite-server`, `vue.runtimeCompiler`; jangan memakai `nuxt/server` import surface. Dependensi turunan yang dibawa Nuxt sendiri tidak dihitung pelanggaran.
- Sampai pemilik memutuskan: tafsir kerja = **tidak ada di `package.json`, `nuxt.config.ts`, atau kode kita**; keberadaan sebagai turunan `nuxt` diterima.
