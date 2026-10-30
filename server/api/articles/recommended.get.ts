import type { RecommendedResponse } from '../../../app/types/article'
import { getRecommendedArticles } from '../../services/articles'

export default defineEventHandler((): RecommendedResponse => {
  const now = new Date()
  return { articles: getRecommendedArticles(now), now: now.toISOString() }
})
