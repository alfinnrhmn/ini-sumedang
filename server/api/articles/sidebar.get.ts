import type { SidebarResponse } from '../../../app/types/article'
import { getLatestArticles, getPopularArticles } from '../../services/articles'

// Tanpa parameter: jumlah item tetap (SIDEBAR_COUNT); query string diabaikan.
export default defineEventHandler(async (): Promise<SidebarResponse> => {
  const now = new Date()
  return { latest: await getLatestArticles(undefined, now), popular: await getPopularArticles(undefined, now), now: now.toISOString() }
})
