# 0006 — `sanitize-html` sebagai penyanitasi HTML artikel (SANITIZE-001)

| Field | Isi |
|---|---|
| **Tanggal / Status** | 2 Nov 2026 · diterapkan (SANITIZE-001 `DONE`) atas pra-persetujuan dependensi pemilik 2 Nov 2026 (syarat diverifikasi PM) |
| **Rujukan** | PRD §10.1, FR-05, §17; AGENTS.md aturan 3, 6, 8 |

## Keputusan
Isi artikel (`body`) dari CMS disanitasi **di server** dengan `sanitize-html` **2.18.1** (dipin eksak, tanpa `^`/`~`) lewat `sanitizeArticleHtml(html: unknown): string` (`server/utils/sanitize-article-html.ts`), allowlist di satu berkas (`server/utils/sanitize-config.ts`); pembungkus `sanitizeBodyHtml` di `server/services/articles.ts`. Satu dependensi runtime baru; tanpa `@types/sanitize-html` dan tanpa Vitest (tidak disetujui pemilik; tipe lokal `server/utils/types/sanitize-html.d.ts`, uji dengan `node:test`, `npm test` = `node --test "tests/unit/**/*.test.ts"`).

## Fakta [V = diverifikasi PM 2 Nov 2026 di registry npm; V-FE = diukur FE]
- **Versi:** `latest` 2.18.1, dirilis 14 Okt 2026 (bukan pra-rilis; sebelumnya 2.18.0 30 Sep, 2.17.7 13 Agt). Lisensi MIT; `engines.node >=22.12.0` [V].
- **Transitif baru (13 entri di lockfile):** `htmlparser2` 12.0.0, `domhandler`, `domutils`, `domelementtype`, `dom-serializer`, `entities`, `launder`, `dayjs`, `parse-srcset`, `is-plain-object`, `escape-string-regexp`; `postcss` sudah ada di pohon Nuxt [V-FE].
- **Advisori:** 0 pada `sanitize-html@2.18.1` [V]. `npm audit --audit-level=high` sebelum dan sesudah memasang: kode 0; 40 temuan (2 low, 38 moderate, 0 high, 0 critical), daftar paket rentan identik; tidak ada temuan pada paket baru [V-FE]. Temuan lama di luar scope (`docs/decisions/0001-npm-audit-low-deepmerge.md`; jumlahnya berbeda dari ADR itu, penyebab tidak diselidiki [?]).

## Alasan memilih
1. **Terpelihara:** 3 rilis dalam ±3 bulan, MIT, tanpa advisori terbuka.
2. **Allowlist (bukan blocklist):** tag, atribut, skema URL, host iframe eksplisit; yang tidak terdaftar dibuang.
3. **Tanpa DOM:** parser `htmlparser2`, keluaran dibuat ulang dari pohon parse (bukan menyalin string), jadi trik kutipan atribut tidak lolos; tidak perlu jsdom.
4. **Titik ekstensi cukup:** `transformTags`, `exclusiveFilter`, `textFilter`, `nonTextTags`, `nestingLimit`, `allowedIframeHostnames`.
5. **Sederhana (aturan 8):** satu fungsi, satu berkas konfigurasi.

**Ditolak:** DOMPurify (butuh jsdom/happy-dom di Node); regex buatan sendiri (tidak andal); HTML mentah dengan CSP saja (CSP lapisan lain, SEC-001); `@types/sanitize-html` dan Vitest (tidak disetujui).

## Perilaku dan batas [I = usulan FE; nilai di `sanitize-config.ts`]
- **Allowlist:** tag/atribut/skema/embed/batas di `sanitize-config.ts`; `h1` tidak diizinkan. Tag tak dikenal dibuang, teksnya dipertahankan, kecuali `SANITIZE_NON_TEXT_TAGS` (script, style, svg, math, form, object, embed, template, dll.) yang isinya ikut dibuang. Atribut `style`/`class`/`id`/`on*` tidak diizinkan.
- **Teks:** `<`, `>`, `&` selalu di-escape; entitas (`&#8211;`, `&hellip;`) dikeluarkan sebagai karakter yang sama (tampilan identik, bukan byte identik).
- **URL:** `href` = https/http/mailto/relatif; `//host`, `javascript:`, `data:`, `vbscript:`, skema lain → atribut dibuang (teks tetap); tab/baris-baru dalam skema dibuang seperti peramban, karakter kontrol lain atau `\` di awal → atribut dibuang. Gambar: relatif atau https dari `IMAGE_ALLOWED_HOSTS` (default kosong [I]; host media WordPress ditetapkan di gerbang G-WP). Tautan eksternal dan `target="_blank"` mendapat `rel="noopener noreferrer"`.
- **Embed (keputusan pemilik 2 Nov 2026): hanya `iframe` YouTube.**
  - Host `youtube.com`, `www.youtube.com`, `youtube-nocookie.com`, `www.youtube-nocookie.com`; `https`; path persis `/embed/<id>` (id `[A-Za-z0-9_-]{6,20}`); tanpa userinfo, port, karakter ter-encode, titik akhir host, atau garis miring akhir.
  - `src` dibangun ulang; query hanya `start`, `end`, `rel`, `controls`, `modestbranding`, `playsinline` (nilai divalidasi; tanpa `autoplay`/`origin`/`playlist`; fragmen dibuang).
  - Atribut: `src`, `width`/`height` (angka), `title`, `allowfullscreen`, `loading` (`lazy`), `referrerpolicy` (dipaksa `strict-origin-when-cross-origin`), `allow` (hanya `accelerometer`, `clipboard-write`, `encrypted-media`, `gyroscope`, `picture-in-picture`, `web-share`, `fullscreen`), `sandbox` (dipaksa `allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox`).
  - Iframe yang gagal aturan dibuang beserta isinya; isi iframe yang lolos tidak pernah dikeluarkan. Lapis kedua: `allowedIframeHostnames` pustaka memakai daftar host yang sama.
- **Batas [I]:** masukan bukan string, kosong, > 2 MB (2.097.152 karakter), atau > 30.000 karakter `<` → `''` (gagal tertutup, tanpa log isi); PAGE-002 menangani `body` kosong. Batas `<` perlu karena `htmlparser2` kuadratik pada tag tak tertutup (100.000 `<b>` = 1,1 detik; 600.000 = ±200 detik). `nestingLimit` 50 (tag ke-51+ dibuang, teks tetap). Kesalahan tak terduga → `''` (tidak melempar). Waktu proses artikel wajar ±1,9 MB = 76-129 ms; terburuk di bawah batas ≈ 164 ms [V-FE]. Uji memaku angka ini (`tests/unit/sanitize-article-html.test.ts`, SN6): ubah batas = ubah uji.
- `colspan`/`rowspan` tidak divalidasi (inert); atribut lain pada `th`/`td` dibuang.

## Risiko dan batas keamanan
- **mXSS / parser differential:** peramban mem-parse ulang keluaran dengan parser HTML5. Mitigasi: allowlist sempit tanpa elemen raw-text/namespace (script, style, svg, math, template, textarea, noscript, xmp, title, noembed, noframes dibuang dengan isinya), isi iframe tidak pernah dikeluarkan, dan uji idempoten pada seluruh korpus.
- **Sandbox embed:** `allow-scripts` + `allow-same-origin` hanya aman bila `src` **lintas-origin** terhadap situs. Hanya tambahkan host pihak ketiga tepercaya; jangan domain situs sendiri atau subdomainnya. `EMBED_ALLOWED_HOSTS` **harus sama persis** dengan CSP `frame-src` (SEC-001; ubah bersamaan, perbarui uji). Penyedia yang butuh sandbox atau path berbeda (mis. `/video/<id>`) = keputusan terpisah.
- **Dependensi:** siklus Dependabot/`npm audit` (PRD §10.1); advisori baru pada `sanitize-html`/`htmlparser2` = prioritas.
- **Build:** Nitro menyalin `sanitize-html` ke `.output/server/node_modules`; `.output/public` tidak memuatnya (dicek lewat pencarian nama modul).

## Cara memperluas
Host embed: tambahkan hostname persis (huruf kecil) ke `EMBED_ALLOWED_HOSTS` + kasus uji + CSP. Host gambar WordPress: ke `IMAGE_ALLOWED_HOSTS` setelah G-WP (https, tanpa port). Tag/atribut baru: ubah `SANITIZE_ALLOWED_TAGS` / `SANITIZE_ALLOWED_ATTRIBUTES` + uji berbahaya.

## Di luar scope
CSP dan header (SEC-001); iklan (ADS-002; hanya gambar + tautan `https`, tidak lewat penyanitasi ini); klien WordPress (API-001); menulis ke WordPress.

## Keputusan pemilik
2 Nov 2026: `sanitize-html` pra-disetujui dengan syarat terverifikasi PM (rilis < 12 bulan, stabil ≥ 2 minggu, tanpa advisori tinggi yang belum ditambal, dipin eksak); embed default hanya YouTube, dapat diperluas lewat konfigurasi. Vitest tidak dipasang; ditawarkan lagi saat persetujuan commit.
