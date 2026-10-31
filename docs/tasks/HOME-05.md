# HOME-05 — Beranda slice 5: footer (desktop + mobile)

| Field | Isi |
|---|---|
| **ID** | HOME-05 |
| **Status** | `BACKLOG` — layak `READY` bila pemilik menyetujui perilaku footer mobile (keputusan 5, usulan) |
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

## File yang boleh disentuh
`app/layouts/default.vue` (baru), `app/components/layout/**` (baru), `app/config/footer.ts` (baru), `app/app.vue`, `public/images/**` dan `public/icons/**` (aset Figma), berkas ini (Bukti). **Tidak boleh:** `package.json`, lockfile, `nuxt.config.ts`, `app/assets/css/**`, `app/pages/**`, `.github/**`, `.env*`.

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| – | – | – | – | – |

## Catatan
- Pertanyaan ke pemilik: setuju akordeon untuk footer mobile; URL akun sosial; tujuan Redaksi/Terbaru/Terpopuler (tidak menghalangi, tetap teks biasa).
- **Keputusan pemilik (31 Okt 2026, dicatat PM saat menjalankan HOME-04; menggantikan bagian yang bertentangan di "Keputusan PM" 2, 3, dan 5):**
  1. Footer mobile mengikuti desain Figma node `101:2600`: logo, tagline, **enam ikon sosial (Facebook, X, WordPress, Instagram, YouTube, TikTok — termasuk WordPress)**, tiga baris berpanah **Navigasi / Kategori / Tentang IniSumedang**, dan baris legal.
  2. **Default (perilaku mobile):** tiga baris = **akordeon**: `<button>` dengan `aria-expanded` dan `aria-controls`, panah berputar saat terbuka, fokus terlihat; daftar tertutup `hidden` namun ada di HTML server. Isi: **Navigasi** = Terbaru, Terpopuler; **Kategori** = 9 kategori resmi (Berita, Nasional, Pemerintahan, Politik, Hukum, Sepak Bola, Otomotif, Jelajah, Bisnis & Teknologi; ejaan dari data, bukan dari teks Figma); **Tentang IniSumedang** = Redaksi, Pedoman Siber, Iklan, Kontak.
  3. **Semua item teks biasa (`to: null`)** sampai halaman tujuannya ada: bukan `<a>`, tanpa `href`, tidak dapat difokus. Konsekuensi: "Beranda" **tidak lagi** ada di Navigasi (keputusan PM 2 versi lama menaruhnya sebagai `to: '/'`), dan Kategori berisi 9 kategori (bukan 4 seperti usulan lama).
  4. **Enam ikon sosial = ikon biasa tanpa tautan** (dekoratif, bukan `<a>`) sampai pemilik memberi URL akun; konfigurasi tetap menyiapkan `url` opsional (hanya `https`, `rel="noopener noreferrer"`).
  5. **Kebijakan Privasi dan Ketentuan Penggunaan** di baris legal = teks biasa.
  6. Prasyarat `READY` HOME-05 ("pemilik menyetujui perilaku footer mobile, keputusan 5") dengan ini **terpenuhi**; status berkas ini **tidak diubah** di sini (diubah PM saat HOME-05 dijalankan). Konfigurasi tautan tetap satu daftar untuk desktop dan mobile (keputusan PM 1), sehingga isi dan `to: null` pada butir 2–3 berlaku juga di footer desktop; tata letak desktop tetap mengikuti node `60:486`.
  7. Deviasi Figma yang kelak diterima di slice ini ditambahkan PM ke `docs/tasks/POLISH-01.md`.
- Riwayat: 30 Okt 2026 → BACKLOG → PM.
