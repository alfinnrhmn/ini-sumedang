import type { SidebarResponse } from '../../../app/types/article'
import { getLatestArticles, getPopularArticles } from '../../services/articles'

// Tanpa parameter: jumlah item tetap (SIDEBAR_COUNT); query string diabaikan.
export default defineEventHandler((): SidebarResponse => {
  const now = new Date()
  return { latest: getLatestArticles(undefined, now), popular: getPopularArticles(undefined, now), now: now.toISOString() }
})
