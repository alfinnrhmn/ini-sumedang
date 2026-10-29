# 0003 — WordPress ditunda: data contoh dan gerbang "titik cek WordPress"

| Field | Isi |
|---|---|
| **Tanggal** | 29 Okt 2026 |
| **Status** | Diputuskan pemilik; dicatat PM |
| **Rujukan** | PRD v1.10 prinsip 9, G21, §13, §15.1; tugas MOCK-001 |

## Keputusan pemilik [V]
WordPress ditunda. UI dikerjakan dengan data contoh.

## Konsekuensi
- **Prinsip:** data contoh berada di balik fungsi layanan yang sama dengan WordPress nanti; fixture sengaja memuat kasus buruk (judul panjang, artikel tanpa gambar, entitas HTML `&amp;` dan `&#8211;`, kategori/tag kosong, isi HTML bervariasi). Saat WordPress siap, hanya isi fungsi layanan diganti.
- **`DITUNDA` (alasan "WordPress ditunda"):** API-001, DISC-002, POP-001, ADS-001, ADS-002, SOC-001. Tidak dihapus.
- **Gerbang titik cek WordPress** (maks. 1 jam, read-only): REST aktif dan publik; bentuk respons `posts` dengan `_embed`; 9 kategori dan tag `terpopuler`; sumber field kredit foto; hasil pencarian "peraturan pemerintah terbaru"; versi Node hosting.
  - Wajib sebelum: PAGE-002, PAGE-003, PAGE-004, dan bagian PAGE-001 yang bergantung data WordPress (Ruang Visual, Terpopuler, iklan, widget sosial).
  - Bagian PAGE-001 yang hanya UI boleh memakai fixture.
- **Vitest:** SET-001 menunda Vitest "sampai ada kode yang layak diuji"; keputusan pemilik berikutnya (29 Okt 2026): Vitest tetap ditunda sampai ada logika nyata pertama (komposisi Rekomendasi, penyanitasi HTML, atau peringkat Berita Terkait, mana yang lebih dulu); MOCK-001 diverifikasi dengan typecheck dan cek manual lewat HTTP.
- **Penyanitasi HTML:** tetap dependensi yang butuh persetujuan; `body` tidak dirender dengan `v-html` sebelum ada (AGENTS.md aturan 6), termasuk saat datanya fixture.

## Risiko
Fixture bisa berbeda dari WordPress asli; dibatasi oleh layanan satu pintu dan dibuktikan di gerbang. Hasil gerbang dicatat di `docs/decisions/` berikutnya.
