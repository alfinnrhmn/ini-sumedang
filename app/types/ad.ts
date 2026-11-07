import type { AdSlotName } from '../utils/ad-slots'

/** Iklan yang SUDAH tervalidasi di server: gambar dari host WordPress (https), alt polos, tautan https. */
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

/** Respons `/api/ads`: `fixture` = tanpa WordPress (penampung "Advertisement"); `wordpress` = hanya iklan nyata. */
export interface AdsResponse {
  source: 'fixture' | 'wordpress'
  ads: AdsBySlot
}
