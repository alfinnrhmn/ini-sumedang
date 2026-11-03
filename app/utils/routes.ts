import type { Article } from '../types/article'
import { OFFICIAL_CATEGORY_SLUGS } from '../config/category.ts'

/**
 * Tujuan tautan artikel (PAGE-002): `/berita/<slug>`. Satu-satunya tempat bentuk URL artikel; kartu, breadcrumb,
 * dan URL kanonis memakai fungsi ini. `slug` dari data sudah divalidasi di server, tetapi tetap di-encode agar
 * karakter tak terduga tidak pernah menjadi bagian path.
 */
export function articlePath(article: Pick<Article, 'slug'>): string {
  return `/berita/${encodeURIComponent(article.slug)}`
}

/** Nama rute Nuxt untuk `app/pages/kategori/[slug].vue`. */
export const CATEGORY_ROUTE_NAME = 'kategori-slug'

/** Nama rute Nuxt untuk Beranda (`app/pages/index.vue`). */
export const HOME_ROUTE_NAME = 'index'

/**
 * Slug kategori "Berita" (E1, evaluasi pemilik): Beranda adalah kategori Berita, jadi kategori ini tidak punya halaman
 * `/kategori/berita` (dialihkan 308 ke `/`) dan semua tautannya menuju `/`. Slug tetap kategori resmi untuk data.
 */
export const HOME_CATEGORY_SLUG = 'berita'

/**
 * Tujuan halaman kategori (PAGE-003): `/kategori/<slug>`; kategori Berita = `/` (E1). Satu-satunya tempat bentuk URL kategori;
 * menu, laci, footer, label kartu, breadcrumb, dan URL kanonis memakai fungsi ini. Murni bentuk URL: tidak memeriksa apakah kategori ada.
 */
export function categoryPath(slug: string): string {
  return slug === HOME_CATEGORY_SLUG ? '/' : `/kategori/${encodeURIComponent(slug)}`
}

/**
 * Tujuan tautan untuk nama kategori yang tampil di UI: `categoryPath(slug)` bila `slug` kategori resmi (punya halaman),
 * selain itu `null` (kategori non-resmi, mis. anak Ruang Visual, tetap teks biasa tanpa `<a>`).
 */
export function categoryLink(slug: string): string | null {
  return OFFICIAL_CATEGORY_SLUGS.includes(slug) ? categoryPath(slug) : null
}

/** Halaman N kategori: halaman 1 = URL kanonis tanpa parameter; N > 1 = `?halaman=N`. Kategori Berita tidak berhalaman (selalu `/`). */
export function categoryPagePath(slug: string, page: number): string {
  return page > 1 && slug !== HOME_CATEGORY_SLUG ? `${categoryPath(slug)}?halaman=${page}` : categoryPath(slug)
}

/**
 * Apakah rute sekarang adalah halaman kategori `slug` (semua halaman paginasinya)? Berbasis nama rute dan parameter slug,
 * bukan `fullPath`, sehingga `?halaman=2` tetap dihitung kategori yang sama (dasar `aria-current="page"`).
 * Kategori Berita = Beranda (E1): aktif di rute Beranda dan tidak pernah di `/kategori/<slug>`.
 */
export function isCategoryRoute(route: { name?: unknown, params: Record<string, unknown> }, slug: string): boolean {
  if (slug === HOME_CATEGORY_SLUG) return route.name === HOME_ROUTE_NAME
  return route.name === CATEGORY_ROUTE_NAME && route.params.slug === slug
}

/**
 * "Lebih banyak" (UX-001 Keputusan PM 3): gabungkan artikel halaman berikutnya ke daftar yang sudah tampil, tanpa duplikat berdasarkan `id`
 * (juga di dalam `incoming` sendiri). Urutan terjaga (yang lama dulu, yang baru di bawah); tidak mengubah masukan. Murni agar bisa diuji.
 */
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
