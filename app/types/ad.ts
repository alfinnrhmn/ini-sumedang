import type { AdSlotName } from '../utils/ad-slots'

/**
 * Iklan yang SUDAH tervalidasi di server (ADS-002): gambar dari host WordPress (https), tautan https, teks alt polos.
 * Hanya field ini yang sampai ke klien; tidak ada HTML dari CMS.
 */
export interface AdItem {
  id: number
  image: { url: string }
  /** Teks alt gambar (teks polos; dirender sebagai teks, di-escape oleh Vue). */
  alt: string
  /** Tujuan klik; selalu `https://` valid tanpa userinfo. */
  href: string
}

/** Satu iklan terpilih per slot; slot tanpa iklan tidak ada di objek. */
export type AdsBySlot = Partial<Record<AdSlotName, AdItem>>

/**
 * Respons `/api/ads`. `source: 'fixture'` = mode tanpa WordPress (slot menampilkan penampung "Advertisement" seperti sebelumnya);
 * `'wordpress'` = hanya iklan nyata, slot tanpa iklan tidak dirender.
 */
export interface AdsResponse {
  source: 'fixture' | 'wordpress'
  ads: AdsBySlot
}
