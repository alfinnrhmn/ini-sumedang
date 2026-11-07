import type { AdsResponse } from '../../app/types/ad'
import { selectAds, withDeadline } from '../utils/wp-ads'
import { loadWpAds, validWpBaseUrl } from '../utils/wp-client'
import { wpImageHosts } from '../utils/wp-map'

/** Iklan opsional: render halaman menunggu WordPress paling lama sekian ms (pemuatan lanjut dan mengisi cache). */
const ADS_MAX_WAIT_MS = 2500

/** Daftar mentah terakhir yang berhasil; dipakai bila pemuatan ulang melewati `ADS_MAX_WAIT_MS` (tanpa berkedip). */
let lastLoaded: unknown[] = []

/** Iklan per slot. Tanpa base URL valid = mode fixture (tanpa iklan). Gagal apa pun = `ads: {}` tanpa galat. */
export async function getAds(now: Date = new Date()): Promise<AdsResponse> {
  const base = validWpBaseUrl(useRuntimeConfig().wpBaseUrl)
  if (!base) return { source: 'fixture', ads: {} }
  try {
    const load = loadWpAds(base).then(list => (lastLoaded = list))
    return { source: 'wordpress', ads: selectAds(await withDeadline(load, ADS_MAX_WAIT_MS, lastLoaded), wpImageHosts(base), now) }
  } catch {
    return { source: 'wordpress', ads: {} }
  }
}
