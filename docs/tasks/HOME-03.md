# HOME-03 — Beranda slice 3: kolom samping (tab Terbaru | Terpopuler)

| Field | Isi |
|---|---|
| **ID / Status** | HOME-03 · `DONE` (PM 31 Okt 2026, setelah `QA_PASSED` putaran 2; putaran 1 `QA_FAILED`: tinggi kolom samping berbeda antar tab di mobile/tablet (F1), diperbaiki; latar tab aktif mobile (F2) tidak diterapkan karena tanpa token). Dibuka PM 30 Okt 2026 (HOME-01 dan HOME-02 `DONE`; gerbang G-WP tidak menghalangi UI dan layanan fixture, pengecualian pemilik 30 Okt 2026) |
| **Dependensi** | HOME-01 `DONE`. Boleh dengan fixture di balik fungsi layanan (pengecualian pemilik 30 Okt 2026); integrasi WordPress = task terpisah setelah G-WP. G-WP tetap wajib sebelum PAGE-002/003/004 dan sebelum situs tayang |
| **Rujukan** | PRD v1.10 §3.6, FR-02; Figma `21:4950` (tab `130:2202`, daftar `34:354`), mobile `90:1611` (`Card Popular News` ×4, `100:2461`) |

## Tujuan
Kolom samping Beranda berisi tab **Terbaru | Terpopuler** dengan 4 item per tab, dapat dioperasikan dengan keyboard, dirender di server.

## Di luar scope
Hero, iklan kolom samping, widget sosial, "Lihat Lainnya", komposisi Rekomendasi campuran, penghitungan tayangan.

## Keputusan yang masih berlaku
1. Tab: `role="tablist"/"tab"/"tabpanel"`, `aria-selected`, `aria-controls`; panah kiri/kanan, Home/End; kedua panel dirender di server, panel nonaktif `hidden`; tanpa layout shift. Garis aksen beranimasi, mati pada `prefers-reduced-motion: reduce`.
2. Data: `getLatestArticles(4)`, `getPopularArticles(4)`; Terpopuler = bertag `terpopuler` dalam 14 hari (`POPULAR_WINDOW_DAYS`, umur tepat 14 hari masuk), hanya `publish`. Tidak ada hasil → tab Terpopuler disembunyikan (bukan diisi terbaru).
3. Varian `NewsCard layout="compact"` (hanya `SidebarTabs`): mobile/tablet item 82, thumbnail 104×80; desktop item 104, thumbnail 104×104; judul selalu klem 2 baris sehingga tinggi aside Terbaru = Terpopuler di semua lebar.
4. Label tab dan `h2` tersembunyi dinamis ("Terbaru dan Terpopuler" bila ada populer, "Terbaru" bila kosong).
5. Posisi: desktop kolom kanan x 923; mobile/tablet di atas Rekomendasi. Kartu tanpa tujuan = `<article>` tanpa `<a>`.
6. Fixture `figma` meniru Figma (Terpopuler id 61–68); kasus buruk di set `edge`; `/api/articles/recommended` tetap 8.

## Kriteria penerimaan
1. Tab dan dua daftar sesuai node pada 1440 dan 402. 2. Perilaku tab sesuai keputusan 1 (keyboard saja). 3. HTML mentah memuat judul kedua daftar. 4. Jendela 14 hari dan tab tersembunyi sesuai keputusan 2. 5. Tidak ada kartu/token baru; `lint`, `typecheck`, `build` kode 0. 6. PRD §15.1 konsisten dengan status HOME-01..03. 7. Fixture mengikuti pola FIX-001/HOME-02; section HOME-02 tidak berubah.

## File yang disentuh
`app/pages/index.vue`, `app/components/home/SidebarTabs.vue`, `app/components/news/NewsCard.vue` (prop `compact`), `app/config/home.ts`, `app/types/article.ts`, `server/services/articles.ts`, `server/api/articles/sidebar.get.ts`, `server/fixtures/posts.ts`.

## Bukti
- FE putaran 3: lint/typecheck kode 0, `Build complete`; QA r1 `QA_FAILED` (F1 High, F2 Medium, L1, L2), diperbaiki.
- QA r2 31 Okt 2026: `QA_PASSED` (K1–K9, K11, T1–T4); selisih tinggi aside Terbaru vs Terpopuler 0 di 8 lebar; Rekomendasi/HOME-02 identik dengan baseline HEAD; lint/typecheck/build/audit kode 0.

## Catatan
- **Terbuka, untuk pemilik:** latar biru `rgba(15,52,202,0.2)` + sudut atas 4 pada tab Terbaru aktif mobile tidak dibuat (token `#0F34CA` dan radius 4 belum ada); penanda aktif hanya garis aksen. Bila disetujui, task terpisah.
- **Deviasi diterima PM (untuk pemilik):** penerbit Bold 700 desktop dan ikon jam 16 px tidak dibuat (tanpa token/aset); placeholder Figma diganti data layanan; garis aksen -1,5 px (desktop) / -3 px (mobile); lebar kolom teks desktop 232 (Figma 237–241).
- **Terbuka:** K10 `npm ci` tidak teruji. Integrasi WordPress nanti: `after` eksklusif, kirim `now − 14 hari − 1 detik`. Komposisi Rekomendasi "campuran terbaru + terpopuler" (PRD §3.6) = task lanjutan, memicu Vitest dan butuh persetujuan pemilik. Label "Terpopuler" dipilih editor, bukan tayangan.
- Riwayat: BACKLOG → READY 30 Okt 2026 → QA_FAILED (r1) → QA_PASSED (r2) → DONE 31 Okt 2026 (PM).

Versi lengkap sebelum pemangkasan: git show 3e8e137:docs/tasks/HOME-03.md
