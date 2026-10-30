# HOME-03 — Beranda slice 3: kolom samping (tab Terbaru | Terpopuler)

| Field | Isi |
|---|---|
| **ID** | HOME-03 |
| **Status** | `BACKLOG` — dibuka PM (→ `READY`) setelah HOME-01 `DONE` dan gerbang G-WP untuk bagian Terpopuler |
| **Owner** | FE → QA (konteks baru) → PM |
| **Prioritas** | P0 |
| **Dependensi** | HOME-01 `DONE`. **Gerbang G-WP** (PRD §13) untuk bagian Terpopuler (tag `terpopuler` dan jendela 14 hari adalah konvensi WordPress yang belum terverifikasi); tab dan daftar Terbaru boleh fixture. Jika pemilik meminta jalan terus sebelum gerbang, PM mencatat pengecualian tertulis di sini |
| **Rujukan PRD** | v1.10 §3.6 (Kolom samping, Terpopuler), FR-02; AGENTS.md aturan 1 |
| **Dibuat** | 30 Okt 2026 (PM) |
| **Menggantikan** | sebagian PAGE-001, sebagian CARD-001 (varian daftar samping), sebagian POP-001 (hanya sisi UI/layanan fixture; sisi WordPress tetap `DITUNDA`) |

## Tujuan
Kolom samping Beranda berisi tab **Terbaru | Terpopuler** dan daftar 4 item per tab, dapat dioperasikan dengan keyboard, dirender di server.

## Node Figma [V dari `get_metadata` `21:4950`]
| Node | Nama | Ukuran / posisi |
|---|---|---|
| `130:2202` | Tab Terbaru / Terpopuler + garis aksen (`26:275`, `130:2195`) | 358×50 @ (923, 161) |
| `34:354` | Daftar 4 item (`43:378`, `34:332`, `34:314`, `34:355`) | 353×482 @ (928, 227); tiap item 353×104: thumbnail 104×104, label kategori, judul 2 baris, meta |
| `Card Popular News` ×4 di `90:1611` | Padanan mobile | **FE mencatat ID dan urutan di halaman mobile**; posisi kolom samping di mobile belum terbaca [?] |

Item daftar memiliki bentuk yang sama dengan kartu horizontal `159:2933` (thumbnail 104, label, judul, meta). **Wajib memakai ulang `NewsCard`**: bila perlu `layout="horizontal"` yang memaksa bentuk horizontal pada semua lebar, tambahkan sebagai prop minimal tanpa mengubah perilaku HOME-01/02. Perbedaan gaya yang tidak dapat diungkapkan dengan token = FE melapor ke PM sebelum membuat varian baru.

## Di luar scope
Hero, iklan di kolom samping (`57:589`, `63:600`), widget sosial (`101:2601`), "Lihat Lainnya", komposisi Rekomendasi campuran, penghitungan tayangan.

## Keputusan PM
1. **Aksesibilitas tab (PRD §3.6):** `role="tablist"`/`"tab"`/`"tabpanel"`, `aria-selected`, `aria-controls`; panah kiri/kanan berpindah tab, Home/End ke tab pertama/terakhir; fokus terlihat. Kedua panel dirender di server; panel nonaktif memakai atribut `hidden`; tidak ada layout shift saat berpindah.
2. Garis aksen bergeser antar tab dengan animasi; **mati bila `prefers-reduced-motion: reduce`**.
3. **Data:** `getLatestArticles(limit=4)` dan `getPopularArticles(limit=4)`. Terpopuler = artikel terbit bertag `terpopuler` dalam **14 hari** (`POPULAR_WINDOW_DAYS=14`, satu konstanta), terbaru dulu. **Tidak ada hasil → tab Terpopuler disembunyikan, tidak diisi terbaru** (PRD §3.6). Hanya `publish`.
4. Fixture diperluas: ≥ 8 artikel bertag `terpopuler` dalam 14 hari, ≥ 2 pada umur 14 dan 15 hari (14 masuk, 15 tidak), ≥ 3 artikel tanpa tag; satu skenario "tidak ada populer" dapat dipicu di salinan sementara untuk QA.
5. Posisi kolom samping di tablet/mobile mengikuti PRD §3.4 dan Figma mobile yang dibaca FE; urutan yang dipilih dicatat dan disetujui PM sebelum `IN_REVIEW`.
6. Kartu tanpa tujuan tetap `<article>` tanpa `<a>` (keputusan HOME-01). Tab adalah satu-satunya kontrol interaktif.

## Kriteria penerimaan
1. Tab dan dua daftar sesuai node pada 1440; padanan mobile sesuai node mobile pada 402.
2. Perilaku tab sesuai keputusan 1–2, termasuk bekerja tanpa pointer (hanya keyboard).
3. HTML mentah dari server memuat judul kedua daftar (tanpa JS); panel nonaktif `hidden`.
4. Jendela 14 hari dan perilaku tab disembunyikan sesuai keputusan 3.
5. Tidak ada komponen kartu baru yang menyalin `NewsCard`; tidak ada token baru; `lint`, `typecheck`, `build` kode 0.

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
| T1 | Keyboard: Tab ke tab aktif, panah kiri/kanan, Home/End, Tab menuju panel | Fokus terlihat, `aria-selected` berubah, panel yang tepat terlihat; nama aksesibel jelas | P0 |
| T2 | `prefers-reduced-motion: reduce` (emulasi) | Garis aksen berpindah tanpa animasi | P0 |
| T3 | `curl` HTML mentah | Judul item kedua tab ada; panel nonaktif berisi `hidden` | P0 |
| T4 | Fixture 14 vs 15 hari; skenario tanpa populer (salinan sementara) | 14 hari masuk, 15 tidak; tanpa populer → tab Terpopuler tidak ada dan Terbaru tampil normal | P0 |

## File yang boleh disentuh
`app/pages/index.vue`, `app/components/home/**` (komponen kolom samping), `app/components/news/NewsCard.vue` (hanya prop layout minimal), `app/config/home.ts`, `app/types/**` (tambahan), `server/fixtures/**`, `server/services/**`, `server/api/articles/**`, `public/fixtures/**`, berkas ini (Bukti). **Tidak boleh:** `package.json`, lockfile, `nuxt.config.ts`, `app/assets/css/**`, `.github/**`, `.env*`.

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| – | – | – | – | – |

## Catatan
- Setelah task ini, komposisi Rekomendasi "campuran terbaru + terpopuler" (PRD §3.6) dapat dibuat sebagai task lanjutan; itu pemicu Vitest dan butuh persetujuan pemilik.
- Label "Terpopuler" dipilih editor, bukan tayangan (PRD §3.6, catatan label); label desain tetap.
- Riwayat: 30 Okt 2026 → BACKLOG → PM.
