import type { SearchResponse } from '../../app/types/article'
import { SEARCH_PER_PAGE } from '../../app/config/search'
import { searchArticles } from '../services/articles'
import { parsePageParam } from '../utils/category-page'
import { normalizeSearchQuery } from '../utils/search-query'

// Pencarian (PAGE-004). `GET /api/search?q=&halaman=N`: `q` = string tunggal 2-100 karakter setelah dinormalisasi (tanpa karakter kontrol;
// lihat `normalizeSearchQuery`), `?halaman=` mengikuti aturan kategori (`^[1-9][0-9]{0,3}$`). `halaman` tak valid atau melewati batas = 404;
// `q` kosong/tidak valid = 400. Semua pesan galat TETAP (tidak pernah memuat masukan). Halaman 1 tanpa hasil = 200 dengan `articles` kosong.
// Hasil 200 memuat `query` (kata kunci ternormalisasi) sebagai data JSON; header nosniff mencegah browser menafsirkannya sebagai HTML.
// Hanya membaca data lewat fungsi layanan (fixture di baliknya); tidak ada tulisan, cookie, atau permintaan keluar.
export default defineEventHandler((event): SearchResponse => {
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  const { q, halaman } = getQuery(event)
  const page = parsePageParam(halaman)
  if (page === null) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Halaman tidak ditemukan.' })
  const query = normalizeSearchQuery(q)
  if (query === null) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Kata kunci tidak valid.' })
  const now = new Date()
  const result = searchArticles(query, page, SEARCH_PER_PAGE, now)
  if (!result) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Halaman tidak ditemukan.' })
  return { ...result, now: now.toISOString() }
})
