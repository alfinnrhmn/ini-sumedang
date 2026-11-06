import type { AdsResponse } from '../../app/types/ad'
import { getAds } from '../services/ads'

// Tanpa parameter: iklan terpilih per slot (WordPress, atau `source: 'fixture'` tanpa iklan); query string diabaikan.
export default defineEventHandler(async (): Promise<AdsResponse> => {
  return await getAds()
})
