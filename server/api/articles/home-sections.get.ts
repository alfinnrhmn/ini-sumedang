import type { HomeSectionsResponse } from '../../../app/types/article'
import { getHomeSections } from '../../services/articles'

// Section kategori Beranda: tanpa parameter; jumlah section dan kartu tetap (HOME_SECTION_*); query diabaikan.
export default defineEventHandler(async (): Promise<HomeSectionsResponse> => {
  const now = new Date()
  return { sections: await getHomeSections(now), now: now.toISOString() }
})
