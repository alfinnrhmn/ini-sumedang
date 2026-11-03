import type { CategoryPageResponse } from '../../../app/types/article'
import { CATEGORY_PER_PAGE } from '../../../app/config/category'
import { getCategoryPage } from '../../services/articles'
import { isValidCategorySlug, parsePageParam } from '../../utils/category-page'

// Halaman kategori (PAGE-003). Path `/api/category/<slug>` (tunggal) sengaja terpisah dari `/api/articles/*` dan `/api/article/*`.
// `?halaman=N` valid = string tunggal `^[1-9][0-9]{0,3}$` (tanpa parameter = 1). Slug tak valid/tak dikenal (hanya 9 kategori resmi),
// halaman tak valid, atau halaman melewati batas = 404 dengan pesan tetap (tanpa mengulang masukan). Halaman 1 kategori kosong
// = 200 dengan `articles` kosong. Tidak ada HTML mentah di respons.
function notFound() {
  return createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Halaman tidak ditemukan.' })
}

export default defineEventHandler((event): CategoryPageResponse => {
  const slug = getRouterParam(event, 'slug')
  if (!isValidCategorySlug(slug)) throw notFound()
  const page = parsePageParam(getQuery(event).halaman)
  if (page === null) throw notFound()
  const now = new Date()
  const result = getCategoryPage(slug, page, CATEGORY_PER_PAGE, now)
  if (!result) throw notFound()
  return { ...result, now: now.toISOString() }
})
