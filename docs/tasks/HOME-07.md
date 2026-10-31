# HOME-07 — Beranda slice 7: hero `Switch`

| Field | Isi |
|---|---|
| **ID** | HOME-07 |
| **Status** | `BACKLOG` — prasyarat `READY`: PM membaca node hero dan pemilik memutuskan font judul hero |
| **Owner** | PM (baca node) → FE → QA (konteks baru) → PM |
| **Prioritas** | P1 |
| **Dependensi** | HOME-01 `DONE`; keputusan Merriweather Sans (PRD §4.5, diputuskan "saat task hero"); isi hero [?] |
| **Rujukan PRD** | v1.10 §3.1, §3.6 (jumlah: 1 komponen), §4.5 |
| **Dibuat** | 30 Okt 2026 (PM) |
| **Menggantikan** | sebagian PAGE-001 |

## Tujuan
Area hero `Switch` di Beranda. **Slice ini ditambahkan PM** karena hero ada di kedua frame Beranda tetapi tidak masuk daftar slice awal.

## Node Figma
| Node | Nama | Ukuran |
|---|---|---|
| `21:4974` | Switch (hero desktop) | 739×531 @ (160, 178) |
| Hero mobile di `90:1611` | – | 354×238 [V ukuran; ID dicatat saat dibaca] |

**Belum dibaca dengan `get_design_context`** [?]: isi (gambar besar, judul 32 px Merriweather Sans [dicatat PRD v1.8], indikator/pergantian slide, tautan).

## Di luar scope
Kolom samping, section lain, penyuntingan hero dari WordPress.

## Keputusan yang dibutuhkan sebelum READY
1. PM membaca `21:4974` dan hero mobile, mencatat struktur, state, dan perilaku "switch" (otomatis? manual?). Perilaku yang tidak digambar = usulan PM, disetujui pemilik.
2. **Merriweather Sans** (judul hero): berkas font baru (butuh pemeriksaan lisensi resmi seperti 0004, SHA-256, subset) atau memakai Merriweather yang ada; keputusan pemilik dan catatan di `docs/decisions/`.
3. Sumber isi hero (artikel unggulan?) [?]; di fixture berupa artikel terbit terbaru (usulan).

## Kriteria penerimaan (draf; final saat READY)
1. Hero sesuai node pada 1440 dan 402; judul memakai font yang diputuskan.
2. Bila ada pergantian slide: dapat dikendalikan keyboard, `prefers-reduced-motion` menonaktifkan otomatis-geser, jeda tersedia.
3. Satu `h1` Beranda berasal dari hero atau `h1` tersembunyi HOME-01 diganti (tidak keduanya).
4. Tanpa token/dependensi baru tanpa persetujuan PM; `lint`, `typecheck`, `build` kode 0.

## Daftar pemeriksaan QA (inline; tanpa Fase 1)
Dilengkapi PM saat READY. Wajib memuat K1–K11 berikut ditambah kasus perilaku hero.

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

## File yang boleh disentuh
Ditetapkan saat READY.

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| – | – | – | – | – |

## Catatan
- **Keputusan pemilik (31 Okt 2026, dicatat PM saat menjalankan HOME-04) tentang font judul hero:**
  1. **Merriweather Sans tetap di-host sendiri** (PRD §10; tidak memuat dari CDN pihak ketiga saat runtime).
  2. **Pemilik menyetujui di muka unduhan berkas font dari Fontsource melalui jsDelivr** (persetujuan untuk aturan 3 AGENTS.md atas unduhan aset) dengan syarat: **versi dipin** (nomor versi paket Fontsource tercatat), **hanya bobot yang dipakai** di hero (bobot persisnya dari node `21:4974` saat dibaca), lisensi diambil dari **repositori pencipta** (bukan dari Fontsource), dan **SHA-256 tiap berkas dicatat** di Bukti beserta URL, versi, dan tanggal (pola S44/S45 SET-002). Berkas dan lisensi ke `public/fonts/`, blok `@font-face` mengikuti pola font yang ada tanpa mengubah `nuxt.config.ts`.
  3. **Pemeriksaan Reserved Font Name (RFN)** pada teks OFL repositori pencipta Merriweather Sans wajib dilakukan FE sebelum berkas dipakai: **jika RFN sama dengan Merriweather** ("Merriweather"), risikonya **tercakup keputusan `docs/decisions/0004-merriweather-rfn.md`** (mitigasi 0004 berlaku: OFL asli dan baris hak cipta ikut, tidak diklaim versi asli, sumber dan SHA-256 tercatat); **jika RFN berbeda** (atau tidak ada kejelasan), berhenti dan **ajukan ke pemilik** sebelum berkas dipakai — jangan memperluas 0004 sendiri.
  4. Keputusan "font baru atau memakai Merriweather yang ada" (butir 2 di "Keputusan yang dibutuhkan sebelum READY") dengan ini condong ke **Merriweather Sans**; token `--font-serif`/`--font-sans` yang dipakai judul hero dan token baru (bila ada) masih butuh persetujuan PM/pemilik saat READY.
  5. Deviasi Figma yang kelak diterima di slice ini ditambahkan PM ke `docs/tasks/POLISH-01.md`.
- Riwayat: 30 Okt 2026 → BACKLOG → PM.
