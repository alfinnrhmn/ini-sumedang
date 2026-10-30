# CARD-001 — Sistem News Card (varian final)

| Field | Isi |
|---|---|
| **ID** | CARD-001 |
| **Status** | `DITUNDA` — alasan: digantikan oleh slice vertikal (keputusan pemilik 30 Okt 2026); sebelumnya `BACKLOG` |
| **Digantikan oleh** | HOME-01 (kartu desktop `57:516` dan mobile `159:2933`), HOME-03 (daftar samping), HOME-04 (kartu besar dan berthumbnail) |
| **Owner** | QA (rencana tes) → FE → QA → PM |
| **Prioritas** | P0 |
| **Dependensi** | SET-001 `DONE`; SET-002 `DONE`; MOCK-001 `DONE` (tipe `Article`, `MediaAsset`; sebelumnya API-001, yang `DITUNDA`) |
| **Rujukan PRD** | §4.6, FR-02, §15 (CARD-001); `docs/FIGMA-INVENTORY.md` §G–H |
| **Dibuat** | 29 Okt 2026 (PM, Sprint 0) |

## Tujuan
Komponen kartu berita bertipe yang dipakai ulang di Beranda, kategori, pencarian, dan Berita Terkait.

## Node Figma
| Node | Varian | Ukuran | Inventaris |
|---|---|---|---|
| `57:516` | kartu vertikal desktop ("News Card 04 — Nasional") | 358×350 | §G |
| `159:2933` | kartu horizontal mobile ("Card News Mobile") | 354×104 | §H |

Varian lain di 4 frame final dipetakan PM per section setelah dibaca (PRD §4.6): `Card recomendasion desktop` 243×260, `Card news Mobile` 354×318, `Card Popular News`, kartu besar dan berthumbnail Ruang Visual. **Belum dibaca; bukan scope tahap ini.**

## Di luar scope
Hero `Switch`, kolom samping, Ruang Visual, iklan, logika pemilihan berita (PAGE-001), tautan "Lihat Lainnya".

## Kriteria penerimaan (draf)
1. Props bertipe dari `Article`: judul, tautan, gambar (`MediaAsset`), kategori, penerbit/label, waktu terbit; `_embedded` tidak masuk komponen.
2. Varian desktop dan mobile sesuai geometri/gaya di inventaris §G–H (radius gambar 8 desktop, 10 mobile; judul, meta, avatar).
3. Satu tautan per kartu; fokus dan hover terlihat; sasaran sentuh memadai.
4. Kasus tepi: gambar hilang, judul sangat panjang/pendek, rasio gambar berbeda, waktu relatif WIB.
5. Warna, font, spasi dari token SET-002.

## Rencana tes (QA)
Disusun saat READY. Minimal: perbandingan dengan screenshot Figma pada 1440 dan 402; judul 1–5 baris; tanpa gambar; keyboard; `grep` warna literal; tidak ada `v-html` pada data CMS.

## File yang boleh disentuh
`app/components/news/**`, `app/types/**` (hanya yang dibutuhkan), `app/assets/css/**` (hanya yang dibutuhkan), `tests/unit/**`.

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| – | – | – | – | – |

## Catatan — keputusan sebelum READY
- **Diputuskan pemilik (29 Okt 2026, G19):** label kategori mengikuti desain per varian — tampil di kartu mobile (`159:2933`), tidak di kartu desktop (`57:516`). Tidak diseragamkan. Tambahan kriteria penerimaan (butir 2): label ada di varian mobile, tidak ada di varian desktop; QA menguji keduanya.
- Label penerbit: "IniSumedang" tetap atau nama penulis (PRD §6 `authorLabel` [?]).
- Aturan waktu relatif ("2 jam lalu"): kapan beralih ke tanggal; zona WIB.
- State hover/fokus/gambar hilang tidak digambar; usulan PM turunan dari token.
- Judul kartu mobile di-hardcode 13,333 px (bukan variabel 16 px): ikuti frame.
- Riwayat: 29 Okt 2026 → BACKLOG → PM.
- **Penundaan (30 Okt 2026, PM):** Keputusan pemilik 30 Okt 2026: backlog per slice vertikal. Slice pertama yang membutuhkan kartu (HOME-01) memilikinya; slice berikutnya wajib memakai ulang. Keputusan G19 (label kategori per varian) berlaku di HOME-01.
- Riwayat: 30 Okt 2026 → BACKLOG → DITUNDA → PM.
