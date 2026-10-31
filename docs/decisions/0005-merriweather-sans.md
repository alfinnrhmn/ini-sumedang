# 0005 — Merriweather Sans: berkas font hero (RFN sama dengan Merriweather, tercakup 0004)

| Field | Isi |
|---|---|
| **Tanggal** | 31 Okt 2026 |
| **Status** | Dikerjakan FE di HOME-07 berdasarkan keputusan pemilik (HOME-07 Catatan butir 1-4); menunggu tinjauan PM/QA |
| **Rujukan** | `docs/tasks/HOME-07.md` (Keputusan PM 6-7, Catatan pemilik), `docs/decisions/0004-merriweather-rfn.md`, PRD v1.10 §4.5, §10 |

## Fakta [V = diukur/diunduh FE pada 31 Okt 2026]
- **Pemakaian:** judul hero desktop, node `21:4980`: Merriweather Sans **Regular 400**, 32 px, line-height 1,2, letter-spacing -1,28 px, `capitalize` [V `get_design_context`]. **Hanya satu bobot yang dipakai.** Judul hero mobile `90:2136` memakai **Merriweather SemiBold** (font yang sudah ada), bukan Merriweather Sans [V].
- **Berkas (turunan subset Latin dari Fontsource, bukan distribusi resmi pencipta):**

| Berkas di repo | Ukuran | SHA-256 | Sumber (URL) | Versi | Tanggal unduh |
|---|---|---|---|---|---|
| `public/fonts/merriweather-sans-latin-400-normal.woff2` | 16.940 byte | `283718899a0070a86c04eae7972abb4df8bf7a7a255fa61f5dfb4b99307ff9a3` | `https://cdn.jsdelivr.net/npm/@fontsource/merriweather-sans@5.3.0/files/merriweather-sans-latin-400-normal.woff2` | `@fontsource/merriweather-sans` 5.3.0 (diterbitkan 19 Jul 2026 menurut registry npm; tag `latest`) | 31 Okt 2026 |
| `public/fonts/LICENSE-MerriweatherSans.txt` | 4.586 byte | `c487138e4ea4688386abfaf72ab2cbc72a7c8c358cca19bd70095e0d07d8d9f2` | `https://raw.githubusercontent.com/SorkinType/Merriweather-Sans/master/OFL.txt` (repositori pencipta Sorkin Type; push terakhir 29 Des 2020) | cabang `master` | 31 Okt 2026 |

- Berkas OFL disalin apa adanya (tanpa perubahan byte) dari repositori pencipta, bukan dari Fontsource.
- Daftar berkas versi 5.3.0 diambil dari `data.jsdelivr.com`; tidak ada unduhan dari host lain untuk font. (Aset gambar/SVG Figma hanya diunduh ke folder sementara di luar repo untuk pengukuran, tidak dimasukkan.)

## Hasil pemeriksaan RFN [V, kutipan baris apa adanya dari `OFL.txt` repositori pencipta]
```
Copyright 2019 The Merriweather Project Authors (https://github.com/SorkinType/Merriweather-Sans)
with Reserved Font Name 'Merriweather'

Merriweather is a trademark of Sorkin Type Co.
```
- **RFN = "Merriweather"** (sama dengan Merriweather yang sudah dipakai). Sesuai Catatan butir 3 HOME-07, risikonya **tercakup keputusan 0004** (pemilik: opsi A, terima risiko) dan mitigasi 0004 diterapkan di bawah.
- Hal yang perlu diketahui PM [?]: (a) teks OFL ini menambahkan pernyataan merek dagang "Merriweather is a trademark of Sorkin Type Co." (`LICENSE-Merriweather.txt` hanya memuat kata "TRADEMARK" pada teks standar OFL, tanpa pernyataan serupa); (b) nama keluarga **"Merriweather Sans"** memuat RFN "Merriweather" sebagai awalan; (c) butir mitigasi 4 di 0004 menyebut "Merriweather Sans tetap di luar scope" — untuk berkas ini butir itu digantikan oleh keputusan pemilik di Catatan HOME-07 butir 3 (RFN sama = tercakup 0004). FE tidak memperluas 0004; keputusan ini hanya mencatat penerapannya. Ini bukan nasihat hukum.

## Mitigasi yang diterapkan (mengikuti 0004)
1. Teks OFL asli dan baris hak cipta ikut: `public/fonts/LICENSE-MerriweatherSans.txt`, identik dengan sumber pencipta (SHA-256 di atas).
2. Berkas tidak diklaim sebagai versi asli: komentar `@font-face` di `app/assets/css/tokens.css` menyebut "turunan subset dari Fontsource 5.3.0".
3. Sumber, versi, tanggal, dan SHA-256 tercatat di tabel di atas dan di Bukti HOME-07.
4. Tidak ada subset/konversi tambahan oleh proyek (berkas Fontsource dipakai apa adanya).

## Jalur keluar
Sama dengan 0004 (Google Fonts CDN dengan keputusan pemilik terpisah, atau font pengganti judul hero dengan persetujuan pemilik). Berkas terpengaruh: `public/fonts/merriweather-sans-latin-400-normal.woff2`, `LICENSE-MerriweatherSans.txt`, blok `@font-face` "Merriweather Sans" dan token `--font-hero` / `--type-hero-headline-desktop` / `--tracking-hero-headline` di `tokens.css`.
