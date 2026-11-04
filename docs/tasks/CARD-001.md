# CARD-001 — Sistem News Card (varian final)
| Field | Isi |
|---|---|
| **ID** | CARD-001 (P0; QA → FE → QA → PM; dibuat 29 Okt 2026, Sprint 0) |
| **Status** | `DITUNDA` — alasan: digantikan oleh slice vertikal (keputusan pemilik 30 Okt 2026); sebelumnya `BACKLOG`. Digantikan oleh HOME-01 (kartu desktop `57:516`, mobile `159:2933`), HOME-03 (daftar samping), HOME-04 (kartu besar dan berthumbnail) |
| **Dependensi** | SET-001, SET-002, MOCK-001 `DONE` (tipe `Article`, `MediaAsset`) |
| **Rujukan** | PRD §4.6, FR-02, §15 (CARD-001); `docs/FIGMA-INVENTORY.md` §G–H; Figma `57:516` (kartu vertikal desktop 358×350), `159:2933` (kartu horizontal mobile 354×104) |
## Tujuan
Komponen kartu berita bertipe yang dipakai ulang di Beranda, kategori, pencarian, dan Berita Terkait.
## Di luar scope
Hero `Switch`, kolom samping, Ruang Visual, iklan, logika pemilihan berita (PAGE-001), tautan "Lihat Lainnya". Varian lain (`Card recomendasion desktop` 243×260, `Card news Mobile` 354×318, `Card Popular News`, kartu besar/berthumbnail Ruang Visual) belum dibaca; dipetakan PM per section (PRD §4.6).
## Keputusan yang masih berlaku
1. **G19 (pemilik, 29 Okt 2026):** label kategori mengikuti desain per varian: tampil di kartu mobile (`159:2933`), tidak di kartu desktop (`57:516`); tidak diseragamkan. Berlaku di HOME-01.
2. Judul kartu mobile di-hardcode 13,333 px (bukan variabel 16 px): ikuti frame.
3. Slice HOME pertama yang butuh kartu memilikinya; slice berikutnya wajib memakai ulang.
## Kriteria penerimaan (draf)
1. Props bertipe dari `Article` (judul, tautan, gambar `MediaAsset`, kategori, penerbit/label, waktu terbit); `_embedded` tidak masuk komponen.
2. Varian desktop dan mobile sesuai inventaris §G–H (radius gambar 8 desktop, 10 mobile); label kategori ada di mobile, tidak di desktop.
3. Satu tautan per kartu; fokus dan hover terlihat; sasaran sentuh memadai.
4. Kasus tepi: gambar hilang, judul sangat panjang/pendek, rasio gambar berbeda, waktu relatif WIB.
5. Warna, font, spasi dari token SET-002.
## File yang disentuh
`app/components/news/**`, `app/types/**` (seperlunya), `app/assets/css/**` (seperlunya), `tests/unit/**`.
## Bukti
n/a (task ditunda; tidak ada bukti).
## Catatan
- **Celah terbuka [?]:** label penerbit "IniSumedang" tetap atau nama penulis (PRD §6 `authorLabel`); aturan waktu relatif ("2 jam lalu"): kapan beralih ke tanggal, zona WIB; state hover/fokus/gambar hilang tidak digambar (usulan PM turunan dari token).
- Riwayat: 29 Okt 2026 `BACKLOG` → 30 Okt 2026 `DITUNDA` (PM).
Versi lengkap sebelum pemangkasan: git show 3e8e137:docs/tasks/CARD-001.md
