import type { CategoryArticlesResponse } from '../../../app/types/article'
import { getArticlesByCategory } from '../../services/articles'
import { parseSectionQuery } from '../../utils/section-query'

export default defineEventHandler(async (event): Promise<CategoryArticlesResponse> => {
  const { category, limit } = parseSectionQuery(getQuery(event))
  const now = new Date()
  return { articles: await getArticlesByCategory(category, limit, now), now: now.toISOString() }
})
