# IniSumedang

Portal berita IniSumedang: **Nuxt 4** (SSR) dengan **WordPress headless** sebagai CMS. Frontend hanya membaca (REST v2, `GET` saja) dan tidak pernah menulis ke WordPress.

Dokumen utama: [`docs/PRD.md`](docs/PRD.md) (scope, keputusan, status task, daftar wajib sebelum tayang). Aturan kerja: [`AGENTS.md`](AGENTS.md).

## Persyaratan
Node sesuai `engines` di `package.json` (`^22.22.3 || ^24.15.0 || >=26`; `.nvmrc` = 22) dan npm.

## Menjalankan
```bash
npm ci
npm run dev        # http://localhost:3000
```

Perintah lain: `npm run build` · `npm run preview` · `npm run lint` · `npx nuxt typecheck` · `npm test`.

## Konfigurasi (env)
Salin `.env.example` ke `.env` (tidak ikut Git). Secret hanya di env server atau secret manager hosting, jangan di repo.

| Variabel | Fungsi |
|---|---|
| `NUXT_WP_BASE_URL` | Origin WordPress (`https://host`, tanpa slash akhir). Kosong atau tidak valid = memakai data contoh (fixture), hanya untuk dev dan uji. |
| `NUXT_PUBLIC_SITE_URL` | URL publik situs (canonical, `og:url`, URL bagikan). Kosong = `https://inisumedang.com`. |
| `FIXTURE_SET` | `edge` = data contoh kasus buruk untuk uji. Hanya dev dan uji. |
| `NODE_EXTRA_CA_CERTS` | Jalur berkas `.crt` bila WordPress memakai sertifikat self-signed (mis. Local). Jangan matikan verifikasi TLS. |

## WordPress
- Artikel, kategori, dan tag dibaca dari `wp/v2` (`posts`, `categories`, `tags`). Kategori dan tag di Nuxt mengikuti WordPress.
- Iklan dari ACF: post type `iklan` (REST base `iklan`) dengan field `gambar`, `tautan`, `slot`, `aktif`, `mulai`, `selesai`, `teks_alt`. Slot: `sidebar-s|m|l`, `mobile-s|m`, `wide-m|l`. Rinciannya di `docs/PRD.md`.
- Gambar dan tautan iklan hanya `https`; HTML dari CMS disanitasi di server sebelum dirender.

## Struktur
- `app/` halaman, komponen, composable, konfigurasi, token CSS
- `server/` API (`/api/*`), layanan data, klien WordPress, sanitasi HTML, data contoh
- `tests/unit/` uji `node:test` (`npm test`)
- `docs/` PRD, keputusan (`docs/decisions`), inventaris Figma, task yang masih berjalan

## CI
`.github/workflows/ci.yml`: lint, typecheck, test, build, dan `npm audit --audit-level=high` pada setiap push ke `main` dan pull request.
