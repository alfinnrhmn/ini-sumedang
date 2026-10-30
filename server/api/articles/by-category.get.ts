import type { CategoryArticlesResponse } from '../../../app/types/article'
import { getArticlesByCategory } from '../../services/articles'
import { parseSectionQuery } from '../../utils/section-query'

export default defineEventHandler((event): CategoryArticlesResponse => {
  const { category, limit } = parseSectionQuery(getQuery(event))
  const now = new Date()
  return { articles: getArticlesByCategory(category, limit, now), now: now.toISOString() }
})
