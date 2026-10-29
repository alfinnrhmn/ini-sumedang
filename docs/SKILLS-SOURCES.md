# Skills pihak ketiga — catatan sumber

Skill = instruksi (dan kadang skrip) yang dijalankan dengan izin agent. Prosedur sebelum memasang: (1) buka repo, baca **seluruh** `SKILL.md` dan skrip di dalamnya; (2) pin ke commit SHA; (3) salin hanya skill yang dibutuhkan ke `.agents/skills/`; (4) isi tabel di bawah; (5) persetujuan pemilik.

**Status saat ini: belum ada yang dipasang atau direview.** Daftar di bawah hasil pencarian, bukan rekomendasi final.

| Kandidat | Fungsi untuk proyek ini | Catatan risiko | Commit dipin | Direview oleh/tgl | Dipasang |
|---|---|---|---|---|---|
| `WordPress/agent-skills` — `wp-rest-api` (+ `wp-performance` bila perlu) | Pola REST WordPress, kontrak data | Organisasi resmi WordPress; README menyebut konten dihasilkan AI lalu direview; targetkan WP 6.9+ | TBD | — | belum |
| `antfu/skills` — `nuxt`, `vue`, `vitest` | Praktik Nuxt/Vue/test | Repo personal maintainer ternama; **cek bahwa isinya cocok Nuxt 4 / 4.6**, bukan Nuxt 3 | TBD | — | belum |
| `addyosmani/web-quality-skills` — `seo`, `accessibility`, `core-web-vitals` | Checklist SEO/a11y/performa untuk QA | MIT; skill audit bersifat umum | TBD | — | belum |
| `currents-dev/playwright-best-practices-skill` | Pola tes Playwright | Pihak vendor; cek apakah mewajibkan layanan berbayar | TBD | — | belum |

Tidak dipilih (alasan): `vuejs-ai/skills` — penulis menyebut "early experiment"; `onmax/nuxt-skills` — README menyebut bisa digantikan; `phuryn/pm-skills` / `deanpeters/Product-Manager-Skills` — PM generik (lisensi `NOASSERTION` pada yang kedua), tiga skill lokal sudah spesifik proyek.

Pilihan paling hemat: **mulai tanpa skill pihak ketiga**; tambahkan satu per satu bila ada kekurangan nyata pada hasil agent.
