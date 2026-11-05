import type { RecommendedResponse } from '../../../app/types/article'
import { getRecommendedArticles } from '../../services/articles'

export default defineEventHandler(async (): Promise<RecommendedResponse> => {
  const now = new Date()
  return { articles: await getRecommendedArticles(now), now: now.toISOString() }
})
