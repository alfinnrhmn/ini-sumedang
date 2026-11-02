# 0006 — `sanitize-html` sebagai penyanitasi HTML artikel (SANITIZE-001)

| Field | Isi |
|---|---|
| **Tanggal** | 2 Nov 2026 |
| **Status** | Dikerjakan FE di SANITIZE-001 berdasarkan persetujuan dependensi pemilik (pra-persetujuan 2 Nov 2026, syarat diverifikasi PM); menunggu tinjauan QA dan persetujuan commit pemilik |
| **Rujukan** | `docs/tasks/SANITIZE-001.md` (Verifikasi dependensi, Kriteria 1-9), PRD v1.10 §10.1, FR-05, §17, AGENTS.md aturan 3, 6, 8 |

## Keputusan
Isi artikel (`body`) dari CMS disanitasi **di server** dengan `sanitize-html` **2.18.1** (dipin eksak, `"sanitize-html": "2.18.1"` tanpa `^`/`~`), lewat satu fungsi `sanitizeArticleHtml(html: unknown): string` (`server/utils/sanitize-article-html.ts`) dengan allowlist di satu berkas (`server/utils/sanitize-config.ts`). Pembungkus titik pemanggilan: `sanitizeBodyHtml` di `server/services/articles.ts` (dipanggil PAGE-002 saat `body` ditambahkan). Satu dependensi runtime baru; tanpa `@types/sanitize-html` dan tanpa Vitest (tidak disetujui; deklarasi tipe lokal `server/utils/types/sanitize-html.d.ts`, uji dengan `node:test` bawaan Node).

## Fakta [V = diverifikasi PM 2 Nov 2026 di registry npm; V-FE = diukur FE 2 Nov 2026]
- **Versi / rilis:** `latest` = 2.18.1, dirilis **14 Okt 2026** (18 hari pada 2 Nov 2026; bukan pra-rilis). Rilis sebelumnya 2.18.0 (30 Sep 2026), 2.17.7 (13 Agt 2026) [V]. Terpasang diperiksa: `require('sanitize-html/package.json').version` = `2.18.1`, `npm ls sanitize-html` = `sanitize-html@2.18.1` [V-FE].
- **Lisensi / engines:** MIT; `engines.node >=22.12.0` (proyek: `^22.22.3 || ^24.15.0 || >=26`) [V, V-FE].
- **Pohon transitif baru (13 entri `node_modules/...` baru di `package-lock.json`, 173 baris, semuanya penambahan):** `htmlparser2` 12.0.0 (MIT), `domhandler` 6.0.1, `domutils` 4.0.2, `domelementtype` 3.0.0 (BSD-2-Clause), `dom-serializer` 3.1.1, `entities` (bersarang di `htmlparser2` dan `dom-serializer`), `postcss` 8.5.32 (sudah ada di pohon Nuxt; tidak ditambah), `launder` 1.7.2, `dayjs` 1.11.23, `parse-srcset` 1.0.2, `is-plain-object` 5.1.0, `escape-string-regexp` 4.0.0 (bersarang) [V-FE, dari `package-lock.json`].
- **Advisori:** 0 kerentanan pada pohon `sanitize-html@2.18.1`; bulk advisory registry untuk 2.18.1 = `{}` [V].
- **`npm audit` di salinan bersih (`npm ci`, Node v22.23.4, npm 10.9.9) [V-FE]:**

| Saat | Perintah | Hasil |
|---|---|---|
| Sebelum memasang | `npm audit --audit-level=high` | kode 0; 40 temuan: 2 low, 38 moderate, **0 high, 0 critical** |
| Sesudah `npm install --save-exact sanitize-html@2.18.1` | `npm audit --audit-level=high` | kode 0; 40 temuan: 2 low, 38 moderate, **0 high, 0 critical**; daftar paket rentan **identik** dengan sebelum memasang (tidak ada temuan baru; tidak ada temuan pada `sanitize-html` maupun dependensinya) |

  Temuan yang ada (deepmerge, glob, minimatch dan rantai turunannya di Nuxt/ESLint) sudah ada sebelum task ini dan di luar scope (lihat `docs/decisions/0001-npm-audit-low-deepmerge.md`; jumlahnya berbeda dari ADR itu (7 low); penyebabnya tidak diselidiki di task ini [?]).

## Alasan memilih
1. **Terpelihara:** rilis rutin (3 rilis dalam ~3 bulan terakhir), lisensi MIT, tanpa advisori terbuka.
2. **Allowlist bawaan (bukan blocklist):** tag, atribut, skema URL, host iframe diatur eksplisit; semua yang tidak terdaftar dibuang. Cocok dengan kebijakan "izinkan hanya yang dikenal".
3. **Berjalan di Node tanpa DOM:** parser `htmlparser2` dan serialisasi sendiri; tidak ada tambahan seperti jsdom. Keluaran dibuat ulang dari pohon hasil parse (bukan menyalin string), sehingga trik penutupan/kutipan atribut tidak lolos.
4. **Titik ekstensi yang dibutuhkan:** `transformTags`, `exclusiveFilter`, `textFilter`, `nonTextTags`, `nestingLimit`, `allowedIframeHostnames` cukup untuk aturan embed/gambar/tautan tanpa mengubah pustaka.
5. **Sederhana (AGENTS.md aturan 8):** satu fungsi, satu berkas konfigurasi, tanpa abstraksi tambahan.

## Alternatif yang ditolak
- **DOMPurify:** membutuhkan DOM (di Node harus memakai jsdom/happy-dom): dependensi besar dan permukaan serangan tambahan di server. Ditolak.
- **Regex/penyanitasi buatan sendiri:** HTML tidak dapat disanitasi dengan regex andal (parser differential, entitas, atribut tak berkutip, komentar kondisional). Ditolak.
- **Merender HTML mentah dengan CSP saja:** CSP adalah lapisan lain (SEC-001), bukan pengganti sanitasi. Ditolak.
- **`@types/sanitize-html`, Vitest:** tidak disetujui pemilik; diganti deklarasi tipe lokal dan `node:test`.

## Perilaku dan batas yang ditetapkan [I = usulan FE, nilai di `sanitize-config.ts`]
- **Allowlist:** semua daftar (tag, atribut, skema, embed, batas) ada di `server/utils/sanitize-config.ts` dengan dokumentasi di kepala berkas. `h1` tidak diizinkan. Tag tak dikenal dibuang tetapi teksnya dipertahankan, kecuali `SANITIZE_NON_TEXT_TAGS` (script, style, svg, math, form, object, embed, template, dll.) yang isinya ikut dibuang.
- **Teks dan entitas:** `&amp;` tetap `&amp;`; entitas numerik/bernama pada teks (`&#8211;`, `&hellip;`) diurai parser dan dikeluarkan sebagai karakter yang sama (`–`, `…`), yaitu tampilan identik, bukan string identik byte. `<`, `>`, `&` pada teks selalu di-escape.
- **URL:** `href` = https/http/mailto/relatif; `//host`, `javascript:`, `data:`, `vbscript:`, skema lain dibuang (atribut dibuang, teks tetap). Tab/baris-baru di dalam skema dibuang seperti peramban; karakter kontrol lain atau `\` di awal → atribut dibuang. Gambar: relatif atau https dari `IMAGE_ALLOWED_HOSTS` (default **kosong** [I]: hanya relatif/same-origin; host media WordPress ditetapkan di gerbang G-WP); gambar tanpa `src` sah dibuang seluruhnya. Tautan eksternal (http/https) dan `target="_blank"` otomatis `rel="noopener noreferrer"`.
- **Embed (keputusan pemilik 2 Nov 2026):** hanya `iframe` YouTube. Host `youtube.com`, `www.youtube.com`, `youtube-nocookie.com`, `www.youtube-nocookie.com`; skema `https`; path persis `/embed/<id>` dengan id `[A-Za-z0-9_-]{6,20}`; tanpa userinfo, port, karakter ter-encode, titik akhir host, atau garis miring akhir. `src` **dibangun ulang** dari bagian tervalidasi; query hanya `start`, `end`, `rel`, `controls`, `modestbranding`, `playsinline` (nilai divalidasi, tanpa `autoplay`/`origin`/`playlist`); fragmen dibuang. Atribut dibatasi: `src`, `width`, `height` (hanya angka), `title`, `allowfullscreen`, `loading` (`lazy` bawaan), `referrerpolicy` (dipaksa `strict-origin-when-cross-origin`), `allow` (hanya `accelerometer`, `clipboard-write`, `encrypted-media`, `gyroscope`, `picture-in-picture`, `web-share`, `fullscreen`), `sandbox` (dipaksa `allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox`). Iframe yang gagal aturan dibuang seluruhnya beserta isinya; isi iframe yang lolos tidak pernah dikeluarkan. Lapis kedua: `allowedIframeHostnames` milik pustaka memakai daftar host yang sama.
- **Ukuran dan kedalaman [I]:** masukan bukan string, kosong, > 2 MB (2.097.152 karakter), atau memuat > 30.000 karakter `<` → `''` (gagal tertutup, tanpa pemotongan, tanpa log isi). Batas jumlah `<` perlu karena parser `htmlparser2` kuadratik pada tag yang tidak ditutup (diukur: 100.000 `<b>` tak tertutup = 1,1 detik hanya di parser; 600.000 `<b>` = sekitar 200 detik tanpa batas ini). Kedalaman sarang tag dibatasi `nestingLimit` = 50 (tag di kedalaman ≥ 50 dibuang, teks tetap). Kesalahan tak terduga di pustaka → `''` (tidak pernah melempar).
- **Waktu proses [V-FE, Node v22.23.4, rata-rata kasar 3 kali]:** 5 MB = 0,0 ms (ditolak oleh batas ukuran); artikel wajar ±1,9 MB = 76-129 ms; ±100 KB = 4-10 ms; sarang 10.000 blockquote tertutup = 22-39 ms; 10.000 tak tertutup = 18-29 ms; terburuk di bawah batas tag (30.000 `<ul>`/`<b>` tak tertutup) = 103-164 ms; 2 MB entitas = ±300 ms.

## Risiko dan batas
- **mXSS / namespace confusion:** keluaran dibuat dari pohon parse `htmlparser2`, sedangkan peramban mem-parse ulang dengan parser HTML5; selisih keduanya (parser differential) adalah risiko inheren penyanitasi berbasis string. Mitigasi: allowlist sempit tanpa elemen raw-text/namespace (script, style, svg, math, template, textarea, noscript, xmp, title, noembed, noframes dibuang dengan isinya), isi iframe tidak pernah dikeluarkan, atribut `style`/`class`/`id`/`on*` tidak diizinkan, dan uji idempoten (menyanitasi keluaran lagi tidak mengubahnya) pada seluruh korpus uji. Elemen tak tertutup seperti `<svg>`/`<form>` menelan sisa masukan (disengaja: lebih baik hilang daripada lolos).
- **Pustaka pihak ketiga:** tetap berlaku siklus Dependabot/`npm audit` (PRD §10.1); advisori baru pada `sanitize-html`/`htmlparser2` harus ditangani sebagai prioritas.
- **Batas ukuran/tag/sarang adalah usulan [I]:** batas 2 MB (2.097.152 karakter), 30.000 karakter `<`, dan `nestingLimit` 50 bersifat [I] (belum ditetapkan pemilik/PM). Artikel sah di atas batas ukuran atau jumlah `<` menghasilkan `''` (gagal tertutup, tanpa pemotongan), sehingga PAGE-002 harus menangani `body` kosong; sarang di atas 50 tingkat tidak menghasilkan `''` tetapi tag tingkat ke-51 dan seterusnya dibuang (teks tetap). Nilai dapat diubah di `sanitize-config.ts` bila pemilik/PM menetapkan lain; angka literal di uji (`tests/unit/sanitize-article-html.test.ts`, SN6) sengaja memaku nilai saat ini sehingga perubahan batas harus disertai perubahan uji.
- **`colspan`/`rowspan` tidak divalidasi:** nilainya dipertahankan apa adanya (ter-escape sebagai nilai atribut). Keduanya inert (hanya memengaruhi tata letak tabel, bukan eksekusi); atribut lain pada `th`/`td` (`onclick`, `style`, `class`, `id`, `align`, dll.) dibuang dan diuji.

## Sandbox embed: batasan keamanan (wajib dibaca sebelum menambah host)
`sandbox` dipaksa `allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox` agar pemutar YouTube berfungsi. Kombinasi `allow-scripts` + `allow-same-origin` **hanya aman bila `src` embed lintas-origin terhadap situs ini**: peramban memperlakukan dokumen berbeda origin sebagai terisolasi, sehingga sandbox tetap berguna sebagai lapisan tambahan. Bila `EMBED_ALLOWED_HOSTS` diperluas dengan host **same-origin** (domain situs ini atau subdomain yang berbagi origin) atau host **tak tepercaya**, dokumen yang di-embed dapat menjalankan skrip dengan hak origin yang sama atau melepas sandbox-nya sendiri, dan perlindungan sandbox hilang. Karena itu:
- Hanya tambahkan host pihak ketiga tepercaya yang lintas-origin; jangan tambahkan domain situs sendiri atau subdomainnya.
- Daftar host `EMBED_ALLOWED_HOSTS` **harus sama persis** dengan CSP `frame-src` (SEC-001); ubah keduanya bersamaan dan perbarui uji.
- Penyedia yang memerlukan sandbox lebih longgar/berbeda memerlukan keputusan terpisah (bukan sekadar menambah host).
- **Keluaran build:** karena modul diimpor di `server/services/articles.ts`, Nitro menyalin `sanitize-html` dan dependensinya ke `.output/server/node_modules`; `.output/public` (bundel klien) tidak memuat satu pun modul ini (diperiksa dengan pencarian nama modul).

## Cara memperluas
- **Host embed baru:** tambahkan hostname persis (huruf kecil) ke `EMBED_ALLOWED_HOSTS` di `server/utils/sanitize-config.ts`, lalu tambahkan kasus uji di `tests/unit/sanitize-article-html.test.ts` (bagian "perluasan lewat konfigurasi" menunjukkan caranya). Semua host memakai pola path `EMBED_PATH_PATTERN` (`/embed/<id>`); penyedia dengan bentuk path lain (mis. `/video/<id>`) memerlukan keputusan terpisah karena mengubah aturan path. Perbarui juga CSP (SEC-001) agar hanya mengizinkan host yang sama.
- **Host gambar WordPress:** setelah gerbang G-WP menetapkan host media, tambahkan ke `IMAGE_ALLOWED_HOSTS` (hostname persis, https, tanpa port).
- **Tag/atribut baru:** ubah `SANITIZE_ALLOWED_TAGS` / `SANITIZE_ALLOWED_ATTRIBUTES` dan tambahkan kasus uji berbahaya yang sesuai.

## Tidak termasuk (di luar scope task)
- **CSP dan header keamanan:** SEC-001 (CSP tetap perlu membatasi `frame-src`/`img-src` ke host yang sama dengan allowlist ini).
- **Iklan:** hanya gambar + tautan `https` (ADS-002), tidak lewat penyanitasi ini.
- **Klien WordPress** (API-001), tampilan artikel dan penambahan `body` ke tipe `Article` (PAGE-002), menulis ke WordPress.

## Keputusan pemilik yang dicatat
- 2 Nov 2026: `sanitize-html` pra-disetujui dengan syarat terverifikasi PM (rilis < 12 bulan, versi stabil ≥ 2 minggu, tanpa advisori tinggi yang belum ditambal, dipin eksak); default embed hanya YouTube dan dapat diperluas lewat konfigurasi; berhenti sebelum commit untuk persetujuan pemilik.
- **Vitest tidak dipasang**; uji unit memakai `node:test` bawaan Node (skrip `npm test` = `node --test "tests/unit/**/*.test.ts"`). Keputusan Vitest ditawarkan lagi kepada pemilik saat persetujuan commit (task SANITIZE-001, Verifikasi dependensi).
