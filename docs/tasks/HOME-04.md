# HOME-04 — Beranda slice 4: Ruang Visual (4 topik)

| Field | Isi |
|---|---|
| **ID** | HOME-04 |
| **Status** | `DONE` (PM 31 Okt 2026, setelah `QA_PASSED` putaran 1; K10 `npm ci` tidak teruji) — dibuka PM 31 Okt 2026 (HOME-01 `DONE`; Definition of Ready terpenuhi); gerbang G-WP **tidak** menghalangi UI dan layanan fixture (pengecualian pemilik 30 Okt 2026) |
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
| QA r1 | Verifikasi penuh pada build produksi (salinan di luar repo `h4q-A`, baseline `HEAD` `h4q-B`; port 3261–3263 dan CDP 9360, semua ditutup) | `QA_PASSED`: K1–K9, K11, V1–V4, kriteria 1–4 LULUS; foto utama 358×189,44 dan thumbnail 80×60 terukur pada 1440; blok 358×638,19 (Figma 638,44); mobile 354×620,06 (Figma 620,33); 4 blok × (1 kartu besar + 3 item); urutan topik = urutan pembuatan; draft/private 0 di HTML dan API; overflow nol di 8 lebar (default dan edge); hash per section (sidebar, Rekomendasi, Sepak Bola, Nasional, Bisnis dan Teknologi, Otomotif) identik dengan baseline HEAD di 8 lebar; `/api/articles/recommended` tetap 8; lint/typecheck/build/audit kode 0; K10 `npm ci` TIDAK TERUJI | QA | 31 Okt 2026 |
| FE | `npm run lint` (repo dan salinan di luar repo) | keluaran hanya `> eslint .`, kode 0 | FE | 31 Okt 2026 |
| FE | `npx nuxt typecheck` (salinan di luar repo; `.nuxt` repo dihindari karena dev server pengguna) | hanya baris info `[nuxt] i Compiled …`, tanpa galat, kode 0 | FE | 31 Okt 2026 |
| FE | `npm run build` (salinan di luar repo) | `Build complete in 51.3s!`, kode 0; chunk `api/articles/visual-topics.get.mjs` 590 B | FE | 31 Okt 2026 |
| FE | Build produksi port 3251 (`figma`), 3252 (`FIXTURE_SET=edge`), 3253 (baseline `HEAD` = HOME-03); Chrome headless CDP port 9344; `getBoundingClientRect` 1440/1280/1024/820/768/402/375/320 | Lihat "Ukuran" di Catatan FE; semua port ditutup | FE | 31 Okt 2026 |

## Catatan
- Alternatif bila pemilik/editor memilih tag + penanda "topik unggulan" (PRD §3.6) diputuskan di gerbang G-WP; layanan satu pintu membatasi dampaknya.
- Deviasi Figma yang diterima di slice ini ditambahkan PM ke `docs/tasks/POLISH-01.md`.
- **Catatan FE (31 Okt 2026), untuk QA dan PM:**
  - **Berkas:** `app/components/home/VisualTopic.vue` (baru; satu blok topik), `app/pages/index.vue` (fetch `/api/articles/visual-topics`, section di antara Sepak Bola dan Nasional), `app/types/article.ts` (`VisualTopic`, `VisualTopicsResponse`), `server/services/articles.ts` (`getVisualTopics()`, helper `isEdgeSet()`), `server/api/articles/visual-topics.get.ts` (baru; tanpa parameter, query string diabaikan, jadi tanpa validasi), `server/fixtures/posts.ts` (`parent` opsional pada `WpTerm`, kategori visual, post 81-98 set `figma` dan 201-216 set `edge`, `buildFigmaVisualCategories`/`buildEdgeVisualCategories`). Tidak menyentuh `app/config/home.ts` (tidak ada di daftar file task; konstanta Ruang Visual ada di `articles.ts` dan `index.vue`), `NewsCard.vue`, `SectionTitle.vue`, CSS, `package.json`, `nuxt.config.ts`, gambar baru (memakai ulang `figma-1..8.jpg`).
  - **Node Figma yang dibaca (`get_design_context`/`get_metadata`, file asli):** judul `65:1072` (garis `65:1070` y 3486, `65:1071`), blok desktop `101:2708`, `101:2709`, `101:2710`, `101:2726`; mobile `179:2422` memuat 4 blok: **`116:1541` (Pemerintahan), `116:1557`, `116:1573`, `116:1589`** (judul topik `116:1544`/`116:1560`/`116:1576`/`116:1592`; foto `116:1547`/`116:1563`/`116:1579`/`116:1595`; baris `116:1551`/`116:1553`/`116:1555`, `116:1567`/`1569`/`1571`, `116:1583`/`1585`/`1587`, `116:1599`/`1601`/`1603`). Teks aktual judul topik: Pemerintahan, Ekonomi & Inovasi, Wisata, Olahraga (bukan "Kategori …", itu nama layer).
  - **Varian atau komponen sendiri:** komponen sendiri (`HomeVisualTopic`). Alasan: tidak ada satu pun elemen `NewsCard` yang dipakai bentuk ini: tanpa label kategori, tanpa avatar/penerbit/waktu; kartu besar = foto rasio 480/254 radius 8 + judul 19,2 tanpa baris meta (kartu desktop `NewsCard` rasio 358/225); item = thumbnail 80x60 radius 6 dengan gambar 132,24 % yang terpotong, judul Regular 16 (`--type-body`), garis #D5D5D5 atas/bawah, padding 16 (kartu horizontal `NewsCard` 104 px, judul 13,3 Semibold). Sebagai varian, setiap aturan dasar dan blok `:not(.card--compact)` (grid, gap, media, title, meta, category) harus ditimpa atau dikecualikan lagi, sehingga risiko mengubah kartu HOME-01/02/03 lebih besar dari menulis satu komponen kecil (~210 baris berikut gaya). `SectionTitle` dipakai ulang untuk judul "Ruang Visual".
  - **Data:** `getVisualTopics()` = anak dari kategori `ruang-visual` (parent), diurutkan id menurun (setara `orderby=id&order=desc`), anak tanpa artikel terbit dilewati (setara `hide_empty=true`; draft/private tidak dihitung), 4 topik pertama, kartu besar = artikel terbaru topik, `items` = sampai 3 berikutnya. Induk tak ada: `[]` dan section tidak dirender. Respons `{ topics }` tanpa `now` (tidak ada waktu relatif di blok). `by-category` tetap menolak slug kategori visual (400) karena hanya menerima `HOME_SECTIONS`.
  - **Fixture `figma` (default):** induk id 20 (`ruang-visual`), anak id 24 (Budaya, anak ke-5, ada 2 artikel, tidak tampil), 25 Olahraga, 26 Wisata, 27 Ekonomi & Inovasi, 28 Pemerintahan, 29 Topik Kosong (anak terbaru tanpa artikel, dilewati). Hasil: Pemerintahan, Ekonomi & Inovasi, Wisata, Olahraga (urutan Figma), tiap topik 1 kartu besar + 3 item; judul kartu besar dan item dari node `101:2708`/`101:2709` (topik 3 dan 4 memakai teks Figma yang sama dengan topik 2). Tanggal sengaja tidak searah urutan topik (Olahraga punya artikel terbaru) untuk membuktikan urutan = pembuatan topik. Semua artikel > 360 menit dan tanpa tag: `/api/articles/recommended` tetap 8 (id sama), `sidebar` Terbaru 1,2,3,4 dan Terpopuler 61-64, `by-category?category=nasional` tetap 3,4,31,32.
  - **Fixture `edge`:** anak 41 (kosong), 40 (hanya draft/private, dianggap kosong), 39 (nama topik 111 karakter; kartu besar judul 190 karakter, item: judul pendek "Banjir surut", entitas `&amp;`/`&#8211;`/`&#8217;`/`&#8230;`, tanpa gambar, gambar `alt` kosong), 38 (tepat 1 artikel terbit + draft + private; blok tanpa item), 37 (2 artikel, keduanya tanpa gambar), 36 (nama "Seni &amp; Budaya &#8211; Tradisi", 4 artikel, judul panjang dan pendek), 35 (anak ke-5, tidak tampil). Tampil: 39, 38, 37, 36. Artikel draft/private tidak muncul (tidak ada satu pun judulnya di HTML mentah).
  - **Struktur:** `h2` "Ruang Visual" (`SectionTitle`) → `h3` nama topik (non-interaktif) → `h4` judul kartu besar dan item. Kartu = `<article>` tanpa `<a>` selama `articlePath()` mengembalikan `null` (pola HOME-01; bila nanti terisi, judul menjadi `NuxtLink` dengan overlay `::after` seperti `NewsCard`, cincin fokus 2 px + offset 2 = 4 px, radius 8). Terukur di browser: 0 `<a>`/tombol/`tabindex` di section, 16 `article`, 4 `h3`, 16 `h4` (set `figma`); urutan heading H1 H2 H3… tanpa lompat; tanpa pesan konsol, semua sumber daya satu origin 200 (CDP, 1440 dan 402, kedua set).
  - **Ukuran vs Figma (build produksi, `getBoundingClientRect`; x 1440 ditambah 7,5 untuk bilah gulir 15 px; mobile 402 dengan emulasi mobile tanpa bilah gulir).** Desktop 1440: blok 358 x 638,19 (Figma 358 x 636,4 blok 1 / 638,4 blok 2-4); x kolom 160 dan 541, jarak kolom 23 (Figma 23), jarak baris 32 (Figma 32,6); judul topik teks 39 tinggi, mulai 10 di bawah tepi blok (Figma 10 pada blok 2-4); foto 358 x 189,44 (358 x 189,44), radius 8; judul kartu besar 358 x 53,75 (54), Inter 600 19,2/26,88; baris 94 / 93 / 93 (94/93/93), pitch 102 (102); thumbnail 80 x 60 radius 6, gambar di dalamnya 80 x 79,34 (79,34); judul item x +90 dari tepi, 268 x 51,19 (268 x 52), Inter 400 16/25,6; garis 1 px atas+bawah rgb(213,213,213) = `#D5D5D5`; daftar 296 (296); h2 "Ruang Visual" 146,7 + padding 14 = 160,66 x 34,95 (teks Figma 146 x 30; garis aksen 65:1071 154 vs di sini 160,66 karena aturan `SectionTitle` yang sama dengan section lain); h2 y ke blok pertama 50,95 (Figma 50 blok 2, 51 blok 1). Mobile 402: blok 354 x 620,06 (Figma 354 x 620,33 blok 2-4, 618,33 blok 1); foto 354 x 187,31 (354 x 187,325); baris 94/93/93 pada y +324,1/+426,1/+527,1 relatif blok (Figma blok 2-4: +324,3/+426,3/+527,3); jarak antar blok 32 (32); thumbnail 80 x 60; judul item 264 x 51,19 (264 x 52); jarak foto-judul 8. Tablet: 1024 = 2 kolom 305,5 (foto 305,5 x 161,7), 820 = 2 kolom 366,5, 768/402/375/320 = satu kolom. Set `edge`: blok 1 judul topik 2 baris (78) dan blok tidak penuh (satu artikel, 2 artikel) tampil tanpa celah aneh; blok sejajar atas di grid.
  - **Overflow (build produksi, set `figma` dan `edge`):** `scrollWidth` = `clientWidth` di 1440, 1280, 1024, 820, 768, 402, 375, 320 (1425/1425, 1265/1265, 1009/1009, 805/805, 753/753, 402, 375, 320; selisih 15 = bilah gulir desktop).
  - **Rekomendasi, HOME-02, kolom samping tidak berubah:** build baseline `HEAD` (port 3253) vs baru (3251): hash gabungan 24 kartu non-sidebar (rect relatif + computed style) + 5 `h2` section (tanpa "Ruang Visual"): 1440 708391226 = 708391226; 402 668846954 = 668846954. Kolom samping 1440: tinggi 547,9 / daftar 482 / item 104 sama; 402: 459,9 / 394 / 82 sama; selisih Terbaru vs Terpopuler 0 di kedua build. Hanya posisi y bagian di bawah Sepak Bola yang bergeser.
  - **Warna dan font (K8):** komentar memuat nilai Figma; kode memakai token saja. `rgb(29, 29, 29)` = `--color-black-2` untuk judul topik, kartu besar, item.
  - **Port:** 3251, 3252, 3253 (server produksi) dan 9344 (Chrome CDP) sudah ditutup. Port 3000 tidak disentuh (saat selesai tidak ada proses yang mendengarkan di 3000). Typecheck/build dijalankan di salinan di luar repo (`.../scratchpad/h4`, baseline `h4base`) agar `.nuxt` repo tidak diubah.
  - **Deviasi Figma yang tidak dapat dibuat (tanpa token/aset; untuk POLISH-01 oleh PM):**
    1. Judul topik `105:468` / `105:477` / `101:2713` / `101:2729` (desktop) dan `116:1544`/`116:1560`/`116:1576`/`116:1592` (mobile): Figma Inter **Bold 700** 32/39. Sekarang Inter **600** 32/39 (literal `font: 600 32px/39px var(--font-sans)` di komponen, **bukan token baru**): `tokens.css` tidak punya gaya 32/39 dan tidak ada berkas Inter 700 (hanya 300-600). Penyebab: tanpa token dan tanpa aset font.
    2. Warna teks judul topik, kartu besar (`105:471` dll.) dan judul item (`105:474` dll.): Figma `#1A1C21`. Sekarang `--color-black-2` `#1D1D1D` (selisih RGB 3/1/12). Penyebab: `#1A1C21` bukan token (inventaris SET-002 mencatat warna ini untuk judul Detail dan menyerahkannya ke PAGE-002/CARD-001).
    3. Judul topik blok pertama desktop `101:2683`/mobile `116:1543`: Figma tanpa padding (teks di y 0, jarak ke foto 18, blok 636,44/618,33). Sekarang semua blok memakai pola blok 2-4 (`101:2684`, `116:1559`: padding 10 atas-bawah, jarak ke foto 10, blok 638,44/620,33). Penyebab: Figma tidak konsisten antar blok; dipilih pola 3 dari 4 blok (2 px lebih tinggi pada blok pertama dan teksnya 10 px lebih rendah).
    4. Garis aksen judul section `65:1071`: lebar 154 (teks 146 + 8); sekarang 160,66 (teks 146,66 + padding 14, aturan `SectionTitle` yang sama untuk semua section; deviasi lebar garis sudah ada di HOME-02).
    5. Gambar placeholder Figma (`acaf9.png` dkk.) diganti `figma-1..8.jpg` yang sudah ada; tidak ada aset baru.
  - **Keputusan/deviasi lain:** (a) Judul "Ruang Visual" di mobile **tidak ada** di frame mobile `90:1611` (blok `179:2422` y 3457 langsung setelah iklan `100:2536`, tanpa judul section); dipakai keputusan PM 3 (gaya judul section mobile `SectionTitle`); jarak garis ke teks topik mobile 30 diturunkan dari `.list` (margin 20 + margin judul topik 10) [I]. (b) Jarak garis section ke blok desktop 13 (Figma 12-13: garis `65:1071` y 3486-3489, blok y 3501/3502) + margin judul topik 10. (c) Urutan di mobile mengikuti PM/HOME-02 (Sepak Bola → Ruang Visual → Nasional); frame mobile `90:1611` menaruh Ruang Visual di paling bawah dan tidak punya section Sepak Bola, jadi tidak dipakai sebagai urutan. (d) Nama topik dan judul kartu besar dibatasi 2 dan 3 baris, judul item 2 baris (klem), supaya judul panjang tidak merusak tinggi baris 93/94; nama topik terpotong "…" hanya pada kasus `edge`. Awalnya padding judul topik terpotong klem memperlihatkan baris ke-3; diperbaiki dengan `margin` (bukan `padding`). (e) Gambar kartu besar dan thumbnail `loading="lazy"` (jauh di bawah lipatan), `width`/`height` dari data (716 x 400). (f) Kontras: `#1D1D1D` di atas putih ≈ 16,9 : 1 (dihitung); label tab/judul section tidak diubah. (g) K10 (`npm ci`) dan `npm audit` tidak dijalankan di sesi ini.
- Keputusan PM penutup: komponen sendiri `HomeVisualTopic` diterima (bukan varian `NewsCard`; kartu lama terbukti tak berubah); deviasi Figma FE 1–4 dicatat di `docs/tasks/POLISH-01.md` (D4–D7); judul "Ruang Visual" tampil di mobile (keputusan PM 3) walau frame mobile tak memilikinya; nama topik panjang dipotong 2 baris dan judul kartu besar 3 baris (temuan Low QA) diterima, batas panjang nama topik adalah topik editorial WordPress (G-WP); `app/config/home.ts` tidak disentuh (di luar daftar berkas).
- **Catatan pemilik (31 Okt 2026):** kasus "kategori induk `ruang-visual` tidak ada atau semua topik kosong" hanya ditinjau dari kode (`getVisualTopics()` mengembalikan `[]`, `v-if` per section) dan belum diuji dengan fixture; wajib diuji dengan data WordPress nyata saat integrasi (dicatat di PRD §13). Deviasi D5 (warna `#1A1C21`) kini **dipetakan** ke `--color-black-2` (POLISH-01 M1).
- Riwayat: 30 Okt 2026 → BACKLOG → PM · 30 Okt 2026 → BACKLOG (pengecualian gerbang dicatat) → PM · 31 Okt 2026 → READY → PM · 31 Okt 2026 → QA_PASSED (r1) → DONE → PM.
