# HOME-05 — Beranda slice 5: footer (desktop + mobile)

| Field | Isi |
|---|---|
| **ID** | HOME-05 |
| **Status** | `DONE` (PM 31 Okt 2026, setelah `QA_PASSED` putaran 1; K10 `npm ci` tidak teruji) — dibuka PM 31 Okt 2026 (SET-002 `DONE`; pemilik menyetujui perilaku footer mobile, lihat "Keputusan pemilik" di Catatan; Definition of Ready terpenuhi) |
| **Owner** | FE → QA (konteks baru) → PM |
| **Prioritas** | P0 |
| **Dependensi** | SET-002 `DONE`. Tidak bergantung HOME-01..04 dan tidak menunggu gerbang G-WP (konfigurasi kode) |
| **Rujukan PRD** | v1.10 §3.1 (Footer), §3.2 G16, §6 (SiteSettings), §7, FR-08; keputusan pemilik 29 Okt 2026 |
| **Dibuat** | 30 Okt 2026 (PM) |
| **Menggantikan** | bagian footer LAY-001 |

## Tujuan
Footer sesuai desain di semua halaman: logo, tagline, ikon sosial, tiga kolom tautan, legal; tanpa panel berlangganan. Footer menjadi bagian `layouts/default.vue` yang kelak diisi header (HOME-06).

## Node Figma [V; inventaris §D, §F]
| Node | Nama | Ukuran |
|---|---|---|
| `60:486` | Footer desktop | 1119×270 |
| `101:2600` | Footer mobile | 402×444 |
| `87:464`–`87:467` | Panel berlangganan | **tidak dibangun (G3)** |
| Padanan di Detail: `130:3659` (mobile) | strukturnya sama (metadata) | – |

## Di luar scope
Panel berlangganan, halaman tujuan (STATIC-001, PAGE-003), header, tautan "Terbaru"/"Terpopuler" (tujuan belum ditentukan pemilik), URL akun sosial (belum ada), toggle tema.

## Keputusan PM
1. **Satu daftar konfigurasi** `{ label, to }` (mis. `app/config/footer.ts`) untuk semua tautan footer. `to: null` → teks biasa: bukan `<a>`, tanpa `href` kosong atau `#`, tampil sama dengan desain, tidak dapat difokus. `to` terisi → `<a>` otomatis.
2. **Enam label di kolom Tentang + legal:** Redaksi, Pedoman Siber, Iklan, Kontak, Kebijakan Privasi, Ketentuan Penggunaan — semua `to: null` (keputusan pemilik; "Redaksi" tetap teks biasa). Kolom Navigasi: **Beranda** (`to: '/'`, rute ada) [usulan], Terbaru, Terpopuler (`null`). Kolom Kategori: Pemerintahan, Nasional, Jelajah, Bisnis & Teknologi — `null` sampai PAGE-003 selesai (hanya 4 dari 9 kategori, mengikuti desain).
3. **Ikon sosial** (Facebook, X, WordPress, Instagram, YouTube, TikTok): URL akun belum ada → ikon tampil sebagai gambar dekoratif non-tautan; konfigurasi menyiapkan `url` (hanya `https`, `rel="noopener noreferrer"`) yang mengubahnya menjadi tautan bila diisi [usulan].
4. Aset logo dan ikon diunduh dari Figma (skill figma-design-to-code) ke `public/`; tidak ada URL sementara Figma di kode.
5. **Perilaku footer mobile** (tiga baris berpanah: Navigasi, Kategori, Tentang IniSumedang; isi tiap baris tidak digambar) [usulan, perlu persetujuan pemilik]: **akordeon** — `<button aria-expanded aria-controls>` per baris yang membuka daftar tautan yang sama seperti desktop; fokus terlihat; daftar tertutup `hidden` namun ada di HTML server. Alternatif: semua daftar selalu terlihat.
6. `<footer>` landmark; teks legal "© 2026 PT. Ini Media Network • Kebijakan Privasi • Ketentuan Penggunaan" mengikuti desain (tahun dari konfigurasi, bukan hitung otomatis, sampai pemilik menyatakan lain) [usulan].
7. Layout: membuat `app/layouts/default.vue` (slot + footer) dan menyesuaikan `app.vue` untuk `NuxtLayout`.

## Kriteria penerimaan
1. Footer desktop (1119 lebar, 270 tinggi) dan mobile (402×444) sesuai node pada 1440 dan 402.
2. Enam label footer terlihat; Redaksi, Terbaru, Terpopuler (dan semua `to: null`) bukan `<a>` dan tidak dapat difokus; hanya "Beranda" (dan tautan yang `to`-nya terisi) berupa `<a>` valid.
3. Tidak ada `<a>` dengan `href` kosong atau `#`; tidak ada tautan mati; tidak ada panel berlangganan; tidak ada kata "Redesaind".
4. Mobile: perilaku sesuai keputusan 5 setelah disetujui; keyboard Enter/Space membuka/menutup.
5. Warna/font/spasi dari token; tidak ada token/dependensi baru; `lint`, `typecheck`, `build` kode 0.
6. *(koreksi pemilik)* "Beranda" di kolom Navigasi (desktop) dan di accordion Navigasi (mobile) adalah `<a href="/">` sungguhan, dapat difokus, dan membuka `/` (200); Terbaru, Terpopuler, dan semua item lain tetap teks biasa. Hasilnya: satu-satunya `<a>` di footer adalah "Beranda" (dua instans bila desktop dan mobile sama-sama dirender di HTML; tidak ada `<a>` mati).
7. *(catatan pemilik)* Warna footer yang berbeda dari token ≤ 4 level per kanal RGB dipetakan ke token terdekat (kontras teks lolos AA, dihitung) dan dilaporkan FE di Catatan untuk dicatat PM di POLISH-01; selisih > 4 level = tidak dipetakan, dilaporkan ke PM.

## Daftar pemeriksaan QA (inline; tanpa Fase 1)
| ID | Langkah | Hasil diharapkan | P |
|---|---|---|---|
| K1 | Desktop 1440: ambil screenshot node Figma yang tercantum, lalu ukur halaman dengan DevTools (`getBoundingClientRect`, computed style) | Ukuran, posisi, jarak, radius, font, warna sama dengan Figma (toleransi ±1 px; tinggi teks ±2 px). Selisih dilaporkan sebagai angka, bukan "mirip" | P0 |
| K2 | Mobile 402: sama dengan K1 terhadap node mobile | Idem; lebar konten 354, margin samping 24 | P0 |
| K3 | Tablet 768, 820, 1024, 1280 | Mengikuti PRD §3.4 (di bawah 1024 pola mobile yang dilonggarkan; ≥ 1024 pola desktop); tidak ada tumpang tindih atau teks terpotong | P0 |
| K4 | Overflow horizontal di 1440, 1280, 1024, 820, 768, 402 | `scrollWidth` = `clientWidth` di semua lebar | P0 |
| K5 | A11y: urutan heading, urutan Tab, fokus terlihat, nama aksesibel, `alt` gambar, kontras pasangan warna yang dipakai | Heading berurutan (satu `h1`); tidak ada elemen interaktif tanpa nama; kontras teks ≥ 4,5:1 (dihitung, angka dicatat) | P0 |
| K6 | SSR: `curl` ke halaman dan buka di browser dengan konsol terbuka | HTML mentah memuat teks section/kartu; tidak ada peringatan hydration atau galat di konsol; semua permintaan satu origin berstatus 200 | P0 |
| K7 | Kasus buruk fixture yang dipakai slice ini (judul ≥ 150 dan ≤ 15 karakter, artikel tanpa gambar, gambar tanpa `alt`, entitas HTML) | Tampil benar, tidak merusak tata letak, entitas terdekode (`&amp;` → `&`, `&#8211;` → `–`) | P0 |
| K8 | `grep` warna heksa/`rgb(`/nama font di `app/` selain `tokens.css`; periksa angka px di luar skala `--space-*` | Tidak ada warna atau font literal; angka di luar skala (5, 6, 10, 12, 15, 26, 52, 160) hanya dengan komentar node Figma | P0 |
| K9 | `grep` impor `server/fixtures` di `app/`, `v-html`, `fetch(`/`http` ke luar; tinjau jalur data | Data hanya lewat fungsi layanan bertipe domain; tidak ada `v-html`; tidak ada panggilan jaringan keluar | P0 |
| K10 | Di salinan bersih di luar repo: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit --audit-level=high` | Semua kode 0; tidak ada temuan audit baru | P0 |
| K11 | `git status --porcelain --untracked-files=all` dan `git diff --stat` | Hanya berkas pada "File yang boleh disentuh"; `package.json`, lockfile, `nuxt.config.ts`, `.github/`, `app/assets/css/tokens.css` dan `base.css` tidak berubah | P0 |
| F1 | Periksa enam label footer pada 1440 dan 402 dan semua `a[href]` di footer | Enam label terlihat; `a[href]` hanya untuk `to` terisi; tidak ada `href=""`/`#`/tujuan 404 | P0 |
| F2 | Tab melalui footer | Label teks biasa tidak dapat difokus; tautan dan tombol akordeon dapat, dengan fokus terlihat | P0 |
| F3 | Mobile: buka/tutup tiap baris dengan klik dan keyboard | `aria-expanded` benar; daftar sama dengan desktop; HTML mentah memuat tautan/teks | P0 |
| F4 | `grep -ri redesaind` di `app/`, `public/` dan periksa panel berlangganan | Tidak ada; panel berlangganan tidak ada | P0 |
| F5 | Klik dan Tab pada "Beranda" di footer (desktop dan accordion Navigasi mobile); periksa `a[href]` di footer | "Beranda" = `<a href="/">` dapat difokus (fokus terlihat), membuka `/` (200); tidak ada `<a>` lain di footer; Terbaru, Terpopuler, dan item lain tetap teks biasa | P0 |

## File yang boleh disentuh
`app/layouts/default.vue` (baru), `app/components/layout/**` (baru), `app/config/footer.ts` (baru), `app/app.vue`, `public/images/**` dan `public/icons/**` (aset Figma), berkas ini (Bukti). **Tidak boleh:** `package.json`, lockfile, `nuxt.config.ts`, `app/assets/css/**`, `app/pages/**`, `.github/**`, `.env*`.

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| QA r1 | Verifikasi penuh pada build produksi (salinan di luar repo `h5q-A`, baseline HEAD `h5q-B`, uji `url` sosial `h5q-C`; port 3281–3285 dan CDP 9380, semua ditutup) | `QA_PASSED`: K1–K9, K11, F1–F5, kriteria 1–7 LULUS; footer desktop 1440 tinggi persis 270 (lebar konten 1120 vs 1119), logo/tagline/ikon/garis/kolom/legal selisih 0 terhadap Figma `60:486`; mobile 402×443,34 (Figma 444; −0,66); semua warna footer selisih 0 per kanal terhadap token, kontras #667085 4,97:1, #172033 16,27:1, #2866EB 5,01:1; satu-satunya `<a>` di footer = "Beranda" `href="/"` (desktop dan accordion mobile; `/` 200); label lain `<span>` tak dapat difokus; accordion aria-expanded/aria-controls benar, Enter/Space bekerja; hash 482 elemen `main` identik dengan HEAD di 8 lebar (default) dan di 1440/402 (edge); `/api/articles/*` identik; lint/typecheck/build/audit kode 0; K10 `npm ci` TIDAK TERUJI; aset SHA-256 dan ukuran cocok (terbesar 4,5 KB) | QA | 31 Okt 2026 |
| FE | `npm run lint` (repo) | kode 0, tanpa temuan | FE | 31 Okt 2026 |
| FE | `npx nuxt typecheck`, `npm run build` di salinan di luar repo | kode 0 / 0 (Nuxt 4.6.3, "Build complete") | FE | 31 Okt 2026 |
| FE | Ukur di browser, build produksi port 3271 (HEAD) dan 3272 (perubahan); keduanya sudah ditutup | Footer desktop 1440: 1120 x 270 (Figma 1119 x 270); mobile 402: 402 x 443,34 (Figma 444); `main` Beranda identik (hash posisi/ukuran sama di 1440 dan 402; HTML `main` identik setelah menormalkan `datetime` dan id `useId`); /api/articles/* identik; tanpa overflow di 1440/1280/1024/820/768/402/375/320 | FE | 31 Okt 2026 |
| FE | Aset Figma (SHA-256) | `public/images/inisumedang-logo-footer.png` 350x71, 4531 B, c709dad5c93f3ff63a6bb8a0ca388991890b11093fa1b8baf4555fbd81698671 · `public/icons/arrow-right.svg` 494 B, 758acd2d9c21ca6f62f6d884194e6beb951d2c7edbc14291dcf85ab613e403fb · `social-facebook.svg` 744 B, d6ce0ff13aef59d396dcc9cff53d54f39c1ec77a6034793634ab2449100a14c5 · `social-x.svg` 769 B, 040bbbb75d10a05bd0036c8a71be4472b12382ad321534ee487c02fb550de237 · `social-wordpress.svg` 753 B, 5cba859979fce6abc2f4195a633ae1b8b0e66fa3ffd035ed94ccc8af5432e05c · `social-instagram.svg` 1229 B, 0902f2320ebfb723becc3f809bade12e61da67fea6a91d0543b1297cff73fafc · `social-youtube.svg` 845 B, 97b01ad4e74fe19680092ba7bd7c13c1f64a560ecc52470972c6ef6b04b1481c · `social-tiktok.svg` 997 B, 98974339d5c0e5456cfed4bde34e763913adfe433b111a5b26e36b64d2714179 | FE | 31 Okt 2026 |

## Catatan
- Pertanyaan ke pemilik: setuju akordeon untuk footer mobile; URL akun sosial; tujuan Redaksi/Terbaru/Terpopuler (tidak menghalangi, tetap teks biasa).
- **Keputusan pemilik (31 Okt 2026, dicatat PM saat menjalankan HOME-04; menggantikan bagian yang bertentangan di "Keputusan PM" 2, 3, dan 5):**
  1. Footer mobile mengikuti desain Figma node `101:2600`: logo, tagline, **enam ikon sosial (Facebook, X, WordPress, Instagram, YouTube, TikTok — termasuk WordPress)**, tiga baris berpanah **Navigasi / Kategori / Tentang IniSumedang**, dan baris legal.
  2. **Default (perilaku mobile):** tiga baris = **akordeon**: `<button>` dengan `aria-expanded` dan `aria-controls`, panah berputar saat terbuka, fokus terlihat; daftar tertutup `hidden` namun ada di HTML server. Isi: **Navigasi** = Beranda, Terbaru, Terpopuler (urutan sama dengan desktop `60:486`; "Beranda" ditambahkan kembali atas koreksi pemilik, butir 8); **Kategori** = 9 kategori resmi (Berita, Nasional, Pemerintahan, Politik, Hukum, Sepak Bola, Otomotif, Jelajah, Bisnis & Teknologi; ejaan dari data, bukan dari teks Figma); **Tentang IniSumedang** = Redaksi, Pedoman Siber, Iklan, Kontak.
  3. **Semua item teks biasa (`to: null`), kecuali "Beranda" (butir 8),** sampai halaman tujuannya ada: bukan `<a>`, tanpa `href`, tidak dapat difokus. Konsekuensi: Kategori berisi 9 kategori (bukan 4 seperti usulan lama). *(Koreksi 31 Okt 2026: kalimat sebelumnya yang menghapus "Beranda" dari Navigasi dibatalkan oleh butir 8.)*
  4. **Enam ikon sosial = ikon biasa tanpa tautan** (dekoratif, bukan `<a>`) sampai pemilik memberi URL akun; konfigurasi tetap menyiapkan `url` opsional (hanya `https`, `rel="noopener noreferrer"`).
  5. **Kebijakan Privasi dan Ketentuan Penggunaan** di baris legal = teks biasa.
  6. Prasyarat `READY` HOME-05 ("pemilik menyetujui perilaku footer mobile, keputusan 5") dengan ini **terpenuhi**; status berkas ini **tidak diubah** di sini (diubah PM saat HOME-05 dijalankan). Konfigurasi tautan tetap satu daftar untuk desktop dan mobile (keputusan PM 1), sehingga isi dan `to: null` pada butir 2–3 berlaku juga di footer desktop; tata letak desktop tetap mengikuti node `60:486`.
  7. Deviasi Figma yang kelak diterima di slice ini ditambahkan PM ke `docs/tasks/POLISH-01.md`.
  8. **Koreksi pemilik (31 Okt 2026): "Beranda" dikembalikan.** Footer desktop Figma `60:486` memang memiliki "Beranda" di kolom Navigasi (inventaris `docs/FIGMA-INVENTORY.md` §D [V]: Beranda, Terbaru, Terpopuler). "Beranda" dirender sebagai **tautan sungguhan** `<a href="/">` (`to: '/'`; rute `/` sudah ada, bukan tautan mati), baik di kolom Navigasi desktop maupun di accordion Navigasi mobile (urutan Beranda, Terbaru, Terpopuler). **Item lain tetap teks biasa (`to: null`).** Bagian "Keputusan PM" 2 (Beranda `to: '/'`) kembali berlaku untuk item ini; butir 2–3 "Keputusan pemilik" di atas diartikan "semua kecuali Beranda".
  9. Pemetaan warna hampir-sama (PRD §4.5, 31 Okt 2026) berlaku di slice ini: warna Figma footer yang selisihnya ≤ 4 level per kanal RGB dari token yang ada dipetakan ke token terdekat tanpa persetujuan per kasus (kontras teks tetap lolos AA) dan dicatat PM di `docs/tasks/POLISH-01.md` sebagai "dipetakan"; selisih lebih besar diajukan ke pemilik.
- Keputusan PM penutup: kolom Kategori desktop dibagi dua sub-kolom 5+4 (9 kategori keputusan pemilik; Figma 4 item) agar footer tetap 270 px; jarak ke footer desktop 187 (163+24) dari Figma, mobile 32 [?] tanpa sumber Figma; isi accordion mobile bergaya tautan desktop (tidak digambar); lebar 1120 vs 1119; id `useId` panel tab sidebar HOME-03 bergeser dan `aria-current="page"` otomatis pada Beranda (fungsi tidak terpengaruh). Deviasi dicatat di POLISH-01 (D9–D11). Tidak ada pemetaan warna baru (semua warna footer sama persis dengan token).
- Temuan Info untuk task berikutnya: halaman 404 bawaan Nuxt tidak memakai layout sehingga tidak ada footer (tidak ada `app/error.vue`); dicatat untuk task halaman error/PAGE, bukan bagian HOME-05.
- Riwayat: 30 Okt 2026 → BACKLOG → PM · 31 Okt 2026 → READY → PM (kriteria 6–7 ditambah atas koreksi pemilik).
- **Catatan FE (31 Okt 2026, belum diverifikasi QA):**
  - Warna footer di Figma (`#667085`, `#172033`, `#2866EB`, `#E5E7EB`, `#D5D5D5`, putih) **sama persis** dengan token yang ada (selisih 0 per kanal): tidak ada pemetaan untuk POLISH-01. Kontras (dihitung): `#667085` vs putih 4,97:1; `#172033` vs putih 16,27:1; `#2866EB` vs putih 5,01:1 (semua lolos AA).
  - **Deviasi 1 (keputusan pemilik, perlu diketahui PM):** kolom Kategori desktop berisi 9 item (Figma 4). Satu kolom 9 item membuat footer setinggi ±294 px (> 270). Dibuat dua sub-kolom 5 + 4 dalam kolom Kategori (x 230, lebar 265) sehingga tinggi tetap 270. Sub-kolom tidak ada di Figma.
  - **Deviasi 2:** lebar footer desktop 1120 (kontainer token `--container-desktop`) vs 1119 di Figma; Figma menempatkan frame di x 161, konten halaman di x 160. Kolom kiri mulai x 160 (bukan 161); ikon sosial di kanan sama dengan Figma (x 1058 pada 1440).
  - **Deviasi 3 (jarak ke footer):** Beranda desktop: kartu terakhir berakhir y 6781, footer y 6968 (187); dipakai margin-atas footer 163 + padding bawah halaman 24 = 187 [V turunan]. Mobile: jarak ke konten sebelumnya tidak dibaca dari Figma, dipakai 32 [?], perlu keputusan PM/QA.
  - **Deviasi 4:** tinggi footer mobile 443,34 vs 444 (tagline 2 baris 37,34 vs 38 di Figma, bulat); dalam ±1.
  - Isi akordeon mobile tidak digambar di Figma [?]: dipakai gaya tautan desktop (13,333/18,666 `#172033`), jarak item 8, bawah 16; satu kolom (9 kategori). Transisi putar panah 0,2 s (mengikuti `prefers-reduced-motion` global).
  - Dua instans "Beranda" di HTML (desktop dan akordeon mobile; salah satu `display: none` sesuai lebar) dan `aria-current="page"` otomatis dari NuxtLink pada halaman `/`. Id `useId` panel sidebar HOME-03 bergeser (`v-0-0-` menjadi `v-0-0-0-`) karena NuxtLayout menambah satu tingkat; tidak berdampak fungsi.
  - `app/pages/**` tidak diubah; layout `default` memberi ruang untuk header HOME-06 di atas slot. Tidak ada getCategories() di layanan; daftar 9 kategori di `app/config/footer.ts`.
  - Jarak dan nilai di luar skala (2,4; 12; 13; 18; 23; 25; 26; 49; 52; 354; 163) memiliki komentar node Figma di `SiteFooter.vue`.
