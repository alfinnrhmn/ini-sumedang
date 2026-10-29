# MOCK-001 — Data contoh (fixture) + fungsi layanan bertipe domain

| Field | Isi |
|---|---|
| **ID** | MOCK-001 |
| **Status** | `BACKLOG` |
| **Owner** | QA (rencana tes) → FE → QA → PM |
| **Prioritas** | P0 |
| **Dependensi** | SET-001 `DONE`. Tidak butuh SET-002 (tanpa CSS). Keputusan pemilik 29 Okt 2026: WordPress ditunda (G21, PRD prinsip 9) |
| **Rujukan PRD** | v1.10 prinsip 7 dan 9, §3.6, §3.8, §6, §11; AGENTS.md aturan 2, 6, 8 |
| **Dibuat** | 29 Okt 2026 (PM) |

## Tujuan
UI (LAY-001, CARD-001, bagian UI PAGE-001) membaca berita lewat fungsi layanan bertipe domain yang **sama** dengan yang kelak dipakai untuk WordPress. Saat WordPress siap, hanya isi fungsi layanan diganti (API-001), bukan komponen/halaman. Fixture sengaja memuat kasus buruk.

## Node Figma
`n/a` (task data; bentuk tampilan ada di task UI).

## Di luar scope
Klien WordPress, `fetch` ke jaringan, sanitasi HTML (penyanitasi = dependensi, butuh persetujuan; `body` **tidak dirender** di task ini), iklan dan widget sosial (menunggu gerbang G-WP, PRD §13), penerapan `HOME_SECTION_COUNTS` (PAGE-001), komponen/halaman, footer (konfigurasi kode di LAY-001), menulis ke WordPress.

## Rancangan (PM, [I]; FE mengonfirmasi dengan dokumentasi Nuxt 4.x, bukan ingatan)
- **Tipe domain** di `app/types/` sesuai PRD §6: `Article` (id, slug, title, excerpt, body, publishedAt, modifiedAt, categories[], tags[], heroImage, readingMinutes, authorLabel), `Category` (id, slug, name, parent?), `Tag` (id, slug, name) [I, PRD §6 hanya menyebut `tags[]`], `MediaAsset` (src, alt, width?, height?, caption?, credit), hasil berhalaman `{ items, total, totalPages }`.
- **Fixture** di `server/fixtures/`: berbentuk **respons REST inti WordPress v2** (`title.rendered`, `excerpt.rendered`, `content.rendered`, `categories`, `tags`, media tertanam), karena bentuk itu yang kelak dipetakan. Bentuk ini diverifikasi di gerbang G-WP, bukan dianggap fakta; **tanpa field kustom yang ditebak**. Tanggal dinyatakan relatif ("N hari lalu") agar jendela Terpopuler 14 hari tidak basi.
- **Mapper** (`server/services/`): fixture → tipe domain; menghapus tag dari `excerpt`; mendekode entitas HTML pada teks (`&amp;`, `&#8211;`, `&#8217;`, `&#8230;`, `&quot;`, `&nbsp;`, dll.) tanpa dependensi baru; menghitung `readingMinutes` (200 kata/menit [?], rumus final di PRD §6); kredit foto dari caption media sebagai sementara [?, sumber asli di gerbang G-WP].
- **Fungsi layanan** (nama final oleh FE; sama untuk fixture dan WordPress): `getCategories`, `getArticles` (kategori, halaman, jumlah, kata cari), `getArticleBySlug`, `getRelatedArticles`, `getPopularArticles` (tag `terpopuler`, jendela dari `POPULAR_WINDOW_DAYS`), `getRecommendedArticles` (PRD §3.6), `getVisualTopics` (Ruang Visual, PRD §3.6). Pencarian meniru perilaku WordPress bawaan yang **diasumsikan** (semua kata harus ada; judul diprioritaskan) [I, dibuktikan di G-WP].
- **Handler tipis** di `server/api/` hanya bila UI di klien butuh; semua akses data lewat fungsi layanan; tidak ada URL dari input pengguna; `slug`/`page`/`q` divalidasi (PRD §3.5: q 2–100 karakter).

## Kasus buruk yang wajib ada di fixture
| Kasus | Minimal |
|---|---|
| Judul sangat panjang (≥ 150 karakter) dan sangat pendek (≤ 15 karakter) | 2 + 2 artikel |
| Artikel **tanpa gambar** (`heroImage` kosong) dan gambar tanpa kredit/alt | 3 artikel |
| Entitas HTML di judul, ringkasan, nama kategori/tag: `&amp;`, `&#8211;`, `&#8217;`, `&#8230;`, `&quot;`, `&lt;` | tiap jenis ≥ 1; muncul pula di "Bisnis &amp; Teknologi" |
| Kategori kosong (nol artikel); kategori dengan tepat 1 artikel; kategori dengan banyak artikel (> 3 halaman pada `per_page` kecil) | 1 / 1 / 1 |
| Artikel tanpa tag; artikel dengan banyak tag; tag kosong | ≥ 1 masing-masing |
| Isi HTML berbeda-beda (`body`): paragraf saja; judul-anak, daftar, kutipan, tabel; `figure`/gambar dengan `figcaption`; tautan eksternal; teks sangat panjang; isi kosong. **Tanpa** `script`/`on*`/`javascript:` (penyanitasi belum ada; uji hostile ditunda ke task penyanitasi) | ≥ 6 variasi |
| 9 kategori resmi lengkap (nama + slug sesuai PRD §4.4) + kategori induk `ruang-visual` dengan ≥ 5 anak, ≥ 1 anak kosong | 1 set |
| Tag `terpopuler`: ≥ 8 artikel dalam 14 hari, ≥ 2 di luar 14 hari (14 dan 15 hari) | 1 set |
| Pencarian: "peraturan pemerintah terbaru" — artikel memuat ketiga kata, artikel memuat sebagian, artikel tanpa kata itu; query tanpa hasil | 1 set |
| Slug tidak ada → hasil kosong terkontrol (404 di lapisan atas) | 1 |
| Jumlah artikel cukup mengisi Rekomendasi (8), 6 section × (sesuai usulan 4), 4 topik Ruang Visual × 4, dan paginasi kategori | ≥ 60 artikel |

## Kriteria penerimaan
1. Tipe domain sesuai PRD §6; komponen/halaman nanti hanya mengimpor tipe domain (bukan bentuk REST).
2. Semua fungsi layanan di daftar ada, bertipe, dan hanya membaca fixture; **tidak ada** panggilan jaringan; tidak ada `import` fixture dari `app/`.
3. Semua kasus pada tabel "Kasus buruk" ada di fixture (QA menghitung).
4. Entitas HTML dalam teks judul/ringkasan/nama terdekode di tipe domain (`"A &amp; B"` → `A & B`, `&#8211;` → `–`); tag `<p>` dibuang dari `excerpt`.
5. `getPopularArticles` hanya mengembalikan artikel bertag `terpopuler` ≤ 14 hari, urut terbaru; kosong → daftar kosong (bukan terbaru). `getRecommendedArticles` 8 artikel tanpa duplikat (PRD §3.6). `getRelatedArticles` tidak memuat artikel yang dibaca (PRD §3.8).
6. Hanya artikel `publish` yang ikut dikembalikan; fixture berisi minimal 2 artikel `draft`/`private` yang **tidak boleh** muncul.
7. `slug`, `page`, `q` divalidasi; nilai buruk (`../`, URL penuh, panjang, kontrol karakter) ditolak dengan kesalahan terkontrol tanpa jejak tumpukan.
8. Tidak ada `body` yang dirender di task ini; tidak ada `v-html`.
9. `npm run lint`, `npm run typecheck`, `npm run build` kode 0; cek manual lewat HTTP sesuai butir "Verifikasi" di bawah.
10. Tidak ada dependensi baru (`package.json` dan lockfile tidak berubah); tidak ada `.env`.

## Verifikasi (keputusan pemilik 29 Okt 2026): typecheck + cek manual lewat HTTP
**Vitest DITUNDA** sampai ada logika nyata pertama. Pemicunya: komposisi Rekomendasi, penyanitasi HTML (SANITIZE-001), atau peringkat Berita Terkait — mana yang lebih dulu. MOCK-001 diverifikasi dengan `npm run typecheck` dan cek manual QA lewat panggilan HTTP ke `server/api` (`nuxt dev` atau `build` + `preview`), dengan skrip sementara di scratchpad (bukan di repo). Tidak ada skrip `test`, tidak ada `vitest.config.ts`, tidak ada `tests/unit/**`.
Konsekuensi: `getRecommendedArticles` dan `getRelatedArticles` yang memuat logika komposisi/peringkat bisa menjadi pemicu Vitest. Bila FE menulisnya di task ini, FE **melapor ke PM** (Vitest lalu diminta persetujuannya), bukan memasangnya sendiri. Usul PM: tulis versi paling sederhana yang memenuhi M5/M6 dan lapor.

## Rencana tes (QA) — draf PM
| ID | Prasyarat | Langkah | Hasil diharapkan | P |
|---|---|---|---|---|
| M1 | Implementasi selesai | Hitung kasus buruk di fixture terhadap tabel | Semua kasus ada, jumlah ≥ minimal | P0 |
| M2 | – | Panggil `getArticles` tanpa filter, per kategori, kategori kosong, kategori 1 artikel, halaman di luar rentang | Hasil benar; `totalPages` konsisten; di luar rentang kosong terkontrol | P0 |
| M3 | – | Periksa judul/ringkasan/nama yang berentitas | `&amp;` → `&`, `&#8211;` → `–`, `&#8217;` → `’`; tidak ada teks `&amp;` tersisa | P0 |
| M4 | – | `getPopularArticles` dengan fixture 14/15 hari | 14 hari masuk, 15 hari tidak; tanpa tag tidak masuk; semua kosong → `[]` | P0 |
| M5 | – | `getRecommendedArticles` | 8 item, tanpa duplikat, campuran terbaru+terpopuler | P0 |
| M6 | – | `getRelatedArticles(slug)` | Tidak memuat artikel itu; tag sama dulu, lalu kategori, lalu terbaru; tanpa duplikat | P0 |
| M7 | – | `getArticleBySlug` untuk slug ada, tidak ada, draft, private, `../x`, URL penuh, 300 karakter | Ada → artikel; lainnya terkontrol/ditolak; draft/private tidak terlihat | P0 |
| M8 | – | Pencarian "peraturan pemerintah terbaru", sebagian kata, tanpa hasil, `<script>`, 1 karakter, 101 karakter | Semua kata → hasil; sebagian → kosong; tanpa hasil → kosong; input buruk ditolak | P0 |
| M9 | – | `getVisualTopics` | 4 topik non-kosong terbaru dibuat; topik kosong dilewati; tiap topik 1 + 3 artikel | P1 |
| M10 | – | `grep` jaringan: `fetch(\|$fetch(\|http` di `server/services`, `server/fixtures`; `grep` import fixture di `app/` | Tidak ada panggilan jaringan; `app/` tidak mengimpor fixture | P0 |
| M11 | – | `grep v-html` | Tidak ada | P0 |
| M12 | – | `npm run lint && npm run typecheck && npm run build`; `git diff --stat` | Kode 0; hanya berkas di daftar boleh-disentuh | P0 |
| M13 | – | `git diff -- package.json package-lock.json`; `npm run typecheck` | `package.json` dan lockfile tidak berubah; typecheck kode 0; cek M2–M9 dilakukan lewat HTTP ke `server/api` dengan keluaran disalin ke bukti | P0 |

## File yang boleh disentuh
`app/types/**`, `server/fixtures/**` (baru), `server/services/**`, `server/utils/**` (validasi), `server/api/**` (handler tipis; **wajib** karena verifikasi lewat HTTP). Tidak boleh: `package.json`, `package-lock.json`, `nuxt.config.ts`, `vitest.config.ts`, `tests/**`, `app/components/**`, `app/pages/**`, `.env*`, `public/**`.

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| – | – | – | – | – |

## Catatan
- **Diputuskan pemilik (29 Okt 2026):** Vitest ditunda; verifikasi = typecheck + cek manual lewat HTTP. Pemicu Vitest: komposisi Rekomendasi, penyanitasi HTML, atau peringkat Berita Terkait (mana yang lebih dulu). Menggantikan usulan awal PM (menyetujui Vitest di task ini).
- Risiko: fixture dapat berbeda dari WordPress asli; gerbang G-WP (PRD §13) membandingkan. Layanan satu pintu membatasi dampaknya pada isi fungsi/mapper.
- `PAGE-002` tidak boleh merender `body` dengan `v-html` sebelum penyanitasi ada (AGENTS.md aturan 6), walau datanya fixture.
- Riwayat: 29 Okt 2026 → BACKLOG → PM.
