# HOME-07 — Beranda slice 7: hero `Switch`

| Field | Isi |
|---|---|
| **ID / Status** | HOME-07 · `DONE` (PM 31 Okt 2026, setelah `QA_PASSED` putaran 1; K10 `npm ci` tidak teruji; sebelum QA, kontras overlay diperbaiki FE atas keputusan PM). Dibuka PM 31 Okt 2026 (node hero dibaca; font judul diputuskan pemilik; perilaku usulan PM) |
| **Dependensi** | HOME-01 `DONE`; keputusan Merriweather Sans (PRD §4.5) |
| **Rujukan** | PRD v1.10 §3.1, §3.6, §4.5; Figma hero desktop `21:4974` (739×531), mobile `90:2130` (354×238); `docs/decisions/0004`, `0005-merriweather-sans.md` |

## Tujuan
Area hero `Switch` di Beranda (4 slide dari artikel terbit terbaru), di kolom kiri atas desktop dan paling atas di mobile. Slice ditambahkan PM karena hero ada di kedua frame Beranda.

## Di luar scope
Kolom samping, section lain, penyuntingan hero dari WordPress.

## Keputusan yang masih berlaku
1. Carousel **manual**, tanpa putar otomatis, tanpa prev/next atau geser sentuh. Empat titik = `<button aria-current>` (roving tabindex; Enter/Space, panah, Home/End). `<section aria-roledescription="carousel">`, slide `role="group"` "n dari N"; slide tidak aktif `hidden` di HTML server; kotak hero tinggi tetap.
2. Isi = `HERO_SLIDE_COUNT` (4) artikel terbit terbaru lewat `getHeroArticles()` dan `/api/articles/hero`. Kurang dari 2 → titik tidak dirender; 0 → hero tidak dirender. `h1` tersembunyi HOME-01 dipertahankan; judul slide `h2`.
3. Judul desktop Merriweather Sans Regular 400 32/38,4 (hanya satu berkas woff2, di-host sendiri, versi Fontsource 5.3.0 dipin, lisensi OFL repositori pencipta); judul mobile Merriweather SemiBold 19,2 (`--type-heading-mobile`). RFN sama dengan Merriweather, tercakup 0004; `tokens.css` hanya ditambah `@font-face` dan token `--font-hero`, `--type-hero-headline-desktop`, `--tracking-hero-headline`.
4. Penerbit memakai avatar `NewsCard` dan `--font-serif`; chip kategori = kategori pertama (tanpa kategori → tanpa chip). Hero + kolom samping dalam satu baris `.top` (flex ≥ 1024); mobile: hero, kolom samping, Rekomendasi.
5. Lapisan gelap `linear-gradient(transparent, black-1 65% @20%, black-1 90%)` (dari `--color-black-1`, tanpa token baru) ditambahkan agar semua teks ≥ 4,5:1.

## Kriteria penerimaan
1. Hero sesuai node pada 1440 dan 402; judul memakai font yang diputuskan. 2. Carousel manual sesuai keputusan 1, tanpa layout shift. 3. Satu `h1`; judul slide `h2`; tanpa `<a>` mati. 4. Font di-host sendiri dengan lisensi, SHA-256, RFN tercatat; `tokens.css` hanya bertambah; tanpa dependensi baru; `lint`, `typecheck`, `build` kode 0. 5. Rekomendasi, HOME-02/03/04, footer tidak berubah selain posisi y. 6. Isi hero sesuai keputusan 2.

## File yang disentuh
`app/pages/index.vue`, `app/components/home/Hero.vue`, `app/config/home.ts`, `app/types/article.ts`, `server/services/**`, `server/api/articles/hero.get.ts`, `server/fixtures/**`, `public/fonts/merriweather-sans-latin-400-normal.woff2` + `LICENSE-MerriweatherSans.txt`, `app/assets/css/tokens.css` (hanya penambahan, +16/−0), `docs/decisions/0005-merriweather-sans.md`.

## Bukti
- FE: lint/typecheck/build kode 0; kontras render nyata setelah perbaikan 65%: teks ≥ 4,9:1, titik ≥ 15:1 (1440 dan 402, 8 foto fixture).
- Font woff2 SHA-256 `283718899a0070a86c04eae7972abb4df8bf7a7a255fa61f5dfb4b99307ff9a3`; lisensi `c487138e4ea4688386abfaf72ab2cbc72a7c8c358cca19bd70095e0d07d8d9f2`.
- QA r1 31 Okt 2026: `QA_PASSED` (K1–K9, K11, H1–H6); hero 739×531 / 354×238 selisih ≤ 0,02 px; tanpa putar otomatis dan layout shift; regresi identik dengan HEAD; `/api/articles/recommended` tetap 8; lint/typecheck/build/audit kode 0.

## Catatan
- **Terbuka (untuk PM/pemilik):** deviasi Figma di POLISH-01 D12–D18 — termasuk overlay gelap yang **tidak ada di Figma** (Figma tanpa gradien; foto tampil lebih gelap), diterima PM; avatar `avatar-mobile.png` hanya 40×40 tampil 50×50 di desktop (aset resolusi lebih tinggi butuh keputusan); judul hero dipotong 4 baris desktop / 3 baris mobile (`line-clamp`).
- **Temuan Low diterima:** CLS 0,00186 saat font Merriweather Sans menggantikan fallback (`preload` font opsional untuk POLISH-01); `alt` foto hero = judul `h2` (tinjau saat integrasi WordPress); area sentuh titik 16–20 px (< 24 px WCAG 2.5.8) mengikuti Figma.
- Lisensi: baris merek dagang "Merriweather is a trademark of Sorkin Type Co." dan definisi "Source" OFL Sans berbunyi "Gelasio files" (artefak repositori pencipta; tanpa tindakan, dicatat di 0005). K10 `npm ci` tidak teruji.
- Riwayat: BACKLOG 30 Okt 2026 → READY 31 Okt 2026 → QA_PASSED (r1) → DONE 31 Okt 2026 (PM).

Versi lengkap sebelum pemangkasan: git show 3e8e137:docs/tasks/HOME-07.md
