# PAGE-004 — Pencarian: kolom di header dan halaman `/cari`

| Field | Isi |
|---|---|
| **ID / Status** | PAGE-004 · `DONE` (PM 4 Nov 2026, setelah QA_PASSED 1 putaran dan persetujuan pemilik); sebelumnya `READY`, `BACKLOG` |
| **Dependensi** | HOME-06, PAGE-003, SOC-001, UX-001 `DONE`; fixture di balik fungsi layanan (pengecualian pemilik 2 Nov 2026, PRD §13) |
| **Rujukan** | PRD §3.5, FR-12, G2, G11; Figma desktop `21:5270` (input 400×54, ikon 20×20), mobile `116:1647` (tombol 30×26, ikon 14×14); keadaan terbuka mobile dan halaman hasil **tanpa frame** |

## Tujuan
Pembaca dapat mencari berita: kolom di header (desktop) atau ikon cari (mobile) membuka `/cari?q=`, yang menampilkan berita berjudul cocok/terkait dengan kata kunci.

## Di luar scope
Saran otomatis saat mengetik, riwayat pencarian, plugin pencarian WordPress, integrasi WordPress nyata (G-WP), filter/urutan lanjutan.

## Keputusan PM (default; ditinjau pemilik, dicatat sebagai deviasi di POLISH-01)
1. **Form** `<form role="search" method="get" action="/cari">` dengan `<input type="search" name="q" maxlength="100">` + label tersembunyi "Cari berita" + tombol kirim beraksesibel "Cari": berfungsi tanpa JavaScript. Desktop ≥ 1024: input 400×54 di header sesuai `21:5270` (radius 16, latar `#F8F8F8`, border `rgba(8,8,8,0.1)` = token; FE membaca `get_design_context` untuk posisi/ukuran/ikon). Placeholder Indonesia **"Cari berita…"** [I] (Figma berbahasa Inggris). Bawah 1024: tombol ikon `116:1647` di kanan header; klik membuka baris input yang menggantikan isi bilah (hamburger + logo disembunyikan), fokus otomatis ke input, tombol tutup dan Esc mengembalikan header dan fokus ke tombol cari; tanpa overlay, tanpa library. Ikon SVG kecil dari Figma ke `public/icons/` (catat ukuran).
2. **Validasi `q`** (server dan klien): string tunggal, trim, spasi berurutan dipadatkan, panjang 2–100, karakter kontrol ditolak. `q` tak valid atau kosong: halaman `/cari` tetap 200 dengan pesan netral ("Masukkan kata kunci minimal 2 karakter."), tanpa memantulkan masukan di pesan galat server (API: 400 dengan pesan tetap). `?halaman=N` mengikuti aturan kategori (1–4 digit; di luar batas atau tak valid = 404); halaman 1 tanpa hasil = 200 keadaan kosong "Tidak ada berita yang cocok." Kata kunci hanya tampil sebagai teks (interpolasi Vue, tanpa `v-html`).
3. **Pencarian** `searchArticles(q, page, perPage, now)` di `server/services/articles.ts` (fixture, hanya terbit): semua kata harus muncul di judul atau ringkasan (tanpa membedakan huruf besar/kecil), hasil dengan kata di **judul** di atas, lalu terbaru; 10 per halaman. API `GET /api/search?q=&halaman=` mengembalikan `{ query, articles, pagination, now }`. Halaman memakai data hanya lewat API ini.
4. **Halaman `/cari`**: tata letak sama dengan kategori (breadcrumb Beranda › Pencarian, `h1` "Hasil pencarian", jumlah hasil, kartu 2 kolom, tombol "Lebih banyak" dengan komponen yang sama (digeneralisasi), kolom kanan widget sosial → Trending → iklan), `noindex`, tanpa cookie, input header terisi `q` saat ada. Navigasi maju memindahkan fokus ke `h1`.
5. **Tanpa dependensi, token, font baru**; `nuxt.config.ts`/`package.json` tidak berubah; `v-html=` tetap tepat satu baris.

## Kriteria penerimaan
1. Header desktop memuat kolom cari sesuai `21:5270` (selisih ≤ 1 px); mobile/tablet memuat ikon `116:1647` dan keadaan terbuka sesuai keputusan 1; header, menu, laci, dan halaman lain tidak berubah selain itu.
2. Enter/tombol cari membuka `/cari?q=` (juga tanpa JS); hasil, urutan, kosong, tak valid, dan 404 sesuai keputusan 2 dan 3.
3. `q` berisi `<script>`, `<img onerror>`, `"`, `'`, `javascript:`, `../`, 5.000 karakter, dan karakter kontrol: aman (tanpa eksekusi, tanpa galat 500, tanpa pantulan mentah di HTML/title/meta/API).
4. A11y: form `role="search"`, label, nama aksesibel tombol, urutan Tab, fokus terlihat, Esc, `aria-expanded`/`aria-controls` pada tombol ikon, urutan heading, kontras ≥ 4,5:1 untuk teks.
5. `/cari` `noindex`, tanpa `Set-Cookie`, tanpa permintaan jaringan baru ke luar; tanpa layout shift; 0 overflow di 1440/1280/1024/820/768/402/375/320.
6. `lint`, `typecheck`, `npm test` (uji unit untuk normalisasi `q`, `searchArticles`, kasus tepi), `build` kode 0.

## File yang boleh disentuh
`app/components/layout/SiteHeader.vue`, `app/components/layout/SearchForm.vue` (baru), `app/pages/cari.vue` (baru), `app/components/category/LoadMore.vue` (generalisasi), `app/config/search.ts` (baru), `app/types/article.ts`, `app/utils/routes.ts`, `server/api/search.get.ts` (baru), `server/services/articles.ts`, `server/utils/search-query.ts` (baru), `public/icons/search*.svg` (baru, kecil), `tests/unit/**`, `docs/tasks/PAGE-004.md`. PM: `docs/PRD.md`, `docs/tasks/POLISH-01.md`. **Tidak boleh:** `package.json`, lockfile, `nuxt.config.ts`, `app/assets/**`, `.github/**`, `.claude/**`, `.env*`, dependensi.

## QA (cakupan sedang-besar: ada masukan pengguna dan server baru)
P0: header 1440/402 vs Figma; tes hasil/kosong/tak valid/404; payload `q` berbahaya; `noindex` dan tanpa cookie; tanpa JS; keyboard/Esc/fokus; regresi posisi elemen dibanding `main` (header, menu, laci, Beranda, Detail, kategori); overflow 8 lebar; lint/typecheck/test/build/audit.

## Bukti (≤ 5 baris)
- FE: `lint` 0, `typecheck` 0, `npm test` 534/534 (80 uji pencarian), `build` 0, audit tanpa temuan High; header 1440 dan 402 selisih 0 px vs Figma `21:5270`/`116:1647`. Log: scratchpad `p4-final-*.log`.
- QA 4 Nov 2026 (salinan sendiri, Edge headless, port 3541-3544): **QA_PASSED**, 0 Critical/High/Medium. Header vs Figma 0 px; hasil/kosong/tak valid/404/Lebih banyak benar; 15 payload `q` berbahaya (URL dan form) tanpa eksekusi/500/pantulan, `noindex`, 0 `Set-Cookie`; tanpa JS, keyboard, Esc, fokus, kontras ≥ 4,5 lulus; regresi 40 kombinasi 0 beda, 0 overflow di 8 lebar; `/api/*` lain identik; `v-html=` 1 baris; 534/534 uji. Log: `p4q-*.log`.

## Catatan
- Riwayat: 4 Nov 2026 → READY (PM).
- Keputusan FE [I] untuk POLISH-01: ikon cari mobile berada di x 310 (slot tombol tema 30 + celah 8 dicadangkan, sesuai Figma `116:1662`; rata ke tepi kanan = ubah `margin-right` 38 → 0); keadaan terbuka mobile = baris input 40 setinggi bilah (51) + tombol tutup; `<title>` konstan "Hasil pencarian - Ini Sumedang" (kata kunci tidak dipantulkan); urutan hasil = jumlah kata di judul terbanyak dulu, lalu terbaru; tanpa JS di < 1024 form tampil sebagai baris kedua bilah (`@media (scripting: none)`).
- Terbatas: `searchArticles` tidak bisa diimpor `node:test` (impor tanpa ekstensi); intinya (`searchPage`) diuji unit, jalur penuh lewat HTTP. `LoadMore` menerima `slug` **atau** `query` (halaman kategori tidak disentuh).
- Low/Info diterima QA: JSON galat Nitro di `/api/search` memuat `url` permintaan ter-encode (perilaku bawaan semua `/api/*`); CLS 0,0003 pada satu muatan dingin `/cari` 1440; pencocokan potongan teks ("ab" cocok "Kabupaten") dan karakter format Unicode lolos validasi; Back/Forward setelah Lebih banyak kembali ke 10 kartu (sama dengan kategori).
- Menunggu pemilik: ikon cari mobile di x 310 menyisakan 38 px kosong di kanan (slot tombol tema; rata kanan = `margin-right` 38 → 0 di `SiteHeader.vue`); placeholder "Cari berita…" dan keadaan terbuka mobile (tanpa frame); pencocokan per kata (bukan potongan teks) bila diinginkan; pencarian tanpa JS di bawah 1024 butuh `@media (scripting: none)` (Chrome 120+, Firefox 113+, Safari 17+).
- Riwayat: 4 Nov 2026 → READY → FE → QA_PASSED (PM) → menunggu persetujuan pemilik (belum DONE).
- 4 Nov 2026 → DONE (pemilik menyetujui commit).
