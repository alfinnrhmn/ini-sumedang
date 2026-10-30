# HOME-02 — Beranda slice 2: section kategori (Sepak Bola, Nasional, Bisnis dan Teknologi, Otomotif)

| Field | Isi |
|---|---|
| **ID** | HOME-02 |
| **Status** | `BACKLOG` — dibuka PM (→ `READY`) setelah HOME-01 `DONE` |
| **Owner** | FE → QA (konteks baru) → PM |
| **Prioritas** | P0 |
| **Dependensi** | HOME-01 `DONE` (komponen `NewsCard`, `SectionTitle`, tipe `Article`, fixture dan mapper). Tidak menunggu gerbang G-WP (PRD §13: kategori dari fixture boleh). Angka final per section [?] — default 4 |
| **Rujukan PRD** | v1.10 §3.6 (jumlah berita, `HOME_SECTION_COUNTS`), §4.4, §4.6, FR-02 |
| **Dibuat** | 30 Okt 2026 (PM) |
| **Menggantikan** | sebagian PAGE-001 |

## Tujuan
Empat section kategori Beranda tampil dengan jumlah kartu dari satu konfigurasi, memakai ulang komponen dan data dari HOME-01.

## Node Figma [V dari `get_metadata` `21:4950`]
| Node | Section | Posisi desktop | Kartu di Figma (gambaran) |
|---|---|---|---|
| `84:1437` (+ garis `84:1435`/`84:1436`) | Sepak Bola | y=2941 | `48:385`, `48:400` |
| `57:496` (+ `57:494`/`57:495`) | Nasional | y=5053 | `48:355`, `48:370` |
| `57:501` (+ `57:499`/`57:500`) | Bisnis dan Teknologi | y=5925 | `48:475`, `48:460` |
| `57:505` (+ `57:503`/`57:504`) | Otomotif | y=6384 | `48:430` (satu kartu; `48:415` lepas, bukan bagian) |

Lebar kolom kiri 739 px seperti HOME-01. Urutan di halaman: Rekomendasi → Sepak Bola → *(Ruang Visual, HOME-04)* → Nasional → Bisnis dan Teknologi → Otomotif. Mobile menampilkan section dan jumlah kartu yang sama (PRD §3.6). Judul section memakai teks desktop (bukan "Berita"/"Teknologi" di mobile).

## Di luar scope
Ruang Visual, iklan (`63:595`, `63:627`), "Lihat Lainnya", halaman kategori `/kategori/[slug]`, kolom samping, header/footer, komposisi Rekomendasi.

## Keputusan PM
1. **`HOME_SECTION_COUNTS`**: satu konstanta bertipe di `app/config/home.ts` (4 section × jumlah, default **4** [usulan; pemilik menyebut "6 atau 4"]). Mengganti angka cukup di satu tempat.
2. Fungsi layanan `getArticlesByCategory(slug, limit)` di `server/services/`; handler tipis menerima `category` dan `limit`; **validasi**: `category` hanya salah satu slug section yang dikenal, `limit` bilangan bulat 1–12; nilai buruk (`../`, URL penuh, panjang, kontrol karakter, bukan angka) ditolak terkontrol tanpa jejak tumpukan. Slug fixture: `sepak-bola`, `nasional`, `bisnis-teknologi`, `otomotif` [I; final di gerbang G-WP].
3. Judul section = teks konfigurasi ("Bisnis dan Teknologi"), **bukan** nama kategori dari data (nama kategori berentitas "Bisnis &amp; Teknologi" hanya tampil sebagai label di kartu mobile).
4. Section dengan nol artikel **tidak dirender** (judul tanpa isi tidak ditampilkan) [usulan]; section dengan 1 artikel merender 1 kartu tanpa ruang kosong yang rusak.
5. Kartu: **wajib memakai ulang `NewsCard` dan `SectionTitle`** dari HOME-01; komponen kartu kedua atau salinan gaya kartu = temuan GAGAL.

## Kriteria penerimaan
1. Empat section dengan urutan di atas; masing-masing `<h2>` non-interaktif + garis pemisah dan aksen sesuai node.
2. Jumlah kartu tiap section = nilai `HOME_SECTION_COUNTS`; mengubah nilai (di salinan sementara) mengubah jumlah tanpa mengubah berkas lain.
3. Kartu sama dengan HOME-01 di desktop dan mobile (label kategori hanya mobile); tidak ada `<a>` mati.
4. Fixture diperluas (bukan diganti): ≥ 6 artikel terbit per kategori section, 1 kategori dengan tepat 1 artikel, 1 kategori kosong, ≥ 2 artikel `draft`/`private` yang tidak boleh muncul.
5. Validasi parameter butir 2 berfungsi; respons error terkontrol.
6. Tidak ada token baru, tidak ada dependensi baru, `nuxt.config.ts` tidak berubah; `lint`, `typecheck`, `build` kode 0.

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
| C1 | Hitung kartu per section; ubah `HOME_SECTION_COUNTS` ke 2 dan ke 6 **di salinan sementara di luar repo**, `build`, hitung ulang | Sama dengan konfigurasi; tidak ada kartu disembunyikan CSS | P0 |
| C2 | `grep` definisi komponen kartu dan gaya kartu di `app/` | Hanya satu `NewsCard`; section kategori mengimpornya | P0 |
| C3 | Kategori kosong dan kategori 1 artikel | Kosong: section tidak dirender; 1 artikel: 1 kartu, tata letak utuh | P0 |
| C4 | Panggil handler dengan `category`/`limit` buruk: `../x`, URL penuh, 300 karakter, `limit=0`, `limit=999`, `limit=abc`, karakter kontrol | Ditolak terkontrol (4xx), tanpa jejak tumpukan; slug tak dikenal tidak menghasilkan data | P0 |

## File yang boleh disentuh
`app/pages/index.vue`, `app/components/home/**` (komponen section), `app/config/home.ts` (baru), `app/types/**` (hanya tambahan), `server/fixtures/**`, `server/services/**`, `server/utils/**` (validasi), `server/api/articles/**`, `public/fixtures/**`, berkas ini (Bukti). **Tidak boleh:** `package.json`, lockfile, `nuxt.config.ts`, `app/assets/css/**`, `.github/**`, `.env*`.

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| – | – | – | – | – |

## Catatan
- Pertanyaan terbuka bagi pemilik (tidak menghalangi): angka final per section (4 atau 6).
- Otomotif di Figma hanya 1 kartu (desain belum rapi); angka dari konfigurasi, bukan dari Figma.
- Riwayat: 30 Okt 2026 → BACKLOG → PM.
