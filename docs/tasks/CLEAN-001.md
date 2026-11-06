# CLEAN-001 — Bersihkan komentar kode dan berkas task lama (tanpa mengubah perilaku)

| Field | Isi |
|---|---|
| **ID / Status** | CLEAN-001 · `DONE` (QA_PASSED 6 Nov 2026; dari `READY`, PM 6 Nov 2026, permintaan pemilik: kode bersih, tingkat "sedang"; berkas task DONE dihapus) |
| **Dependensi** | ADS-002 di `main` (2b06bbc) |
| **Rujukan** | AGENTS.md aturan 8, 11 |

## Tujuan
Kode `app/`, `server/`, `tests/` bebas rujukan proses (ID task, ID keputusan, ID node Figma, "PRD §") dan komentar panjang; perilaku, tampilan, dan keluaran build tidak berubah.

## Di luar scope
Mengubah logika, nama, impor, CSS/markup, pesan galat, teks tampilan; `nuxt.config.ts`, `package.json`, lockfile, `.github/**`, `.claude/**`, `docs/**`, `.env*`, `public/**`.

## Keputusan PM
1. **Hapus:** rujukan `HOME-03`, `UX-001`, `D47`, `E6`, `G21`, `PRD §x`, `docs/tasks/...`, `docs/decisions/...`, ID node Figma (`90:1611`, dst.), "Keputusan PM n", "pemilik 4 Nov", dan sejenisnya; komentar yang hanya mengulang kode; blok komentar > 2 baris diringkas jadi 1-2 baris.
2. **Pertahankan (ringkas, bahasa Indonesia):** alasan keamanan/sanitasi (HTML, URL, `rel`), batas WordPress (timeout, cache, backoff), trik layout/SSR yang tidak jelas dari kode (sticky, hydration, `:empty`), dan peringatan "jangan ubah karena ...".
3. **Dilarang:** mengubah satu karakter pun di luar komentar (termasuk spasi/urutan baris kode); menyentuh string literal, regex, template, `<style>` selain isi komentar. Komentar di dalam string/regex bukan komentar.
4. Uji yang membaca isi sumber (`readFileSync`) dan gagal karena teks komentar: laporkan; ubah hanya penyaringnya agar tidak bergantung pada komentar, tanpa melonggarkan asersi perilaku.

## Kriteria penerimaan
1. `git diff` hanya menghapus/mengganti komentar: tanpa komentar, AST tiap `.ts`/`.vue` identik (cek otomatis) dan `<style>`/template identik setelah komentar dibuang.
2. `npm run lint`, `npx nuxt typecheck`, `npm test` (923), `npm run build` kode 0.
3. Keluaran build identik dengan HEAD: HTML Beranda/Detail/kategori/`/cari` pada fixture setelah `data-v-*` dinormalisasi, dan CSS/JS klien setelah minifikasi (selisih hanya hash nama berkas).
4. Tanpa rujukan ID proses tersisa (`grep` untuk pola task/D/E/G/node Figma/`docs/tasks`/`PRD §` di `app server tests` = 0, kecuali teks tampilan atau data uji).

## File yang boleh disentuh
`app/**`, `server/**`, `tests/**` (hanya komentar). PM: `docs/PRD.md`, `docs/tasks/**` (hapus yang DONE), `docs/TASK-TEMPLATE.md`, `.agents/skills/pm/SKILL.md`, `.claude/commands/jalankan-slice.md`, `docs/decisions/*` (rujukan jalur).

## QA (cakupan sedang)
Bandingkan keluaran build dengan HEAD (kriteria 3), AST identik, grep sisa rujukan, `lint`/`typecheck`/`test`/`build`.

## Bukti (≤ 5 baris)
- QA independen 6 Nov 2026 (sedang) **QA_PASSED**: 85 berkas AST/template/style identik setelah komentar dibuang (0 beda); build base vs baru: JS/CSS klien identik, 29 rute + semua `/api/*` identik; lint, typecheck, 923/923, audit kode 0. Low: nama uji masih memuat ID task/keputusan (dibiarkan), penjelasan `useStickyColumn.ts` diringkas. Log: scratchpad `cq/`.

## Catatan
Berkas task DONE dihapus oleh PM (riwayat di git). Sisa: ADS-002, STATIC-001, POLISH-01, CLEAN-001.
