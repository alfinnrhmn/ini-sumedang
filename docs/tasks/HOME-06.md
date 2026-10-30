# HOME-06 — Beranda slice 6: header, menu kategori, hamburger (laci 9 kategori)

| Field | Isi |
|---|---|
| **ID** | HOME-06 |
| **Status** | `BACKLOG` — prasyarat `READY`: **usulan visual laci disetujui pemilik** (keputusan pemilik 29 Okt 2026) |
| **Owner** | FE → QA (konteks baru) → PM |
| **Prioritas** | P0 |
| **Dependensi** | SET-002 `DONE`; HOME-05 `DONE` (membuat `layouts/default.vue`); usulan visual laci disetujui pemilik. Kategori dari fixture (tanpa gerbang G-WP) |
| **Rujukan PRD** | v1.10 §3.5, §3.7, §4.4, FR-01, G20; `docs/FIGMA-INVENTORY.md` §B, §C, §E |
| **Dibuat** | 30 Okt 2026 (PM) |
| **Menggantikan** | bagian header dan laci LAY-001 |

## Tujuan
Header desktop dan mobile, menu kategori desktop (9 kategori), dan hamburger yang membuka laci berisi 9 kategori resmi, di semua halaman.

## Node Figma [V; inventaris]
| Node | Nama | Ukuran |
|---|---|---|
| `21:5360` | Header Beranda desktop | 1440×94 |
| `21:4951` | Header Menu (kategori) | 1440×47 |
| `116:1662` | Header mobile Beranda | 354×26 |
| `130:553`, `130:2093`, `130:3312` | Padanan di Detail | geometri berbeda (inventaris §B); disamakan atau tidak = keputusan di Catatan, dibaca saat slice Detail |

## Di luar scope
Toggle tema (tidak dirender, PRD §3.7); kolom dan logika pencarian (PAGE-004); halaman `/kategori/[slug]` (PAGE-003).

## Keputusan PM
1. Menu kategori dibuat dari `getCategories()` (fixture, 9 kategori resmi; ejaan "Politik", "Otomotif", "Jelajah"), bukan dari teks Figma.
2. **Tautan kategori:** `/kategori/[slug]` belum ada sampai PAGE-003; `categoryPath(slug)` di `app/utils/routes.ts` mengembalikan `null` (teks biasa, bukan `<a>`) sampai PAGE-003 selesai — konsisten dengan aturan `to: null` footer dan larangan tautan mati.
3. **Laci (G20):** desktop dan mobile sama; tombol hamburger `aria-expanded`/`aria-controls`; fokus pindah ke laci saat terbuka dan kembali ke tombol saat tutup; Esc menutup; tombol tutup; fokus terkurung selama terbuka [usulan]; isi = 9 kategori bergaya teks menu. **Visual laci belum ada: PM menyiapkan usulan, pemilik menyetujui, baru dibangun.**
4. Slot pencarian: **tidak dirender** sampai PAGE-004 (kontrol tanpa fungsi = tautan mati); ruang tata letaknya dijaga agar PAGE-004 menyisipkannya tanpa menggeser header [usulan; LAY-001 butir 3 masih [I]].
5. Menu kategori desktop: state aktif/hover/fokus tidak digambar; turunan dari token (kandidat state aktif `130:2098`), usulan dicatat dan disetujui PM.
6. Landmark `header`/`nav`; cincin fokus 4 px (padding bila ada `overflow: hidden`); tablet 768–1023 mengikuti PRD §3.4.

## Kriteria penerimaan
1. Header desktop dan mobile sesuai node pada 1440 dan 402; menu kategori 9 item pada desktop.
2. Laci sesuai keputusan 3 (keyboard, fokus, Esc) dengan 9 kategori yang sama di desktop dan mobile.
3. Tidak ada toggle tema, tidak ada kolom pencarian tanpa fungsi, tidak ada `<a>` mati; ejaan kategori benar ("Politic/Otomatif/Jalajah" tidak ada).
4. Token SET-002; tidak ada dependensi baru; `lint`, `typecheck`, `build` kode 0.

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
| L1 | Hamburger di desktop dan mobile: buka, Tab, Esc, tombol tutup | `aria-expanded` benar; fokus ke laci lalu kembali ke tombol; Esc menutup; fokus tidak keluar selama terbuka | P0 |
| L2 | Isi menu dan laci | 9 kategori resmi dari fungsi layanan; ejaan benar; tidak ada tautan mati | P0 |
| L3 | Cari toggle tema, kolom pencarian, elemen berlangganan | Tidak ada | P0 |
| L4 | `prefers-reduced-motion: reduce` pada laci | Tanpa animasi | P1 |

## File yang boleh disentuh
`app/layouts/default.vue`, `app/components/layout/**`, `app/utils/routes.ts`, `server/fixtures/**` (kategori), `server/services/**`, `server/api/**` (`getCategories`), `public/images/**` (aset Figma), berkas ini (Bukti). **Tidak boleh:** `package.json`, lockfile, `nuxt.config.ts`, `app/assets/css/**`, `.github/**`, `.env*`.

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| – | – | – | – | – |

## Catatan
- **Prasyarat READY (dari LAY-001):** PM menyiapkan usulan visual laci (panel, daftar 9 kategori bergaya teks menu, tombol tutup, perilaku fokus dan Esc); belum ditulis.
- Header Detail desktop (`130:553`) berbeda geometri dari Beranda: diputuskan saat slice Detail.
- Riwayat: 30 Okt 2026 → BACKLOG → PM.
