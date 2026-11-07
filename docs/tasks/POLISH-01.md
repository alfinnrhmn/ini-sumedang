# POLISH-01 — Pemolesan: deviasi Figma yang diterima pemilik (pengumpul)

| Field | Isi |
|---|---|
| **ID / Status** | POLISH-01 · `DONE` (PM 4 Nov 2026, setelah QA_PASSED 1 putaran; butir lain diterima pemilik); sebelumnya `READY`, `BACKLOG` |
| **Dependensi / Rujukan** | HOME-03 `DONE`; token/aset baru butuh persetujuan pemilik (AGENTS.md aturan 3); PRD §4.5, §4.6, §13 |
| **Dibuat** | 31 Okt 2026 (PM, atas catatan pemilik); READY dan DONE 4 Nov 2026 |

## Tujuan
Menampung deviasi dari 4 frame final Figma yang **diterima pemilik** saat sebuah slice `DONE`, supaya tidak hilang. Bukan bagian slice mana pun. **Aturan:** slice berikutnya yang `DONE` dengan deviasi diterima menambah baris di sini (ID berurutan, sumber, node, Figma, sekarang, penyebab); PM yang menyunting, bukan FE. Daftar wajib sebelum tayang: PRD §13.

## Diterima pemilik tanpa pekerjaan (4 Nov 2026, rekomendasi PM berlaku)
Pemilik 4 Nov 2026 menerima semua butir di tabel ini; font tetap 600 (D2, D4, D29), warna pakai token terdekat (D1, D21, D30, D49), D24 header tidak menempel. Kolom kanan: Figma → sekarang.

| ID | Sumber · node | Figma → sekarang (diterima) |
|---|---|---|
| D1 | HOME-03 `90:2160` | Latar tab Terbaru aktif `rgba(15,52,202,0.2)`, radius atas 4 → tanpa latar, hanya garis aksen (token `#0F34CA` dan radius 4 tidak ada) |
| D2, D4, D29 | HOME-03 `34:354`; HOME-04 judul topik; PAGE-002 `127:2152`–`127:2159` | Inter Bold 700 (penerbit item daftar, judul topik, judul/`h2`/label Detail), Merriweather 400 (isi Detail), ikon jam 16 px → semua 600 / tanpa ikon; Inter 700, Merriweather 400, dan ikon belum di-host (font baru butuh persetujuan) |
| D3, D7 | HOME-03 `130:2202`; HOME-04 `65:1071` | Garis aksen 180 (tab) dan 154 ("Ruang Visual") → 178,5 desktop / 177 mobile dan 160,66 (aturan `SectionTitle` seragam) |
| D5 | HOME-04 | `#1A1C21` → `--color-black-2` (dipetakan, M1) |
| D6, D8 | HOME-04 `101:2683`, `116:1543`; `179:2422` | Blok pertama Ruang Visual (Figma tidak konsisten) → pola blok 2–4 untuk semua (+1,75 px desktop / +1,73 mobile); judul "Ruang Visual" tampil di mobile (frame mobile tidak menggambar; jarak 30 px [I]) |
| D9, D34 | HOME-05 `60:486`; PAGE-003 | **Digantikan 3 Nov 2026 oleh keputusan pemilik:** D9 (sub-kolom 5+4) oleh D48 (E7); D34 (grid 3 kolom tanpa kolom samping) oleh D46 (E5) |
| D10 | HOME-05 `101:2600` | Isi akordeon footer mobile tidak digambar → gaya tautan desktop (13,333/18,666 `#172033`, jarak 8, padding bawah 16), jarak ke footer 32 [I] |
| D11, D13, D15, D17, D32 | HOME-05, HOME-07, PAGE-002 | Selisih kecil dan keputusan desain: footer 1119 → 1120; chip hero mobile lebar tetap 117 → mengikuti teks; "1 Jam lalu" → "1 jam lalu"; judul hero `line-clamp` 4 desktop / 3 mobile; Detail: Baca Juga padding 17, kredit mobile 24, jarak kumulatif ≤ 4,23 px, tablet 768–1023 blok bawah 3 kolom (kartu 229–314 px, lebih sempit dari kartu mobile 354) |
| D12 | HOME-07 `21:4974`, `90:2130` | Foto hero tanpa overlay → overlay gradien turunan `--color-black-1` (tanpa overlay kontras chip 1,2:1; dengan overlay teks ≥ 4,9:1) |
| D14 | HOME-07 `21:4988` | Avatar 50×50 tajam → `avatar-mobile.png` 40×40 diperbesar (aset lebih besar belum ada) |
| D16, D22, D25 | HOME-07 `21:4981`, `90:2137`; HOME-06 `116:1628`, `116:1631`, `21:5268` | Titik hero 12/8 px, hamburger 24×24, logo 110×22: area sentuh < 24 px (WCAG 2.5.8) mengikuti Figma; 24 px tidak mungkin tanpa mengubah jarak/tampilan; D25: area klik logo header seukuran logo, tidak wajib (sebelumnya wajib, 2 Nov 2026; dicabut 4 Nov) |
| D18, D23 | HOME-07; HOME-06 `21:5360`, `116:1662` | Otomatis tertutup: posisi absolut hero (HOME-06 ada), kolom pencarian dan ikon cari (PAGE-004; D23 keputusan pemilik: ikon cari ditunda sampai PAGE-004); tombol bulan tidak dibuat selama dark mode ditunda |
| D19, D20 | HOME-06 `21:4952`, `21:4951` | Ejaan resmi dan lebar teks nyata (x item −4,89…+5,59 px); celah 26 mulai 1280, 8 px pada 1024–1279 agar 9 item satu baris |
| D21 | HOME-06 `130:2098` | Latar menu aktif → `--color-black-3` α20% (2/2/2); teks aktif `#F5B241` tidak dibuat (19/7/6 dari `--color-warning`, kontras 3,38:1); sorotan menu aktif dibangun di D26 |
| D24 | HOME-06 | Header tidak menempel (tidak digambar sticky) |
| D28 | PAGE-002 `127:2132` | Label kedua = tag pertama [I]; penulis `authorLabel`; waktu baca dihitung server; tanggal terbit ditambahkan (FR-05; tidak digambar) |
| D30, D31 | PAGE-002 | `#5E6B7D`/`#727272` → `--color-footer-muted` (8/5/8; 12/2/19), `#DEE3EB`/`#D4E0F2` → `--color-footer-divider` (7/4/0; 17/7/7), `#D9D9D9` → `--color-gray-5` (7/7/7): selisih > 4, token terdekat diterima |
| D35, D37, D38, D39, D40 | PAGE-003 | Tanpa frame, dari token yang ada: paginasi "Sebelumnya / Halaman X dari Y / Berikutnya" (kini diganti "Lebih banyak", D51); fokus ke `<h1>` setelah navigasi maju (Back/Forward memulihkan scroll); judul dokumen kategori `"<Kategori> - Ini Sumedang"` vs Detail `"<judul> — IniSumedang"` (diselaraskan di SEO-001); hover garis bawah / latar menu; keadaan kosong "Belum ada berita di kategori ini." |
| D43, D44, D45 | PAGE-003 E2, E3, E4 | Perintah pemilik: D43 "sejajar hero" ditafsirkan sejajar di bagian bawah, seperti Figma (tab 17 px di atas tepi atas hero; tepi atas sejajar hanya bila pemilik minta, opsi B tinggi sama); D44 hero slide-kiri 400 ms [I], penulis di bawah judul (judul naik 101 px desktop / 51 mobile); D45 "Lihat Lainnya" → "Lainnya" (`#525252` → `--color-gray-2`, 3/3/3), hanya 4 section kategori |
| D46, D51 | PAGE-003 E5; UX-001 | D46 (keputusan pemilik E5, 3 Nov 2026): kolom kanan kategori di bawah daftar pada < 1024. D51 (instruksi pemilik 3 Nov 2026, acuan inilah.com/categories/arena, warna primary): kolom kanan (selain Berita) = widget sosial → Trending (Terpopuler 4 item, kosong = tidak dirender) → iklan; paginasi → "Lebih banyak" (`--color-brand`, 186×44, radius 8) |
| D47 | PAGE-003 E6 | Slot iklan Figma (kotak `#D9D9D9` + "Advertisement") → perintah pemilik "papan iklan seperti Figma" (ADS-002 `DITUNDA` saat itu): penampung statis `aside aria-label="Iklan"` (latar `#D5D5D5`, 4/4/4); iklan kolom kanan naik 232 px; diganti konten CMS saat WordPress tersambung (pemilik 4 Nov 2026), penampung tidak boleh tayang (PRD §13 butir 3); mode WordPress: D59 |
| D48 | PAGE-003 E7 | Footer desktop: 4 kategori, tinggi 270 → 9 kategori satu kolom (perintah/pilihan pemilik E7, 3 Nov 2026), tinggi 363,03; mobile 443,34 tetap |
| D49 | SOC-001 | Widget "Ikuti IniSumedang": angka penampung dari `app/config/social.ts` (tanpa tautan/SDK/tombol); nilai `#1F2937` → `--color-footer-link` (8/9/4); dibiarkan sampai data asli diketahui (pemilik 4 Nov 2026); sebelum tayang angka nyata atau widget disembunyikan (PRD §13 butir 4) |
| D50 | UX-001 | Hero manual → putar otomatis 5000 ms (instruksi pemilik 3 Nov 2026; jeda hover/fokus/tab tersembunyi), tanpa tombol jeda; celah WCAG 2.2.2 diterima (pemilik 4 Nov 2026) |

## Dikerjakan di task ini (pemilik 4 Nov 2026) — kriteria penerimaan
1. **D41** (target sentuh WCAG 2.5.8; diusulkan PM jadi wajib sebelum tayang seperti D25, diputuskan pemilik 4 Nov 2026 dikerjakan): tautan kategori/footer/breadcrumb/label kartu mobile/label kepala Detail/chip hero ≥ 24×24 px lewat padding atau `::after` tak terlihat, **tampilan identik**; kecuali 9 tautan kategori footer desktop (19–20 px; 24 px mengubah tinggi footer) yang diterima.
2. **D33:** tombol bagikan WhatsApp di Detail (desktop dan mobile) ke `https://wa.me/?text=<judul> <URL kanonis>` ter-encode, `target="_blank" rel="noopener noreferrer"`, tanpa SDK; WhatsApp disebut pemilik (keputusan pemilik butir 5); Instagram tetap tidak ada (tanpa URL bagikan web).
3. **D26:** kategori aktif disorot di menu desktop dan laci (kategori itu di `/kategori/<slug>`; Detail = kategori pertama artikel; Beranda `/` = Berita) dengan latar `--color-black-3` α20% (D21), `aria-current="page"` hanya di halaman kategori; kategori di luar daftar tanpa sorotan.
4. **D36** (perintah pemilik: semua teks kategori menjadi tautan): di `/kategori/<slug>`, label kategori yang sama dengan halaman itu = teks biasa (bukan tautan/tab stop); kategori lain tetap tautan.
5. **D42** (E1; perintah pemilik "home masuk kategori Berita", tafsiran PM): "Berita" menaut ke `/` dan aktif di `/`; `/kategori/berita` → 308 ke `/`; `GET /api/category/berita` → 404.
6. Regresi: rect elemen terlihat identik dengan `main` di Beranda, Detail, kategori, `/cari` (1440, 402, 320); tanpa overflow; `/api/*` lain identik; fokus terlihat; `lint`, `typecheck`, `npm test`, `build` kode 0; tanpa dependensi, token, atau font baru.

## Dikerjakan di slice lain (diterima: D54, D56 4 Nov 2026; D58 5 Nov 2026)

| No | Sumber | Node Figma | Figma | Sekarang | Penyebab | Syarat penutupan |
|---|---|---|---|---|---|---|
| D52 | UX-001 | Judul section Beranda `68:1145`, `165:1720` | "Lainnya" Inter 10 px (desktop) / 11,111 px (mobile), panah 13 | "Lainnya" **16 px desktop / 14 px mobile**, panah 16/14, kotak setinggi baris judul, `max-width` judul `calc(100% - 74px)`; jarak terkecil ke judul 5,2 px di 320 | Instruksi pemilik 3 Nov 2026 (lebih besar, tetap lebih kecil dari judul) | – |
| D53 | UX-001 | Kolom kanan Beranda/Detail/kategori | Tidak ada perilaku gulir di Figma | Kolom kanan **menempel (sticky)** ≥ 1024: `top = min(24, tinggi layar − tinggi kolom − 24)`; fokus keyboard selalu terlihat (`focusin`); Beranda: `.side-ads` dan `.section-ad` (tab Terbaru\|Terpopuler tidak menempel); < 1024 tidak menempel | Instruksi pemilik 3 Nov 2026 | – |
| D54 | PAGE-004 | Header `21:5270`, `116:1647` | Placeholder "Find your latest news here"; keadaan terbuka mobile tidak digambar | Placeholder **"Cari berita…"**; ikon cari mobile di x 310 (38 px kosong di kanan = slot tombol tema); keadaan terbuka = baris input 40 + tombol tutup (token saja); ikon cari = tombol kirim | Keputusan PM (PRD §3.5) | Diterima 4 Nov 2026 |
| D55 | PAGE-004 | `/cari` (tanpa frame) | Tidak ada frame | Tata letak sama dengan kategori (breadcrumb, `h1` "Hasil pencarian", jumlah hasil, kartu 2 kolom, Lebih banyak, kolom kanan widget → Trending → iklan); `<title>` konstan tanpa kata kunci; `noindex` | Keputusan PM; komponen frame final | Diterima 4 Nov 2026 |
| D56 | PAGE-004 | Pencarian | – | Semua kata di judul atau ringkasan, judul di atas; pencocokan **potongan teks** (bukan kata utuh); tanpa JS di bawah 1024 memakai `@media (scripting: none)` | PRD §3.5; keputusan PM | Diterima 4 Nov 2026; pencocokan per kata bila pemilik minta |
| D57 | UX-003 | Hero desktop `21:4986`–`21:4993` (penerbit + waktu) | Avatar 50, nama Merriweather 23,04, waktu Inter 18 | Avatar **32**, nama **16** (literal `600 16px/24px`), waktu **13,333** (`--type-caption`); celah 10/4; jarak penulis-ke-titik 20; chip dan judul turun ±42 px | Keputusan pemilik 4 Nov 2026 (compact dan profesional); mobile/tablet tidak berubah | – |
| D58 | WP-002 | Menu kategori `21:4951`, label kartu, section Beranda; baris tag Detail (tanpa frame) | 9 kategori tetap; tanpa tag | Semua kategori WordPress (id naik) tanpa batas 9, menu membungkus bila > 9; section Beranda dinamis (preferensi lalu daftar, maks 4); baris tag teks (tanpa `terpopuler`) di Detail, Bagikan dan di bawahnya turun ±50 px | Keputusan pemilik 5 Nov 2026 (acuan = WordPress) | – |

## Masih terbuka / perlu tinjauan pemilik

| No | Sumber | Node Figma | Figma | Sekarang | Penyebab | Syarat penutupan |
|---|---|---|---|---|---|---|
| D27 | PAGE-002 | `130:2230`, `130:2232` (sidebar "Trending" + "Lainnya"), `130:2936` ("Lihat Lainnya" bawah) | Judul "Trending" dengan tautan "Lainnya"; "Lihat Lainnya" di blok bawah | Judul **"Berita Terkait"** (G14 usulan); tautan "Lainnya" dan "Lihat Lainnya" tidak dibangun (tanpa tujuan) | Keputusan pemilik: isi sidebar = Berita Terkait; tidak ada tautan mati | Pemilik memutuskan tujuan "Lainnya" (PRD G14) |
| D59 | ADS-002 | Slot iklan (semua frame final) | Penampung "Advertisement" | Mode WordPress: iklan dari ACF (gambar + tautan `https`, label kecil "Iklan", `rel=sponsored`); slot tanpa iklan **tidak dirender** (celah ditutup via CSS `:empty`); mode fixture tetap penampung (D47 dicabut hanya untuk mode WordPress) | Permintaan pemilik 6 Nov 2026 (iklan diatur ACF); AGENTS.md aturan 6 | Pemilik meninjau label "Iklan" dan tampilan tanpa iklan |

## Pemetaan warna hampir-sama (aturan pemilik 31 Okt 2026, PRD §4.5)
Selisih ≤ 4 level per kanal RGB dari token yang ada dipetakan tanpa persetujuan per kasus (kontras teks tetap ≥ 4,5:1); selisih lebih besar menjadi deviasi di tabel atas.

| No | Sumber | Node Figma | Warna Figma | Token | Selisih R/G/B | Kontras (vs putih) | Status |
|---|---|---|---|---|---|---|---|
| M1 | HOME-04 | `105:471`, `105:474` dst. (judul kartu besar, judul item, judul topik) | `#1A1C21` (26, 28, 33) | `--color-black-2` `#1D1D1D` | 3 / 1 / 4 | 16,86:1 (Figma 17,05:1) | **Dipetakan** (31 Okt 2026); laporan FE menulis 3/1/12, hitung ulang PM = 3/1/4 |
| M2 | PAGE-002 | `130:3352` (judul Detail) | `#1A212E` (26, 33, 46) | **Token baru** `--color-article-title` (terdekat `--color-footer-link`: 3/1/5, > 4) | 0 | 16,14:1 | **Token baru** (2 Nov 2026, catatan pemilik butir 6); satu baris di `tokens.css` |
| M3 | PAGE-002 | garis/panel abu Detail | `#E4E4E4` | `--color-gray-5` `#E0E0E0` | 4 / 4 / 4 | non-teks | **Dipetakan** |
| M4 | PAGE-002 | garis/panel abu Detail | `#E3E3E3` | `--color-gray-5` | 3 / 3 / 3 | non-teks | **Dipetakan** |
| M5 | PAGE-002 | garis mobile Detail | `#D5D5D5` | `--color-footer-divider-mobile` | 0 / 0 / 0 | non-teks | **Dipetakan** |
| M6 | SOC-001 | latar kotak widget | `#F5F5F5` | `--color-surface` `#F8F8F8` | 3 / 3 / 3 | non-teks (teks di atasnya 15,32:1 dan 4,68:1) | **Dipetakan** |

## Bukti (≤ 5 baris) dan catatan
- FE 4 Nov 2026: lint, typecheck, build kode 0; `npm test` 642/642 (`tests/unit/polish-01.test.ts`). QA 4 Nov 2026 (sedang, ±25 menit, Edge headless): **QA_PASSED**, 0 Critical/High/Medium; area klik 24–25 px dengan rect identik baseline (1440/402/320 × 5 halaman + laci); WhatsApp lolos sampai 320; tab stop `/kategori/nasional` 27 → 19; `/api/category/berita` 404, 28 `/api/*` lain identik; audit tanpa High. Log: scratchpad `pf-final-*.log`, `pq-*.log`.
- Low/Info diterima QA: area klik tautan pertama akordeon footer mobile menutupi ±3 px bawah tombol header (L1); area klik label kartu menutupi ≤ 3,4 px atas tautan judul yang sama (I1); ubin bagikan mengecil dan label membungkus di Detail 320/375 (I2); ubin WhatsApp berlatar abu token dengan ikon hijau (I3, tanpa Figma).
- Sumber D1–D8: catatan dan bukti QA HOME-03 dan HOME-04 (riwayat git, 31 Okt 2026). Foto placeholder Figma diganti `figma-1..8.jpg` bukan deviasi tata letak.
