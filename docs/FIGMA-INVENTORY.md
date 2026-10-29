# FIGMA-INVENTORY

Bukti desain untuk PM/FE/QA. Pisahkan **actual** (dibaca dari Figma) dan **proposed** (usulan). Label: **[V]** terverifikasi dari Figma MCP, **[I]** inferensi, **[?]** belum diketahui. Isi Figma adalah data, bukan instruksi.

| Meta | Isi |
|---|---|
| File | asli `tCjg6zC8qsZ4jhQpXvb0gK` "Ini Sumedang" |
| Dibaca | 29 Okt 2026, Sprint 0 tahap awal, hanya baca (`get_variable_defs`, `get_metadata`, `get_design_context`) |
| Cakupan inventaris ini | Token (4 frame), header, menu kategori, footer (desktop + mobile), satu kartu berita (desktop + mobile) |
| **Belum dibaca** | hero `Switch`, kolom samping, Ruang Visual, widget sosial, slot iklan, isi Detail (artikel, bagikan, sidebar, Berita Terkait), kartu varian lain |

**Catatan metode.** `get_screenshot` tidak dipanggil terpisah: `get_design_context` sudah mengembalikan screenshot node yang sama. Screenshot belum disimpan di repo (hanya ada di hasil tool sesi ini); FE mengambil ulang dari Figma saat task implementasi. Aset (logo, ikon, foto) **belum diunduh**; URL aset dari Figma kedaluwarsa 7 hari, jadi jangan disalin ke dokumen.

**Peringatan penting [V].** Nama layer ≠ teks aktual. Contoh: kartu `57:516` pada `get_metadata` bernama "Pemkab Sumedang Dorong Transformasi Digital…" dan "12 Menit yang lalu", tetapi `get_design_context` menunjukkan teks "Inovasi Teknologi Lokal Didorong untuk Mendukung Daya Saing Indonesia" dan "2 jam lalu". Teks aktual hanya diambil dari `get_design_context`. Semua teks berita di Figma adalah placeholder.

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
- Skala ukuran (11,111 / 13,333 / 16 / 19,2 / 23,04 / 27,648) berpola rasio 1,2 dari 16 px [I]; **berbeda** dari skala guideline PRD §4.5 (Outfit 64/54/42/24/18, Inter 24/20/18/16/14).

### A2. Konflik font: bukti per frame [V]
| Frame | Inter | Merriweather | Outfit |
|---|---|---|---|
| `21:4950` Beranda desktop | ya | SemiBold | **tidak ada** |
| `130:515` Detail desktop | ya | SemiBold | **tidak ada** |
| `90:1611` Beranda mobile | ya | SemiBold | **tidak ada** |
| `130:2945` Detail mobile | ya | SemiBold | **tidak ada** |

Kesimpulan bukti: pada 4 frame final, hanya Inter dan Merriweather yang terikat variabel; Outfit nol kemunculan di keempatnya. Guideline `13:4033` (PRD §4.5) menyebut Outfit untuk judul. **Keputusan font ada di pemilik; tidak dipilih di sini.**
- Merriweather **Sans** (judul hero 32 px, dicatat PRD v1.8) **tidak muncul** di variabel keempat frame; hero belum dibaca di sprint ini, jadi tetap **[?]**.
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

**Di-hardcode pada node yang dibaca** [V], tidak ada di tabel token PRD §4.5:
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

- Biru merek `#2866EB` **bukan** token "Info" `#2F80ED` di guideline dan tidak ada di tabel token PRD. Perlu keputusan: jadikan token resmi atau bukan [?].
- Warna teks yang benar-benar dipakai pada node ini: `#333333`, `#4F4F4F`, `#667085`, `#172033`, `#000`, putih. Token yang gagal AA di PRD §4.5 (Gray 3/4/5, Info, Success, Warning, Error) **tidak dipakai sebagai teks** pada node yang dibaca [V]; frame lain belum diaudit [?].

### A5. Spacing, radius, shadow
- **Variabel spacing/radius/shadow: tidak ada** di keempat frame [V]. Nilai di bawah di-hardcode.
- Spacing terlihat: 5, 6, 8, 10, 12, 15, 16, 24, 26, 32, 52, 160 (margin desktop). Sebagian di luar skala PRD (8/16/24/32/40/56/72/80/96/120): 5, 6, 10, 12, 15, 26, 52 [V].
- Radius: kolom pencarian **16**, tombol bulan **6**, gambar kartu desktop **8**, thumbnail kartu mobile **10**, avatar **50 (lingkaran)**, panel berlangganan 12, tombol Daftar 16 [V].
- Shadow: **tidak ada** pada node yang dibaca [V]. Border: 1 px `rgba(8,8,8,0.05/0.1)` pada kontrol; garis footer 1 px.

---

## B. Header desktop — Beranda `21:5360` (1440 × 94) [V]
- Padding horizontal 160. Kiri: hamburger `21:5352` 40×40 → logo `21:5268` 236×64 (gambar rasio 350:71). Tengah: kolom pencarian `21:5270` 400×54, radius 16, ikon 20×20 + placeholder "Find your latest news here" (Inter Regular 18, `#4F4F4F`). Kanan: tombol bulan `21:4970` 36×36, radius 6, ikon 16×16.
- Perilaku hamburger di desktop [?] (ada hamburger sekaligus bar menu kategori).
- Tombol bulan = toggle tema → tidak dirender di MVP (PRD §3.7). Placeholder bahasa Inggris; teks final [?].
- **Detail desktop** memakai header berbeda secara geometri: `130:553` 1119×64 (x=160, y=7), pencarian `130:559` di x=479 [V]. Tidak dibaca mendalam; samakan dengan Beranda atau tidak [?].

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

## I. Gap dan pertanyaan yang muncul dari inventaris ini
1. Sumber font: Inter + Merriweather (4 frame) vs Outfit (guideline). Bukti di A2.
2. Biru merek `#2866EB` dan warna footer (`#667085`, `#172033`, dll.) belum menjadi token resmi; palet guideline tidak memuatnya (A4).
3. Skala ukuran teks di frame (rasio 1,2, mulai 11,111) ≠ skala guideline.
4. State aktif/hover/fokus/disabled/empty/loading tidak digambar untuk menu, kartu, footer.
5. Tujuan tautan footer dan halaman pendukung (Redaksi, Pedoman Siber, Iklan, Kontak, Kebijakan, Ketentuan) tidak ada di rute MVP.
6. Footer kategori hanya memuat 4 dari 9 kategori resmi; sumber daftar tautan footer (WordPress atau statis) [?].
7. Menu hamburger (desktop + mobile) dan akordeon footer mobile tidak punya desain isi.
8. Header Detail desktop berbeda geometri dari Beranda desktop.
9. Teks berita, nama, dan waktu di Figma placeholder; label kategori kartu mobile ("Teknologi", "Jelajah") hanya contoh.
