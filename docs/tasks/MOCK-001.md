# MOCK-001 — Data contoh (fixture) + fungsi layanan bertipe domain
| Field | Isi |
|---|---|
| **ID** | MOCK-001 (P0; QA → FE → QA → PM; dibuat 29 Okt 2026) |
| **Status** | `DITUNDA` — alasan: digantikan oleh slice vertikal (keputusan pemilik 30 Okt 2026); sebelumnya `BACKLOG`. Digantikan oleh HOME-01 sampai HOME-05 (data tipis per slice) |
| **Dependensi** | SET-001 `DONE`; WordPress ditunda (G21, PRD prinsip 9) |
| **Rujukan** | PRD v1.10 prinsip 7 dan 9, §3.6, §3.8, §6, §11; AGENTS.md aturan 2, 6, 8 |
## Tujuan
UI membaca berita lewat fungsi layanan bertipe domain yang sama dengan yang kelak dipakai untuk WordPress; saat WordPress siap hanya isi fungsi layanan diganti (API-001). Fixture sengaja memuat kasus buruk.
## Di luar scope
Klien WordPress, `fetch` jaringan, sanitasi HTML (`body` tidak dirender di task ini), iklan dan widget sosial (G-WP), komponen/halaman, footer, menulis ke WordPress.
## Keputusan yang masih berlaku
1. **Rancangan [I].** Tipe domain di `app/types/` (PRD §6: `Article`, `Category`, `Tag`, `MediaAsset`, hasil berhalaman); fixture di `server/fixtures/` berbentuk respons REST inti WordPress v2 (tanpa field kustom ditebak, tanggal relatif); mapper di `server/services/` (hapus tag dari `excerpt`, dekode entitas HTML, `readingMinutes` 200 kata/menit [?]); fungsi layanan: `getCategories`, `getArticles`, `getArticleBySlug`, `getRelatedArticles`, `getPopularArticles` (tag `terpopuler`, ≤ 14 hari), `getRecommendedArticles`, `getVisualTopics`; `slug`/`page`/`q` divalidasi (q 2–100 karakter).
2. **Kasus buruk wajib di fixture:** judul sangat panjang (≥ 150) dan pendek (≤ 15); artikel tanpa gambar/kredit/alt; entitas HTML (`&amp;`, `&#8211;`, `&#8217;`, `&#8230;`, `&quot;`, `&lt;`); kategori kosong, 1 artikel, banyak artikel; artikel tanpa tag/banyak tag; ≥ 6 variasi `body` tanpa payload hostile; 9 kategori resmi + induk `ruang-visual` dengan ≥ 5 anak (≥ 1 kosong); tag `terpopuler` (≥ 8 dalam 14 hari, ≥ 2 di luar); skenario pencarian "peraturan pemerintah terbaru"; ≥ 2 artikel `draft`/`private`; ≥ 60 artikel.
3. **Verifikasi (pemilik, 29 Okt 2026):** typecheck + cek manual lewat HTTP ke `server/api`; Vitest ditunda sampai ada logika nyata pertama (komposisi Rekomendasi, penyanitasi, atau peringkat Berita Terkait); bila FE menulisnya, lapor ke PM.
## Kriteria penerimaan
1. Tipe domain sesuai PRD §6; `app/` hanya mengimpor tipe domain; tanpa panggilan jaringan; tanpa `import` fixture dari `app/`.
2. Semua kasus buruk ada; entitas terdekode (`A &amp; B` → `A & B`); hanya artikel `publish` dikembalikan.
3. `getPopularArticles` hanya tag `terpopuler` ≤ 14 hari (kosong → `[]`); `getRecommendedArticles` 8 tanpa duplikat; `getRelatedArticles` tanpa artikel yang dibaca.
4. Nilai `slug`/`page`/`q` buruk (`../`, URL penuh, panjang, kontrol) ditolak terkontrol tanpa jejak tumpukan; tanpa `v-html`.
5. `lint`, `typecheck`, `build` kode 0; tanpa dependensi baru.
## File yang disentuh
`app/types/**`, `server/fixtures/**`, `server/services/**`, `server/utils/**` (validasi), `server/api/**` (handler tipis). Tidak boleh: `package.json`, lockfile, `nuxt.config.ts`, `tests/**`, `app/components|pages/**`, `.env*`, `public/**`.
## Bukti
n/a (task ditunda; tidak ada bukti).
## Catatan
- **Celah/risiko:** fixture dapat berbeda dari WordPress asli; gerbang G-WP (PRD §13) membandingkan. `body` tidak boleh dirender dengan `v-html` sebelum penyanitasi ada (kini SANITIZE-001).
- **Penundaan 30 Okt 2026 (PM):** tipe, fixture, mapper, dan layanan dibuat seperlunya oleh tiap slice HOME dan diperluas, tidak diganti; fungsi di luar slice HOME (`getArticleBySlug`, pencarian, `getRelatedArticles`, validasi, fixture `body`) dikerjakan bersama PAGE-002/003/004 setelah G-WP. Kasus buruk dan kriteria tetap acuan.
- Riwayat: 29 Okt 2026 `BACKLOG` → 30 Okt 2026 `DITUNDA` (PM).
Versi lengkap sebelum pemangkasan: git show 3e8e137:docs/tasks/MOCK-001.md
