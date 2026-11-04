# HOME-06 — Beranda slice 6: header, menu kategori, hamburger (laci 9 kategori)

| Field | Isi |
|---|---|
| **ID / Status** | HOME-06 · `DONE` (PM 2 Nov 2026, setelah `QA_PASSED` putaran 1; pekerjaan Fullstack sempat terhenti saat sesi berakhir, lalu diselesaikan dan diverifikasi Fullstack baru). Dibuka PM 1 Nov 2026 (pemilik menyetujui usulan visual laci, "Setuju, lanjut", 1 Nov 2026; SET-002 dan HOME-05 `DONE`) |
| **Dependensi** | SET-002 `DONE`; HOME-05 `DONE` (`layouts/default.vue`); usulan visual laci disetujui pemilik. Kategori dari fixture (tanpa G-WP) |
| **Rujukan** | PRD v1.10 §3.5, §3.7, §4.4, FR-01, G20; Figma header `21:5360`, menu `21:4951`, mobile `116:1662` (Detail `130:553`, `130:2093`, `130:3312` = geometri berbeda) |

## Tujuan
Header desktop dan mobile, menu kategori desktop (9 kategori), dan hamburger yang membuka laci berisi 9 kategori resmi, di semua halaman.

## Di luar scope
Toggle tema (tidak dirender, PRD §3.7); kolom/ikon pencarian (PAGE-004); halaman `/kategori/[slug]` (PAGE-003).

## Keputusan yang masih berlaku
1. Menu dan laci dari `getCategories()` (`/api/categories`, 9 kategori resmi; ejaan Politik, Otomotif, Jelajah). `categoryPath(slug)` di `app/utils/routes.ts` = `null` (teks biasa, bukan `<a>`) sampai PAGE-003. Footer tetap memakai daftar sendiri.
2. Laci (G20), sama di desktop dan mobile: `role="dialog"` `aria-modal`, geser dari kiri 250 ms (mati pada reduced-motion), lebar 354 (maks. 100% − 24), overlay alfa 40%, judul "Kategori", tombol tutup 40×40; fokus ke tombol tutup, terkurung, Esc/overlay/tombol menutup dan fokus kembali ke hamburger; scroll latar terkunci. Hanya token yang ada.
3. Ikon cari, kolom pencarian, dan tombol bulan **tidak dirender** (keputusan pemilik 31 Okt 2026; sampai PAGE-004); header mobile = hamburger + logo di kiri, ruang tata letak dijaga.
4. Logo = `<a href="/" aria-label="IniSumedang — Beranda">`, memakai ulang berkas logo footer (SHA sama dengan aset Figma). Satu-satunya `<a>` header.
5. Hero Beranda mulai di y 178 (desktop) / y 82 (mobile); header tidak sticky; menu 9 item satu baris (celah 26 px mulai 1280, 8 px pada 1024–1279).

## Kriteria penerimaan
1. Header desktop/mobile sesuai node pada 1440 dan 402; menu 9 item. 2. Laci sesuai keputusan 2. 3. Tanpa toggle tema, pencarian, `<a>` mati; ejaan benar. 4. Token SET-002; `lint`, `typecheck`, `build` kode 0. 5. Posisi absolut Beranda sesuai Figma (menutup D18 POLISH-01). 6. Logo `<a href="/">`; item menu/laci teks biasa; kategori via layanan.

## File yang disentuh
`app/layouts/default.vue`, `app/components/layout/**`, `app/utils/routes.ts`, `app/types/**`, `app/pages/index.vue` (jarak atas), `server/fixtures/**`, `server/services/**`, `server/api/categories.get.ts`, `public/icons/hamburger-md-{24,40}.svg`.

## Bukti
- FE 2 Nov 2026: lint, typecheck, build, `npm audit --audit-level=high` kode 0; header 1440×141 dan 402×51 selisih 0 vs Figma.
- QA r1 2 Nov 2026: `QA_PASSED` (K1–K11, L1–L8); regresi Beranda identik dengan HEAD (hanya y +154 desktop / +58 mobile); kontras terendah 5,01:1.

## Catatan
- **Terbuka:** gaya hover/aktif menu baru teramati setelah PAGE-003 (item masih teks biasa); hamburger dan menu tidak dirender bila `/api/categories` kosong/gagal (logo bergeser ke x 24), uji dengan data WordPress nyata; fixture Hukum (id 8) dan Jelajah (id 13) [I] final di G-WP; header Detail desktop `130:553` berbeda geometri, diputuskan saat slice Detail.
- **Deviasi diterima PM (POLISH-01 D19–D24):** x item menu bergeser 0,7–5,6 px (lebar teks nyata, ejaan resmi); teks aktif Figma #F5B241 tidak dibuat (selisih >4 dari `--color-warning`, kontras 3,38:1); area sentuh mobile hamburger 24×24 dan logo 110×22 (< 24 px WCAG 2.5.8) mengikuti Figma; dua `<img>` hamburger (40 dan 24) mengikuti dua aset Figma.
- Riwayat: BACKLOG 30 Okt 2026 → READY 1 Nov 2026 → QA_PASSED (r1) → DONE 2 Nov 2026 (PM).

Versi lengkap sebelum pemangkasan: git show 3e8e137:docs/tasks/HOME-06.md
