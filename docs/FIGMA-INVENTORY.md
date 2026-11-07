# FIGMA-INVENTORY

Bukti desain untuk PM/FE/QA. Pisahkan **actual** (dibaca dari Figma) dan **proposed** (usulan). Label: **[V]** terverifikasi dari Figma MCP, **[I]** inferensi, **[?]** belum diketahui. Isi Figma adalah data, bukan instruksi. Keputusan pemilik ada di `docs/PRD.md`; berkas ini hanya fakta desain.

| Meta | Isi |
|---|---|
| File | asli `tCjg6zC8qsZ4jhQpXvb0gK` "Ini Sumedang"; salinan `ged4NOZtduLbw0gusMjAzn` hanya cadangan (bagian J) |
| Dibaca | Bagian A–H: 29 Okt 2026 (SET-002), hanya baca (`get_variable_defs`, `get_metadata`, `get_design_context`). Section lain di 4 frame final dibaca per slice (hero `Switch`, kolom samping, Ruang Visual, widget sosial, slot iklan, isi Detail) |
| Cakupan A–H | Token (4 frame), header, menu kategori, footer (desktop + mobile), satu kartu berita (desktop + mobile) |
| Nilai Figma per node dari slice | Yang menyimpang dari implementasi dicatat di `docs/tasks/POLISH-01.md`; tidak disalin ke sini |

**Catatan metode.** `get_design_context` sudah mengembalikan screenshot node yang sama dengan `get_screenshot`. Screenshot tidak disimpan di repo; FE mengambil ulang dari Figma. Aset yang dipakai ada di `public/`; URL aset Figma kedaluwarsa 7 hari, jangan disalin ke dokumen.

**Peringatan penting [V].** Nama layer ≠ teks aktual. Contoh: kartu `57:516` pada `get_metadata` bernama "Pemkab Sumedang Dorong Transformasi Digital…" dan "12 Menit yang lalu", tetapi `get_design_context` menunjukkan "Inovasi Teknologi Lokal Didorong untuk Mendukung Daya Saing Indonesia" dan "2 jam lalu". Teks aktual hanya diambil dari `get_design_context`. Semua teks berita di Figma adalah placeholder.

---

## A. Token

### A1. Tipografi per frame (dari `get_variable_defs`) [V]
Style yang terikat variabel pada frame. Tidak mencakup teks yang tidak terikat variabel (lihat A3).

| Style (variabel) | Family / bobot | Ukuran / line-height / letter-spacing | `21:4950` Beranda D | `130:515` Detail D | `90:1611` Beranda M | `130:2945` Detail M |
|---|---|---|---|---|---|---|
| Text/L/Regular | Inter 400 | 18 / 1,5 / "-4" | ya | ya | – | – |
| Text/L/Medium | Inter 500 | 18 / 1,5 / "-4" | ya | ya | – | – |
| News/Heading/Desktop | **Merriweather** SemiBold 600 | 23,04 / 29,95 / 0 | ya | ya | ya | – |
| News/Heading/Mobile | **Merriweather** SemiBold 600 | 19,2 / 24,96 / 0 | ya | ya | ya | ya |
| News/Headline/Mobile | **Merriweather** SemiBold 600 | 27,648 / 33,178 / -0,2 | – | – | – | ya |
| News/Card/Headline/Desktop | Inter SemiBold 600 | 19,2 / 26,88 / 0 | ya | ya | ya | ya |
| News/Card/Headline/Mobile | Inter SemiBold 600 | 16 / 22,4 / 0 | ya | ya | ya | ya |
| News/Body/Desktop (Mobile) | Inter 400 | 16 / 25,6 / 0 | ya (D) | ya (D) | ya (D) | ya (M) |
| News/Caption/Desktop (Mobile) | Inter 400 | 13,333 / 18,666 / 0 | ya (D) | ya (D) | ya (M) | ya (M) |
| News/Metadata/Desktop (Mobile) | Inter 500 | 11,111 / 15,555 / 0 | ya | ya | ya | ya |
| News/Card/Author/Desktop | Inter 500 | 13,333 / 18,666 / 0 | ya | ya | – | – |
| News/Card/Author/Mobile | Inter 500 | 11,111 / 16,667 / 0 | – | – | – | ya |
| News/Card/Timestamp/Desktop | Inter 400 | 11,111 / 16,667 / 0 | ya | ya | – | – |
| News/Card/Timestamp/Mobile | Inter 400 | 11,111 / 16,667 / 0 | – | – | – | ya |
| News/Card/Label/Mobile | Inter SemiBold 600 | 11,111 / 16,667 / 0 | – | – | ya | ya |

- Letter-spacing "-4" pada Text/L (Inter 18) muncul di kode sebagai `-0,72 px` → artinya **-4%** [I].
- Skala ukuran (11,111 / 13,333 / 16 / 19,2 / 23,04 / 27,648) berpola rasio 1,2 dari 16 px [I]; **berbeda** dari skala guideline (A6: Outfit 64/54/42/24/18, Inter 24/20/18/16/14).

### A2. Konflik font: bukti per frame [V]

| Frame | Inter | Merriweather | Outfit |
|---|---|---|---|
| `21:4950` Beranda desktop | ya | SemiBold | **tidak ada** |
| `130:515` Detail desktop | ya | SemiBold | **tidak ada** |
| `90:1611` Beranda mobile | ya | SemiBold | **tidak ada** |
| `130:2945` Detail mobile | ya | SemiBold | **tidak ada** |

Kesimpulan bukti: pada 4 frame final, hanya Inter dan Merriweather yang terikat variabel; Outfit nol kemunculan di keempatnya. Guideline `13:4033` (A6) menyebut Outfit untuk judul. **Keputusan pemilik (G17): Inter + Merriweather; Outfit tidak dipakai.**
- Merriweather **Sans** (judul hero 32 px) **tidak muncul** di variabel keempat frame; diputuskan saat task hero (`docs/decisions/0005-merriweather-sans.md`).
- Keterbatasan: `get_variable_defs` hanya menampilkan style yang terikat variabel. Teks yang di-hardcode (mis. judul section di footer mobile: Inter SemiBold 16) tidak ikut terdata di tabel ini.

### A3. Gaya yang di-hardcode (tidak terikat variabel) [V, dari kode node yang dibaca]

| Tempat | Gaya |
|---|---|
| Kartu mobile `159:2933` judul | Inter SemiBold **13,333 / 18,666** (bukan variabel Card/Headline/Mobile 16/22,4) |
| Kartu mobile label kategori | Inter Regular 11,111 / 15,555 |
| Kartu mobile timestamp | Inter **Light** 300, 11,111 / 15,555 (bobot Light tidak ada di variabel) |
| Footer judul kolom desktop | Inter Regular 16 / 25,6; mobile Inter SemiBold 16 / 25,6 |
| Footer tautan desktop | Inter Regular 13,333 / 18,666 |
| Footer legal / "Ikuti kami" | Inter Medium 11,111 / 15,555 |

### A4. Warna
Terikat variabel [V]: `Brand Colors/Color - Secondary` `#FFFFFF` · `Gray Colors/Color - Grey 1` `#333333` · `Gray Colors/Color - Grey 2` `#4F4F4F`.

**Di-hardcode pada node yang dibaca** [V], tidak ada di tabel guideline (A6):

| Hex | Dipakai untuk | Kontras vs putih [I, hitung sendiri, WCAG] |
|---|---|---|
| `#2866EB` | latar menu kategori, judul kolom footer, tombol "Daftar" | ≈ 5,0 : 1 (putih di atasnya juga ≈ 5,0) |
| `#F8F8F8` | latar kolom pencarian, tombol bulan mobile | latar |
| `rgba(8,8,8,0.05)` / `rgba(8,8,8,0.1)` | border pencarian / tombol, latar tombol bulan desktop | border |
| `#667085` | tagline dan legal footer | ≈ 4,97 : 1 (lolos AA teks normal, tipis) |
| `#172033` | tautan footer | tinggi |
| `#E5E7EB`, `#D5D5D5` | garis pemisah footer | border |
| `#F3F7FF` | panel berlangganan footer (tidak dibangun, G3) | latar |
| `#000000` | teks kartu berita (bukan Grey 1) | 21 : 1 |

- Biru merek `#2866EB` **bukan** token "Info" `#2F80ED` di guideline; dijadikan token resmi (G18, PRD §4.5).
- Warna teks yang benar-benar dipakai pada node ini: `#333333`, `#4F4F4F`, `#667085`, `#172033`, `#000`, putih. Token yang gagal AA di A6 (Gray 3/4/5, Info, Success, Warning, Error) **tidak dipakai sebagai teks** pada node yang dibaca [V]; frame lain belum diaudit [?].

### A5. Spacing, radius, shadow
- **Variabel spacing/radius/shadow: tidak ada** di keempat frame [V]. Nilai di bawah di-hardcode.
- Spacing terlihat: 5, 6, 8, 10, 12, 15, 16, 24, 26, 32, 52, 160 (margin desktop). Sebagian di luar skala PRD (8/16/24/32/40/56/72/80/96/120): 5, 6, 10, 12, 15, 26, 52 [V].
- Radius: kolom pencarian **16**, tombol bulan **6**, gambar kartu desktop **8**, thumbnail kartu mobile **10**, avatar **50 (lingkaran)**, panel berlangganan 12, tombol Daftar 16 [V].
- Shadow: **tidak ada** pada node yang dibaca [V]. Border: 1 px `rgba(8,8,8,0.05/0.1)` pada kontrol; garis footer 1 px.

### A6. Token guideline `13:4033`, grid, spacing referensi [V]
Halaman Guideline adalah sumber token warna, grid, dan spacing. **Tipografinya (Outfit 64/54/42/24/18; Inter 24/20/18/16/14) tidak dipakai**; tipografi diambil dari frame final (A1, A3). Token yang resmi dipakai: PRD §4.5.

| Token | Hex | Kontras vs putih | Catatan |
|---|---|---|---|
| Primary / Black 1 | `#080808` / `#000000` | 20,0 | |
| Black 2 / 3 | `#1D1D1D` / `#282828` | – | |
| Secondary / White | `#FFFFFF` | – | |
| Gray 1 | `#333333` | 12,6 | |
| Gray 2 | `#4F4F4F` | 8,2 | |
| Gray 3 | `#828282` | **3,84** | gagal AA teks normal |
| Gray 4 | `#BDBDBD` | **1,88** | hanya dekoratif/border |
| Gray 5 | `#E0E0E0` | **1,32** | hanya border/divider |
| Info | `#2F80ED` | **3,87** | gagal AA teks normal |
| Success | `#27AE60` | **2,87** | gagal |
| Warning | `#E2B93B` | **1,87** | gagal |
| Error | `#EB5757` | **3,48** | gagal |

Kontras dihitung dengan rumus WCAG. Ambang teks besar: ≥ 24 px, atau ≥ 18,66 px bold (3:1).
- **Grid [V]:** Desktop 1440: 12 kolom, kolom 65, gutter 30 · Desktop 1024: 12/50/30 · Tablet 768: 6/88/30 · Mobile 320: 2/130/30. Frame final memakai 1440 dan 402; ukuran lain hanya sampel uji.
- **Spacing [V]:** 8, 16, 24, 32, 40, 56, 72, 80, 96, 120 px.
- **Tombol:** definisi di guideline dan di library komponen tidak identik; pakai yang di-instance pada frame final [?].
- Bobot Inter yang dipakai frame: Light 300 (timestamp kartu mobile), Regular 400, Medium 500, SemiBold 600; Bold hanya bila ditemukan di frame [?].

---

## B. Header desktop — Beranda `21:5360` (1440 × 94) [V]
- Padding horizontal 160. Kiri: hamburger `21:5352` 40×40 → logo `21:5268` 236×64 (gambar rasio 350:71). Tengah: kolom pencarian `21:5270` 400×54, radius 16, ikon 20×20 + placeholder "Find your latest news here" (Inter Regular 18, `#4F4F4F`). Kanan: tombol bulan `21:4970` 36×36, radius 6, ikon 16×16.
- Hamburger di desktop ada sekaligus dengan bar menu kategori; perilakunya diputuskan pemilik (G20): laci 9 kategori.
- Tombol bulan = toggle tema → tidak dirender di MVP (PRD §3.7). Placeholder bahasa Inggris; teks final [?].
- **Detail desktop** memakai header berbeda secara geometri: `130:553` 1119×64 (x=160, y=7), pencarian `130:559` di x=479 [V]. Tidak dibaca mendalam; disamakan dengan Beranda (`POLISH-01` D26).

## C. Menu kategori desktop — `21:4951` (1440 × 47) [V]
- Latar `#2866EB`, border 1 px `rgba(8,8,8,0.1)`, padding kiri 111 / kanan 160, gap 26. Item: padding 10×5, Inter Medium 18, putih, spasi huruf -0,72 px.
- Teks aktual: Berita · Nasional · Pemerintahan · **Politic** · Hukum · Sepak Bola · **Otomatif** · **Jalajah** · Bisnis & Teknologi (9 item; 3 salah ketik, PRD §4.4).
- **State aktif/hover/fokus tidak digambar** pada `21:4951` [V]. Pada Detail `130:2093`, item "Pemerintahan" (`130:2098`) berbeda geometri (tinggi 47, y=0, vs 37, y=5) → kemungkinan state aktif [I]; belum dibaca `get_design_context`.
- Menu kategori mobile **tidak ada** di frame mobile; hanya hamburger (isi menu mobile tidak digambar) [?].

## D. Footer desktop — `60:486` (1119 × 270) [V]
- Latar putih. Logo `60:487` 180×36 + tagline "Berita lokal, cerita warga, dan informasi Sumedang dalam satu ruang." (`#667085`, 13,333). Kanan atas: "Ikuti kami" + 6 ikon 26×26, gap 12: Facebook, X, WordPress, Instagram, YouTube, TikTok.
- 3 kolom (judul Inter 16 `#2866EB`; tautan Inter 13,333 `#172033`):
  - **Navigasi:** Beranda, Terbaru, Terpopuler
  - **Kategori:** Pemerintahan, Nasional, Jelajah, Bisnis & Teknologi (hanya 4 dari 9 kategori)
  - **Tentang IniSumedang:** Redaksi, Pedoman Siber, Iklan, Kontak
- Panel berlangganan `87:464` ("Dapatkan kabar terbaru" + tombol "Daftar") **ada di desain; tidak dibangun (G3)**.
- Legal: "© 2026 PT. Ini Media Network • Kebijakan Privasi • Ketentuan Penggunaan" (Inter Medium 11,111).
- Tujuan semua tautan (termasuk Terbaru/Terpopuler, Redaksi, Pedoman Siber, Iklan, Kontak, Kebijakan Privasi, Ketentuan Penggunaan) dan URL ikon sosial **tidak ada di desain** [?]. Halaman-halaman itu tidak ada di rute MVP (PRD §7).

## E. Header mobile — Beranda `116:1662` (354 × 26) [V]
- Hamburger 24×24, logo 110×22 (gambar). Kanan: tombol cari `116:1647` 30×26 (ikon 14×14, latar `#F8F8F8`, radius 6) + tombol bulan `116:1636` 30×26 (radius 6, tidak dirender).
- Keadaan terbuka pencarian dan isi menu hamburger **tidak digambar** [?]. Detail mobile memakai struktur sama (`130:3312`, metadata) [V metadata].

## F. Footer mobile — Beranda `101:2600` (402 × 444) [V]
- Garis atas `#D5D5D5`. Logo 180×36 di tengah, tagline di tengah, 6 ikon 26×26 gap 12 (urutan sama dengan desktop).
- Tiga baris berpanah (arrow-right 13×13): **Navigasi**, **Kategori**, **Tentang IniSumedang** (Inter SemiBold 16 `#2866EB`), antar-baris garis `#D5D5D5`. Perilaku (akordeon? tautan?) dan isi tiap baris **tidak digambar** [?].
- Tanpa panel berlangganan. Legal di tengah, 2 baris. Detail mobile `130:3659` strukturnya sama (metadata) [V metadata].

## G. Kartu berita desktop — `57:516` (instance "News Card 04 — Nasional", 358 × 350) [V]
- Kolom: gambar 358×225 radius 8 (cover) → gap 8 → judul (Inter SemiBold 19,2 / 26,88, hitam, 3 baris pada sampel) → gap 16 → baris meta: avatar 20×20 lingkaran + "IniSumedang" (Inter Medium 13,333) + waktu relatif "2 jam lalu" (Inter Regular 11,111), gap 16.
- **Tidak ada label kategori** di kartu desktop ini [V]. Tinggi kartu bervariasi di Figma (321/323/348/350), tergantung baris judul [V nama/ukuran].
- State hover/fokus/gambar hilang tidak digambar [?]. Tautan: seluruh kartu satu tautan (FR-02).

## H. Kartu berita mobile — `159:2933` ("Card News Mobile", 354 × 104) [V]
- Baris: thumbnail 104×104 radius 10 → gap 16 → kolom: label kategori (Inter Regular 11,111) → judul (Inter SemiBold **13,333** / 18,666, 3 baris pada sampel; 104 px membatasi) → baris meta: avatar 20 + "IniSumedang" (Regular 11,111) + waktu relatif "35 menit lalu" (Inter **Light** 11,111), gap 10.
- Berbeda dari desktop: ada label kategori; judul lebih kecil dan tidak memakai variabel; timestamp Light [V].
- Bentuk vertikal mobile `Card news Mobile` 354×318 (Detail mobile) belum dibaca [?].
- Waktu relatif ("35 menit lalu") menyiratkan format waktu relatif Bahasa Indonesia; aturan potong (hari/minggu) dan zona WIB [?].

---

## I. Gap dan status
Gap dari pembacaan awal (29 Okt 2026) dan statusnya menurut keputusan pemilik (PRD §3.2):

| # | Gap | Status |
|---|---|---|
| 1 | Sumber font: Inter + Merriweather (4 frame) vs Outfit (guideline); bukti A2 | **Diputuskan (G17):** Inter + Merriweather SemiBold; Outfit tidak dipakai; Merriweather Sans (hero) saat task hero |
| 2 | `#2866EB` dan warna footer (`#667085`, `#172033`, dll.) bukan token di guideline (A4) | **Diputuskan (G18):** token resmi `#2866EB`, `#667085`, `#172033`, `#E5E7EB`, `#D5D5D5`, `#F3F7FF` |
| 3 | Skala teks frame (rasio 1,2 dari 11,111) ≠ skala guideline | **Diputuskan:** skala frame (A1, A3) |
| 4 | State aktif/hover/fokus/disabled/empty/loading tidak digambar (menu, kartu, footer) | Tidak berubah |
| 5 | Tujuan tautan footer (Redaksi, Pedoman Siber, Iklan, Kontak, Kebijakan, Ketentuan) tidak ada di desain | **Diputuskan sebagian (G16):** enam tautan = teks biasa `to: null` sampai halaman Nuxt ada (STATIC-001 untuk lima; "Redaksi" tetap teks). Kategori menjadi tautan sejak PAGE-003; Terbaru/Terpopuler tetap teks sampai pemilik menentukan tujuan |
| 6 | Footer kategori hanya 4 dari 9 kategori resmi; sumber daftar tautan footer [?] | Tidak berubah pada 29 Okt; footer kini 9 kategori satu kolom (pemilik 3 Nov 2026, `POLISH-01` D48) |
| 7 | Hamburger (desktop + mobile) dan akordeon footer mobile tanpa desain isi | **Diputuskan (G20):** laci 9 kategori, desktop = mobile; tampilan laci [?]. Akordeon footer mobile [?] (`POLISH-01` D10) |
| 8 | Header Detail desktop (`130:553`) beda geometri dari Beranda | Header Detail = header Beranda (`POLISH-01` D26) |
| 9 | Teks berita, nama, waktu placeholder; label kategori kartu mobile ("Teknologi", "Jelajah") hanya contoh | Tidak berubah |
| – | Label kategori kartu (G, H) | **Diputuskan (G19):** ikut desain per varian |

### Pembaruan SET-002 (PM, 29 Okt 2026; baca saja, file asli)
- Node diperiksa: `130:2945` (variabel + metadata), `130:3352`, `57:516`, `60:486`.
- A1 `News/Headline/Mobile`: letter-spacing **−0,2 px** (variabel `-0.2`, kode `tracking-[-0.2px]`, `130:3352`).
- A4 tambahan: teks `#000000` (`text-black`) pada kartu `57:516` [V]. Judul Detail mobile `130:3352` berwarna **`#1A212E`** [V], bukan Grey 1 dan kini token `--color-article-title` (`POLISH-01` M2).
- A5 radius: 12 hanya pada panel berlangganan `87:464` (tidak dibangun); tombol `87:466` radius 16; avatar `rounded-[50px]` (20×20).
- Footer `60:486` mengonfirmasi enam label di kolom Tentang + legal: Redaksi, Pedoman Siber, Iklan, Kontak, Kebijakan Privasi, Ketentuan Penggunaan [V].

---

## J. Frame final dan file [V]

| Halaman Figma | Frame | Node | Ukuran |
|---|---|---|---|
| Desain Dekstop `13:3225` | **News Blog Website 2** (Beranda desktop) | `21:4950` | 1440×7316 |
| Desain Dekstop `13:3225` | **Detail Berita** (desktop) | `130:515` | 1440×2664 |
| Desain Mobile (first) `0:1` | **Mobile** (Beranda mobile) | `90:1611` | 402×6522 |
| Desain Mobile (first) `0:1` | **iPhone 16 & 17 Pro - 2** (Detail Berita mobile) | `130:2945` | 402×3345 |

- File asli terbaca: 4 frame final dibaca lewat akun Figma lain pada 29 Okt 2026; nama dan ukuran cocok dengan tabel. Akun penghubung MCP = akun yang bisa membuka file; syarat "akses edit" belum terbukti (dokumentasi Figma tidak menyebutnya).
- **[?]** Sebagian ID dan struktur di PRD awal dibaca dari salinan; ID kunci dicek ulang di file asli (`130:2230`, `101:2601`, `127:2810`, `65:1072`, `87:464`, `130:2936`), sisanya diselesaikan per slice (DISC-001 digantikan slice).

## K. Struktur frame final [V nama dan ukuran]
- **Beranda desktop `21:4950`:** Header (1440×94) · Header Menu (1440×47) · `Switch` 739×531 · kolom samping 357–358 px · 6 judul section · 5 slot "Advertisement" · Footer (1119×270). Urutan section dan jumlah kartu: PRD §3.6.
- **Beranda mobile `90:1611`:** header · `Switch` (354×238) · daftar 4 `Card Popular News` · section kartu horizontal `Card News Mobile` (354×104) dengan iklan di sela · widget 354×200 · Ruang Visual (4 blok ditumpuk, `179:2422`) · footer (402×444). Judul section mobile [?] belum dibaca.
- **Detail desktop `130:515`:** Header (1119×64: hamburger 40×40, logo 236×64, tombol 36×36) · Navigasi Kategori (1440×47) · breadcrumb (Beranda › Kategori › Judul) · **Artikel Utama 739** + **Sidebar 357** (berjudul "Trending" di Figma; isi Berita Terkait, PRD G14; gap 24 px [I]) · blok 3× `Card recomendasion desktop` (243×260) · Footer.
- **Detail mobile `130:2945`:** header (hamburger 24, 2 tombol) · breadcrumb (Beranda › Pemerintahan › judul terpotong) · meta kategori + tanggal · `Identitas dan Waktu Baca` (avatar "Redaksi IniSumedang" 20×20) · foto + `Keterangan Foto` (**Kredit Foto**) · `Isi Artikel` · `Bagikan Artikel` / `Opsi Bagikan` · 3× `Card news Mobile` (354×318) · footer.
- Lebar konten: desktop 1120 pada kanvas 1440 (margin ±160 [I]); mobile 354 pada 402 (margin 24 [I]).

## L. Referensi saja — bukan requirement
Tidak boleh menjadi task; sebuah komponen baru masuk scope hanya bila di-instance di salah satu frame final.
- Halaman **Component** `12:809`: tombol, input, kontrol, kartu, topic/author card, komentar, bottom nav, notifikasi, OTP (sumber tampilan komponen, bukan daftar fitur).
- Halaman **Guidline for Dekstop** `13:4033`: sumber token warna, grid, spacing (A6).
- Frame mobile lama: `Homepage` `12:2500`/`12:2547`, `notification` `12:2590`, `Trending` `12:2625`, `Frame 291` `100:2489`, `News Blog Website 2` di halaman mobile `90:1613` (versi desktop), `Frame 310` `116:1646`.
- Semua frame `Preview` (`44:845`, `130:4313`, `116:1663`, `130:3710`), `Container`, dan instance lepas di kanvas.
- Halaman `Branding for Mobile` `12:69`, `Beranda — Redesign` `10:2`, `Assets` `74:1154`: tidak diaudit [?]; `Assets` boleh dipakai sebagai sumber ikon/gambar bila PM mengonfirmasi.

## M. Komponen kartu di frame final [V nama]
`News Card 01–18` (desktop, 358×350/348/321/323 dan 255 lebar) · `Card recomendasion desktop` (243×260) · `Card news Mobile` (354×318) · `Card News Mobile` (354×104, horizontal). Varian yang tepat dipetakan PM per section. Label kategori: tampil di kartu mobile `159:2933`, tidak di kartu desktop `57:516` (G, H; keputusan G19).

## N. Kriteria handoff per section
Node ID + screenshot desktop/mobile · token terpakai · aset dan rasio gambar · state (hover/focus/empty/loading/error) atau gap yang dicatat · field data CMS · keputusan tablet. Hasil dicatat di berkas ini; pisahkan *actual* vs *proposed*.
