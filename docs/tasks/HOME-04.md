# HOME-04 — Beranda slice 4: Ruang Visual (4 topik)

| Field | Isi |
|---|---|
| **ID** | HOME-04 |
| **Status** | `BACKLOG` — dibuka PM (→ `READY`) setelah HOME-01 `DONE`; gerbang G-WP **tidak** menghalangi UI dan layanan fixture (pengecualian pemilik 30 Okt 2026) |
| **Owner** | FE → QA (konteks baru) → PM |
| **Prioritas** | P0 |
| **Dependensi** | HOME-01 `DONE`. **Pengecualian pemilik (30 Okt 2026):** boleh dikerjakan dengan fixture di balik fungsi layanan; integrasi WordPress (struktur kategori induk `ruang-visual`) menjadi task terpisah setelah gerbang titik cek G-WP (PRD §13). G-WP tetap wajib sebelum PAGE-002/003/004 dan sebelum situs tayang |
| **Rujukan PRD** | v1.10 §3.6 (Ruang Visual), §4.4, §4.6 |
| **Dibuat** | 30 Okt 2026 (PM) |
| **Menggantikan** | sebagian PAGE-001, sebagian CARD-001 (kartu besar dan kartu berthumbnail) |

## Tujuan
Section **Ruang Visual** menampilkan 4 topik; tiap topik = judul topik, 1 kartu besar, dan 3 berita berthumbnail kecil.

## Node Figma [V dari `get_metadata` `21:4950`; isi belum dibaca dengan `get_design_context`]
| Node | Isi | Ukuran / posisi |
|---|---|---|
| `65:1072` (+ garis `65:1070`/`65:1071`) | Judul "Ruang Visual" | 146×30 @ y=3451 |
| `101:2708`, `101:2709`, `101:2710`, `101:2726` | 4 blok topik (2×2) | 358×≈638 @ (160/541, 3502/4171) |
| Dalam tiap blok | Judul topik (≈ 39 px tinggi) → foto utama 358×189,44 → judul utama (54 px) → 3 baris berita: thumbnail 80×60 + judul 268×52 | tinggi baris 94/93 |
| `179:2422` | Padanan mobile (blok ditumpuk) | **FE mencatat ID tiap blok mobile** |

Teks di Figma ("Kategori Pemerintahan", "Kategori Ekonomi & Inovasi") adalah placeholder.

## Di luar scope
Iklan `63:595` (1118×159, di bawah section), "Lihat Lainnya" `68:1129`, arsip topik (judul topik tidak menaut), kolom samping, kategori induk di menu 9 kategori.

## Keputusan PM
1. Topik = **kategori anak** dari kategori induk `ruang-visual`; Beranda memakai 4 anak non-kosong yang paling baru dibuat, yang kosong dilewati (PRD §3.6). Fungsi layanan `getVisualTopics()` mengembalikan `{ topic: Category, lead: Article, items: Article[3] }[]`.
2. Kartu besar dan kartu berthumbnail adalah varian **`NewsCard`** atau komponen sendiri hanya bila geometri tidak dapat diungkapkan sebagai varian; FE melapor alasannya di Bukti. Judul section memakai ulang `SectionTitle`.
3. Judul "Ruang Visual" tampil juga di mobile dengan gaya judul section mobile (PRD §3.6 default).
4. Kartu tanpa tujuan = `<article>` tanpa `<a>`. Judul topik non-interaktif (`<h3>`).
5. Fixture: induk `ruang-visual` dengan ≥ 5 anak, ≥ 1 anak kosong, anak dengan tepat 1 artikel (blok tak penuh), anak dengan judul sangat panjang; artikel `draft` di anak tidak muncul.
6. Angka spacing di luar skala dengan komentar node Figma; cincin fokus 4 px (padding bila ada `overflow: hidden`).

## Kriteria penerimaan
1. Judul + 4 blok topik 2×2 (desktop) dan tertumpuk (mobile) sesuai node; ukuran foto utama 358×189,44 dan thumbnail 80×60 pada 1440.
2. Tepat 4 topik non-kosong terbaru; topik kosong tidak tampil; topik dengan kurang dari 4 artikel tampil dengan sisa item tanpa kerusakan tata letak.
3. Kasus buruk fixture (tanpa gambar, judul panjang/pendek, entitas) tampil benar di kartu besar dan item kecil.
4. Tidak ada token/dependensi baru; `lint`, `typecheck`, `build` kode 0.

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
| V1 | Hitung blok topik dan isi tiap blok pada 1440 dan 402 | 4 blok; tiap blok 1 kartu besar + 3 item; topik kosong tidak muncul | P0 |
| V2 | Fixture: anak kosong, anak 1 artikel, anak berjudul panjang; urutan "paling baru dibuat" | Sesuai aturan; urutan mengikuti pembuatan topik, bukan tanggal artikel | P0 |
| V3 | Struktur heading dan `<a>` | Judul section `h2`, judul topik `h3`; tidak ada `<a>` mati | P0 |
| V4 | Item thumbnail tanpa gambar | Blok pengganti 80×60 tanpa layout shift | P1 |

## File yang boleh disentuh
`app/pages/index.vue`, `app/components/home/**`, `app/components/news/**` (hanya varian yang diperlukan), `app/types/**` (tambahan), `server/fixtures/**`, `server/services/**`, `server/api/**`, `public/fixtures/**`, berkas ini (Bukti). **Tidak boleh:** `package.json`, lockfile, `nuxt.config.ts`, `app/assets/css/**`, `.github/**`, `.env*`.

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| – | – | – | – | – |

## Catatan
- Alternatif bila pemilik/editor memilih tag + penanda "topik unggulan" (PRD §3.6) diputuskan di gerbang G-WP; layanan satu pintu membatasi dampaknya.
- Riwayat: 30 Okt 2026 → BACKLOG → PM · 30 Okt 2026 → BACKLOG (pengecualian gerbang dicatat) → PM.
