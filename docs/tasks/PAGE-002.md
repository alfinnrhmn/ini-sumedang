# PAGE-002 — Detail berita `/berita/[slug]` (desktop + mobile, data fixture)
| Field | Isi |
|---|---|
| **ID** | PAGE-002 (P0; FE → QA → PM; dibuat 2 Nov 2026) |
| **Status** | `DONE` (PM 2 Nov 2026, setelah `QA_PASSED` putaran 2 dan persetujuan pemilik atas commit, 2 Nov 2026) |
| **Dependensi** | SANITIZE-001, HOME-01..07 `DONE`; gerbang G-WP tidak menghalangi (fixture) |
| **Rujukan** | PRD v1.10 FR-05, FR-06, FR-07, §3.8, §4.4, §10.1, G14; Figma Detail desktop `130:515`, mobile `130:2945`; AGENTS.md aturan 1, 3, 6, 7, 8 |
## Tujuan
Halaman Detail Berita sesuai frame final: breadcrumb, kepala artikel, foto + kredit, isi (HTML disanitasi di server), tombol bagikan, Berita Terkait (sidebar desktop + blok bawah). `articlePath()` = `/berita/<slug>` sehingga semua kartu artikel menjadi tautan sungguhan.
## Di luar scope
Pencarian (PAGE-004), integrasi WordPress, halaman error berlayout, CSP (SEC-001), `Web Share API`, komentar. Tidak dirender (aturan desain): pencarian/tema header, panel berlangganan footer, Instagram dan WhatsApp, "Lainnya"/"Lihat Lainnya" tanpa tujuan; widget sosial dan iklan Detail kemudian ditambah SOC-001 dan PAGE-003 (E6).
## Keputusan yang masih berlaku
1. **Kartu.** Semua kartu (NewsCard, Ruang Visual, judul hero) = satu tab stop, gambar bukan tautan kedua; fokus 2+2 px, hover judul bergaris bawah (`@media (hover: hover)`).
2. **API.** `/api/article/[slug]` mengembalikan `{ article, related: { sidebar, bottom, bottomMobile }, now }` dengan `bodyHtml` tersanitasi; HTML mentah tidak pernah keluar. Slug `^[a-z0-9]+(?:-[a-z0-9]+)*$` ≤ 120; tidak ada/`draft`/`private`/tak valid = 404 netral. Isi kosong atau hanya spasi = pesan "Isi artikel belum tersedia."
3. **`v-html` satu tempat.** `ArticleBody.vue`; `git grep -n 'v-html=' -- app server` tepat satu baris; uji pemindai sink (SN7) menjaga.
4. **Berita Terkait.** Peringkat tag → kategori → terbaru, hanya `publish`; ≥ 1024: sidebar 1–4 + bawah 5–7, < 1024: `bottomMobile` 1–3; judul "Berita Terkait" (G14); tablet 3 kolom (deviasi POLISH-01 D32).
5. **Bagikan.** Facebook dan X = `<a rel="noopener noreferrer">`; Salin tautan = `<button>` dengan `aria-live`; Instagram/WhatsApp tidak dirender.
6. **Metadata.** `useSeoMeta`: `"<judul> — IniSumedang"`, og, canonical origin + `/berita/<slug>`. Waktu baca dihitung server (200 kata/menit).
7. **Fixture.** Artikel teks-Figma = id 81 (`/berita/fixture-81`); set `edge` memuat artikel lama XSS/iframe non-YouTube/isi kosong/isi spasi/judul panjang; `draft`/`private` = 404.
8. **Warna/token.** Hanya token baru `--color-article-title` (`#1A212E`); tanpa dependensi, `nuxt.config.ts`, atau font baru.
## Kriteria penerimaan
1. Desktop 1440 dan mobile 402 sesuai node `130:515`/`130:2945`; selisih dilaporkan sebagai angka.
2. Semua kartu tautan sungguhan, satu tab stop; kategori teks biasa saat itu (jadi tautan di PAGE-003).
3. API hanya `bodyHtml` tersanitasi; slug buruk 404; `v-html=` satu baris; XSS end-to-end set edge 0 eksekusi, iframe non-YouTube 0 di DOM.
4. Bagikan, Berita Terkait (4 + 3, tanpa duplikat), dimensi gambar 716×400 (CLS gambar 0).
5. `lint`, `typecheck`, `npm test`, `build` kode 0.
## File yang disentuh
`app/pages/berita/[slug].vue`, `app/components/article/**`, `NewsCard`/`Hero`/`VisualTopic` (tautan/fokus/hover), `app/utils/{routes,share,relative-time}.ts`, `app/config/article.ts`, `server/api/article/**`, `server/{services,fixtures,utils}/**`, `tokens.css` (+1 baris), `public/icons/**`, `tests/unit/**`.
## Bukti
FE: lint/typecheck/build kode 0; `npm test` 269 → 292/292; audit identik baseline (40: 2 low, 38 moderate). Regresi Beranda 0 selisih rect; `ci.yml` tidak diubah. Hash commit tidak tercatat di berkas.
QA r1: `QA_PASSED` tanpa Critical/High (XSS 67 halaman 0 eksekusi; temuan M-1, M-2, L-1, L-6, L-7). QA r2: `QA_PASSED` tanpa Critical/High/Medium (292/292, XSS ulang 0 eksekusi). Total 2 putaran QA.
## Catatan
- **Wajib sebelum tayang (PRD §13):** area klik logo header ≥ 24 px (POLISH-01 D25); hapus `public/fixtures/` dan `FIXTURE_SET`; basis URL kanonis dari konfigurasi; validasi skema URL gambar; CSP `frame-src` = `EMBED_ALLOWED_HOSTS`.
- **Menunggu pemilik:** platform bagikan tambahan (Instagram tanpa URL bagikan web, WhatsApp tidak di Figma); font Merriweather 400 dan Inter 700 belum di-host (dirender 600; berkas baru butuh ADR dan lisensi) atau terima deviasi; basis URL kanonis produksi; saran QA hapus `--if-present` dari langkah `npm test` di `ci.yml` (dilakukan kemudian di PAGE-003).
- **Deviasi Figma (POLISH-01 D26–D33, M2–M5):** warna `#5E6B7D`, `#DEE3EB`, `#D4E0F2`, `#727272` dipetakan ke token terdekat (selisih > 4, usul token baru); penulis "IniSumedang" bukan "IniSumedang.com"; tanggal terbit ditambah; header Detail disamakan dengan Beranda.
- **Low diterima:** L-8, L-9 (CLS ≤ 0,0508 di 820 px, penukaran font), I-1 (isi hanya U+3164/U+2800 tampil div kosong), I-2 (`/berita/<slug>/` 200), sandbox iframe `allow-scripts allow-same-origin` (lintas-origin); amplop galat 404 memuat `url` (bawaan Nitro); unduhan gambar blok tersembunyi tidak diverifikasi. Repo belum `npm ci` (`sanitize-html`).
Versi lengkap sebelum pemangkasan: git show 3e8e137:docs/tasks/PAGE-002.md
