/**
 * Validasi URL gambar hero (masuk ke `<img src>` dan `og:image`). Murni (tanpa auto-import Nuxt) agar bisa diuji dengan `node:test`.
 * Lolos hanya jalur relatif satu `/` (bukan `//host`, tanpa `\`) atau `https://` dengan host persis di `IMAGE_ALLOWED_HOSTS` (tanpa userinfo/port); selain itu `null` (artikel tanpa gambar, bukan galat).
 */
import { IMAGE_ALLOWED_HOSTS } from './sanitize-config.ts'

/** Karakter kontrol, spasi, DEL, dan garis miring terbalik (dibaca peramban sebagai `/`) ditolak di mana pun. */
// eslint-disable-next-line no-control-regex
const FORBIDDEN_CHARS = /[\u0000- \u007F\\]/

/** `hosts` hanya untuk uji/override; produksi memakai `IMAGE_ALLOWED_HOSTS`. */
export function safeImageUrl(url: unknown, hosts: readonly string[] = IMAGE_ALLOWED_HOSTS): string | null {
  if (typeof url !== 'string' || url === '' || FORBIDDEN_CHARS.test(url)) return null

  if (url.startsWith('/')) return url.startsWith('//') ? null : url

  if (!/^https:\/\//i.test(url)) return null
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port) return null
  return hosts.some(host => host.toLowerCase() === parsed.hostname) ? url : null
}
