/**
 * URL bagikan Detail Berita (PAGE-002, FR-06). Hanya platform yang ada di Figma dan punya URL bagikan web standar
 * (Facebook, X); tanpa SDK pihak ketiga. Instagram dan WhatsApp tidak punya/tidak ada di desain dan tidak dibuat.
 * Murni (tanpa auto-import Nuxt) agar bisa diuji dengan `node:test`.
 */

/** `url` = URL kanonis artikel (https). Parameter di-encode. */
export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

/** Endpoint resmi X: `https://x.com/intent/post` (`twitter.com/intent/tweet` masih dialihkan; dipakai domain x.com). */
export function xShareUrl(url: string, text: string): string {
  return `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
}
