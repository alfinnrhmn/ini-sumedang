# SANITIZE-001 — Penyanitasi HTML sisi server

| Field | Isi |
|---|---|
| **ID** | SANITIZE-001 |
| **Status** | `DONE` (PM 2 Nov 2026, setelah `QA_PASSED` putaran 1 + perbaikan celah uji dan **persetujuan pemilik atas commit, 2 Nov 2026**) — sebelumnya `READY`, dibuka kembali pemilik 2 Nov 2026 (dari `DITUNDA` ke `BACKLOG`, prasyarat PAGE-002); Definition of Ready dipenuhi PM 2 Nov 2026 (dependensi `sanitize-html` pra-disetujui dan diverifikasi, lihat "Verifikasi dependensi"). **Berhenti sebelum commit untuk persetujuan pemilik** (tugas berisiko tinggi: keamanan, sanitasi HTML, dependensi baru) |
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
- **Embed (keputusan pemilik 2 Nov 2026):** default yang diizinkan **hanya YouTube** lewat `iframe`: host `youtube.com`, `www.youtube.com`, `youtube-nocookie.com`, `www.youtube-nocookie.com`; skema `https:` saja; path `/embed/<id>` saja (id `[A-Za-z0-9_-]{6,20}` [I], boleh `?` parameter pemutar aman bila FE mendokumentasikan allowlist-nya); atribut dibatasi (`src`, `width`, `height`, `title`, `allowfullscreen`, `loading`, `referrerpolicy`; `allow` dibatasi daftar aman; `sandbox` dan `referrerpolicy` dipaksa oleh penyanitasi). **Semua host lain ditolak** (iframe dibuang seluruhnya). **Daftar host dapat diperluas lewat konfigurasi** (satu konstanta di `server/utils/`; menambah host = ubah konfigurasi, bukan kode penyanitasi).
- Membuang konten `script`, `style`, `object`, `embed`, `form`, `input`, `meta`, `link`, `base`, komentar HTML.
- Tidak mengubah teks; entitas HTML tetap benar.

## Verifikasi dependensi (PM, 2 Nov 2026; syarat pra-persetujuan pemilik)
Pemilik **menyetujui `sanitize-html`** dengan syarat yang diverifikasi PM sebelum dipasang. Hasil (registry npm, hanya baca; audit pada pohon sementara di luar repo):

| Syarat | Hasil | Status |
|---|---|---|
| Rilis terakhir < 12 bulan | `latest` = **2.18.1**, dirilis 14 Okt 2026 (`time.modified` 20 Okt 2026); rilis sebelumnya 2.18.0 (30 Sep 2026), 2.17.7 (13 Agt 2026) | LULUS |
| Versi stabil dirilis ≥ 2 minggu | 2.18.1 berumur **18 hari** pada 2 Nov 2026 (bukan alpha; tag `latest`) | LULUS |
| Tidak ada advisori tinggi belum ditambal | `npm audit` pada pohon `sanitize-html@2.18.1` (htmlparser2 12.0.0, postcss 8.5.32, launder 1.7.2, dayjs 1.11.23, parse-srcset 1.0.2, is-plain-object 5.1.0, escape-string-regexp 4.0.0, domhandler/domutils/dom-serializer/entities): **0 kerentanan** (info/low/moderate/high/critical = 0); bulk advisory registry untuk `sanitize-html@2.18.1` = `{}` | LULUS |
| Dipin eksak | `npm install --save-exact sanitize-html@2.18.1` (tanpa `^`/`~`) | Wajib saat pemasangan |
| Lisensi / engines | MIT; `engines.node >=22.12.0` (proyek: `^22.22.3 || ^24.15.0 || >=26`) | Cocok |

Seluruh syarat terpenuhi, **tidak perlu alternatif**. Catatan: `@types/sanitize-html` (paket terpisah) **tidak** termasuk persetujuan; gunakan deklarasi tipe lokal minimal (`declare module 'sanitize-html'` hanya untuk API yang dipakai) — FE melapor bila itu tidak cukup. **Vitest tidak termasuk persetujuan** (hanya `sanitize-html` yang disetujui): uji unit memakai **`node:test` bawaan Node** (tanpa dependensi; `node --test "tests/unit/**/*.test.ts"` menjalankan `.ts` langsung di Node 22.23.4, sudah dicoba PM) dengan skrip `test` di `package.json`. Keputusan Vitest ditawarkan lagi kepada pemilik pada saat persetujuan commit.

## Kriteria penerimaan (final, READY 2 Nov 2026)
1. Satu fungsi penyanitasi sisi server dengan allowlist tag/atribut/URL/embed seperti di atas; daftar allowlist ada di satu tempat dan terdokumentasi.
2. Library = `sanitize-html` **2.18.1 dipin eksak** (`npm install --save-exact`; `package.json` memuat `"sanitize-html": "2.18.1"` tanpa `^`), pra-disetujui pemilik dengan syarat terverifikasi PM; **hanya satu dependensi runtime baru** (plus pohon transitifnya di lockfile); alasan konkret, hasil verifikasi, dan hasil `npm audit` dicatat di `docs/decisions/0006-sanitize-html.md` (baru, ditulis FE). Tanpa `@types/sanitize-html` dan tanpa Vitest (tidak disetujui).
3. `sanitizeArticleHtml` adalah satu-satunya jalur HTML CMS ke keluaran; titik pemanggilan di lapisan layanan disediakan (mis. fungsi pembungkus yang dipanggil PAGE-002 saat `body` ditambahkan); **tidak ada `v-html` di `app/` dan `server/`** pada task ini (`git grep v-html` kosong); PAGE-002 wajib merender `body` hanya dari keluaran penyanitasi.
4. Masukan berbahaya dibuang: `<script>`, `<img onerror=…>`, `<a href="javascript:…">`, `<iframe src="https://host-tak-diizinkan">`, `<svg onload>`, `style` dengan `expression`/`url(javascript:)`, `data:` URI, atribut `on*`, `<form>`, `<base>`.
5. Masukan aman tetap utuh: paragraf, judul-anak, daftar, kutipan, tabel, `figure`/`figcaption`, gambar WordPress, tautan `https`, entitas (`&amp;`, `&#8211;`).
6. Masukan kosong, `null`, atau sangat besar (batas ukuran ditetapkan FE) menghasilkan keluaran terkontrol tanpa melempar jejak tumpukan; HTML rusak/bersarang dalam tidak membuat proses menggantung.
7. **Uji unit** dengan tabel masukan→keluaran yang mencakup butir 4–6 dan embed (YouTube lolos; host lain, `http:`, path bukan `/embed/`, dan atribut berbahaya dibuang), memakai **`node:test` bawaan Node** (`tests/unit/**/*.test.ts`; skrip `test` = `node --test "tests/unit/**/*.test.ts"`); tanpa Vitest (belum disetujui).
8. `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` kode 0; `npm audit --audit-level=high` tanpa High/Critical yang belum dinilai.
9. Tidak ada secret; tidak ada `.env`.

## Rencana tes (QA) — draf PM
| ID | Langkah | Hasil diharapkan | P |
|---|---|---|---|
| SN1 | Masukkan payload XSS klasik (script, onerror, onload, javascript:, data:, svg, iframe tak diizinkan) | Semuanya dibuang; tidak ada eksekusi saat dirender di browser | P0 |
| SN2 | Masukkan HTML artikel nyata dari fixture (6 variasi) | Struktur dan teks tetap; entitas benar | P0 |
| SN3 | Tautan eksternal | `rel="noopener noreferrer"` ada | P0 |
| SN4 | Gambar dari host luar allowlist | Dibuang/diganti kosong | P0 |
| SN5 | Embed: YouTube (`youtube.com`, `www.youtube.com`, `youtube-nocookie.com`, `www.youtube-nocookie.com`, `https`, `/embed/<id>`) vs host lain (`vimeo.com`, `evil.com`, `youtube.com.evil.com`, `http:`, `//host`, path `/watch`, `data:`) | Hanya YouTube `https` `/embed/` yang lolos (atribut `sandbox`/`referrerpolicy` dipaksa); semua lain dibuang; memperluas daftar lewat konfigurasi berfungsi (tes dengan konfigurasi tambahan) | P0 |
| SN6 | Masukan kosong, `null`, 5 MB, sarang 10.000 tingkat | Keluaran terkontrol; waktu proses wajar | P1 |
| SN7 | `grep v-html` di `app/` | Setiap pemakaian hanya pada keluaran penyanitasi | P0 |
| SN8 | Bundel klien (`.output/public`) | Penyanitasi tidak masuk bundel klien (jalan di server) | P1 |
| SN9 | `npm test`, `npm audit --audit-level=high`, `git diff --stat` | Hijau; hanya berkas di daftar boleh-disentuh | P0 |

## File yang boleh disentuh
`server/utils/**` (penyanitasi, konfigurasi allowlist, deklarasi tipe lokal), `server/services/**` (hanya titik pemanggilan), `tests/unit/**`, `docs/decisions/0006-sanitize-html.md` (baru), berkas ini (Bukti). **[APPROVAL, sudah diberikan pemilik untuk `sanitize-html` saja]:** `package.json` (dependensi `sanitize-html` 2.18.1 eksak dan skrip `test`), `package-lock.json`. Tidak boleh: `nuxt.config.ts`, `vitest.config.ts` (tidak dibuat), `app/**`, `.github/**`, `.env*`, dependensi lain.

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| QA r1 | Verifikasi keamanan independen pada salinan di luar repo (`s1q-A` pohon kerja, `s1q-B` baseline HEAD; `npm ci` hanya di salinan; port 3341, 3342, CDP 9342; semua ditutup) | `QA_PASSED`: tanpa Critical/High; **516 payload sendiri (independen dari uji FE)**: 0 pelanggaran allowlist, idempoten 516/516, **0 eksekusi skrip di Chrome** (kontrol positif: 50 dari 90 input mentah memicu hook), 0 elemen/atribut/namespace di luar allowlist setelah parse ulang DOM; embed: 99 payload, hanya YouTube https `/embed/<id>` lolos, `sandbox`/`referrerpolicy` dipaksa, perluasan lewat `EMBED_ALLOWED_HOSTS` terbukti; `npm test` 196/196 (cocok dengan klaim FE); mutasi allowlist hampir semuanya membuat uji merah (selamat: `nestingLimit` 5000, batas input 200 MB, atribut `style`/`class` pada `th` — celah uji, ditutup di putaran perbaikan); SN6: tidak ada kasus > 2 dtk (maks 706 ms, 30.000 `<svg>`), tanpa jejak tumpukan; SN7 `v-html` kosong; SN8 bundel klien bersih; `package.json` +2 baris (`"sanitize-html": "2.18.1"` eksak dan skrip `test`), lockfile +173/−0 dengan tepat 13 entri baru, integritas 10 paket cocok dengan registry (3 entri bersarang tidak dicocokkan); `npm audit --audit-level=high`: 40 temuan (2 low, 38 moderate) identik dengan baseline, 0 baru, 0 pada sanitize-html; `/api/articles/*` identik dengan HEAD (recommended tetap 8) | QA | 2 Nov 2026 |
| FE (perbaikan temuan QA r1) | Tambah uji batas sarang (50), batas input (2.097.152), atribut `th`/`td` (22 kasus); komentar peringatan `sandbox` di config dan ADR | `npm test` kode 0: **222 uji** (196 + 26), 0 gagal; mutasi `NESTING_LIMIT` 5000 → 2 merah, `MAX_INPUT_LENGTH` 200 MB → 1 merah, `style`/`class` pada `th`/`td` → 5 merah masing-masing; lint dan typecheck kode 0; perilaku penyanitasi tidak berubah | FE | 2 Nov 2026 |
| FE | Salinan bersih di luar repo (`robocopy` tanpa `.git`/`node_modules`/`.output`/`.nuxt`/`.env*`), `npm ci` (Node v22.23.4, npm 10.9.9); `npm audit --audit-level=high` **sebelum** memasang | Kode 0; 40 temuan (2 low, 38 moderate, 0 high, 0 critical), sudah ada sebelum task | FE | 2 Nov 2026 |
| FE | `npm install --save-exact sanitize-html@2.18.1` di salinan; `npm ls sanitize-html`; `require('sanitize-html/package.json').version`; `npm audit --audit-level=high` **sesudah** | Terpasang `2.18.1`; audit kode 0, 40 temuan (2 low, 38 moderate, 0 high, 0 critical), daftar paket rentan identik dengan sebelum (tidak ada temuan baru). Diff `package.json`: hanya `"sanitize-html": "2.18.1"` dan skrip `"test"`. Diff lockfile: +173 baris, 0 baris dihapus, 13 entri `node_modules/` baru (pohon sanitize-html). Hanya dua berkas ini yang disalin kembali ke repo (`node_modules` repo tidak disentuh) | FE | 2 Nov 2026 |
| FE | Salinan + perubahan: `npm run lint` | Kode 0, tanpa keluaran galat | FE | 2 Nov 2026 |
| FE | `npm run typecheck` (`nuxt typecheck`) | Kode 0. Tanpa `server/utils/types/sanitize-html.d.ts` gagal TS7016 (deklarasi lokal terbukti dipakai) | FE | 2 Nov 2026 |
| FE | `npm test` (`node --test "tests/unit/**/*.test.ts"`) | Kode 0: tests 196, suites 9, pass 196, fail 0, cancelled 0, skipped 0, ±1,6 detik. Cakupan: SN1 72 kasus (payload XSS/mXSS), SN2 18, SN3 9, SN4 21, SN5 61 (4 host YouTube, 38 embed ditolak, 5 perluasan konfigurasi), SN6 10, SN7/SN8 2 (pemindaian sumber), invarian seluruh korpus 3 (bebas pola berbahaya, idempoten). Mutasi uji: skema `javascript`/`data` ditambahkan ke allowlist → 14 tes gagal | FE | 2 Nov 2026 |
| FE | `npm run build` (`nuxt build`) | Kode 0 ("Build complete"). Server hasil build dijalankan di port 3917 (dihentikan): `/api/articles/recommended`, `/api/categories`, `/api/articles/by-category`, `/` = HTTP 200. Perbandingan dengan build `articles.ts` asli: `.output/public` identik kecuali build id/meta; chunk `articles.mjs` dan semua `routes/api/**` identik byte (pembungkus tidak terpakai handler); hanya beda build id, etag, urutan peta gaya, `server/package.json` (dependensi tertelusur) | FE | 2 Nov 2026 |
| FE | SN8: pencarian nama modul di `.output/public` (sanitize, htmlparser2, postcss, domhandler, domutils, launder, parse-srcset, `sanitizeArticleHtml`, `sanitizeBodyHtml`, youtube, `noopener noreferrer`, dayjs, dll.) | 0 berkas cocok dari 46 berkas klien (1.023 kB). `sanitize-html` hanya ada di `.output/server/node_modules` (tertelusur Nitro). `app/` tidak mengimpor penyanitasi (diuji otomatis) | FE | 2 Nov 2026 |
| FE | SN6 (ms, Node v22.23.4, 3 kali): 5 MB; ±1,9 MB artikel wajar; sarang 10.000 blockquote tertutup; 10.000 tak tertutup; 30.000 `<b>`/`<ul>` tak tertutup | 5 MB = 0,0 ms (`''`, di atas batas 2 MB); 1,9 MB = 76-129 ms; 10.000 tertutup = 22-39 ms (keluaran 50 tingkat); 10.000 tak tertutup = 18-29 ms; 30.000 tak tertutup = 103-164 ms. Tanpa batas jumlah `<`: 600.000 `<b>` tak tertutup = ±202 detik (parser kuadratik) → batas 30.000 `<` ditambahkan | FE | 2 Nov 2026 |
| FE | `git grep -n --untracked "v-html" -- app server tests` | Kosong (satu-satunya kemunculan repo ada di narasi `docs/decisions/0003-...md`) | FE | 2 Nov 2026 |
| FE | `git status --porcelain --untracked-files=all` | Hanya berkas daftar boleh-disentuh: `package.json`, `package-lock.json`, `server/services/articles.ts` (diubah); `server/utils/sanitize-config.ts`, `sanitize-article-html.ts`, `types/sanitize-html.d.ts`, `tests/unit/sanitize-article-html.test.ts`, `docs/decisions/0006-sanitize-html.md` (baru); berkas ini. Berkas lain yang tampak `M` (`docs/PRD.md`, `docs/tasks/POLISH-01.md`) sudah diubah sebelum task ini | FE | 2 Nov 2026 |
| FE (perbaikan temuan QA) | Salinan baru di luar repo + `npm ci`; tambah uji: batas sarang literal 50 (tepat 50, 51, jauh di atas batas), batas ukuran literal 2.097.152 karakter (tepat batas lolos, batas+1 → `''`), atribut `th`/`td` berbahaya (22 kasus + 1 uji allowlist persis `colspan`/`rowspan`); komentar peringatan sandbox di `sanitize-config.ts` (komentar saja, perilaku tidak berubah); bagian "Sandbox embed" + catatan batas [I] dan `colspan`/`rowspan` di ADR 0006. `npm test` / `npm run lint` / `npx nuxt typecheck` | `npm test` kode 0: tests 222 (sebelumnya 196), suites 10, pass 222, fail 0. Lint kode 0; typecheck kode 0. Mutasi (masing-masing dikembalikan, `cmp` identik dengan repo): `SANITIZE_NESTING_LIMIT` 50→5000 → 2 uji baru merah (sebelumnya hijau 196/196); `SANITIZE_MAX_INPUT_LENGTH` →200 MB → 1 uji baru merah (sebelumnya hijau 196/196, karena uji lama memakai konstanta); atribut `style`/`class` ditambah ke `th` → 5 gagal (3 kasus th + uji allowlist + invarian korpus); sama untuk `td` → 5 gagal | FE | 2 Nov 2026 |

## Catatan FE (2 Nov 2026)
- Keputusan [I] FE untuk ditinjau PM/pemilik: batas masukan 2 MB (`''` di atasnya); batas **30.000 karakter `<`** (`''` di atasnya; ditambahkan karena parser kuadratik pada tag tak tertutup); `nestingLimit` 50; `IMAGE_ALLOWED_HOSTS` default kosong; query embed hanya `start,end,rel,controls,modestbranding,playsinline`; `sandbox` YouTube = `allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox`; `referrerpolicy` = `strict-origin-when-cross-origin`. Semua di `server/utils/sanitize-config.ts`.
- Penyimpangan kecil: entitas numerik pada teks (`&#8211;`) keluar sebagai karakter yang sama (`–`), bukan string byte-identik; `&amp;` tetap `&amp;`. `h1` pada masukan dibuang tag-nya, teksnya tetap.
- Fixture tidak memuat `body` (dan `server/fixtures` di luar daftar boleh-disentuh), sehingga SN2 "6 variasi HTML dari fixture" diganti kasus HTML artikel realistis di dalam uji unit.
- `node_modules` repo tidak memuat `sanitize-html` (sengaja tidak menjalankan `npm ci`/`npm install` di repo). Selama belum `npm ci`, `nuxt dev` yang sedang berjalan akan gagal mengimpor `server/services/articles.ts` pada muat ulang berikutnya; jalankan `npm ci` di repo setelah persetujuan.
- Temuan QA ditutup (2 Nov 2026): uji batas sarang/ukuran memakai angka literal (bukan konstanta), sehingga mengubah batas di `sanitize-config.ts` WAJIB disertai perubahan uji. Sandbox iframe `allow-scripts allow-same-origin` hanya aman untuk host embed lintas-origin; menambah host same-origin/tak tepercaya meniadakan perlindungan sandbox, dan daftar host harus sama dengan CSP `frame-src` (SEC-001) — dicatat di ADR 0006 dan komentar `sanitize-config.ts`. Batas 2 MB / 30.000 `<` / `nestingLimit` 50 bersifat [I]; artikel sah di atas batas ukuran/`<` menghasilkan `''` (PAGE-002 menangani body kosong). `colspan`/`rowspan` tidak divalidasi (inert).
- Pembungkus `sanitizeBodyHtml` di `articles.ts` belum dipakai handler mana pun (PAGE-002 yang memanggil); perilaku `/api/articles/*` tidak berubah.

## Catatan
- Dibuka kembali PM bersama PAGE-002, setelah gerbang G-WP (PRD §13) atau lebih awal bila pemilik ingin merender fixture `body`.
- Menggantikan butir 6 API-001 (sanitasi) dan butir "penyanitasi" di risiko PRD §17.
- Pertanyaan ke pemilik (saat dibuka): daftar host embed yang diizinkan; persetujuan library dan Vitest.
- Catatan pemilik 2 Nov 2026: (1) SANITIZE-001 diaktifkan kembali (prasyarat PAGE-002); (2) `sanitize-html` pra-disetujui dengan syarat terverifikasi; (3) default embed hanya YouTube, diperluas lewat konfigurasi; berhenti sebelum commit untuk persetujuan pemilik.
- Keputusan PM penutup: temuan Low QA diterima/ditutup: (1–3) celah uji ditutup (222 uji); (4) klaim "±1,9 MB artikel wajar" FE tidak menghasilkan keluaran (melebihi 30.000 `<`) — angka waktu tetap sah, batas 2 MB / 30.000 `<` / nestingLimit 50 adalah [I] dan artikel sah di atasnya menghasilkan `""` (PAGE-002 menangani `body` kosong; pemilik meninjau batas); (5) `colspan`/`rowspan` tidak divalidasi (inert, dicatat di ADR); (6) NUL di teks dipertahankan (inert); (8) peringatan `sandbox` ditulis di config dan ADR 0006 (daftar host embed harus sama dengan CSP `frame-src`, SEC-001). Operasional: `node_modules` repo belum memuat `sanitize-html`; `npm ci` di repo dijalankan setelah persetujuan commit (dev server di port 3000 gagal mengimpor `articles.ts` sampai itu).
- Riwayat: 29 Okt 2026 → DITUNDA → PM · 2 Nov 2026 → BACKLOG → READY → PM (pemilik mengaktifkan kembali; syarat dependensi lulus) · 2 Nov 2026 → QA_PASSED (r1) → perbaikan celah uji → persetujuan pemilik (commit) → DONE → PM.
