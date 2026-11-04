# HOME-05 — Beranda slice 5: footer (desktop + mobile)

| Field | Isi |
|---|---|
| **ID / Status** | HOME-05 · `DONE` (PM 31 Okt 2026, setelah `QA_PASSED` putaran 1; K10 `npm ci` tidak teruji). Dibuka PM 31 Okt 2026 (SET-002 `DONE`; pemilik menyetujui perilaku footer mobile) |
| **Dependensi** | SET-002 `DONE`. Tidak bergantung HOME-01..04 dan tidak menunggu G-WP |
| **Rujukan** | PRD v1.10 §3.1 (Footer), §3.2 G16, §6, §7, FR-08; Figma footer desktop `60:486`, mobile `101:2600` (panel berlangganan `87:464`–`87:467` tidak dibangun, G3) |

## Tujuan
Footer sesuai desain di semua halaman: logo, tagline, ikon sosial, tiga kolom tautan, legal; tanpa panel berlangganan. Footer bagian `layouts/default.vue`.

## Di luar scope
Panel berlangganan, halaman tujuan (STATIC-001, PAGE-003), header, tautan Terbaru/Terpopuler, URL akun sosial, toggle tema.

## Keputusan yang masih berlaku
1. Satu daftar konfigurasi `{ label, to }` (`app/config/footer.ts`) untuk desktop dan mobile; `to: null` = teks biasa (bukan `<a>`, tanpa `href`, tidak dapat difokus). Satu-satunya `<a>` di footer: **Beranda** `href="/"` (desktop dan accordion mobile; koreksi pemilik 31 Okt 2026).
2. Kolom Navigasi: Beranda, Terbaru, Terpopuler. Kategori: 9 kategori resmi (keputusan pemilik; Figma 4), desktop dibagi sub-kolom 5+4 agar tinggi tetap 270. Tentang: Redaksi, Pedoman Siber, Iklan, Kontak. Legal (Kebijakan Privasi, Ketentuan Penggunaan) teks biasa; tahun © dari konfigurasi.
3. Enam ikon sosial (Facebook, X, WordPress, Instagram, YouTube, TikTok) = gambar dekoratif non-tautan; konfigurasi menyiapkan `url` opsional (hanya `https`, `rel="noopener noreferrer"`).
4. Mobile = akordeon (`<button aria-expanded aria-controls>`, daftar tertutup `hidden` tetapi ada di HTML server, panah berputar).
5. Warna footer sama persis dengan token (selisih 0); pemetaan ≤ 4 level (PRD §4.5) berlaku bila muncul. Tidak ada kata "Redesaind". Aset logo/ikon dari Figma di `public/`.

## Kriteria penerimaan
1. Footer desktop (270 tinggi) dan mobile (402×444) sesuai node. 2. Enam label terlihat; hanya Beranda berupa `<a>` valid. 3. Tanpa `href` kosong/`#`, tautan mati, panel berlangganan. 4. Akordeon bekerja dengan Enter/Space. 5. Token saja; `lint`, `typecheck`, `build` kode 0. 6. Koreksi pemilik Beranda sesuai keputusan 1. 7. Pemetaan warna sesuai keputusan 5.

## File yang disentuh
`app/layouts/default.vue` (baru), `app/components/layout/**` (`SiteFooter.vue`), `app/config/footer.ts` (baru), `app/app.vue`, `public/images/**`, `public/icons/**`.

## Bukti
- FE: lint, typecheck, build kode 0; footer desktop 1120×270, mobile 402×443,34; `main` Beranda identik dengan HEAD.
- QA r1 31 Okt 2026: `QA_PASSED` (K1–K9, K11, F1–F5); kontras #667085 4,97:1, #172033 16,27:1, #2866EB 5,01:1; lint/typecheck/build/audit kode 0.

## Catatan
- **Terbuka, untuk pemilik:** URL akun sosial; tujuan Redaksi/Terbaru/Terpopuler (tidak menghalangi; tetap teks biasa).
- **Deviasi diterima PM (POLISH-01 D9–D11):** sub-kolom Kategori 5+4; lebar 1120 vs 1119; jarak ke footer desktop 187 (163+24); jarak ke footer mobile 32 [?] tanpa sumber Figma; tinggi mobile 443,34 vs 444; isi accordion mobile tidak digambar di Figma (gaya tautan desktop).
- **Temuan Info untuk task berikutnya:** halaman 404 bawaan Nuxt tidak memakai layout sehingga tanpa footer (belum ada `app/error.vue`); untuk task halaman error/PAGE.
- K10 `npm ci` tidak teruji. Id `useId` panel sidebar HOME-03 bergeser dan `aria-current="page"` otomatis pada Beranda (fungsi tidak terpengaruh).
- Riwayat: BACKLOG 30 Okt 2026 → READY 31 Okt 2026 → QA_PASSED (r1) → DONE 31 Okt 2026 (PM).

Versi lengkap sebelum pemangkasan: git show 3e8e137:docs/tasks/HOME-05.md
