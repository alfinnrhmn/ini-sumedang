# HOME-01 — Beranda slice 1: kartu berita + section Rekomendasi (8 kartu)

| Field | Isi |
|---|---|
| **ID / Status** | `HOME-01` · `DONE` (PM 30 Okt 2026, setelah `QA_PASSED` putaran 2; tidak dikomit) |
| **Dependensi** | SET-001 `DONE`; SET-002 `DONE`. Tidak menunggu gerbang G-WP (UI dan data contoh) |
| **Rujukan** | PRD v1.10 §3.4, §3.6, §4.6, §6, FR-02; Figma `21:4950` (desktop), `90:1611` (mobile); `docs/decisions/0004-merriweather-rfn.md` |

## Tujuan
Beranda `/` menampilkan section **Rekomendasi** dengan **8 kartu berita** dari data contoh lewat fungsi layanan bertipe domain, sesuai Figma desktop dan mobile. Slice ini memiliki `NewsCard` dan `SectionTitle`; slice berikutnya memakainya ulang.

## Di luar scope
Header, menu, footer, hero, kolom samping (kolom kanan 357 px dibiarkan kosong), section kategori lain, Ruang Visual, iklan, widget sosial, "Lihat Lainnya" (belum diputuskan pemilik), halaman Detail dan `/berita/[slug]`, komposisi "terbaru + terpopuler", sanitasi `body`, WordPress.

## Keputusan yang masih berlaku
- Satu komponen `NewsCard`, dua varian dalam satu DOM: horizontal (354×104) di bawah 1024 px, vertikal (358) di ≥ 1024 px; label kategori hanya tampil di mobile (G19). Tablet mengikuti PRD §3.4.
- `articlePath(article)` di `app/utils/routes.ts` mengembalikan `null` pada slice ini: kartu `<article>` tanpa `<a>` (tanpa tautan mati); PAGE-002 mengisinya.
- Waktu relatif WIB (baru saja / N menit / N jam / N hari lalu / tanggal) dari satu nilai `now` per permintaan; judul kartu dipotong 3 baris; tanpa gambar = blok `--color-surface`; `<h1>` tersembunyi "IniSumedang", `<h2>` section, `<h3>` kartu; `<html lang="id">` lewat `useHead` di `app/app.vue`.
- Rekomendasi = 8 artikel terbit terbaru, tanpa duplikat; data hanya via `getRecommendedArticles()` (`server/services/`) dan `server/api/articles/recommended.get.ts`; mapper mendekode entitas HTML; hanya `status=publish`.
- **Deviasi sengaja:** iklan `84:1442` tidak dirender (ADS-001/002 `DITUNDA`), baris 4 mengikuti baris 3 tanpa jarak kosong. Garis pemisah `42:374` (`#D9D9D9`) memakai `--color-gray-5` (token terdekat; daftar warna ditutup pemilik).
- Mobile mengikuti desktop/PRD §3.6, bukan frame `90:1611` ("Berita", 6 kartu, iklan): judul "Rekomendasi", 8 kartu, tanpa iklan dan "Lihat Lainnya"; pitch 120 px; judul section mobile dengan aksen tepat di bawah teks (`padding-bottom: 5px` hanya ≥ 1024).
- Penerbit kartu mobile memakai `--type-card-timestamp`; avatar satu aset `public/images/avatar-mobile.png` (20×20) untuk kedua layout.
- Cincin fokus menjorok 4 px: komponen ber-`overflow: hidden` wajib padding ≥ 4 px. Angka px di luar skala (termasuk 4, 14, 23, 28, 30, 48) diizinkan hanya dengan komentar node Figma; `row-gap: 48px`.

## Kriteria penerimaan
1. `/` merender `<h2>` "Rekomendasi", garis pemisah + aksen, dan tepat 8 kartu dalam satu grid (tanpa salinan DOM per viewport).
2. Desktop 1440: kolom kiri 739 px, grid 2×4, kartu 358 px (gambar 358×225 radius 8), tanpa label kategori.
3. Mobile 402: 8 kartu horizontal 354×104, thumbnail 104×104 radius 10, label kategori, margin 24.
4. Teks "Rekomendasi" Merriweather 600 lokal selebar 152 ±2 px pada 1440; first paint Slow 4G: teks terlihat saat swap, CLS dicatat.
5. Fixture (≥ 12 artikel terbit, kasus buruk, ≥ 2 `draft`/`private` yang tidak tampil); tanpa `<a>` mati; tanpa token/dependensi baru; `nuxt.config.ts` tidak berubah; `lint`, `typecheck`, `build` kode 0.

## File yang disentuh
`app/app.vue`, `app/pages/index.vue`, `app/components/news/NewsCard.vue`, `app/components/home/SectionTitle.vue`, `app/types/article.ts`, `app/utils/{relative-time,routes}.ts`, `server/{fixtures,services}/**`, `server/api/articles/recommended.get.ts`, `public/{fixtures,images}/**`, berkas ini.

## Bukti
- FE (30 Okt 2026): lint, typecheck, build kode 0 (setelah perbaikan QA putaran 1); teks "Rekomendasi" 152,25 px; CLS 1440 0,0043, 402 0,0025.
- QA putaran 1: `QA_FAILED` (Low: aksen judul mobile 5 px terlalu rendah; `<html>` tanpa `lang`), diperbaiki FE.
- QA putaran 2 (salinan bersih, Edge headless CDP): `QA_PASSED`, K1–K11 dan H1–H4 LULUS; lint/typecheck/build/audit kode 0 (7 low); tanpa overflow 1440–320.

## Catatan
- Menunggu keputusan pemilik: penerbit "IniSumedang" atau "Redaksi IniSumedang" (PRD §4.4/§6 [?]); "Lihat Lainnya" `68:1145`.
- Komposisi Rekomendasi "campuran terbaru + terpopuler" butuh `getPopularArticles` (HOME-03) dan menjadi pemicu Vitest: task lanjutan setelah HOME-03 bersama permintaan persetujuan Vitest.
- Tidak teruji (diterima): fokus keyboard pada tautan nyata (menunggu `articlePath` di PAGE-002), Safari/Firefox, scrollbar 15 px Chrome asli, diff piksel otomatis. `#1A212E` dibahas di slice Detail.

Versi lengkap sebelum pemangkasan: git show 3e8e137:docs/tasks/HOME-01.md
