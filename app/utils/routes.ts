import type { Article } from '~/types/article'

/**
 * Tujuan tautan artikel. Mengembalikan null selama rute /berita/[slug] belum ada
 * (PAGE-002), sehingga kartu dirender tanpa <a>. PAGE-002 mengisinya.
 */
export function articlePath(_article: Article): string | null {
  return null
}

/**
 * Tujuan tautan kategori. Mengembalikan null selama rute /kategori/[slug] belum ada
 * (PAGE-003), sehingga menu dan laci merender teks biasa tanpa <a>. PAGE-003 mengisinya.
 */
export function categoryPath(_slug: string): string | null {
  return null
}
