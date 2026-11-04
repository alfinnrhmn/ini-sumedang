# PAGE-003 — Halaman Kategori `/kategori/[slug]` + semua tautan kategori (data fixture)
| Field | Isi |
|---|---|
| **ID** | PAGE-003 (P0; FE → QA → PM; dibuat 2 Nov 2026) |
| **Status** | `DONE` (PM 3 Nov 2026, setelah `QA_PASSED` E1–E7 dan persetujuan pemilik atas commit, 3 Nov 2026). Riwayat: `READY` 2 Nov 2026 → `QA_PASSED` 2 Nov → dibuka kembali `READY` 3 Nov untuk evaluasi visual pemilik E1–E7 → `DONE` |
| **Dependensi** | PAGE-002, HOME-05/06, SET-002/HOME-01 `DONE`; gerbang G-WP tidak menghalangi (fixture) |
| **Rujukan** | PRD v1.10 FR-11, FR-01, §3.2 G1, §3.5, §4.4; AGENTS.md aturan 1, 2, 7, 8. **Tidak ada frame Figma Kategori** (keputusan pemilik): dibangun dari komponen yang ada |
## Tujuan
Halaman kategori untuk 9 kategori resmi di `/kategori/<slug>` (daftar berita berhalaman, tanpa hero) dan semua teks kategori menjadi tautan sungguhan ke halaman itu. Evaluasi visual pemilik 3 Nov 2026 (E1–E7) menyesuaikan tata letak Beranda/kategori/footer.
## Di luar scope
Pencarian (PAGE-004), 404 berlayout, SEO lengkap (SEO-001), integrasi WordPress, filter/pengurutan.
## Keputusan yang masih berlaku
1. **Rute/data.** `categoryPath(slug)` di `app/utils/routes.ts`; slug valid = 9 kategori resmi `getCategories()`, lainnya (mis. anak `ruang-visual`) 404. API `server/api/category/[slug].get.ts` (`?halaman=N`, hanya `publish`, urut terbaru, tanpa field `body`).
2. **Paginasi.** `CATEGORY_PER_PAGE = 10` (`app/config/category.ts`); `halaman` valid `^[1-9][0-9]{0,3}$`, tidak valid atau lewat batas = 404; kategori kosong = keadaan kosong netral; Sebelumnya/Berikutnya tautan biasa SSR (`rel`), tepi = teks biasa (tampilan paginasi kemudian digantikan "Lebih banyak" di UX-001). Navigasi SPA maju memindah fokus ke `<h1>` dan gulir ke atas, bukan pada Back/Forward.
3. **Titik masuk tautan.** Menu, laci, footer, label kartu, chip hero, label dan breadcrumb Detail = `<a>` sungguhan, satu tab stop, tanpa `<a>` bersarang; laci menutup setelah navigasi dan fokus ke `<h1>`. Tetap bukan tautan: judul section Beranda, topik Ruang Visual, Redaksi/footer `to: null`, ikon sosial tanpa URL, tag.
4. **`aria-current` dan judul.** Kategori aktif di menu/laci/footer ditandai berbasis slug rute (juga `?halaman=N`), gaya aktif = gaya hover yang ada. Judul dokumen `"<Kategori> - Ini Sumedang"`, canonical `/kategori/<slug>` (+ `?halaman=N` bila N > 1).
5. **Fixture.** Default: 23 artikel Hukum (3 halaman 10/10/3), gambar `figma-1..8.jpg` dipakai ulang; edge: kategori kosong/draft/private. Tanpa dependensi, `nuxt.config.ts`, token, atau aset baru.
6. **E1 dan E5.** Beranda = kategori "Berita": `categoryPath('berita')` = `/`, `/kategori/berita` dialihkan 308 ke `/` (`server/routes/kategori/berita.get.ts` + middleware). Halaman kategori memakai tata letak Beranda: kolom kiri 739 px (kartu 2 kolom 358/23; mobile 1 kolom 354×104) + kolom kanan 357 px.
7. **E2, E3, E4.** Sidebar sejajar hero mengikuti Figma (tab y 161, bawah ±709). Hero: animasi geser-kiri 400 ms (mati pada reduced-motion), penulis+waktu di kiri bawah judul. Tautan "Lainnya" + panah di Sepak Bola, Nasional, Bisnis dan Teknologi, Otomotif (tidak di Rekomendasi/Ruang Visual).
8. **E6 dan E7.** `AdSlot` = penampung statis "Advertisement" (tanpa tautan/skrip/HTML, bukan tab stop) di semua posisi iklan frame final (Beranda, Detail desktop, kolom kanan kategori). Footer desktop: Kategori satu kolom, tinggi 363,03 px (Figma 270; pilihan pemilik).
## Kriteria penerimaan
1. `/kategori/<slug>` untuk 9 kategori resmi; semua titik masuk tautan sungguhan, laci/fokus/`aria-current` benar; slug tak dikenal, `ruang-visual`, dan `halaman` tak valid = 404 terkontrol; kategori kosong = keadaan kosong netral.
2. Fixture default punya kategori > 1 halaman; edge punya kategori kosong; paginasi 10/10/3 tanpa duplikat.
3. E1–E7 sesuai butir keputusan 6–8; ukuran kartu/komponen lain tidak berubah (rect relatif identik dengan `16350f7`).
4. Gerbang: `lint`, `typecheck`, `npm test`, `build` kode 0; `v-html=` tepat satu baris; XSS edge 0 eksekusi; `ci.yml`: hanya `npm test --if-present` → `npm test`.
## File yang disentuh
`app/pages/kategori/[slug].vue`, `app/components/{category,ad,layout,news,home,article}/**`, `app/config/{category,footer,home}.ts`, `app/utils/**`, `server/api/category/**`, `server/routes/kategori/berita.get.ts`, `server/services|utils|fixtures/**`, `tests/unit/**`, `.github/workflows/ci.yml` (PM).
## Bukti
FE: lint/typecheck/build kode 0; `npm test` 363 → 374 (M1/L1) → 391/391; audit identik baseline (40: 2 low, 38 moderate). Baseline regresi `16350f7`; hash commit akhir tidak tercatat di berkas.
QA r1 (2 Nov): `QA_PASSED` tanpa Critical/High (363/363; temuan M1, M2, L1–L7; M1/L1 diperbaiki, 38 pemeriksaan browser). QA E1–E7 (3 Nov): `QA_PASSED` tanpa Critical/High (391/391; L2 jarak footer diperbaiki). Total 2 putaran QA.
## Catatan
- **Wajib sebelum tayang:** penampung iklan "Advertisement" diganti konten CMS (ADS-002) atau disembunyikan (PRD §13 butir 9). **M2** (target sentuh tautan baru < 24 px; POLISH-01 D41) usulan PM diperlakukan sama dengan D25, menunggu keputusan pemilik.
- **Menunggu pemilik:** tafsiran E1–E7 dan keputusan tata letak tanpa frame (POLISH-01 D9, D34–D48); format judul `"<Kategori> - Ini Sumedang"` vs Detail `"<judul> — IniSumedang"`; L6 (label kartu di halaman kategori menaut ke halaman sama, ±10 tab stop berlebih; opsi: teks biasa di halaman itu); `/api/category/berita` masih 200 (opsi: 404).
- **Celah:** frame Kategori tidak ditemukan (pencarian ulang dianjurkan); `OFFICIAL_CATEGORY_SLUGS` menduplikasi `getCategories()` (satukan saat integrasi WordPress); payload galat 404 memuat `url` (bawaan Nuxt; ketat butuh penanganan error global).
- **Low diterima:** L7 (`/kategori/x/` 200, `halaman[]=2` parameter lain), 9 `aside` "Iklan" berlabel sama, iklan 737 rata kiri di tablet, CLS cold ≤ 0,0017, 404 browser = halaman error bawaan Nuxt. Tidak teruji: tab stop Detail penuh (iframe YouTube), `/api/*` edge vs baseline, kontras chip hero.
Versi lengkap sebelum pemangkasan: git show 3e8e137:docs/tasks/PAGE-003.md
