import type { Article } from '~/types/article'

/**
 * Tujuan tautan artikel (PAGE-002): `/berita/<slug>`. Satu-satunya tempat bentuk URL artikel; kartu, breadcrumb,
 * dan URL kanonis memakai fungsi ini. `slug` dari data sudah divalidasi di server, tetapi tetap di-encode agar
 * karakter tak terduga tidak pernah menjadi bagian path.
 */
export function articlePath(article: Pick<Article, 'slug'>): string {
  return `/berita/${encodeURIComponent(article.slug)}`
}

/**
 * Tujuan tautan kategori. Mengembalikan null selama rute /kategori/[slug] belum ada
 * (PAGE-003), sehingga menu dan laci merender teks biasa tanpa <a>. PAGE-003 mengisinya.
 */
export function categoryPath(_slug: string): string | null {
  return null
}
