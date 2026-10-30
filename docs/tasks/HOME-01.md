# HOME-01 — Beranda slice 1: kartu berita + section Rekomendasi (8 kartu)

| Field | Isi |
|---|---|
| **ID** | HOME-01 |
| **Status** | `DONE` (PM 30 Okt 2026, setelah `QA_PASSED` putaran 2; tidak dikomit) |
| **Owner** | FE → QA (konteks baru) → PM |
| **Prioritas** | P0 |
| **Dependensi** | SET-001 `DONE`; SET-002 `DONE` (token, font, CSS dasar). Tidak menunggu gerbang G-WP (UI dan data contoh) |
| **Rujukan PRD** | v1.10 §3.4, §3.6 (Rekomendasi), §4.6, §6, FR-02, prinsip 9 (G21); AGENTS.md aturan 1, 2, 6, 8; `docs/FIGMA-INVENTORY.md` §G–H; `docs/decisions/0004-merriweather-rfn.md` |
| **Dibuat** | 30 Okt 2026 (PM) |
| **Menggantikan** | sebagian MOCK-001 (tipe, fixture, layanan yang dipakai slice ini), CARD-001 (dua varian kartu), sebagian PAGE-001 |

## Tujuan
Beranda `/` menampilkan section **Rekomendasi** dengan **8 kartu berita** dari data contoh lewat fungsi layanan bertipe domain, dengan tampilan desktop dan mobile sesuai Figma. Slice ini **memiliki** komponen kartu berita dan komponen judul section; slice berikutnya memakainya ulang.

## Node Figma
File asli `tCjg6zC8qsZ4jhQpXvb0gK`. Posisi dan ukuran dari `get_metadata` `21:4950` (30 Okt 2026, baca saja) [V].

| Node | Nama | Ukuran / posisi (desktop) | Catatan |
|---|---|---|---|
| `42:376` | Judul "Rekomendasi" | 152×30 @ (160, 782) | Merriweather SemiBold (News/Heading/Desktop). Warna belum dibaca [?] |
| `42:374` / `42:375` | Garis pemisah / garis aksen | 1119×3 / 166×3 @ y=817 | Warna belum dibaca [?]. Garis pemisah selebar 1119 (kolom kiri + samping); aksen selebar teks judul + sisa |
| `57:514`, `57:513` | News Card 02, 01 (baris 1) | 359×350, 358×350 @ y≈848 | x=159/541 |
| `57:515`, `57:516` | News Card 03, 04 (baris 2) | 358×350 @ y≈1244 | `57:516` sudah dibaca (inventaris §G) |
| `48:310`, `48:325` | News Card 06, 07 (baris 3) | 358×348/350 @ y≈1645 | |
| `48:340`, `63:605` | News Card 08, 05 (baris 4) | 358×350 @ y=2187 | |
| `159:2933` | Card News Mobile (horizontal) | 354×104 | Sudah dibaca (inventaris §H) |
| Section Rekomendasi di `90:1611` | judul + daftar mobile | – | **FE membaca dan mencatat ID-nya** (get_metadata `90:1611`); PRD §3.6: mobile = 8 kartu horizontal, bukan 6 |

Tata letak desktop [V dari metadata]: kolom kiri 739 px (x 160–899) berisi grid 2 kolom × 4 baris (kartu 358, jarak horizontal 23); kolom kanan 357 px (x=923) dipakai kolom samping (HOME-03) dan **dibiarkan kosong** di slice ini. 739 + 24 + 357 = 1120 = `--container-desktop`.

Bukan bagian slice ini walau ada di kolom/baris yang sama: iklan `84:1442` (737×107, di antara baris 3 dan 4), "Lihat Lainnya" `68:1145`, hero `21:4974`, kolom samping `130:2202`/`34:354`, widget sosial `101:2601`, kartu `48:415` (kartu Otomotif lepas).

## Yang dibaca FE lebih dulu (get_design_context; catat hasil di Bukti)
1. `42:376`, `42:374`, `42:375` — warna dan gaya judul + garis. 2. `57:514` (baris 1: apakah geometri berbeda dari `57:516`?). 3. Elemen kartu mobile `159:2933`: warna label kategori. 4. Aset avatar "IniSumedang" 20×20 (unduh sesuai skill figma-design-to-code; simpan di `public/images/`). 5. Section Rekomendasi di `90:1611`. **Warna yang tidak ada di `tokens.css` → status `BLOCKED` ke PM; tidak menambah token sendiri.**

## Di luar scope
Header, menu, footer, hamburger (HOME-05/06); hero; kolom samping; section kategori lain (HOME-02); Ruang Visual; iklan; widget sosial; tautan "Lihat Lainnya" (belum diputuskan pemilik, PRD §3.6); halaman Detail dan rute `/berita/[slug]`; komposisi "campuran terbaru + terpopuler" (lihat Catatan); sanitasi/`body` artikel (tidak dirender); WordPress.

## Keputusan PM yang berlaku di slice ini
1. **Satu komponen kartu** `NewsCard` untuk dua varian: horizontal (mobile, 354×104) di bawah 1024 px dan vertikal (desktop, 358×≤350) di ≥ 1024 px [usulan, PRD §3.4]. Tidak ada dua komponen dan tidak ada kartu yang disembunyikan dengan CSS; hanya label kategori yang tampil di mobile dan tidak di desktop (G19).
2. **Tautan kartu.** Rute `/berita/[slug]` belum ada (PAGE-002 menunggu gerbang G-WP), dan pemilik melarang tautan mati. Maka fungsi `articlePath(article)` di `app/utils/routes.ts` **mengembalikan `null`**; kartu tanpa tujuan dirender sebagai `<article>` tanpa `<a>`. PAGE-002 mengisinya dan kartu otomatis menjadi satu tautan (nama aksesibel = judul).
3. **Waktu relatif** (WIB, bahasa Indonesia) [usulan]: < 1 menit "baru saja"; < 60 menit "N menit lalu"; < 24 jam "N jam lalu"; < 7 hari "N hari lalu"; selebihnya tanggal "30 Okt 2026". Dihitung dari satu nilai `now` per permintaan sehingga HTML server dan hidrasi sama (tanpa peringatan hydration).
4. **Judul kartu** dipotong dengan elipsis pada 3 baris (sampel Figma 3 baris; mobile dibatasi tinggi 104) [usulan].
5. **Tanpa gambar:** blok pengganti berukuran sama (warna `--color-surface`), tanpa layout shift. Gambar tanpa `alt` → `alt=""`.
6. **Label penerbit** = `authorLabel` dari data; di fixture "IniSumedang" [I, mengikuti sampel Figma; PRD §6 masih [?]].
7. **Komposisi Rekomendasi (versi sederhana):** 8 artikel terbit terbaru, tanpa duplikat. Komposisi campuran terpopuler tidak dikerjakan di sini (pemicu Vitest; lihat Catatan).
8. `<h1>` Beranda disembunyikan secara visual dengan teks "IniSumedang" [usulan; hero HOME-07 dapat menggantinya]; judul section `<h2>` non-interaktif; judul kartu `<h3>`.
9. Gambar baris pertama (2 kartu) `loading="eager"`, sisanya `lazy`; `width`/`height` diatur agar tidak ada layout shift.
10. Angka spacing di luar skala (5, 6, 10, 12, 15, 26, 52, 160) ditulis langsung dengan komentar ID node Figma. Jarak antarbaris grid diukur FE dari Figma (selisih posisi baris 396–400 px [I]) dan dicatat.
11. Cincin fokus (`outline` 2 px + offset 2 px) menjorok 4 px: komponen dengan `overflow: hidden` wajib memberi padding ≥ 4 px atau memindahkan clipping ke gambar saja.
12. **Iklan ditunda — deviasi sengaja dari Figma.** Slot iklan `84:1442` (737×107, di antara baris 3 dan 4) **tidak dirender** (ADS-001/002 `DITUNDA`). Baris 4 mengikuti baris 3 dengan jarak antarbaris yang sama seperti baris lain, **tanpa jarak kosong** bekas iklan. Selisih posisi baris 4 terhadap Figma adalah deviasi yang disengaja; QA tidak menandainya sebagai GAGAL.
13. **Cakupan perbandingan visual:** hanya area section Rekomendasi (kolom kiri 739 px: judul, garis, grid kartu). Kolom kanan (kolom samping), hero, header, dan footer tidak dibandingkan karena milik HOME-03/07/06/05; kolom kanan dibiarkan kosong.
14. **Garis pemisah `42:374` (#D9D9D9) tidak ada di token.** Daftar warna ditutup pemilik dan token baru tidak ditambah. Dipakai `--color-gray-5` (#E0E0E0), token terdekat; deviasi disengaja, dekoratif (bukan teks, di luar syarat kontras). Garis aksen `42:375` = `--color-brand`; judul `42:376` = `--color-black` + `--type-heading-desktop` (dibaca FE 30 Okt 2026 [V]).
15. **Judul dan jumlah di mobile mengikuti desktop/PRD §3.6, bukan frame mobile.** Frame `90:1611` menamai section pertama "Berita" (`165:1727`) dengan 6 kartu (`100:2458`: `159:2933`, `159:2963`, `159:2978`, `159:2993`, `159:3019`, `159:3034`) dan iklan `165:1933`; itu gambaran. Dirender: judul "Rekomendasi", **8 kartu**, tanpa iklan dan tanpa "Lihat Lainnya" `165:1720`. Pitch kartu mobile 120 px (kartu 104 + jarak 16) [V]; garis aksen mobile selebar judul (≈ 59 di Figma, ikut lebar teks).
16. **Penerbit di kartu mobile** (Figma: Inter Regular 400, 11.111/16.667) memakai `--type-card-timestamp` (nilai identik); `--type-card-author-mobile` (500) tidak dipakai di kartu Beranda mobile. Label kategori mobile berwarna `--color-black`. Avatar: satu aset dipakai di kedua layout (ukuran 20×20 lingkaran); jika aset desktop (crop `imgRectangle6`) dan mobile (`30:318`) tampak berbeda, FE mencatat dan melapor, tidak menduplikasi DOM.
17. **Putaran 1 QA (30 Okt 2026):** judul section mobile mengikuti Figma `165:1727` (garis aksen tepat di bawah teks, tanpa jarak 5 px; total ≈ 28 px) — `padding-bottom: 5px` hanya di ≥ 1024; posisi kartu pertama mobile dalam ±1 px dari Figma. `<html lang="id">` ditambahkan lewat `useHead` di `app/app.vue` (WCAG 3.1.1; tanpa mengubah `nuxt.config.ts`).

## Kriteria penerimaan
1. `/` merender section Rekomendasi: `<h2>` "Rekomendasi", garis pemisah + aksen, dan **tepat 8 kartu** dalam satu grid yang sama untuk desktop dan mobile (tidak ada salinan DOM per viewport).
2. Desktop 1440 (≥ 1024): kolom kiri 739 px, grid 2 × 4, kartu vertikal 358 px: gambar 358×225 radius 8, jarak 8 ke judul, jarak 16 ke baris meta (avatar 20×20 lingkaran + penerbit + waktu); judul `--type-card-headline-desktop`; **tanpa** label kategori. Kolom kanan 357 px kosong.
3. Mobile 402: daftar 8 kartu horizontal 354×104: thumbnail 104×104 radius 10, label kategori (`--type-card-mobile-category`), judul `--type-card-mobile-headline`, waktu `--type-card-mobile-timestamp` (Light 300). Margin samping 24.
4. Tablet 768–1023 mengikuti PRD §3.4 dan K3; keputusan layout tablet dicatat FE di Bukti.
5. Judul section memakai Merriweather SemiBold lokal (SET-002). **Lebar teks "Rekomendasi" pada 1440 = 152 px ±2** (Figma `42:376`). Selisih lebih besar dilaporkan ke PM (berkas font adalah instance 18pt dari font variabel; 0004 tidak dibuka lagi, tidak mengganti sumber font).
6. **Screenshot first paint** (ditunda dari SET-002): dengan throttling Slow 4G dan cache nonaktif pada 1440 dan 402, teks terlihat saat font fallback (swap) dan berganti ke font final; CLS dicatat; screenshot disimpan di jalur yang dicatat di Bukti.
7. Data: `getRecommendedArticles()` di `server/services/`, dipanggil lewat handler tipis `server/api/` dan `useFetch`/`useAsyncData`; mengembalikan tipe domain `Article` (hanya field yang dipakai: id, slug, title, publishedAt, categories, heroImage, authorLabel); mapper dari fixture berbentuk respons REST WordPress v2 mendekode entitas HTML pada teks. Hanya `status=publish`; fixture memuat ≥ 2 artikel `draft`/`private` yang tidak boleh muncul.
8. Fixture (`server/fixtures/`, ≥ 12 artikel terbit) memuat kasus buruk: judul ≥ 150 karakter ×1 dan ≤ 15 karakter ×1; ≥ 2 artikel tanpa gambar; ≥ 1 gambar tanpa `alt`; entitas `&amp;`, `&#8211;`, `&#8217;`, `&#8230;`; kategori "Bisnis &amp; Teknologi"; rentang umur dari menit sampai > 7 hari (tanggal relatif terhadap waktu proses). Gambar contoh netral berada di `public/fixtures/`.
9. Tidak ada `<a>` dengan `href` kosong, `#`, atau ke rute yang belum ada.
10. Tidak ada token baru; semua warna/font/spasi dari token SET-002.
11. `<html>` memiliki `lang="id"`; judul section mobile sesuai keputusan 17.
12. `npm run lint`, `typecheck`, `build` kode 0; tidak ada dependensi baru; `nuxt.config.ts` tidak berubah. Jika `app/pages/` tidak otomatis aktif tanpa perubahan konfigurasi, FE berhenti dan melapor ke PM **[APPROVAL]**.

## Daftar pemeriksaan QA (inline; tanpa Fase 1)
QA bekerja di konteks baru, memeriksa pohon kerja dengan `git status --porcelain --untracked-files=all` dan `git diff`. Maks. 15 kasus.

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
| H1 | Hitung kartu di Rekomendasi pada 1440 dan 402; bandingkan judul dengan fixture terbit | Tepat 8, tanpa duplikat, terbaru dulu; tidak ada artikel `draft`/`private`; satu DOM untuk kedua viewport | P0 |
| H2 | Label kategori: periksa pada 1440 dan 402 | Terlihat di mobile; tidak terlihat dan tidak dapat dibaca pembaca layar di desktop (G19) | P0 |
| H3 | Ukur lebar teks "Rekomendasi" pada 1440; ambil screenshot first paint (Slow 4G, cache off) 1440 dan 402 | 152 ±2 px; teks terlihat saat swap; CLS dicatat; jalur screenshot tercatat | P0 |
| H4 | Periksa semua `<a>` di halaman dan struktur kartu; periksa clipping cincin fokus pada elemen ber-`overflow: hidden` | Tidak ada `<a>` mati; kartu `<article>` tanpa tautan; tidak ada pemotongan cincin (padding ≥ 4 px) | P0 |

## File yang boleh disentuh
`app/app.vue` (ganti `NuxtWelcome` dengan `NuxtPage`), `app/pages/index.vue` (baru), `app/components/news/NewsCard.vue` (baru), `app/components/home/SectionTitle.vue` (baru, judul + garis + aksen), `app/types/article.ts` (baru), `app/utils/relative-time.ts`, `app/utils/routes.ts` (baru), `server/fixtures/**` (baru), `server/services/**` (baru), `server/api/articles/recommended.get.ts` (baru), `public/fixtures/**`, `public/images/**` (avatar dan aset Figma yang dipakai), berkas ini (Bukti). **Tidak boleh:** `package.json`, `package-lock.json`, `nuxt.config.ts`, `app/assets/css/**`, `.github/**`, `.env*`.

## Bukti
Diisi FE saat `IN_REVIEW` (perintah dan keluaran nyata) dan QA saat verifikasi.

| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| FE | `npm run lint` | `eslint .` tanpa temuan, kode keluar 0 | FE | 30 Okt 2026 |
| FE | `npm run typecheck` | `nuxt typecheck` tanpa galat, kode keluar 0 | FE | 30 Okt 2026 |
| FE | `npm run build` | `Build complete in 12.5s`, kode keluar 0 (build akhir setelah perbaikan ellipsis penerbit) | FE | 30 Okt 2026 |
| FE | `node .output/server/index.mjs` port 3101; `curl /` dan `/api/articles/recommended` | HTML mentah memuat `<h1>` (1), `<h2>` Rekomendasi (1), `<h3>` (8); API mengembalikan 8 artikel terbit terbaru; `app/pages/` aktif tanpa ubah `nuxt.config.ts` | FE | 30 Okt 2026 |
| FE | Edge headless + CDP (skrip di scratchpad), 1440 / 1280 / 1024 / 820 / 768 / 402 / 320 | Lihat pengukuran di bawah. Catatan: scrollbar headless 15 px menggeser x container (152,5 bukan 160); lebar container tetap 1120 | FE | 30 Okt 2026 |
| FE | Ukur teks "Rekomendasi" 1440 (`Range.getBoundingClientRect`, font Merriweather 600 23,04 px termuat) | **152,25 px** (target 152 ±2); h2 166,25 (teks + padding 14), tinggi baris 29,95 | FE | 30 Okt 2026 |
| FE | Geometri 1440: kartu | 8 kartu; kolom kiri 739; kartu 358; gambar 358×225; jarak gambar→judul 8; judul→meta 16; avatar 20×20; jarak avatar→penerbit 8; penerbit→waktu 16; judul 3 baris 80,6 (Figma 81); label kategori `display:none` (8/8) | FE | 30 Okt 2026 |
| FE | Geometri 402 dan 320: kartu | Kartu tinggi 104, thumbnail 104×104, avatar 20; avatar→penerbit 6; penerbit→waktu 10; label kategori tampil 8/8; satu DOM untuk semua viewport; di 402 kolom konten = viewport − 48 (354 pada viewport tanpa scrollbar) | FE | 30 Okt 2026 |
| FE | `scrollWidth` vs `clientWidth` | 1440: 1425/1425; 1280: 1265/1265; 1024: 1009/1009; 820: 820/820; 768: 753/753; 402: 387/387; 320: 305/305 (sempat 314/305 sebelum ellipsis penerbit; diperbaiki) | FE | 30 Okt 2026 |
| FE | First paint, Slow 4G (latensi 150 ms, 1,6 Mbps), cache nonaktif, 1440 dan 402 | Teks h2 sudah berukuran >0 pada poll pertama (100 ms) saat semua font status `loading` (fallback swap), lalu seluruh font `loaded`; CLS 1440 = 0,0043, 402 = 0,0025. Screenshot: `C:\Users\IPGAMI~1\AppData\Local\Temp\claude\D--Folka-Project-Redesaind-Ini-sumedang-ini-sumedang\953395f4-bb94-4cc8-a92a-6f40fca89e20\scratchpad\shots\firstpaint-1440.png`, `firstpaint-402.png`, `final-1440.png`, `final-402.png`, `shot-1440.png`, `shot-402.png` (di luar repo; sebelum perbaikan ellipsis) | FE | 30 Okt 2026 |
| FE | `grep` hex/`rgb(` di `app/` selain `assets/css`; `v-html`; impor `server/fixtures` di `app/` | Hanya satu komentar menyebut `#D9D9D9`; tidak ada `v-html`; tidak ada impor fixture | FE | 30 Okt 2026 |
| FE | `git status --porcelain --untracked-files=all` | Hanya berkas daftar "File yang boleh disentuh" + berkas docs milik PM yang sudah modified sebelumnya; `package.json`, lockfile, `nuxt.config.ts`, `.github/`, `app/assets/css/**` tidak berubah | FE | 30 Okt 2026 |
| FE | Perbaikan QA putaran 1 (F1, F2): `npm run lint`, `npm run typecheck`, `npm run build` | Ketiganya kode keluar 0 (`Build complete in 13.7s`); tanpa dependensi baru; `nuxt.config.ts` tidak berubah | FE | 30 Okt 2026 |
| FE | Ukur ulang (Chrome headless CDP, build `node .output/server/index.mjs` port 3102, ditutup) + `curl /` | `curl /`: `<html  lang="id">`. Mobile 402: h2 24,95 (sebelum 29,95), wrapper judul+garis 28,59 (Figma 28), kartu pertama y=58,59 (Figma 58; selisih 0,59), scrollWidth=clientWidth 387. Desktop 1440 tidak berubah: teks "Rekomendasi" 152,25, h2 34,95, wrapper 37,95, kartu pertama y=65,95, kartu 358 | FE | 30 Okt 2026 |

**Hasil pembacaan Figma (30 Okt 2026, get_design_context/get_metadata, [V]):**
- Judul `42:376`: Merriweather SemiBold 23,04/29,952, `text-black`. Garis pemisah `42:374` `#D9D9D9` (dipakai `--color-gray-5`, keputusan 14). Aksen `42:375` `#2866EB` = `--color-brand`.
- Kartu `57:514`: geometri sama dengan `57:516`; semua teks hitam. Kartu mobile `159:2933`: label kategori Inter Regular 11,111/15,555 hitam; penerbit Regular 400; waktu Light 300.
- Section mobile di `90:1611`: judul "Berita" `165:1727` (Frame 346) dengan 6 kartu `100:2458` + iklan `165:1933`; diganti sesuai keputusan 15 (judul "Rekomendasi", 8 kartu, tanpa iklan dan "Lihat Lainnya"). Pitch 120.
- Jarak baris desktop (selisih y kartu → bawah kartu sebelumnya): baris1 y=850 (`57:514`, tinggi 350) → baris2 y=1244 (jarak 44); baris2 bawah 1594 → baris3 y=1646 (`48:310`, jarak 52). Tidak seragam di Figma; dipakai `row-gap: 48px` (rata-rata). Jarak horizontal 23. Jarak judul: teks (y 782, tinggi 30) → garis y=817 (5); garis bawah y=820 → kartu y=848 (28, `margin-top`).
- Avatar: aset desktop (`imgRectangle6`) adalah logo lengkap 350×71 ("IniSumedang.Com" + ikon) yang di-crop ke ikon; aset mobile `30:318` (`imgEllipse1`) 40×40 berisi ikon yang sama. Dipakai satu aset: `public/images/avatar-mobile.png` (40×40, tampil 20×20) di kedua layout; ikon terlihat sama, tidak ada duplikasi DOM. Aset desktop mentah tidak disimpan.
- Tablet: 768–1023 mengikuti PRD §3.4: kartu horizontal; daftar `auto-fill minmax(min(354px,100%),1fr)` sehingga 1 kolom di 768 (lebar konten 720 < 2×354+24) dan 2 kolom di 820 (374 per kolom); ≥ 1024 pola desktop (fluid: di 1024 kolom kiri 634, kartu 305,5, gambar 305,5×192).

| QA | Putaran 1 (konteks baru; Chrome via CDP; salinan bersih) | 14 dari 15 LULUS; K2 GAGAL (Low): garis aksen judul section mobile 5 px terlalu rendah (F1); F2: `<html>` tanpa `lang`. Diperbaiki FE (keputusan 17) | QA | 30 Okt 2026 |
| QA | Putaran 2 (konteks baru; Edge headless via CDP; Figma `get_metadata`/`get_design_context`/`get_screenshot` dibaca saja; salinan bersih: `npm ci`, lint, typecheck, build, `npm audit --audit-level=high` semuanya kode 0, 7 low) | **QA_PASSED**: K1–K11 dan H1–H4 semuanya LULUS; kriteria 1–12 terpenuhi. Angka kunci: teks "Rekomendasi" 152,25 px (target 152 ±2); desktop 8 kartu 358×≈350, kolom kiri 739; mobile kartu 354×104, wrapper judul 28,59 (Figma 28), kartu pertama 58,59 (Figma 58); CLS 1440 0,0000073 / 402 0,0026; `<html lang="id">` di HTML mentah; tanpa overflow di 1440, 1280, 1024, 820, 768, 402, 375, 320; 0 `<a>`, 0 galat konsol. Screenshot first paint/final di scratchpad `r2` | QA | 30 Okt 2026 |
| PM | Penerimaan | Diterima: angka di luar skala tambahan 4, 14, 23, 28, 30, 48 px (semua berkomentar node Figma) ditambahkan ke daftar yang diizinkan; aksen mobile mengikuti lebar teks "Rekomendasi" (keputusan 15). Tidak teruji (diterima sebagai batasan): fokus keyboard pada tautan nyata (menunggu `articlePath` di PAGE-002; disimulasikan lulus), Safari/Firefox, scrollbar 15 px di Chrome asli, diff piksel otomatis | PM | 30 Okt 2026 |

## Catatan
- **Definition of Ready (PM, 30 Okt 2026):** node dan geometri dari `get_metadata` `21:4950`, `57:516`, `159:2933` terbaca [V]; screenshot diambil FE/QA dari Figma saat implementasi (inventaris tidak menyimpan screenshot); token dan font tersedia (SET-002 `DONE`); data = fixture lewat fungsi layanan; kriteria dan daftar pemeriksaan di atas; keputusan tablet = PRD §3.4; daftar file ada. Sisa pembacaan Figma (warna judul/garis, label mobile) ditugaskan di awal implementasi.
- **Bawaan dari SET-002/QA:** (a) screenshot first paint + perbandingan Merriweather: kriteria 5–6; (b) cincin fokus 4 px: keputusan 11; (c) angka spacing di luar skala: keputusan 10; (d) `#1A212E` bukan urusan slice ini, dibahas di slice Detail.
- **Pemicu Vitest:** komposisi Rekomendasi "campuran terbaru + terpopuler" butuh `getPopularArticles` (HOME-03) dan menjadi logika nyata pertama. Dikerjakan sebagai task lanjutan setelah HOME-03, bersama permintaan persetujuan Vitest. Jika FE menulis logika komposisi di sini, FE berhenti dan melapor.
- Nilai ketidakpastian: penerbit "IniSumedang" atau "Redaksi IniSumedang" (PRD §4.4/§6 [?]); aturan waktu relatif di atas adalah usulan.
- Riwayat: 30 Okt 2026 → READY → PM · 30 Okt 2026 → READY (ditegaskan: iklan ditunda, cakupan visual) → PM · 30 Okt 2026 → READY (BLOCKED FE diselesaikan: butir 14–16) → PM · 30 Okt 2026 → IN_REVIEW → FE. · QA_FAILED (putaran 1) → QA · IN_REVIEW (perbaikan F1/F2) → FE · QA_PASSED (putaran 2) → QA · DONE → PM.

## Gate
`DONE` hanya oleh PM setelah `QA_PASSED` dengan bukti. Maks. 3 putaran FE ↔ QA; setelah itu `BLOCKED` dengan alasan.
