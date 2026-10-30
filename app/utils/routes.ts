import type { Article } from '~/types/article'

/**
 * Tujuan tautan artikel. Mengembalikan null selama rute /berita/[slug] belum ada
 * (PAGE-002), sehingga kartu dirender tanpa <a>. PAGE-002 mengisinya.
 */
export function articlePath(_article: Article): string | null {
  return null
}
