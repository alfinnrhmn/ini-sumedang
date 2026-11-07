// URL bagikan Detail Berita: Facebook, X, WhatsApp, tanpa SDK pihak ketiga (Instagram tak punya URL bagikan web).
// Murni (tanpa auto-import Nuxt) agar bisa diuji dengan `node:test`.

/** `url` = URL kanonis artikel (https). Parameter di-encode. */
export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

/** Endpoint resmi X: `https://x.com/intent/post` (`twitter.com/intent/tweet` masih dialihkan; dipakai x.com). */
export function xShareUrl(url: string, text: string): string {
  return `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
}

/** WhatsApp (`wa.me`, tanpa SDK): teks = "<judul> <URL kanonis>", di-encode sekali sebagai nilai `text`. */
export function whatsappShareUrl(url: string, text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
}
