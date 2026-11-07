import type { SearchResponse } from '../../app/types/article'
import { SEARCH_PER_PAGE } from '../../app/config/search'
import { searchArticles } from '../services/articles'
import { parsePageParam } from '../utils/category-page'
import { normalizeSearchQuery } from '../utils/search-query'

// `q` 2-100 karakter ternormalisasi (`normalizeSearchQuery`); `halaman` tak valid = 404, `q` tak valid = 400.
// Pesan galat tetap. Header nosniff mencegah JSON dibaca sebagai HTML. Hanya baca (WordPress gagal = 502).
export default defineEventHandler(async (event): Promise<SearchResponse> => {
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  const { q, halaman } = getQuery(event)
  const page = parsePageParam(halaman)
  if (page === null) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Halaman tidak ditemukan.' })
  const query = normalizeSearchQuery(q)
  if (query === null) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Kata kunci tidak valid.' })
  const now = new Date()
  const result = await searchArticles(query, page, SEARCH_PER_PAGE, now)
  if (!result) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Halaman tidak ditemukan.' })
  return { ...result, now: now.toISOString() }
})
