# HOME-06 — Beranda slice 6: header, menu kategori, hamburger (laci 9 kategori)

| Field | Isi |
|---|---|
| **ID** | HOME-06 |
| **Status** | `DONE` (PM 2 Nov 2026, setelah `QA_PASSED` putaran 1; pekerjaan Fullstack sempat terhenti saat sesi berakhir, lalu diselesaikan dan diverifikasi Fullstack baru) — dibuka PM 1 Nov 2026: pemilik menyetujui usulan visual laci ("Setuju, lanjut", 1 Nov 2026); SET-002 dan HOME-05 `DONE`; Definition of Ready terpenuhi |
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
5. Posisi absolut konten Beranda kini sesuai Figma karena header ada: desktop hero `Switch` mulai di y 178 (header 94 + menu 47 + jarak 37) dan mobile hero di y 82; ikon cari mobile (`116:1647`), kolom pencarian desktop (`21:5270`), dan tombol bulan (`116:1636`) TIDAK dirender; header mobile = hamburger + logo di kiri, kanan kosong (Catatan pemilik 31 Okt 2026 butir 2 dan 4). Menutup deviasi D18 di POLISH-01.
6. Logo header = tautan sungguhan `<a href="/">` (rute `/` ada, bukan tautan mati; `aria-label` "IniSumedang — Beranda"); item menu kategori dan laci = teks biasa (`categoryPath` = `null`) sampai PAGE-003; `getCategories()` dari layanan (fixture, 9 kategori resmi) via `/api/categories`; footer tetap memakai daftar sendiri (tidak diubah).

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
| L5 | Hero, kolom samping, dan Rekomendasi pada 1440 dan 402 dengan header ada | Hero mulai di y 178 (1440) dan y 82 (402), selisih ≤ 1 px; semua komponen Beranda lain tidak berubah ukuran/style dibanding build HEAD (hash rect relatif + computed style), hanya posisi y yang bergeser oleh header | P0 |
| L6 | Header mobile 402: urutan dan isi | Hamburger (24×24) dan logo (110×22) di kiri, margin samping 24; kanan kosong (tanpa ikon cari dan tombol bulan) | P0 |
| L7 | Logo header dan menu kategori | Logo = `<a href="/">` valid yang membuka `/` (200); item menu dan laci tanpa `<a>` (teks biasa); tidak ada `href` kosong/`#` | P0 |
| L8 | Laci: fokus terkurung, Esc, klik overlay, scroll latar terkunci, lebar 354 (maks. 100% − 24), animasi geser 250 ms dan mati pada reduced-motion, kontras teks item (`--color-brand` di atas putih ≥ 4,5:1) | Sesuai "Usulan visual" yang disetujui; kontras dihitung | P0 |

## File yang boleh disentuh
`app/layouts/default.vue`, `app/components/layout/**`, `app/utils/routes.ts`, `app/types/**` (tambahan), `app/pages/index.vue` (hanya jarak/margin atas agar posisi absolut sesuai Figma, kriteria 5; tidak mengubah isi section), `server/fixtures/**` (kategori), `server/services/**`, `server/api/**` (`getCategories`, mis. `server/api/categories.get.ts`), `public/images/**` dan `public/icons/**` (aset Figma: logo header, ikon hamburger, ikon tutup bila diunduh), berkas ini (Bukti). **Tidak boleh:** `package.json`, lockfile, `nuxt.config.ts`, `app/assets/css/**`, `.github/**`, `.env*`.

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| QA r1 | Verifikasi penuh pada build produksi (salinan di luar repo `h6q-A`, baseline HEAD `h6q-B`; `npm ci` hanya di salinan; port 3331–3334 dan CDP 9331–9344, semua ditutup) | `QA_PASSED`: K1–K11 dan L1–L8, kriteria 1–6 LULUS; header 1440×141 dan hamburger (160,27) 40×40, logo (206,15) 236×64, menu (0,94) 1440×47 selisih 0 terhadap Figma `21:5360`/`21:4951`; mobile header 402×51, hamburger (24,27) 24×24, logo (54,28) 110×22 selisih 0; hero y 178 (≥1024) dan y 82 (<1024); laci: fokus terkurung, Esc/overlay/tombol tutup menutup dan fokus kembali ke hamburger, scroll latar terkunci, lebar 354 (maks 100%−24), overlay alfa 0,4, animasi 250 ms ease dan mati pada reduced-motion (diemulasi); 9 kategori resmi di menu dan laci (teks biasa, tanpa `<a>`), satu-satunya `<a>` header = logo `href="/"`; tanpa ikon cari/kolom pencarian/tombol bulan; regresi hero/kolom samping/Rekomendasi/HOME-02/Ruang Visual/footer identik dengan HEAD (rect max selisih 0,000; hanya y +154 desktop, +58 mobile); `/api/articles/*` identik; kontras: putih/biru merek 5,01:1, judul laci 12,63:1, ikon tutup 18,86:1; `npm ci` (748 paket), lint, typecheck, build, audit kode 0 | QA | 2 Nov 2026 |
| FE | `npm run lint`; `npx nuxt typecheck`; `npm run build` di salinan di luar repo (`npm ci` dari lockfile; build produksi) | lint kode 0; typecheck kode 0; build kode 0 ("Build complete"); `npm audit --audit-level=high` kode 0 (high 0, critical 0; low 2, moderate 38 = sama seperti sebelumnya, tanpa perubahan lockfile) | Fullstack | 2 Nov 2026 |
| FE | Ukur browser 1440 (viewport tanpa scrollbar) vs Figma | Header 1440×141 (bar 94 + menu 47); hamburger `21:5352` (160, 27, 40×40); logo `21:5268` (206, 15, 236×64), gambar `21:5269` (216, 25, 216×44); menu `21:4951` (0, 94, 1440×47), padding 4+border 1 = 5 (kiri 111, kanan 160), gap 26, item tinggi 37 y 99; hero `21:4974` (160, 178, 739×531) = Figma; kolom samping y 178 | Fullstack | 2 Nov 2026 |
| FE | Ukur browser 402 vs Figma | Header 402×51; hamburger `116:1628` (24, 27, 24×24); logo `116:1631` (54, 28, 110×22); hero `90:2130` (24, 82, 354×238) = Figma; tanpa ikon cari/tombol bulan/kolom pencarian | Fullstack | 2 Nov 2026 |
| FE | Regresi vs build HEAD (hash rect relatif terhadap tiap region + hash computed style semua properti, 1440 dan 402) | hero, kolom samping, Rekomendasi, 5 section (Sepak Bola, Ruang Visual, Nasional, Bisnis dan Teknologi, Otomotif), footer: rect relatif dan style identik; hanya posisi y (+154 px di 1440, +58 px di 402) dan nilai `top/bottom/inset` terpakai pada `h2.visually-hidden` kolom samping (offset auto elemen absolut) | Fullstack | 2 Nov 2026 |
| FE | `/api/articles/*` (recommended, hero, sidebar, visual-topics, by-category ×4 + parameter salah) A vs HEAD | identik (cap waktu ms dinormalkan); `/api/categories` = 9 kategori resmi, query diabaikan | Fullstack | 2 Nov 2026 |
| FE | Overflow `scrollWidth` = `clientWidth` | 1440, 1280, 1024, 820, 768, 402, 375, 320 semua sama; menu 9 item muat satu baris di 1024 dan 1280 | Fullstack | 2 Nov 2026 |
| FE | Keyboard laci (1440 dan 402) | Enter/Space buka (`aria-expanded` true, `hidden` lepas), fokus ke tombol tutup; Tab dan Shift+Tab tetap di tombol tutup; Esc, tombol tutup, klik overlay menutup dan fokus kembali ke hamburger; html `overflow: hidden` selama terbuka (scroll tidak berubah); panel 354×viewport; animasi `drawer-in` 250 ms ease; aturan `prefers-reduced-motion` ada (`animation: none`); konsol bersih, semua permintaan 200; HTML mentah memuat 9 kategori dan `class="drawer" hidden` | Fullstack | 2 Nov 2026 |
| FE | Aset (sama persis dengan unduhan Figma, SHA-256 dicocokkan) | `public/icons/hamburger-md-40.svg` 374 B `8b36a017fe1bbceda6a9b3ccf3bb5e2b81be9425b53a1578106bb11e1e358ac9` (21:5352); `public/icons/hamburger-md-24.svg` 330 B `b01a948eda580f4447eb944c8f9fb1f8c838d18785dbcd1d089869e44bd87bf4` (116:1628); logo header = `public/images/inisumedang-logo-footer.png` 4531 B, 350×71, `c709dad5c93f3ff63a6bb8a0ca388991890b11093fa1b8baf4555fbd81698671`, identik dengan aset Figma `21:5269` dan `116:1631` (SHA sama), dipakai ulang tanpa berkas baru | Fullstack | 2 Nov 2026 |
| FE | Kontras (WCAG, dihitung) | `--color-brand` #2866EB di atas putih (teks item laci) dan putih di atas biru (menu) = 5,01 : 1; judul laci `--color-text` di atas putih 12,63 : 1; ikon tutup `--color-black-1` di atas `--color-surface` 18,86 : 1; teks item laci di atas `--color-surface` (hover tautan kelak) 4,72 : 1; putih di atas latar hover menu 6,27 : 1; cincin fokus `--color-focus` vs putih 20,03 : 1, vs biru 4,00 : 1 | Fullstack | 2 Nov 2026 |

## Catatan
- **Prasyarat READY (dari LAY-001):** PM menyiapkan usulan visual laci (panel, daftar 9 kategori bergaya teks menu, tombol tutup, perilaku fokus dan Esc); usulan kini **tertulis di bawah, menunggu persetujuan pemilik**. Status berkas ini **tetap `BACKLOG`**.
- **Catatan pemilik (31 Okt 2026, dicatat PM saat menjalankan HOME-04):**
  1. Header mobile (node `116:1662`) = **hamburger + logo di kiri, ikon cari di kanan**.
  2. **Tombol bulan (ubah mode) TIDAK dirender** karena dark mode ditunda (keputusan tetap berlaku; tombol bulan `116:1636` di frame diabaikan).
  3. **Hamburger membuka laci berisi 9 kategori** (G20; sama di desktop dan mobile).
  4. **Keputusan pemilik (31 Okt 2026, dicatat PM saat menjalankan HOME-05): ikon cari di header ditunda — TIDAK dirender sampai PAGE-004**, baik ikon cari di header mobile (`116:1647`) maupun kolom/input pencarian di header desktop (`21:5270`). Tidak ada versi non-interaktif/dekoratif. Ini mengonfirmasi keputusan PM 4 di atas (kontrol tanpa fungsi = tautan mati). Header mobile sementara = hamburger + logo di kiri, kanan kosong (tombol bulan juga tidak dirender, butir 2); ruang tata letak dijaga agar PAGE-004 menyisipkan ikon/input tanpa menggeser header. Pertanyaan terbuka sebelumnya (ikon non-interaktif atau tidak dirender) **ditutup**: tidak dirender.
  5. Deviasi Figma yang kelak diterima di slice ini ditambahkan PM ke `docs/tasks/POLISH-01.md`.

## Usulan visual (DISETUJUI pemilik 1 Nov 2026 — tanpa revisi)
Usulan PM [I]; tidak dibangun sebelum disetujui pemilik. **Hanya token yang sudah ada di `tokens.css`; tidak ada token, font, atau aset baru** (ikon tutup digambar dengan dua garis SVG inline, tanpa unduhan). Berlaku sama di desktop dan mobile (G20).

| Aspek | Usulan |
|---|---|
| Bentuk | Panel samping dengan `role="dialog"`, `aria-modal="true"`, `aria-labelledby` ke judul panel; di-render di server dalam keadaan tertutup (`hidden`), tidak mempengaruhi tata letak header |
| Arah geser | Dari **kiri** (hamburger berada di kiri header); durasi 250 ms `ease`; **tanpa animasi** bila `prefers-reduced-motion: reduce` |
| Lebar | `--container-mobile` (354 px), dibatasi `max-width: calc(100% - var(--space-24))`; tinggi penuh viewport; isi dapat di-scroll di dalam panel; scroll halaman di belakangnya dikunci selama terbuka |
| Latar panel | `--color-white`; pemisah dari halaman dengan garis kanan `--color-border`; tanpa bayangan (tidak ada token bayangan) |
| Overlay | Menutupi sisa layar; warna turunan dari token yang ada: `color-mix(in srgb, var(--color-black-1) 40%, transparent)` (alfa 40 % = usulan, bukan token baru); klik overlay menutup laci |
| Judul panel | "Kategori", `--type-heading-mobile`, `--color-text`; `<h2>` di dalam dialog |
| Tombol tutup | Kanan atas panel, 40×40 (ukuran tombol hamburger desktop `21:5352`), `--radius-6`, latar `--color-surface`, ikon X dua garis `--color-black-1`; `aria-label="Tutup menu kategori"`; cincin fokus 4 px (`--color-focus`) |
| Daftar | 9 kategori resmi dari `getCategories()` (ejaan data: Berita, Nasional, Pemerintahan, Politik, Hukum, Sepak Bola, Otomotif, Jelajah, Bisnis & Teknologi), `<ul>` vertikal; padding item `--space-16` vertikal dan `--space-24` horizontal; garis pemisah antar item `--color-border` |
| Gaya item | Meniru teks menu kategori desktop (`21:4951`): warna `--color-brand`, `--type-text-l-medium`; FE memastikan gaya persisnya dari node. Item tanpa tujuan (`categoryPath(slug)` = `null`) = teks biasa, bukan `<a>`, tidak dapat difokus; item bertujuan = `<a>` dengan fokus terlihat |
| Fokus | Saat terbuka, fokus pindah ke tombol tutup; fokus **terkurung** di dalam panel (Tab/Shift+Tab berputar); Esc menutup; setelah ditutup fokus kembali ke tombol hamburger; `aria-expanded` dan `aria-controls` pada hamburger |
| Tablet | 768–1023: sama seperti mobile (PRD §3.4); ≥ 1024: sama |

Disetujui seluruhnya oleh pemilik (1 Nov 2026), termasuk kelima butir berikut: (1) arah geser dari kiri; (2) lebar 354 px; (3) alfa overlay 40 %; (4) judul panel "Kategori"; (5) item tanpa tautan tampil sebagai teks biasa sampai PAGE-003.
- Header Detail desktop (`130:553`) berbeda geometri dari Beranda: diputuskan saat slice Detail.
- Keputusan PM penutup: deviasi diterima: x item menu desktop bergeser 0,7–5,6 px dari Figma (kotak teks bulat dan ejaan salah di Figma; implementasi memakai lebar teks nyata dan ejaan resmi); celah menu 8 px pada 1024–1279 (26 px mulai 1280); teks aktif Figma #F5B241 tidak dibuat (selisih >4 dari `--color-warning`, kontras 3,38:1; item masih teks biasa); area sentuh mobile hamburger 24×24 dan logo 110×22 (< 24 px WCAG 2.5.8) mengikuti Figma; logo header memakai ulang berkas logo footer (SHA sama dengan aset Figma header); dua `<img>` hamburger (40 dan 24) mengikuti dua aset Figma; fixture Hukum (id 8) dan Jelajah (id 13) [I] final di gerbang WordPress. Catatan Info untuk integrasi WordPress: hamburger dan menu tidak dirender bila `/api/categories` kosong/gagal (logo bergeser ke x 24) — uji dengan data nyata; gaya hover/aktif menu baru teramati setelah PAGE-003 (item masih teks biasa); header tidak sticky. Deviasi dicatat di POLISH-01 (D19–D24).
- Riwayat: 30 Okt 2026 → BACKLOG → PM · 1 Nov 2026 → READY → PM (usulan visual laci disetujui pemilik; kriteria 5–6 dan L5–L8 ditambah) · 2 Nov 2026 → QA_PASSED (r1) → DONE → PM.

## Catatan FE (2 Nov 2026; untuk QA dan POLISH-01)
- **Pemetaan warna:** biru menu `21:4951` #2866EB = `--color-brand` (selisih 0/0/0); border menu rgba(8,8,8,0.1) = `--color-border` (0); teks putih = `--color-white` (0). State aktif `130:2098` (tidak digambar di `21:4951`; hanya referensi): latar rgba(42,42,42,0.2) dipetakan ke `--color-black-3` (#282828) alfa 20 % (selisih R/G/B 2/2/2, alfa sama; hasil di atas biru 40,90,196 dan kontras putih 6,27 : 1); teks #F5B241 **tidak** dipetakan (`--color-warning` #E2B93B selisih R/G/B 19/7/6 > 4; kontras #F5B241 di atas latar itu hanya 3,38 : 1) → deviasi, teks tetap putih. Item saat ini teks biasa, jadi state ini baru terlihat saat PAGE-003.
- **Deviasi posisi horizontal menu (POLISH-01):** ejaan resmi dan lebar teks nyata Inter membuat lebar item sedikit berbeda dari kotak teks Figma (mis. "Berita" 66,2 vs 68 px; "Pemerintahan" 130,7 vs 132; "Bisnis & Teknologi" 163,3 vs 164). Karena baris dipusatkan, x item pertama 157,6 (Figma 152) dan item lain bergeser 0,7 hingga 5,6 px; tinggi 37 dan y 99 sama. Tidak diperbaiki dengan nilai tetap (akan rapuh terhadap font dan teks resmi).
- **Logo:** gambar header sama persis (SHA-256) dengan logo footer, maka berkas `inisumedang-logo-footer.png` dipakai ulang di header (tanpa duplikat). Gambar 350×71 ditampilkan 216×44 (desktop) dan 110×22 (mobile); tidak diperkecil karena sudah 4,5 KB.
- **Tablet 768–1023 dan 1024–1279:** header mengikuti mobile di bawah 1024; mulai 1024 pola desktop. Celah menu 26 px (Figma) dipakai mulai 1280; 1024–1279 memakai celah 8 px agar 9 item muat satu baris dalam kontainer (turunan, bukan Figma).
- **Cincin fokus:** memakai aturan global `:focus-visible` (2 px + jarak 2 px = 4 px total, `--color-focus`); pada tombol tutup dan hamburger tidak ada `overflow: hidden` yang memotong.
- **Dua `<img>` hamburger** (40 dan 24, satu `display: none` per lebar) mengikuti dua aset Figma; keduanya terunduh (kecil, 330 dan 374 B).
- **Fixture:** `Hukum` (id 8) dan `Jelajah` (id 13) ditambahkan di `buildMenuCategories()` [I], final di gerbang WordPress; tidak masuk 8 kartu Rekomendasi maupun section Beranda.
