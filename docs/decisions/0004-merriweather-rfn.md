# 0004 — Merriweather: Reserved Font Name pada berkas woff2 turunan (risiko diterima)

| Field | Isi |
|---|---|
| **Tanggal** | 30 Okt 2026 |
| **Status** | Diputuskan pemilik (opsi A: terima risiko, lanjut); dicatat PM |
| **Rujukan** | SET-002 (BLOCKED oleh FE, kini READY); S44, S45; PRD v1.10 §5.1, G17; keputusan pemilik font opsi A (29 Okt 2026) |

## Fakta [V = dilaporkan FE dari teks lisensi; [?] = belum diverifikasi PM]
- Teks SIL Open Font License (OFL) yang menyertai Merriweather memuat **Reserved Font Name "Merriweather"** dalam baris hak cipta. Kutipan baris hak cipta persis disalin FE dari berkas lisensi ke tabel Bukti SET-002 (PM tidak menyalinnya di sini dari ingatan) [?].
- Berkas `woff2` yang akan dipakai berasal dari **Fontsource 5.3.0** dan merupakan **turunan**: sudah di-subset dan dikonversi format dari font asli.
- FAQ resmi OFL: entri **2.2**, **2.5**, dan **2.6** menyatakan bahwa subsetting dan perubahan format umumnya dianggap **Modified Version**, dan Modified Version **tidak boleh memakai Reserved Font Name** tanpa izin tertulis pemegang hak cipta.
- **Inter** tidak memuat Reserved Font Name; keputusan ini tidak menyangkut Inter.

## Inferensi dan ketidakpastian [I / ?]
- [?] **Tidak diketahui** apakah Fontsource atau Google Fonts memegang izin dari pemegang hak cipta untuk memakai nama "Merriweather" pada berkas turunan.
- [I] Berkas turunan yang tetap bernama "Merriweather" dapat dinilai melanggar klausul RFN. Tingkat risikonya bergantung pada penafsiran dan izin yang tidak kita ketahui.
- **Ini bukan nasihat hukum.** PM tidak menilai keabsahan; PM mencatat risiko dan keputusan pemilik.

## Keputusan pemilik [V]
**Opsi A: terima risiko dan lanjut** (30 Okt 2026). SET-002 kembali ke `READY`. Berkas `woff2` Merriweather SemiBold dari sumber yang tercatat boleh dipakai di `public/fonts/`.

## Mitigasi (wajib dikerjakan di SET-002)
1. Teks **OFL asli** dan **baris hak cipta** ikut di `public/fonts/` (`LICENSE-Merriweather.txt`), identik dengan sumber resmi (S44).
2. Berkas **tidak diklaim sebagai versi asli**: tidak ada pernyataan di kode, komentar, atau dokumen bahwa berkas adalah distribusi resmi pencipta; komentar `@font-face` menyebut "turunan subset dari Fontsource 5.3.0".
3. **Sumber dan SHA-256** tiap berkas dicatat di Bukti (S45): URL, versi, tanggal, perintah subset bila ada.
4. Tidak ada font lain yang memakai nama "Merriweather" (Merriweather Sans tetap di luar scope).

## Pemicu tinjau ulang
- Klien menyaratkan kepatuhan lisensi yang ketat.
- Ada keberatan dari pencipta atau pemegang hak cipta.
- PRD berubah (mis. font diganti atau distribusi lisensi diubah).

## Rencana keluar
- **Opsi B:** memuat Merriweather dari **Google Fonts CDN** (berkas asli, bukan turunan kita). Konsekuensi: host pihak ketiga, melanggar keputusan self-host (PRD §10) sehingga perlu keputusan pemilik terpisah dan perubahan kebijakan privasi/CSP.
- **Opsi D:** **font pengganti** untuk judul (serif tanpa RFN yang sama) dengan persetujuan pemilik karena mengubah tampilan frame.
- **Berkas yang terpengaruh:** `public/fonts/` (berkas `woff2` dan lisensi), blok `@font-face` di `app/assets/css/`, token `--font-serif` di `tokens.css` (nama keluarga harus tetap sinkron dengan `@font-face`).

## Dampak pada pekerjaan
- FE tidak perlu menandai masalah ini lagi; cukup mencatat hasil pemeriksaan teks lisensi di tabel Bukti SET-002.
- QA S44 tetap Wajib: memeriksa kesamaan teks dengan sumber resmi dan kehadiran baris hak cipta; temuan RFN tidak lagi memblokir selama mitigasi di atas terpenuhi.
