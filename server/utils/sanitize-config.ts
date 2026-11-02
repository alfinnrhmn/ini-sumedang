/**
 * Konfigurasi penyanitasi HTML artikel (SANITIZE-001) — SATU-SATUNYA tempat allowlist.
 * Penyanitasi: `sanitize-article-html.ts`. Keputusan dan batas: docs/decisions/0006-sanitize-html.md.
 * Berkas ini murni data (tanpa auto-import Nuxt) agar bisa diuji langsung dengan `node:test`.
 *
 * ## Ringkasan allowlist
 * - Tag: lihat `SANITIZE_ALLOWED_TAGS` (tanpa `h1`: judul halaman satu `h1`). Tag lain dibuang, teks di dalamnya
 *   dipertahankan (mis. `<div>`/`<span>`), kecuali `SANITIZE_NON_TEXT_TAGS` (isi ikut dibuang).
 * - Atribut: lihat `SANITIZE_ALLOWED_ATTRIBUTES`. Tanpa `class`, `style`, `id`, dan semua `on*`.
 * - URL: `href` = https/http/mailto/relatif. `img src` = relatif atau https dari host di `IMAGE_ALLOWED_HOSTS`.
 *   `javascript:`, `data:`, `vbscript:`, dan skema lain ditolak. Tautan eksternal otomatis `rel="noopener noreferrer"`.
 * - Embed: hanya `iframe` ke host di `EMBED_ALLOWED_HOSTS` (default YouTube), https, path `/embed/<id>`.
 *   `src` dibangun ulang dari bagian yang tervalidasi; `sandbox` dan `referrerpolicy` dipaksa.
 *
 * ## Cara memperluas
 * - Host embed baru: tambahkan hostname persis (huruf kecil, tanpa skema/port) ke `EMBED_ALLOWED_HOSTS`.
 *   Semua host embed memakai pola path yang sama (`EMBED_PATH_PATTERN`); penyedia dengan bentuk path lain
 *   membutuhkan keputusan dan perubahan terdokumentasi (bukan sekadar menambah host).
 * - Host gambar (media WordPress): tambahkan ke `IMAGE_ALLOWED_HOSTS` setelah gerbang G-WP menetapkan hostnya.
 */

/** Tag yang dipertahankan. `iframe` hanya lolos lewat aturan embed. `h1` sengaja tidak ada. */
export const SANITIZE_ALLOWED_TAGS: string[] = [
  'p', 'br', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'em', 'b', 'i', 'u', 's',
  'blockquote', 'ul', 'ol', 'li',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'code', 'pre', 'sup', 'sub',
  'iframe'
]

/**
 * Tag yang dibuang BESERTA isinya (bukan hanya tag-nya): kode, formulir, objek tertanam, dan namespace
 * SVG/MathML (sumber utama mXSS/namespace confusion). Tag tak dikenal lain hanya dibuang tag-nya.
 */
export const SANITIZE_NON_TEXT_TAGS: string[] = [
  'script', 'style', 'textarea', 'option', 'noscript',
  'svg', 'math', 'template', 'object', 'embed', 'form', 'select',
  'title', 'noembed', 'noframes', 'xmp'
]

/** Atribut yang dipertahankan per tag. Nilai tertentu diperketat lagi di `sanitize-article-html.ts`. */
export const SANITIZE_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'rel', 'target'],
  img: ['src', 'alt', 'width', 'height', 'loading'],
  th: ['colspan', 'rowspan'],
  td: ['colspan', 'rowspan'],
  iframe: ['src', 'width', 'height', 'title', 'allowfullscreen', 'loading', 'referrerpolicy', 'allow', 'sandbox']
}

/** Skema URL yang boleh pada `href`/`src` (URL relatif selalu boleh; `//host` ditolak). */
export const SANITIZE_ALLOWED_SCHEMES: string[] = ['https', 'http', 'mailto']

/** Nilai `target` yang dipertahankan; selain itu atribut dibuang. */
export const SANITIZE_ALLOWED_TARGETS: string[] = ['_blank', '_self']

/**
 * Host gambar absolut (https) yang diizinkan. DEFAULT KOSONG [I]: hanya gambar relatif/same-origin lolos;
 * host media WordPress ditetapkan di gerbang G-WP (PRD §13). Hostname persis, huruf kecil.
 */
export const IMAGE_ALLOWED_HOSTS: readonly string[] = []

/**
 * Host embed yang diizinkan (keputusan pemilik 2 Nov 2026: default hanya YouTube). Hostname persis, huruf kecil,
 * tanpa skema/port/path. Menambah host = mengubah daftar ini, bukan kode penyanitasi.
 *
 * PERINGATAN KEAMANAN (sandbox, lihat `EMBED_SANDBOX`): iframe dipaksa memakai `allow-scripts allow-same-origin`.
 * Kombinasi itu aman HANYA selama `src` embed LINTAS-ORIGIN terhadap situs ini. Menambahkan ke daftar ini host
 * same-origin (domain situs ini atau subdomain berbagi origin) atau host yang tidak tepercaya meniadakan perlindungan
 * sandbox: dokumen yang di-embed dapat menjalankan skrip dengan hak origin situs, atau melepas sandbox-nya sendiri.
 * Daftar ini juga HARUS sama persis dengan CSP `frame-src` (SEC-001); ubah keduanya bersamaan.
 */
export const EMBED_ALLOWED_HOSTS: readonly string[] = [
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com'
]

/** Path embed yang diizinkan: `/embed/<id>` saja; id 6-20 karakter [A-Za-z0-9_-] [I]. Tanpa garis miring akhir. */
export const EMBED_PATH_PATTERN: RegExp = /^\/embed\/[A-Za-z0-9_-]{6,20}$/

/**
 * Parameter query pemutar yang dipertahankan pada `src` embed (nilai divalidasi, sisanya dibuang;
 * tidak ada `autoplay`/`playlist`/`origin`). Hanya parameter tampilan/rentang waktu [I].
 */
export const EMBED_QUERY_PARAMS: Record<string, RegExp> = {
  start: /^\d{1,6}$/,
  end: /^\d{1,6}$/,
  rel: /^[01]$/,
  controls: /^[01]$/,
  modestbranding: /^[01]$/,
  playsinline: /^[01]$/
}

/** Fitur yang boleh didelegasikan lewat atribut `allow` iframe (selain ini dibuang; tanpa kamera/mikrofon/lokasi/autoplay). */
export const EMBED_ALLOW_FEATURES: readonly string[] = [
  'accelerometer', 'clipboard-write', 'encrypted-media', 'gyroscope', 'picture-in-picture', 'web-share', 'fullscreen'
]

/**
 * `sandbox` yang DIPAKSA pada setiap iframe (nilai dari HTML CMS diabaikan). Cukup agar pemutar YouTube berfungsi.
 * PERINGATAN: `allow-scripts` + `allow-same-origin` hanya aman bila host embed lintas-origin; lihat peringatan
 * pada `EMBED_ALLOWED_HOSTS` (jangan menambah host same-origin atau tak tepercaya).
 */
export const EMBED_SANDBOX = 'allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox'

/** `referrerpolicy` yang DIPAKSA pada setiap iframe. */
export const EMBED_REFERRER_POLICY = 'strict-origin-when-cross-origin'

/** Batas ukuran masukan (jumlah karakter) [I]: 2 MB. Di atas batas, keluaran = '' (gagal tertutup, tanpa pemotongan). */
export const SANITIZE_MAX_INPUT_LENGTH: number = 2 * 1024 * 1024

/**
 * Batas jumlah karakter '<' per masukan [I]: 30.000. Parser (htmlparser2) kuadratik terhadap kedalaman tag yang tidak
 * ditutup (diukur: 100.000 tag `<b>` tak tertutup = 1,1 detik hanya di parser), sehingga ukuran saja tidak cukup untuk
 * mencegah penghambatan CPU. Artikel nyata memuat jauh di bawah ini. Di atas batas, keluaran = '' (gagal tertutup).
 */
export const SANITIZE_MAX_TAG_OPENINGS: number = 30_000

/** Batas kedalaman sarang tag [I]: tag pada kedalaman >= batas dibuang (isi teksnya tetap diproses). */
export const SANITIZE_NESTING_LIMIT: number = 50
