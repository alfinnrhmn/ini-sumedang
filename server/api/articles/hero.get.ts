import type { HeroResponse } from '../../../app/types/article'
import { getHeroArticles } from '../../services/articles'

// Tanpa parameter: jumlah slide tetap (HERO_SLIDE_COUNT); query string diabaikan.
export default defineEventHandler(async (): Promise<HeroResponse> => {
  const now = new Date()
  return { articles: await getHeroArticles(undefined, now), now: now.toISOString() }
})
