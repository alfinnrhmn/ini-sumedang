// Konfigurasi penyanitasi HTML artikel: SATU-SATUNYA tempat allowlist; murni data agar bisa diuji `node:test`.
// Tag lain dibuang; tanpa `class/style/id/on*`; skema berbahaya ditolak; iframe hanya ke `EMBED_ALLOWED_HOSTS`.

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

/** Tag yang dibuang BESERTA isinya: kode, formulir, objek tertanam, SVG/MathML (sumber mXSS). Lainnya: tag-nya. */
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

/** Host gambar absolut (https) yang diizinkan. DEFAULT KOSONG: host media WordPress masuk lewat `extraImageHosts`. */
export const IMAGE_ALLOWED_HOSTS: readonly string[] = []

// Host embed yang diizinkan (hostname persis, huruf kecil). HARUS sama dengan CSP `frame-src`; ubah keduanya bersamaan.
// PERINGATAN: iframe dipaksa `allow-scripts allow-same-origin`: aman HANYA bila `src` LINTAS-ORIGIN dari situs ini.
export const EMBED_ALLOWED_HOSTS: readonly string[] = [
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com'
]

/** Nilai `Content-Security-Policy`: hanya `frame-src` dari `EMBED_ALLOWED_HOSTS`; kosong = `'none'`. */
export function embedFrameSrcPolicy(hosts: readonly string[] = EMBED_ALLOWED_HOSTS): string {
  return hosts.length > 0 ? `frame-src ${hosts.map(host => `https://${host}`).join(' ')}` : 'frame-src \'none\''
}

/** Path embed yang diizinkan: `/embed/<id>` saja; id 6-20 karakter [A-Za-z0-9_-]. Tanpa garis miring akhir. */
export const EMBED_PATH_PATTERN: RegExp = /^\/embed\/[A-Za-z0-9_-]{6,20}$/

/** Parameter query pemutar yang dipertahankan pada `src` embed (nilai divalidasi, sisanya dibuang). */
export const EMBED_QUERY_PARAMS: Record<string, RegExp> = {
  start: /^\d{1,6}$/,
  end: /^\d{1,6}$/,
  rel: /^[01]$/,
  controls: /^[01]$/,
  modestbranding: /^[01]$/,
  playsinline: /^[01]$/
}

/** Fitur yang boleh didelegasikan lewat atribut `allow` iframe (selain ini dibuang; tanpa kamera/mikrofon/lokasi). */
export const EMBED_ALLOW_FEATURES: readonly string[] = [
  'accelerometer', 'clipboard-write', 'encrypted-media', 'gyroscope', 'picture-in-picture', 'web-share', 'fullscreen'
]

/** `sandbox` yang DIPAKSA pada setiap iframe. Hanya aman bila host embed lintas-origin (lihat peringatan di atas). */
export const EMBED_SANDBOX = 'allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox'

/** `referrerpolicy` yang DIPAKSA pada setiap iframe. */
export const EMBED_REFERRER_POLICY = 'strict-origin-when-cross-origin'

/** Batas ukuran masukan (jumlah karakter): 2 MB. Di atas batas, keluaran = '' (gagal tertutup, tanpa pemotongan). */
export const SANITIZE_MAX_INPUT_LENGTH: number = 2 * 1024 * 1024

/** Batas '<' per masukan: 30.000 (parser kuadratik pada tag tak tertutup, CPU); di atas batas keluaran = ''. */
export const SANITIZE_MAX_TAG_OPENINGS: number = 30_000

/** Batas kedalaman sarang tag: tag pada kedalaman >= batas dibuang (isi teksnya tetap diproses). */
export const SANITIZE_NESTING_LIMIT: number = 50
