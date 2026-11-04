# SANITIZE-001 — Penyanitasi HTML sisi server
| Field | Isi |
|---|---|
| **ID** | SANITIZE-001 (P0; QA → FE → QA → PM; dibuat 29 Okt 2026) |
| **Status** | `DONE` (PM 2 Nov 2026, setelah `QA_PASSED` putaran 1 + perbaikan celah uji dan persetujuan pemilik atas commit, 2 Nov 2026). Sebelumnya `DITUNDA` (29 Okt), dibuka kembali pemilik 2 Nov 2026 sebagai prasyarat PAGE-002 |
| **Dependensi** | SET-001 `DONE`; `sanitize-html` 2.18.1 pra-disetujui pemilik (syarat diverifikasi PM); PAGE-002 bergantung pada task ini |
| **Rujukan** | PRD v1.10 §10.1, FR-05, prinsip 9, §17; AGENTS.md aturan 6, 3, 8; ADR `docs/decisions/0006-sanitize-html.md` |
## Tujuan
HTML dari CMS (`body` artikel) disanitasi di server dengan allowlist sebelum dirender, sehingga `v-html` hanya menerima keluaran penyanitasi. Berlaku juga untuk fixture. `v-html` untuk data mentah dilarang.
## Di luar scope
Klien WordPress (API-001), sanitasi iklan (ADS-002), tampilan artikel (PAGE-002), CSP (SEC-001), menulis ke WordPress.
## Keputusan yang masih berlaku
1. **Library.** `sanitize-html` 2.18.1 dipin eksak, satu-satunya dependensi baru; tanpa `@types/sanitize-html` (deklarasi tipe lokal) dan tanpa Vitest; uji memakai `node:test` (`npm test` = `node --test "tests/unit/**/*.test.ts"`).
2. **Satu jalur.** `sanitizeArticleHtml` di `server/utils/`, pembungkus `sanitizeBodyHtml` di `server/services/articles.ts`; allowlist tag/atribut/URL/embed di satu tempat, `server/utils/sanitize-config.ts`. `h1` dibuang tag-nya, teksnya tetap; `script`, `style`, `object`, `form`, atribut `on*`, `style`, `class`, dan komentar dibuang.
3. **URL.** `href` hanya `https`/`http`/`mailto`/relatif; `src` gambar hanya host `IMAGE_ALLOWED_HOSTS` (default kosong); `javascript:`/`data:`/`vbscript:` ditolak; tautan eksternal otomatis `rel="noopener noreferrer"`.
4. **Embed.** Hanya YouTube (`youtube.com`, `www.`, `youtube-nocookie.com`, `www.`), `https`, path `/embed/<id>`; `sandbox` dan `referrerpolicy` dipaksa; host lain dibuang; perluasan lewat `EMBED_ALLOWED_HOSTS`. Sandbox `allow-scripts allow-same-origin` hanya aman untuk host lintas-origin, dan daftar host harus sama dengan CSP `frame-src` (SEC-001).
5. **Batas [I].** Masukan 2 MB (2.097.152), 30.000 karakter `<`, `nestingLimit` 50: di atas batas keluaran `''` (PAGE-002 menangani body kosong). Mengubah batas wajib mengubah uji (angka literal).
## Kriteria penerimaan
1. Satu fungsi penyanitasi dengan allowlist terdokumentasi; `sanitize-html` dipin eksak; ADR 0006 mencatat alasan, verifikasi, dan audit.
2. Masukan berbahaya dibuang (script, `onerror`, `javascript:`, iframe host lain, `svg onload`, `data:`, `on*`, `form`, `base`); masukan aman utuh (paragraf, daftar, kutipan, tabel, gambar, entitas).
3. Masukan kosong, `null`, atau sangat besar terkontrol tanpa jejak tumpukan atau proses menggantung.
4. Uji unit `node:test` mencakup butir 2–3 dan embed; `lint`, `typecheck`, `npm test`, `build` kode 0; `npm audit --audit-level=high` tanpa temuan baru; `v-html` kosong di `app/` dan `server/` pada task ini.
## File yang disentuh
`server/utils/{sanitize-config,sanitize-article-html}.ts`, `server/utils/types/sanitize-html.d.ts`, `server/services/articles.ts` (titik pemanggilan), `tests/unit/**`, `docs/decisions/0006-sanitize-html.md`, `package.json` dan `package-lock.json` **[APPROVAL diberikan untuk `sanitize-html` saja]**.
## Bukti
QA r1 (2 Nov): `QA_PASSED` tanpa Critical/High; 516 payload sendiri 0 pelanggaran dan 0 eksekusi di Chrome, embed 99 payload hanya YouTube lolos, `npm test` 196/196, audit 40 temuan (2 low, 38 moderate) identik baseline, bundel klien bersih.
FE perbaikan celah uji (batas sarang/ukuran, atribut `th`/`td`): `npm test` 222/222, lint/typecheck/build kode 0, mutasi membuat uji merah. Total 1 putaran QA. Hash commit tidak tercatat di berkas.
## Catatan
- **Menunggu pemilik:** Batas [I] (2 MB / 30.000 `<` / `nestingLimit` 50) untuk ditinjau; Vitest ditawarkan lagi saat persetujuan commit.
- **Low diterima:** `colspan`/`rowspan` tidak divalidasi (inert); NUL di teks dipertahankan; entitas numerik (`&#8211;`) keluar sebagai karakter yang sama; klaim "±1,9 MB artikel wajar" FE tidak menghasilkan keluaran (melebihi 30.000 `<`); `v-bind="obj"` dinamis tidak terdeteksi pemindai statis; fixture tanpa `body` sehingga SN2 diganti kasus HTML realistis di uji unit.
Versi lengkap sebelum pemangkasan: git show 3e8e137:docs/tasks/SANITIZE-001.md
