import { HOME_SECTIONS, SECTION_LIMIT_MAX, SECTION_LIMIT_MIN } from '../../app/config/home'
import type { HomeSectionSlug } from '../../app/config/home'

export interface SectionQuery {
  category: HomeSectionSlug
  limit: number
}

function badRequest() {
  // Pesan tetap dan tanpa detail internal. Catatan: respons error 400 bawaan Nitro tetap memuat `url`
  // permintaan (termasuk query mentah dari pengguna); kita tidak menambah input pengguna ke pesan, tetapi
  // `url` itu bukan hasil kendali kita.
  return createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Parameter tidak valid.' })
}

/**
 * Validasi `category` (hanya slug section yang dikenal, pencocokan persis) dan `limit`
 * (bilangan bulat 1-12, hanya digit). Nilai lain ditolak dengan 400.
 */
export function parseSectionQuery(query: Record<string, unknown>): SectionQuery {
  const { category, limit } = query
  if (typeof category !== 'string' || typeof limit !== 'string') throw badRequest()

  const section = HOME_SECTIONS.find(item => item.slug === category)
  if (!section || !/^[0-9]{1,2}$/.test(limit)) throw badRequest()

  const value = Number(limit)
  if (value < SECTION_LIMIT_MIN || value > SECTION_LIMIT_MAX) throw badRequest()

  return { category: section.slug, limit: value }
}
