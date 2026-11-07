// Pembantu murni halaman kategori; tanpa auto-import Nuxt (impor berekstensi `.ts`) agar bisa diuji dengan `node:test`.
// Logika penyanitasi HTML TIDAK ada di sini.
import { CATEGORY_PAGE_PATTERN, CATEGORY_SLUG_MAX_LENGTH } from '../../app/config/category.ts'
import { HOME_CATEGORY_SLUG } from '../../app/utils/routes.ts'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export interface Pagination {
  page: number
  perPage: number
  total: number
  totalPages: number
}

/** `?halaman=`: tak ada = 1; selain itu STRING TUNGGAL `^[1-9][0-9]{0,3}$`, lainnya (`0`, `01`, ganda, ...) = null. */
export function parsePageParam(value: unknown): number | null {
  if (value === undefined) return 1
  if (typeof value !== 'string' || !CATEGORY_PAGE_PATTERN.test(value)) return null
  return Number(value)
}

/** Slug kategori yang bentuknya wajar: `^[a-z0-9]+(?:-[a-z0-9]+)*$`, 1-60 karakter. Selain string = tidak valid. */
export function isValidCategorySlug(value: unknown): value is string {
  return typeof value === 'string' && value.length <= CATEGORY_SLUG_MAX_LENGTH && SLUG_PATTERN.test(value)
}

/** Jumlah halaman = ceil(total / perPage); total 0 = 0 halaman. */
export function totalPagesOf(total: number, perPage: number): number {
  return total <= 0 ? 0 : Math.ceil(total / perPage)
}

/** Apakah `page` boleh ditampilkan? Halaman 1 selalu (total 0 = kosong netral); >= 2 hanya bila tak lewat akhir. */
export function isPageInRange(page: number, total: number, perPage: number): boolean {
  return page === 1 || (page > 1 && page <= totalPagesOf(total, perPage))
}

/** Metadata paginasi untuk respons API. */
export function buildPagination(page: number, total: number, perPage: number): Pagination {
  return { page, perPage, total, totalPages: totalPagesOf(total, perPage) }
}

/** Irisan item halaman `page` (1-based). */
export function sliceForPage<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage
  return items.slice(start, start + perPage)
}

/** Slug yang punya halaman kategori: bentuk wajar dan bukan Berita (= Beranda; `/kategori/berita` dialihkan 308). */
export function isCategoryPageSlug(value: unknown): value is string {
  return isValidCategorySlug(value) && value !== HOME_CATEGORY_SLUG
}
