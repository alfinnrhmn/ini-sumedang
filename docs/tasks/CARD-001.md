# CARD-001 — Sistem News Card (varian final)

| Field | Isi |
|---|---|
| **ID** | CARD-001 |
| **Status** | `BACKLOG` |
| **Owner** | QA (rencana tes) → FE → QA → PM |
| **Prioritas** | P0 |
| **Dependensi** | SET-001 `DONE`; SET-002 `DONE`; API-001 `DONE` (tipe `Article`, `MediaAsset`) |
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
- Label kategori: tampil di mobile (`159:2933`) tetapi tidak di desktop (`57:516`). Pemilik/PM: ikuti desain per varian atau samakan?
- Label penerbit: "IniSumedang" tetap atau nama penulis (PRD §6 `authorLabel` [?]).
- Aturan waktu relatif ("2 jam lalu"): kapan beralih ke tanggal; zona WIB.
- State hover/fokus/gambar hilang tidak digambar; usulan PM turunan dari token.
- Judul kartu mobile di-hardcode 13,333 px (bukan variabel 16 px): ikuti frame.
- Riwayat: 29 Okt 2026 → BACKLOG → PM.
