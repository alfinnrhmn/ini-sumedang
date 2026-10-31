# POLISH-01 — Pemolesan: deviasi Figma yang diterima pemilik (pengumpul)

| Field | Isi |
|---|---|
| **ID** | POLISH-01 |
| **Status** | `BACKLOG` — pengumpul; dibuka PM (→ `READY`) setelah slice HOME-01..07 `DONE` dan pemilik memutuskan token/aset yang dibutuhkan |
| **Owner** | PM (mengumpulkan) → FE → QA (konteks baru) → PM |
| **Prioritas** | P2 |
| **Dependensi** | HOME-03 `DONE`; keputusan pemilik atas token/aset baru di tiap butir (aturan 3 AGENTS.md: token dan aset baru butuh persetujuan) |
| **Rujukan PRD** | v1.10 §4.5 (token), §4.6; `docs/tasks/HOME-03.md` (Catatan, Bukti QA) |
| **Dibuat** | 31 Okt 2026 (PM, atas catatan pemilik) |

## Tujuan
Menampung deviasi dari 4 frame final Figma yang **diterima pemilik** saat sebuah slice `DONE`, supaya tidak hilang dan dapat ditutup dalam satu pass pemolesan. Task ini **bukan** bagian slice mana pun dan tidak menghalangi slice lain.

**Aturan pengumpulan:** tiap slice berikutnya (HOME-04..07 dan seterusnya) yang `DONE` dengan deviasi Figma yang diterima **menambahkan deviasi itu ke tabel di bawah** (ID baru berurutan, sumber slice, node, nilai Figma, nilai sekarang, penyebab). PM yang menyunting berkas ini, bukan FE.

## Deviasi yang diterima
| No | Sumber | Node Figma | Figma | Sekarang | Penyebab belum dibuat | Syarat penutupan |
|---|---|---|---|---|---|---|
| D1 | HOME-03 | `90:2160` (tab Terbaru aktif, mobile/tablet < 1024) | Latar `rgba(15,52,202,0.2)`, radius sudut atas 4 px, padding 10 | Tanpa latar dan radius; penanda aktif hanya garis aksen | Token warna `#0F34CA` dan token radius 4 px belum ada di `tokens.css` (hanya radius 6/8/10/16/full; `--color-brand` `#2866EB` berbeda) | Pemilik menyetujui token warna (atau turunan `color-mix` dari token yang ada) dan radius 4; ubah `SidebarTabs.vue` |
| D2 | HOME-03 | `34:354` (item daftar kolom samping, desktop) | Nama penerbit Bold 700; ikon jam 16 px sebelum waktu | Penerbit Regular 400; waktu tanpa ikon | Tidak ada token bobot 700 (Inter 700 tidak di-host di `tokens.css`) dan tidak ada aset ikon jam | Pemilik menyetujui bobot Inter 700 (berkas font baru + SHA-256) dan aset ikon jam dari Figma; tambah ke varian `NewsCard layout="compact"` |
| D3 | HOME-03 | `130:2202` (tab + garis aksen), `100:2461` (mobile) | Garis aksen 180 px | Garis aksen 178,5 px di desktop (−1,5 px) dan 177 px di mobile (−3 px) | Lebar tab mengikuti isi/kontainer 354 px (Figma 180+178 melampaui kontainer); lebar aksen dibagi rata tab | Pemilik memutuskan lebar aksen (ikuti Figma atau ikuti tab); disesuaikan di `SidebarTabs.vue` |
| D4 | HOME-04 | `105:468`, `105:477`, `101:2713`, `101:2729` (desktop); `116:1544`, `116:1560`, `116:1576`, `116:1592` (mobile) — judul topik Ruang Visual | Inter Bold 700, 32/39 | Inter 600, 32/39 (literal `font: 600 32px/39px var(--font-sans)`) | Tidak ada token gaya ini dan tidak ada berkas Inter 700 (hanya 300–600) | Pemilik menyetujui bobot Inter 700 (berkas font + SHA-256) dan token gaya judul topik; gabung dengan D2 |
| D5 | HOME-04 | `105:471`, `105:474` dst. (judul kartu besar, judul item, judul topik) | Warna teks `#1A1C21` | `--color-black-2` `#1D1D1D` (**DIPETAKAN**, lihat tabel pemetaan; kontras 16,86:1) | `#1A1C21` bukan token | Tidak ada pekerjaan: dipetakan sesuai aturan pemetaan warna (PRD §4.5) |
| D6 | HOME-04 | `101:2683` (desktop), `116:1543` (mobile) — judul topik blok pertama | Tanpa padding; jarak ke foto 18; blok 636,44 / 618,33 | Pola blok 2–4 (`101:2684`: padding/margin 10) untuk semua blok; blok pertama +1,75 px (desktop) / +1,73 px (mobile), teks 10 px lebih rendah | Figma tidak konsisten antar blok; dipilih pola 3 dari 4 blok | Pemilik memutuskan pola blok pertama (ikuti Figma atau seragam) |
| D7 | HOME-04 | `65:1071` — garis aksen judul "Ruang Visual" | Lebar 154 (teks 146 + 8) | 160,66 (teks 146,66 + padding 14; aturan `SectionTitle` yang sama untuk semua section) | Aturan `SectionTitle` HOME-01 seragam; Figma berbeda antar section (lihat selisih aksen di HOME-02) | Pemilik memutuskan lebar aksen judul section (token padding per section atau seragam) |
| D8 | HOME-04 | Mobile `179:2422`, `116:1541` dst. | Frame mobile `90:1611` tidak memuat judul "Ruang Visual" | Judul tampil di mobile (keputusan PM 3, mode judul section mobile); jarak garis ke teks topik mobile 30 px [I] | Frame mobile tidak menggambar judul; jarak diturunkan dari `.list` | Pemilik menyetujui judul di mobile dan jaraknya, atau menghapusnya |
| D9 | HOME-05 | `60:486` (kolom Kategori footer desktop) | 4 kategori (Pemerintahan, Nasional, Jelajah, Bisnis & Teknologi), satu kolom | 9 kategori resmi (keputusan pemilik) dalam dua sub-kolom 5+4 di dalam kolom Kategori (x230, lebar 265) agar tinggi footer tetap 270 | Daftar 9 kategori tidak tergambar di Figma; satu kolom 9 item membuat footer ±294 px | Pemilik menyetujui dua sub-kolom atau tinggi footer lebih besar |
| D10 | HOME-05 | `101:2600` (accordion footer mobile) | Isi tiap baris tidak digambar; jarak ke footer mobile tidak terbaca | Isi bergaya tautan desktop (13,333/18,666 `#172033`, jarak item 8, padding bawah 16, satu kolom); jarak halaman ke footer 32 [I] | Figma hanya menggambar tiga baris tertutup | Pemilik/desainer menggambar isi accordion dan jarak, atau menerima |
| D11 | HOME-05 | `60:486`, `101:2600` | Lebar footer 1119; tinggi mobile 444; tagline 38 px tinggi (dibulatkan) | Lebar 1120 (kontainer 160); mobile 443,34; tagline 37,34 | Frame footer Figma di x161 vs konten x160; pembulatan tinggi teks | Tidak perlu (selisih ≤ 1 px, dalam toleransi); dicatat untuk kelengkapan |
| D12 | HOME-07 | `21:4974`, `90:2130` (hero) | Foto penuh tanpa gradien/overlay (Figma tidak punya lapisan gelap) | Overlay `linear-gradient(transparent, black-1 65% @20%, black-1 90%)` (turunan `--color-black-1` lewat `color-mix`) di atas foto | Foto artikel nyata bervariasi; tanpa overlay kontras chip turun sampai 1,2:1 (AA gagal); dengan overlay semua teks ≥ 4,9:1 pada 8 foto fixture | Pemilik menyetujui overlay atau menyediakan foto khusus/aturan editorial |
| D13 | HOME-07 | `90:2134` (chip mobile) | Lebar tetap 117, padding 15 (teks 97,56 terpusat, tepi ±9,7) | Lebar mengikuti teks, padding 10 (label contoh 117,56) | Chip dengan label berbeda harus pas; lebar tetap tidak mungkin untuk semua kategori | Tidak perlu (keputusan desain berlaku untuk label bervariasi) |
| D14 | HOME-07 | `21:4988` (avatar desktop 50×50) | Avatar tajam 50×50 | Aset `avatar-mobile.png` 40×40 diperbesar ke 50 (lembut, terutama layar 2×) | Aset lebih besar belum ada; tidak diunduh baru | Pemilik/desainer menyediakan avatar ≥ 100×100 |
| D15 | HOME-07 | `21:4993`, `90:2147` (waktu relatif) | "1 Jam lalu" (huruf besar J) | "1 jam lalu" dari util waktu relatif yang ada | Konsistensi dengan seluruh situs | Tidak perlu |
| D16 | HOME-07 | `21:4981`, `90:2137` (titik indikator) | Titik 12 px (desktop, pitch 20) / 8 px (mobile, pitch 16) | Sama dengan Figma; area sentuh 16–20 px (< 24 px WCAG 2.5.8) | Mengikuti Figma | Pemilik memutuskan memperbesar area sentuh (padding tak terlihat) atau menerima |
| D17 | HOME-07 | `21:4980` (judul desktop) | Judul 2 baris untuk teks contoh | `line-clamp` 4 baris desktop / 3 baris mobile; judul panjang dipotong dengan elipsis | Judul artikel nyata bervariasi panjangnya | Tidak perlu |
| D18 | HOME-07 | Hero (`21:4974`) | Posisi y 178 (desktop) / 82 (mobile) | y 24 pada build ini (header HOME-06 belum ada); jarak relatif dipakai | Header belum dibuat | Otomatis tertutup oleh HOME-06 (ukur ulang posisi absolut) |

Catatan tambahan HOME-03 yang **bukan** deviasi baru tetapi terkait: lebar kolom teks desktop item 232 px (Figma 237–241) dan pemenggalan judul item pertama berbeda; placeholder Figma ("BBC News", "4h ago", avatar merah) diganti data layanan. Keduanya diterima PM di HOME-03; dipertimbangkan ulang bersama D2 bila varian `compact` disentuh.

## Aturan pemetaan warna hampir-sama (keputusan pemilik 31 Okt 2026; PRD §4.5)
Warna Figma dengan selisih **≤ 4 level per kanal RGB** (skala 0–255) dari token yang ada dipetakan ke token terdekat **tanpa persetujuan per kasus**, selama kontras teks tetap lolos AA (≥ 4,5:1, dihitung). PM mencatatnya di sini sebagai **"dipetakan"**. Selisih > 4 pada kanal mana pun **diajukan ke pemilik** dan tetap sebagai deviasi menunggu keputusan di tabel di atas. FE melaporkan kandidat pemetaan di Catatan task-nya; PM yang menyalinnya ke tabel ini.

| No | Sumber | Node Figma | Warna Figma | Token | Selisih R/G/B | Kontras (vs putih) | Status |
|---|---|---|---|---|---|---|---|
| M1 | HOME-04 | `105:471`, `105:474` dst. (judul kartu besar, judul item, judul topik Ruang Visual) | `#1A1C21` (26, 28, 33) | `--color-black-2` `#1D1D1D` (29, 29, 29) | 3 / 1 / 4 (maks. 4) | 16,86:1 (Figma 17,05:1) | **Dipetakan** (31 Okt 2026). Catatan: laporan FE HOME-04 menulis selisih "3/1/12"; hitung ulang PM = 3/1/4, memenuhi aturan |

## Di luar scope
Perubahan fungsi, data, atau perilaku; deviasi yang ditolak pemilik; token baru tanpa persetujuan.

## Kriteria penerimaan (draf; final saat READY)
1. Tiap butir deviasi pada tabel yang diputuskan pemilik "dibuat" sesuai node Figma (selisih terukur ≤ 1 px; font/warna dari token); butir yang diputuskan "tetap diterima" ditandai `DITERIMA` tanpa pekerjaan.
2. Token/aset baru hanya yang disetujui pemilik, tercatat di `docs/decisions/` bila perlu (SHA-256 untuk font/aset).
3. Slice asal tidak mengalami regresi (ukuran kartu Rekomendasi, section kategori, kolom samping identik dengan sebelum perubahan, kecuali butir yang dipoles).
4. `lint`, `typecheck`, `build` kode 0.

## Daftar pemeriksaan QA (inline; draf)
| ID | Langkah | Hasil diharapkan | P |
|---|---|---|---|
| K1 | Desktop 1440 dan mobile 402: ukur tiap butir deviasi yang dikerjakan terhadap node Figma di tabel | Selisih ≤ 1 px; font/warna sama; dilaporkan sebagai angka | P0 |
| K2 | Bandingkan elemen non-sasaran (Rekomendasi, section HOME-02, kolom samping) dengan baseline `HEAD` | Ukuran dan computed style identik | P0 |
| K3 | A11y butir yang berubah (kontras latar tab aktif, fokus, nama aksesibel ikon jam bila ada) | Kontras teks ≥ 4,5:1 (dihitung); ikon dekoratif `aria-hidden` | P0 |
| K4 | `git status --porcelain --untracked-files=all`; `grep` warna heksa/`rgb(`/nama font di `app/` selain `tokens.css` | Hanya berkas yang diizinkan; tidak ada warna/font literal | P0 |
| K5 | Salinan bersih di luar repo: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit --audit-level=high` | Semua kode 0; tidak ada temuan audit baru | P0 |

## File yang boleh disentuh
Ditetapkan saat READY (kandidat: `app/components/home/SidebarTabs.vue`, `app/components/news/NewsCard.vue`, `app/assets/css/tokens.css` bila token disetujui, `public/fonts/**`, `public/icons/**`, `docs/decisions/**`, berkas ini).

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| – | – | – | – | – |

## Catatan
- Sumber deviasi D1–D3: Catatan dan Bukti QA `docs/tasks/HOME-03.md` (QA putaran 2, 31 Okt 2026) dan keputusan PM penutup HOME-03. D4–D8: Catatan FE dan Bukti QA `docs/tasks/HOME-04.md` (31 Okt 2026). Item lain yang sudah dicatat di HOME-03 (foto placeholder Figma diganti `figma-1..8.jpg`) bukan deviasi tata letak.
- Riwayat: 31 Okt 2026 → BACKLOG → PM (dibuat atas catatan pemilik saat menjalankan HOME-04).
