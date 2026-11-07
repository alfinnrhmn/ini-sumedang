import type { CategoryPageResponse } from '../../../app/types/article'
import { CATEGORY_PER_PAGE } from '../../../app/config/category'
import { getCategoryPage } from '../../services/articles'
import { isCategoryPageSlug, parsePageParam } from '../../utils/category-page'

// Terpisah dari `/api/articles/*` dan `/api/article/*`. `?halaman=N` = string tunggal `^[1-9][0-9]{0,3}$` (default 1).
// Slug tak valid/tak dikenal (termasuk `berita`), halaman tak valid/melewati batas = 404; halaman 1 kosong = 200.
function notFound() {
  return createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Halaman tidak ditemukan.' })
}

export default defineEventHandler(async (event): Promise<CategoryPageResponse> => {
  const slug = getRouterParam(event, 'slug')
  if (!isCategoryPageSlug(slug)) throw notFound()
  const page = parsePageParam(getQuery(event).halaman)
  if (page === null) throw notFound()
  const now = new Date()
  const result = await getCategoryPage(slug, page, CATEGORY_PER_PAGE, now)
  if (!result) throw notFound()
  return { ...result, now: now.toISOString() }
})
