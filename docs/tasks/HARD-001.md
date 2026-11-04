# HARD-001 — Pengerasan: basis URL kanonis tetap, validasi URL gambar hero, CSP `frame-src`

| Field | Isi |
|---|---|
| **ID / Status** | HARD-001 · `READY` (PM 4 Nov 2026, atas keputusan pemilik poin 11, 12, 13) |
| **Dependensi** | PAGE-002, PAGE-003, SANITIZE-001 `DONE` |
| **Rujukan** | PRD §13 butir "wajib sebelum tayang" 3, 4, 5; `server/utils/sanitize-config.ts` (`EMBED_ALLOWED_HOSTS`, `IMAGE_ALLOWED_HOSTS`) |

## Tujuan
Tidak ada canonical atau URL bagikan palsu lewat header `Host`; URL gambar hero/og:image dari data tidak bisa membawa skema berbahaya; header CSP hanya mengizinkan iframe ke host embed yang sama dengan penyanitasi.

## Di luar scope
CSP penuh (`script-src` dll.), header keamanan lain, integrasi WordPress, satu sumber daftar kategori (saat integrasi), `nuxt.config.ts`.

## Keputusan PM
1. **Basis URL.** `app/config/site.ts` mengekspor `SITE_URL = 'https://inisumedang.com'` [I: domain produksi; pemilik mengonfirmasi]. Satu fungsi (mis. `siteOrigin(requestOrigin)`) dipakai semua tempat yang kini memakai `useRequestURL().origin`: `canonical`, `og:url`, `og:image` absolut, dan URL bagikan/salin tautan di Detail, serta canonical Kategori. Di mode pengembangan (`import.meta.dev`) boleh memakai origin permintaan agar uji lokal tetap jalan; build produksi **selalu** memakai `SITE_URL`, apa pun header `Host`.
2. **URL gambar hero.** Fungsi murni `safeImageUrl(url)` di `server/utils/`: lolos hanya jalur relatif satu `/` (bukan `//`, tanpa `\`, tanpa karakter kontrol) atau `https:` dengan host di `IMAGE_ALLOWED_HOSTS`; selain itu `null` (artikel dirender tanpa gambar, tanpa galat). Dipakai di pemetaan artikel (`server/services/articles.ts`) untuk `heroImage.url` dan turunannya (`og:image`). Gambar di `body` sudah divalidasi penyanitasi: jangan diubah selain bila uji menemukan celah.
3. **CSP `frame-src`.** `server/middleware/security-headers.ts` (Nitro, tanpa `nuxt.config.ts`) menambah `Content-Security-Policy: frame-src https://<host> …` pada respons HTML, diturunkan dari `EMBED_ALLOWED_HOSTS` (satu sumber; tanpa daftar kedua), plus `X-Content-Type-Options: nosniff`. Tanpa direktif lain (CSP penuh = SEC-001). Aset statis dan API tidak perlu header CSP.
4. Tanpa dependensi baru; `nuxt.config.ts`/`package.json` tidak berubah; `v-html=` tetap satu baris.

## Kriteria penerimaan
1. Produksi: header `Host` palsu (mis. `evil.example`) tidak mengubah `canonical`, `og:url`, `og:image`, dan URL bagikan Detail/Kategori; semuanya memakai `SITE_URL`.
2. `safeImageUrl` menolak `javascript:`, `data:`, `http:`, `//host`, `https:` host di luar daftar, `\`, karakter kontrol, kosong/bukan string; menerima `/fixtures/x.jpg` dan `https:` host yang ada di daftar. Artikel dengan `heroImage.url` berbahaya dirender tanpa `<img>`/`og:image` dan tanpa galat 500.
3. Respons HTML memuat `Content-Security-Policy: frame-src …` persis sama dengan `EMBED_ALLOWED_HOSTS`; menambah host di daftar mengubah header tanpa edit kedua; embed YouTube pada artikel fixture masih tampil; iframe host lain tetap dibuang penyanitasi.
4. Tidak ada regresi: halaman lain, 534 uji lama, XSS end-to-end 0 eksekusi.
5. `lint`, `typecheck`, `npm test` (uji unit baru untuk `siteOrigin`, `safeImageUrl`, turunan header), `build` kode 0.

## File yang boleh disentuh
`app/config/site.ts` (baru), `app/pages/berita/[slug].vue`, `app/pages/kategori/[slug].vue`, `app/utils/**` bila perlu, `server/utils/image-url.ts` (baru), `server/utils/sanitize-config.ts` (hanya bila perlu untuk satu sumber host), `server/services/articles.ts`, `server/middleware/security-headers.ts` (baru), `tests/unit/**`, `docs/tasks/HARD-001.md`. PM: `docs/PRD.md`. **Tidak boleh:** `package.json`, lockfile, `nuxt.config.ts`, `app/assets/**`, `.github/**`, `.claude/**`, `.env*`.

## QA (cakupan besar: keamanan)
P0: `Host` palsu di build produksi; URL gambar berbahaya (via salinan sementara dengan fixture yang diubah); header CSP; iframe YouTube/host lain; korpus XSS penyanitasi lama tetap 0 eksekusi; regresi posisi dan `/api/*`; lint/typecheck/test/build/audit.

## Bukti (≤ 5 baris)

## Catatan
- Domain `https://inisumedang.com` adalah asumsi PM [I]; pemilik mengonfirmasi atau menyebut domain lain.
- Riwayat: 4 Nov 2026 → READY (PM).
