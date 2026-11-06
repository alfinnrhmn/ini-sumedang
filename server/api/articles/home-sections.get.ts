import type { HomeSectionsResponse } from '../../../app/types/article'
import { getHomeSections } from '../../services/articles'

// Section kategori Beranda: tanpa parameter; jumlah section dan kartu tetap (HOME_SECTION_MAX, HOME_SECTION_ARTICLE_COUNT). Query string diabaikan.
export default defineEventHandler(async (): Promise<HomeSectionsResponse> => {
  const now = new Date()
  return { sections: await getHomeSections(now), now: now.toISOString() }
})
