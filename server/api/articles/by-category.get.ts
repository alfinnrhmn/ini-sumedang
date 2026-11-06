import type { CategoryArticlesResponse } from '../../../app/types/article'
import { getArticlesByCategory, getCategories } from '../../services/articles'
import { parseSectionQuery } from '../../utils/section-query'

// Slug kategori mana pun dari daftar kategori (`getCategories()`); slug lain atau limit di luar 1-12 = 400.
export default defineEventHandler(async (event): Promise<CategoryArticlesResponse> => {
  const { category, limit } = parseSectionQuery(getQuery(event), (await getCategories()).map(item => item.slug))
  const now = new Date()
  return { articles: await getArticlesByCategory(category, limit, now), now: now.toISOString() }
})
