# 0001 — 7 temuan `npm audit` (low): rantai `deepmerge`

| Field | Isi |
|---|---|
| **Tanggal** | 29 Okt 2026 |
| **Status** | Diterima sementara (dengan pemicu cek ulang) |
| **Penilai** | PM |
| **Task** | SET-001 (kriteria 5: "yang ada dinilai tertulis") |
| **Sumber fakta** | Laporan QA di `docs/tasks/SET-001.md` (diulang independen di salinan bersih, Node v22.23.4, npm 10.9.9) |

## Fakta [V] (dari QA)
- `npm audit`: **7 low, 0 moderate, 0 high, 0 critical**. `npm audit --audit-level=high` kode 0 (gerbang CI lulus).
- Advisory: GHSA-gcqx-w48m-w2h4 (`deepmerge`, "mergeObject() allows prototype poisoning"), rentang terdampak menurut npm `>=4.2.0`.
- Satu rantai, satu salinan: `nuxt@4.6.3 → @nuxt/nitro-server@4.6.3 → nitropack@2.13.5 → @rollup/plugin-node-resolve@16.0.3 → deepmerge@4.3.1`. Hanya `nuxt` yang `isDirect`; temuan lain (`@nuxt/vite-builder`, `@nuxt/vite-server`) hanya turunan `nuxt`.
- Bukan dari paket yang ditambah SET-001; rantai ini sudah ada di lockfile `main`.
- Pada build produksi ini (`npm run build`), `deepmerge` **tidak ada** di `.output`: tidak ada direktori `deepmerge`, `grep -rIl deepmerge .output` kosong, `.output/server/package.json` tidak memuatnya.
- `npm audit fix --force` menawarkan `nuxt@4.1.3` (breaking, di bawah 4.5.1). Tidak dijalankan.

## Ketidakcocokan severity [V pada selisihnya, [?] pada isinya]
- npm menulis **low**. Halaman advisory GitHub, menurut catatan pemilik, menulis **High (CVSS v4 8,7)**, tetapi tanpa paket dan versi terdampak yang jelas.
- Sisi GitHub tidak diverifikasi QA maupun PM. Data severity GitHub dianggap **lemah**: skor tinggi tanpa paket/versi terdampak tidak dapat dipetakan ke `deepmerge@4.3.1` di repo ini. Tidak dijadikan dasar menurunkan Nuxt atau memblokir task.

## Penilaian
- [V] Kerentanan ada di dependensi **build-time** (plugin Rollup di dalam Nitro), dan kodenya tidak terbawa ke `.output` pada build ini.
- [I] Eksploitasi prototype poisoning lewat `mergeObject()` butuh data yang dikendalikan penyerang masuk ke pemanggilan merge. Di rantai ini, masukan merge adalah opsi plugin dari konfigurasi build (repo kita), bukan input pembaca situs. Risiko produksi dinilai rendah.
- [?] Perilaku `nuxt dev` / `nuxt preview` dan build lain (preset lain, deploy yang menjalankan `npm ci` penuh di server) tidak diuji. Keterpakaian di runtime tidak dinilai.

## Keputusan
**Diterima sementara.** Tidak ada tindakan kode. SET-001 tidak diblokir oleh temuan ini.

## Mitigasi
1. Deploy dari artefak `.output` (bukan `node_modules` penuh) [I, konfirmasi saat task deploy/REL-001].
2. Gerbang CI `npm audit --audit-level=high` tetap; jika ada High/Critical muncul dari paket yang benar-benar terpakai, gerbang gagal dan temuan dinilai ulang.
3. Perbaikan datang dari hulu (rilis patch Nuxt/Nitro/`@rollup/plugin-node-resolve`), bukan dari penimpaan manual.

## Pemicu cek ulang
- Setiap rilis patch/minor Nuxt (jalankan `npm audit` dan `npm ls deepmerge`).
- Setiap PR Dependabot.
- **Sebelum rilis produksi** (wajib; ulangi cek `.output` untuk `deepmerge` pada build yang akan dirilis).
- Bila severity GitHub terklarifikasi dengan paket/versi yang jelas dan mencakup `deepmerge@4.3.1`.

## Larangan
- **Jangan** `npm audit fix --force` (menurunkan Nuxt ke 4.1.3, di bawah 4.5.1, PRD §10.1).
- **Jangan** menurunkan Nuxt.
- Jangan menambah `overrides` untuk `deepmerge` tanpa persetujuan pemilik (AGENTS.md aturan 3, 8) dan catatan keputusan baru.
