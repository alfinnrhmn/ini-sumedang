# HOME-04 — Beranda slice 4: Ruang Visual (4 topik)

| Field | Isi |
|---|---|
| **ID / Status** | HOME-04 · `DONE` (PM 31 Okt 2026, setelah `QA_PASSED` putaran 1; K10 `npm ci` tidak teruji). Dibuka PM 31 Okt 2026 (HOME-01 `DONE`; gerbang G-WP tidak menghalangi UI dan layanan fixture, pengecualian pemilik 30 Okt 2026) |
| **Dependensi** | HOME-01 `DONE`. Boleh dengan fixture; integrasi WordPress (kategori induk `ruang-visual`) = task terpisah setelah G-WP. G-WP wajib sebelum PAGE-002/003/004 dan sebelum situs tayang |
| **Rujukan** | PRD v1.10 §3.6 (Ruang Visual), §4.4, §4.6; Figma `21:4950` (judul `65:1072`, blok `101:2708/2709/2710/2726`), mobile `179:2422` |

## Tujuan
Section **Ruang Visual** menampilkan 4 topik; tiap topik = judul topik, 1 kartu besar, dan 3 berita berthumbnail kecil.

## Di luar scope
Iklan `63:595`, "Lihat Lainnya" `68:1129`, arsip topik (judul topik tidak menaut), kolom samping, kategori induk di menu 9 kategori.

## Keputusan yang masih berlaku
1. Topik = kategori anak dari `ruang-visual`; Beranda memakai 4 anak non-kosong yang paling baru dibuat (urutan id menurun), yang tanpa artikel terbit dilewati. `getVisualTopics()` → `{ topic, lead, items[3] }[]`; induk tak ada → `[]`, section tidak dirender. Endpoint `/api/articles/visual-topics`.
2. Komponen sendiri `HomeVisualTopic` (bukan varian `NewsCard`; kartu lama terbukti tak berubah); `SectionTitle` dipakai ulang.
3. Judul "Ruang Visual" tampil juga di mobile (gaya judul section mobile), walau frame mobile tidak memilikinya. Urutan mobile: Sepak Bola → Ruang Visual → Nasional.
4. Kartu tanpa tujuan = `<article>` tanpa `<a>`; heading `h2` section → `h3` nama topik (non-interaktif) → `h4` judul kartu.
5. Nama topik dibatasi 2 baris, judul kartu besar 3 baris, judul item 2 baris (klem); gambar `loading="lazy"`.
6. Fixture `figma` (Pemerintahan, Ekonomi & Inovasi, Wisata, Olahraga) dan `edge` (anak kosong, 1 artikel, judul panjang); draft/private tidak muncul.

## Kriteria penerimaan
1. Judul + 4 blok 2×2 (desktop) / tertumpuk (mobile) sesuai node; foto utama 358×189,44 dan thumbnail 80×60 pada 1440. 2. Tepat 4 topik non-kosong terbaru; blok kurang dari 4 artikel tidak merusak tata letak. 3. Kasus buruk fixture tampil benar. 4. Tanpa token/dependensi baru; `lint`, `typecheck`, `build` kode 0.

## File yang disentuh
`app/components/home/VisualTopic.vue` (baru), `app/pages/index.vue`, `app/types/article.ts`, `server/services/articles.ts`, `server/api/articles/visual-topics.get.ts` (baru), `server/fixtures/posts.ts`.

## Bukti
- FE: lint/typecheck/build kode 0 (salinan di luar repo); ukuran vs Figma terukur di 8 lebar, overflow nol.
- QA r1 31 Okt 2026: `QA_PASSED` (K1–K9, K11, V1–V4); blok 358×638,19 (Figma 638,44), mobile 354×620,06 (620,33); hash section lain identik dengan baseline HEAD; `/api/articles/recommended` tetap 8; lint/typecheck/build/audit kode 0.

## Catatan
- **Terbuka (wajib saat integrasi WordPress):** kasus "kategori induk `ruang-visual` tidak ada atau semua topik kosong" hanya ditinjau dari kode, belum diuji; uji dengan data nyata (PRD §13). Alternatif tag + penanda "topik unggulan" (PRD §3.6) diputuskan di G-WP.
- **Deviasi Figma diterima, dicatat di `docs/tasks/POLISH-01.md` (D4–D7):** judul topik Inter 600 (Figma Bold 700, tanpa berkas font); warna `#1A1C21` dipetakan ke `--color-black-2` (POLISH-01 M1); judul topik blok pertama memakai pola blok 2–4 (padding 10); garis aksen 160,66 vs 154. Gambar placeholder diganti `figma-1..8.jpg`.
- **Temuan Low diterima:** nama topik panjang terpotong 2 baris dan judul kartu besar 3 baris; batas panjang nama topik = topik editorial WordPress (G-WP). Jarak garis ke teks topik mobile 30 diturunkan [I].
- K10 `npm ci` dan `npm audit` tidak dijalankan FE; `npm ci` tidak teruji QA.
- Riwayat: BACKLOG 30 Okt 2026 → READY 31 Okt 2026 → QA_PASSED (r1) → DONE 31 Okt 2026 (PM).

Versi lengkap sebelum pemangkasan: git show 3e8e137:docs/tasks/HOME-04.md
