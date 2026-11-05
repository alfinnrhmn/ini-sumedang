import type { ArticleDetailResponse } from '../../../app/types/article'
import { getArticleBySlug, getRelatedArticles } from '../../services/articles'
import { isValidArticleSlug } from '../../utils/article-detail'

// Detail Berita (PAGE-002). Path `/api/article/<slug>` (tunggal) sengaja terpisah dari `/api/articles/*` (daftar).
// Slug divalidasi (pola + panjang); tak valid, tak ada, draft, atau private = 404 dengan pesan tetap (tanpa mengulang
// masukan). Query diabaikan. `bodyHtml` sudah disanitasi di layanan; HTML mentah tidak pernah keluar.
function notFound() {
  return createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Artikel tidak ditemukan.' })
}

export default defineEventHandler(async (event): Promise<ArticleDetailResponse> => {
  const slug = getRouterParam(event, 'slug')
  if (!isValidArticleSlug(slug)) throw notFound()
  const now = new Date()
  const article = await getArticleBySlug(slug, now)
  if (!article) throw notFound()
  return { article, related: await getRelatedArticles(article.id, now), now: now.toISOString() }
})
