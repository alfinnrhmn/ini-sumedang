import type { Article } from '../types/article'

/** Tujuan tautan artikel `/berita/<slug>`, satu-satunya tempat bentuk URL artikel; `slug` di-encode. */
export function articlePath(article: Pick<Article, 'slug'>): string {
  return `/berita/${encodeURIComponent(article.slug)}`
}

/** Nama rute Nuxt untuk `app/pages/kategori/[slug].vue`. */
export const CATEGORY_ROUTE_NAME = 'kategori-slug'

/** Nama rute Nuxt untuk Beranda (`app/pages/index.vue`). */
export const HOME_ROUTE_NAME = 'index'

/** Slug kategori "Berita": Beranda adalah kategori ini, jadi `/kategori/berita` dialihkan 308 ke `/`. */
export const HOME_CATEGORY_SLUG = 'berita'

/** Tujuan halaman kategori `/kategori/<slug>`; kategori Berita = `/`. Satu-satunya tempat bentuk URL kategori. */
export function categoryPath(slug: string): string {
  return slug === HOME_CATEGORY_SLUG ? '/' : `/kategori/${encodeURIComponent(slug)}`
}

// `categoryPath(slug)` bila `slug` ada di `categories` (lewat `useCategories()`), selain itu `null`: kategori di luar
// daftar (mis. `uncategorized`, anak Ruang Visual) tetap teks biasa tanpa `<a>`. Pencocokan persis.
export function categoryLink(slug: string, categories: readonly { slug: string }[]): string | null {
  return categories.some(category => category.slug === slug) ? categoryPath(slug) : null
}

/** Halaman N kategori: halaman 1 = URL kanonis tanpa parameter; N > 1 = `?halaman=N`. Kategori Berita selalu `/`. */
export function categoryPagePath(slug: string, page: number): string {
  return page > 1 && slug !== HOME_CATEGORY_SLUG ? `${categoryPath(slug)}?halaman=${page}` : categoryPath(slug)
}

// Apakah rute sekarang halaman kategori `slug` (semua halaman paginasinya)? Berbasis nama rute dan parameter slug,
// bukan `fullPath` (dasar `aria-current="page"`). Kategori Berita = Beranda: aktif di rute Beranda.
export function isCategoryRoute(route: { name?: unknown, params: Record<string, unknown> }, slug: string): boolean {
  if (slug === HOME_CATEGORY_SLUG) return route.name === HOME_ROUTE_NAME
  return route.name === CATEGORY_ROUTE_NAME && route.params.slug === slug
}

/** Nama rute Nuxt untuk `app/pages/cari.vue`. */
export const SEARCH_ROUTE_NAME = 'cari'

// Tujuan hasil pencarian `/cari?q=<kata kunci>` (+ `&halaman=N` bila N > 1); `q` di-encode penuh agar tak jadi path
// atau parameter lain. Tanpa `q` = `/cari`. Satu-satunya tempat bentuk URL pencarian.
export function searchPath(query: string, page = 1): string {
  if (query === '') return '/cari'
  return `/cari?q=${encodeURIComponent(query)}${page > 1 ? `&halaman=${page}` : ''}`
}

/** "Lebih banyak": gabungkan artikel halaman berikutnya tanpa duplikat `id`, urutan terjaga, masukan tak diubah. */
export function mergeArticles<T extends { id: number }>(existing: readonly T[], incoming: readonly T[]): T[] {
  const seen = new Set(existing.map(item => item.id))
  const merged = [...existing]
  for (const item of incoming) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    merged.push(item)
  }
  return merged
}
