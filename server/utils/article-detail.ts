/**
 * Pembantu murni Detail Berita. Tanpa auto-import Nuxt (impor eksplisit berekstensi `.ts`) agar bisa diuji dengan `node:test`.
 * Logika penyanitasi HTML TIDAK ada di sini (lihat `sanitize-article-html.ts`).
 */
import { ARTICLE_SLUG_MAX_LENGTH, READING_WORDS_PER_MINUTE } from '../../app/config/article.ts'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Slug valid: `^[a-z0-9]+(?:-[a-z0-9]+)*$`, 1-120 karakter. Selain string (undefined, array) = tidak valid. */
export function isValidArticleSlug(value: unknown): value is string {
  return typeof value === 'string' && value.length <= ARTICLE_SLUG_MAX_LENGTH && SLUG_PATTERN.test(value)
}

/** Buang tag HTML dari teks sumber tepercaya CMS (excerpt, keterangan foto) untuk dirender sebagai teks. Bukan penyanitasi. */
export function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

/** Apakah HTML yang sudah disanitasi punya isi terlihat (teks selain spasi/`&nbsp;`/karakter lebar nol, gambar, atau embed)? Hanya spasi/tag kosong (`<p> </p>`, `<br>`, `<hr>`) = false. Bukan penyanitasi. */
export function hasVisibleContent(sanitizedHtml: string): boolean {
  if (/<(img|iframe)\b/i.test(sanitizedHtml)) return true
  const text = sanitizedHtml
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:nbsp|#0*160|#x0*a0);/gi, ' ')
    .replace(/[\s\p{Cf}]+/gu, '')
  return text !== ''
}

/** Jumlah kata dari HTML yang sudah disanitasi (tag diganti spasi agar kata antar tag tidak menyatu). */
export function countWords(sanitizedHtml: string): number {
  const text = sanitizedHtml.replace(/<[^>]*>/g, ' ').trim()
  return text === '' ? 0 : text.split(/\s+/).length
}

/** Waktu baca (menit): ceil(kata / 200), minimal 1. */
export function readingMinutes(sanitizedHtml: string): number {
  return Math.max(1, Math.ceil(countWords(sanitizedHtml) / READING_WORDS_PER_MINUTE))
}
