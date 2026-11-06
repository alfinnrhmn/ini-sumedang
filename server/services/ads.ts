import type { AdsResponse } from '../../app/types/ad'
import { selectAds, withDeadline } from '../utils/wp-ads'
import { loadWpAds, validWpBaseUrl } from '../utils/wp-client'
import { wpImageHosts } from '../utils/wp-map'

/** Iklan bersifat opsional: render halaman menunggu WordPress paling lama sekian ms (pemuatan terus berjalan dan mengisi cache). */
const ADS_MAX_WAIT_MS = 2500

/** Daftar mentah terakhir yang berhasil dimuat; dipakai bila pemuatan ulang melewati `ADS_MAX_WAIT_MS` (iklan tidak berkedip saat WordPress lambat). */
let lastLoaded: unknown[] = []

/**
 * Iklan per slot. Tanpa base URL WordPress yang valid = mode fixture (`source: 'fixture'`, tanpa iklan; `AdSlot` menampilkan penampung). Mode WordPress: satu iklan layak per slot.
 * Gagal apa pun (WordPress mati/lambat, post type `iklan` belum ada, JSON rusak) = `ads: {}` TANPA galat agar halaman tidak ikut gagal; alasannya sudah dicatat klien WordPress (hanya kode singkat, tanpa URL).
 */
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
