# SANITIZE-001 — Penyanitasi HTML sisi server

| Field | Isi |
|---|---|
| **ID** | SANITIZE-001 |
| **Status** | `DITUNDA` — alasan: **WordPress ditunda** (keputusan pemilik 29 Okt 2026, PRD G21) |
| **Owner** | QA (rencana tes) → FE → QA → PM (setelah dibuka kembali) |
| **Prioritas** | P0 |
| **Dependensi** | SET-001 `DONE`; **persetujuan dependensi** (library penyanitasi + Vitest); dibuka kembali PM bersama PAGE-002. **PAGE-002 bergantung pada task ini** |
| **Rujukan PRD** | v1.10 §10.1 (Data & input), FR-05, prinsip 9, §17; AGENTS.md aturan 6, 3, 8 |
| **Dibuat** | 29 Okt 2026 (PM) |

## Tujuan
HTML dari CMS (isi artikel `body`) disanitasi **di server** dengan allowlist sebelum dirender, sehingga `v-html` hanya pernah menerima keluaran penyanitasi. Berlaku juga untuk data contoh (fixture) bila `body`-nya dirender.

## Node Figma
`n/a` (task keamanan data).

## Larangan tetap
**`v-html` untuk data mentah dilarang** (AGENTS.md aturan 6; skill Fullstack). `body` tidak boleh dirender dengan `v-html` sebelum task ini selesai, walau datanya fixture.

## Di luar scope
Klien WordPress (API-001), sanitasi iklan (iklan hanya gambar + tautan `https`, tanpa HTML; ADS-002), tampilan artikel (PAGE-002), CSP (SEC-001), menulis ke WordPress.

## Rancangan awal [I; pilihan library dan versi dicari FE di npm/dokumentasi resmi, tidak ditebak]
- Fungsi di `server/utils/` (mis. `sanitizeArticleHtml(html): string`) dipanggil di lapisan layanan/mapper sebelum `body` keluar sebagai tipe domain.
- **Allowlist tag** (usulan): `p, br, h2–h6, strong, em, b, i, u, s, blockquote, ul, ol, li, a, img, figure, figcaption, table, thead, tbody, tr, th, td, hr, code, pre, sup, sub`. `h1` tidak (judul halaman satu `h1`).
- **Allowlist atribut** (usulan): `a[href,title,rel,target]`, `img[src,alt,width,height,loading]`, `th/td[colspan,rowspan]`, `figure/figcaption` tanpa atribut; `class` tidak; `style` tidak; semua `on*` tidak.
- **URL:** `href` hanya `https:`/`http:`/`mailto:`/relatif; `src` gambar hanya `https:` dari host media WordPress yang di-allowlist; tolak `javascript:`, `data:`, `vbscript:`.
- **Tautan eksternal:** otomatis `rel="noopener noreferrer"`.
- **Embed:** hanya allowlist `iframe` dari host yang disetujui pemilik (daftar kosong sampai pemilik menyebut host, mis. YouTube) dengan atribut dibatasi; selain itu dibuang.
- Membuang konten `script`, `style`, `object`, `embed`, `form`, `input`, `meta`, `link`, `base`, komentar HTML.
- Tidak mengubah teks; entitas HTML tetap benar.

## Kriteria penerimaan (draf; final saat dibuka kembali)
1. Satu fungsi penyanitasi sisi server dengan allowlist tag/atribut/URL/embed seperti di atas; daftar allowlist ada di satu tempat dan terdokumentasi.
2. Library penyanitasi terpelihara, versi **persis** dipin, **disetujui pemilik** sebelum dipasang (AGENTS.md aturan 3, 8); alasan konkret dicatat di `docs/decisions/`.
3. `body` yang keluar dari layanan selalu melewati penyanitasi; tidak ada jalur lain ke `v-html`.
4. Masukan berbahaya dibuang: `<script>`, `<img onerror=…>`, `<a href="javascript:…">`, `<iframe src="https://host-tak-diizinkan">`, `<svg onload>`, `style` dengan `expression`/`url(javascript:)`, `data:` URI, atribut `on*`, `<form>`, `<base>`.
5. Masukan aman tetap utuh: paragraf, judul-anak, daftar, kutipan, tabel, `figure`/`figcaption`, gambar WordPress, tautan `https`, entitas (`&amp;`, `&#8211;`).
6. Masukan kosong, `null`, atau sangat besar (batas ukuran ditetapkan FE) menghasilkan keluaran terkontrol tanpa melempar jejak tumpukan; HTML rusak/bersarang dalam tidak membuat proses menggantung.
7. **Uji unit** dengan tabel masukan→keluaran yang mencakup butir 4–6. Karena ini logika nyata, **task ini adalah pemicu Vitest bila dikerjakan lebih dulu** dari komposisi Rekomendasi dan peringkat Berita Terkait (keputusan pemilik 29 Okt 2026): Vitest (+ `@nuxt/test-utils` bila perlu) diminta persetujuannya, versi persis, skrip `test` ditambahkan.
8. `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` kode 0; `npm audit --audit-level=high` tanpa High/Critical yang belum dinilai.
9. Tidak ada secret; tidak ada `.env`.

## Rencana tes (QA) — draf PM
| ID | Langkah | Hasil diharapkan | P |
|---|---|---|---|
| SN1 | Masukkan payload XSS klasik (script, onerror, onload, javascript:, data:, svg, iframe tak diizinkan) | Semuanya dibuang; tidak ada eksekusi saat dirender di browser | P0 |
| SN2 | Masukkan HTML artikel nyata dari fixture (6 variasi) | Struktur dan teks tetap; entitas benar | P0 |
| SN3 | Tautan eksternal | `rel="noopener noreferrer"` ada | P0 |
| SN4 | Gambar dari host luar allowlist | Dibuang/diganti kosong | P0 |
| SN5 | Embed: host diizinkan vs tidak | Hanya host di allowlist yang lolos | P0 |
| SN6 | Masukan kosong, `null`, 5 MB, sarang 10.000 tingkat | Keluaran terkontrol; waktu proses wajar | P1 |
| SN7 | `grep v-html` di `app/` | Setiap pemakaian hanya pada keluaran penyanitasi | P0 |
| SN8 | Bundel klien (`.output/public`) | Penyanitasi tidak masuk bundel klien (jalan di server) | P1 |
| SN9 | `npm test`, `npm audit --audit-level=high`, `git diff --stat` | Hijau; hanya berkas di daftar boleh-disentuh | P0 |

## File yang boleh disentuh
`server/utils/**`, `server/services/**` (hanya titik pemanggilan), `tests/unit/**`, `vitest.config.ts`. **[APPROVAL]:** `package.json`, `package-lock.json` (library penyanitasi, Vitest), `nuxt.config.ts` (hanya bila `@nuxt/test-utils` mengharuskan). Tidak boleh: `app/components/**`, `app/pages/**`, `.env*`.

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| – | – | – | – | – |

## Catatan
- Dibuka kembali PM bersama PAGE-002, setelah gerbang G-WP (PRD §13) atau lebih awal bila pemilik ingin merender fixture `body`.
- Menggantikan butir 6 API-001 (sanitasi) dan butir "penyanitasi" di risiko PRD §17.
- Pertanyaan ke pemilik (saat dibuka): daftar host embed yang diizinkan; persetujuan library dan Vitest.
- Riwayat: 29 Okt 2026 → DITUNDA → PM.
