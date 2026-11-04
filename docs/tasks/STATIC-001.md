# STATIC-001 — Halaman statis footer (lima tautan)
| Field | Isi |
|---|---|
| **ID** | STATIC-001 (P1; QA → FE → QA → PM; dibuat 29 Okt 2026) |
| **Status** | `BACKLOG` — menunggu konten dari pemilik dan LAY-001 |
| **Dependensi** | SET-002 `DONE`; LAY-001 `DONE` (layout + daftar konfigurasi footer `{ label, to }`); isi teks lima halaman dari pemilik |
| **Rujukan** | PRD v1.10 §3.1 (Footer), §7, FR-08, G16; AGENTS.md aturan 1 (tanpa form input). Tidak ada frame Figma halaman statis; label footer di `60:486`, `101:2600` |
## Tujuan
Lima label footer (Pedoman Siber, Iklan, Kontak, Kebijakan Privasi, Ketentuan Penggunaan) yang kini teks biasa (`to: null`) menjadi tautan ke halaman nyata di Nuxt, satu per satu begitu siap. "Redaksi" tetap teks biasa (keputusan pemilik 29 Okt 2026).
## Di luar scope
Halaman "Redaksi", tujuan "Terbaru"/"Terpopuler" dan item kategori footer (kategori jadi tautan di PAGE-003), WordPress Pages, modul tambahan (content/markdown), formulir kontak, CMS untuk teks ini, terjemahan, perubahan layout footer.
## Keputusan yang masih berlaku
1. Rute usulan [I]: `/pedoman-siber`, `/iklan`, `/kontak`, `/kebijakan-privasi`, `/ketentuan-penggunaan` (final ditetapkan di task ini).
2. Halaman dibangun dari token dan komponen frame final tanpa elemen visual baru (PRD §3.2); PM menyetujui tampilannya sebelum dianggap selesai.
## Kriteria penerimaan
1. Lima halaman Vue biasa di `app/pages/` (satu berkas per halaman), tanpa modul/dependensi baru.
2. Isi teks persis dari pemilik (tidak mengarang); satu `h1`, heading berurutan, tautan eksternal `rel="noopener noreferrer"`; tanpa formulir/input ("Kontak" berisi teks).
3. Tiap halaman: `title`/`description` unik, canonical, status 200, dapat diindeks, masuk sitemap (dicatat untuk SEO-001).
4. Di daftar footer `to` terisi hanya untuk halaman yang ada (`<a>` valid); label tanpa halaman tetap teks biasa; tidak ada `<a>` dengan `href` kosong atau `#`.
5. Header/menu/footer sama dengan halaman lain; tanpa overflow pada 1440, 768/820/1024/1280, 402; token SET-002; `lint`, `typecheck`, `build` kode 0.
## File yang disentuh
`app/pages/{pedoman-siber,iklan,kontak,kebijakan-privasi,ketentuan-penggunaan}.vue`, konfigurasi footer LAY-001 (hanya mengisi `to`), `app/assets/css/**` (seperlunya). Tidak boleh: `package.json`, `nuxt.config.ts`, `server/**`.
## Bukti
n/a (belum dikerjakan).
## Catatan
- Pembuka `BACKLOG` → `READY`: isi teks (minimal satu halaman) dari pemilik dan LAY-001 `DONE`; halaman boleh bertahap.
- **Pertanyaan ke pemilik:** isi teks lima halaman; tujuan "Redaksi" (kelak halaman atau tetap teks); apakah "Iklan" = info pemasangan iklan (bukan slot iklan); slug final.
- Riwayat: 29 Okt 2026 `BACKLOG` (PM).
Versi lengkap sebelum pemangkasan: git show 3e8e137:docs/tasks/STATIC-001.md
