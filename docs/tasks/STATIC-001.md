# STATIC-001 — Halaman statis footer (lima tautan)

| Field | Isi |
|---|---|
| **ID** | STATIC-001 |
| **Status** | `BACKLOG` — menunggu konten dari pemilik dan LAY-001 |
| **Owner** | QA (rencana tes) → FE → QA → PM |
| **Prioritas** | P1 |
| **Dependensi** | SET-002 `DONE`; LAY-001 `DONE` (layout + daftar konfigurasi footer `{ label, to }`); **isi teks lima halaman dari pemilik** |
| **Rujukan PRD** | v1.10 §3.1 (Footer), §7 (rute rencana), FR-08, G16; AGENTS.md aturan 1 (tanpa form input) |
| **Dibuat** | 29 Okt 2026 (PM) |

## Tujuan
Lima dari enam label footer (Pedoman Siber, Iklan, Kontak, Kebijakan Privasi, Ketentuan Penggunaan) yang kini berupa teks biasa (`to: null`) menjadi tautan ke halaman nyata di Nuxt, satu per satu begitu halamannya siap. Label keenam, "Redaksi", tetap teks biasa (keputusan pemilik 29 Okt 2026).

## Node Figma
Tidak ada frame untuk halaman statis. Label di footer: `60:486` (desktop), `101:2600` (mobile). Halaman dibangun dari token dan komponen frame final tanpa elemen visual baru (PRD §3.2); PM menyetujui tampilannya sebelum dianggap selesai.

## Halaman (slug usulan [I]; final ditetapkan di task ini)
| Label | Rute |
|---|---|
| Pedoman Siber | `/pedoman-siber` |
| Iklan | `/iklan` |
| Kontak | `/kontak` |
| Kebijakan Privasi | `/kebijakan-privasi` |
| Ketentuan Penggunaan | `/ketentuan-penggunaan` |

## Di luar scope
Halaman untuk "Redaksi" (label keenam; **dipertahankan sebagai teks biasa**, tujuan ditentukan pemilik nanti), tujuan "Terbaru"/"Terpopuler" dan item kategori footer (kategori menjadi tautan saat PAGE-003), halaman WordPress Pages, modul tambahan (mis. content/markdown), formulir kontak (tidak ada input selain pencarian), CMS untuk teks ini, terjemahan, mengubah layout footer, Terbaru/Terpopuler.

## Kriteria penerimaan
1. Lima halaman Vue biasa di `app/pages/` (satu berkas per halaman), tanpa modul/dependensi baru.
2. Isi teks **persis dari pemilik** (tidak mengarang); satu `h1` per halaman, heading berurutan, tautan eksternal `rel="noopener noreferrer"`.
3. Tiap halaman: `title` dan `description` unik, canonical, status 200, dapat diindeks, masuk sitemap (dicatat untuk SEO-001).
4. Tanpa formulir/input; "Kontak" berisi teks (alamat/email/telepon yang diberikan pemilik).
5. Pada daftar footer, `to` diisi **hanya** untuk halaman yang sudah ada; footer menampilkannya sebagai `<a>` valid. Label tanpa halaman tetap teks biasa. Tidak ada `<a>` dengan `href` kosong atau `#`.
6. Header, menu, dan footer tampil sama dengan halaman lain; tanpa overflow pada 1440, 768/820/1024/1280, 402.
7. Warna/font/spasi dari token SET-002; `lint`, `typecheck`, `build` kode 0.

## Rencana tes (QA) — draf PM
| ID | Langkah | Hasil diharapkan | P |
|---|---|---|---|
| ST1 | Buka tiap rute | 200; satu `h1`; judul/deskripsi unik; canonical benar | P0 |
| ST2 | Bandingkan teks halaman dengan teks sumber pemilik | Persis sama (tidak ada tambahan/pengurangan) | P0 |
| ST3 | Klik tiap label footer di desktop dan mobile | Menuju halaman yang benar; yang belum ada tetap teks biasa | P0 |
| ST4 | `grep`/DOM: semua `a[href]` | Tidak ada `href=""`, `#`, atau tujuan 404 | P0 |
| ST5 | Periksa Tab di footer | Label teks biasa tidak bisa difokus; label tautan bisa, fokus terlihat | P1 |
| ST6 | Periksa "Redaksi", "Terbaru", "Terpopuler" di footer | Teks biasa (bukan `<a>`, tidak bisa difokus); enam label footer terlihat | P0 |
| ST7 | Cek input | Tidak ada form/input di lima halaman | P0 |
| ST8 | 1440, 768/820/1024/1280, 402 | Tanpa overflow; tipografi dari token | P1 |

## File yang boleh disentuh
`app/pages/{pedoman-siber,iklan,kontak,kebijakan-privasi,ketentuan-penggunaan}.vue` (baru), berkas konfigurasi footer yang dibuat LAY-001 (hanya mengisi `to`), `app/assets/css/**` (hanya yang dibutuhkan). Tidak boleh: `package.json`, `nuxt.config.ts`, `server/**`.

## Bukti
| Tahap | Perintah / langkah | Output / jalur bukti | Oleh | Tanggal |
|---|---|---|---|---|
| – | – | – | – | – |

## Catatan
- Pembuka BACKLOG → READY: isi teks (minimal satu halaman) dari pemilik; LAY-001 `DONE`. Halaman boleh dikerjakan bertahap sesuai teks yang tersedia.
- Pertanyaan ke pemilik: isi teks lima halaman; tujuan "Redaksi" (kelak halaman atau tetap teks); apakah "Iklan" = info pemasangan iklan (bukan slot iklan); slug final.
- Riwayat: 29 Okt 2026 → BACKLOG → PM.
