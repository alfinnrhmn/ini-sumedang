# HOME-02 — Beranda slice 2: section kategori (Sepak Bola, Nasional, Bisnis dan Teknologi, Otomotif)

| Field | Isi |
|---|---|
| **ID / Status** | `HOME-02` · `DONE` (PM 30 Okt 2026, setelah `QA_PASSED` putaran 2; putaran 1 `QA_FAILED` karena lebar kartu section desktop 232 px, diperbaiki; tidak ada `npm ci` di QA) |
| **Dependensi** | HOME-01 `DONE`. Tidak menunggu gerbang G-WP. Angka final per section [?] — default 4 |
| **Rujukan** | PRD v1.10 §3.6 (`HOME_SECTION_COUNTS`), §4.4, §4.6, FR-02; Figma `21:4950` (`84:1437`, `57:496`, `57:501`, `57:505`) |

## Tujuan
Empat section kategori Beranda tampil dengan jumlah kartu dari satu konfigurasi, memakai ulang komponen dan data HOME-01. Urutan: Rekomendasi → Sepak Bola → *(Ruang Visual, HOME-04)* → Nasional → Bisnis dan Teknologi → Otomotif.

## Di luar scope
Ruang Visual, iklan (`63:595`, `63:627`), "Lihat Lainnya", `/kategori/[slug]`, kolom samping, header/footer, komposisi Rekomendasi.

## Keputusan yang masih berlaku
- `HOME_SECTION_COUNTS`: satu konstanta di `app/config/home.ts`, default 4 per section [usulan; pemilik menyebut "6 atau 4"].
- `getArticlesByCategory(slug, limit)` di `server/services/`; handler `api/articles/by-category` memvalidasi `category` (hanya slug section: `sepak-bola`, `nasional`, `bisnis-teknologi`, `otomotif` [I; final di G-WP]) dan `limit` bilangan bulat 1–12; nilai buruk ditolak 400 terkontrol tanpa jejak tumpukan.
- Judul section = teks konfigurasi, bukan nama kategori dari data. Section nol artikel tidak dirender; 1 artikel = 1 kartu.
- Wajib memakai ulang `NewsCard` dan `SectionTitle`; komponen/gaya kartu kedua = GAGAL. Lebar kolom 739 px (`.category-section .list { width: 100% }` pada ≥ 1024); aksen judul dan jarak garis-ke-kartu 28 px mengikuti HOME-01.
- Fixture: set `figma` (default) meniru Figma, ≥ 6 terbit per kategori section, tanpa `draft`/`private`; kasus buruk (kategori 1 artikel, kategori kosong, ≥ 2 `draft`/`private`) hanya di set `edge` (`FIXTURE_SET=edge`). Dimensi gambar fixture dideklarasikan 716×400. Kartu yang sama boleh muncul di Rekomendasi dan Nasional (tanpa dedupe).

## Kriteria penerimaan
1. Empat section berurutan, masing-masing `<h2>` non-interaktif + garis pemisah dan aksen.
2. Jumlah kartu = `HOME_SECTION_COUNTS`; mengubah nilai tidak menyentuh berkas lain.
3. Kartu sama dengan HOME-01 (label kategori hanya mobile); tanpa `<a>` mati.
4. Fixture per set sesuai keputusan di atas; validasi parameter berfungsi.
5. Dimensi fixture 716×400 (sesuai berkas nyata); tanpa 1354×756 tersisa.
6. Tanpa token/dependensi baru, `nuxt.config.ts` tidak berubah; `lint`, `typecheck`, `build` kode 0.

## File yang disentuh
`app/pages/index.vue`, `app/components/home/**`, `app/config/home.ts` (baru), `app/types/**` (tambahan), `server/{fixtures,services,utils}/**`, `server/api/articles/**`, `public/fixtures/**`, berkas ini.

## Bukti
- FE (30 Okt 2026): lint, typecheck, build kode 0 (`Build complete in 14.6s`, putaran 2).
- QA putaran 1: `QA_FAILED` D1 (High) kartu section 232,3 px vs Figma 358 px; diperbaiki FE putaran 2 (kartu 358 × 349,6).
- QA putaran 2 (build produksi, salinan di luar repo): `QA_PASSED`, K1–K9, K11, C1–C4, kriteria 1–8 LULUS; handler 400 terkontrol untuk input buruk; lint/typecheck/build/audit kode 0; K10 `npm ci` tidak teruji.

## Catatan
- Terbuka bagi pemilik (tidak menghalangi): angka final per section (4 atau 6).
- Otomotif di Figma hanya 1 kartu (desain belum rapi); angka dari konfigurasi, bukan Figma. Judul fixture selain kartu Figma bertanda [I].
- Temuan Low/Info diterima: judul fixture terpotong 3 baris di 1024 (clamp `NewsCard`); respons 400 bawaan Nitro memantulkan `url` permintaan; `alt` gambar kartu = judul; aksen judul mobile Nasional 81,69 vs 86.

Versi lengkap sebelum pemangkasan: git show 3e8e137:docs/tasks/HOME-02.md
