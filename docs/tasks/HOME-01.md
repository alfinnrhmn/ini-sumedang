# HOME-01 — Beranda slice 1: kartu berita + section Rekomendasi (8 kartu)

| Field | Isi |
|---|---|
| **ID** | HOME-01 |
| **Status** | `READY` (Definition of Ready terpenuhi, PM 30 Okt 2026; lihat Catatan) |
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
11. `npm run lint`, `typecheck`, `build` kode 0; tidak ada dependensi baru; `nuxt.config.ts` tidak berubah. Jika `app/pages/` tidak otomatis aktif tanpa perubahan konfigurasi, FE berhenti dan melapor ke PM **[APPROVAL]**.

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
| – | – | – | – | – |

## Catatan
- **Definition of Ready (PM, 30 Okt 2026):** node dan geometri dari `get_metadata` `21:4950`, `57:516`, `159:2933` terbaca [V]; screenshot diambil FE/QA dari Figma saat implementasi (inventaris tidak menyimpan screenshot); token dan font tersedia (SET-002 `DONE`); data = fixture lewat fungsi layanan; kriteria dan daftar pemeriksaan di atas; keputusan tablet = PRD §3.4; daftar file ada. Sisa pembacaan Figma (warna judul/garis, label mobile) ditugaskan di awal implementasi.
- **Bawaan dari SET-002/QA:** (a) screenshot first paint + perbandingan Merriweather: kriteria 5–6; (b) cincin fokus 4 px: keputusan 11; (c) angka spacing di luar skala: keputusan 10; (d) `#1A212E` bukan urusan slice ini, dibahas di slice Detail.
- **Pemicu Vitest:** komposisi Rekomendasi "campuran terbaru + terpopuler" butuh `getPopularArticles` (HOME-03) dan menjadi logika nyata pertama. Dikerjakan sebagai task lanjutan setelah HOME-03, bersama permintaan persetujuan Vitest. Jika FE menulis logika komposisi di sini, FE berhenti dan melapor.
- Nilai ketidakpastian: penerbit "IniSumedang" atau "Redaksi IniSumedang" (PRD §4.4/§6 [?]); aturan waktu relatif di atas adalah usulan.
- Riwayat: 30 Okt 2026 → READY → PM.

## Gate
`DONE` hanya oleh PM setelah `QA_PASSED` dengan bukti. Maks. 3 putaran FE ↔ QA; setelah itu `BLOCKED` dengan alasan.
