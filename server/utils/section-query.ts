// Pembantu section kategori Beranda. Impor berekstensi `.ts` agar bagian murninya bisa diuji dengan `node:test`;
// `createError` hanya dipanggil di dalam `parseSectionQuery` (auto-import Nitro).
import type { ArticleCategory } from '../../app/types/article'
import { HOME_SECTIONS, HOME_SECTION_MAX, SECTION_LIMIT_MAX, SECTION_LIMIT_MIN } from '../../app/config/home.ts'
import type { HomeSectionPreference } from '../../app/config/home.ts'
import { HOME_CATEGORY_SLUG } from '../../app/utils/routes.ts'

export interface SectionQuery {
  category: string
  limit: number
}

function badRequest() {
  // Pesan tetap tanpa detail internal. Respons 400 bawaan Nitro memuat `url` permintaan (query mentah pengguna).
  return createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Parameter tidak valid.' })
}

/** Validasi `category` (slug di `knownSlugs`, cocok persis) dan `limit` (bilangan bulat 1-12, digit saja); else 400. */
export function parseSectionQuery(query: Record<string, unknown>, knownSlugs: readonly string[]): SectionQuery {
  const { category, limit } = query
  if (typeof category !== 'string' || typeof limit !== 'string') throw badRequest()

  if (!knownSlugs.includes(category) || !/^[0-9]{1,2}$/.test(limit)) throw badRequest()

  const value = Number(limit)
  if (value < SECTION_LIMIT_MIN || value > SECTION_LIMIT_MAX) throw badRequest()

  return { category, limit: value }
}

export interface HomeSectionPick {
  slug: string
  /** Judul tampil: judul konfigurasi bila slug ada di preferensi, jika tidak nama kategori WordPress. */
  title: string
}

// Pilih section Beranda: kategori tak kosong menurut `preference`, lalu urutan daftar (Berita dilewati), maks `max`.
// `categories` = daftar kategori situs (urutan menu), `nonEmptySlugs` = slug dengan >= 1 artikel terbit. Murni.
export function pickHomeSections(
  categories: readonly ArticleCategory[],
  nonEmptySlugs: ReadonlySet<string>,
  preference: readonly HomeSectionPreference[] = HOME_SECTIONS,
  max: number = HOME_SECTION_MAX
): HomeSectionPick[] {
  const picked: HomeSectionPick[] = []
  const used = new Set<string>()
  const add = (slug: string, title: string) => {
    if (picked.length >= max || used.has(slug)) return
    used.add(slug)
    picked.push({ slug, title })
  }
  for (const wanted of preference) {
    if (categories.some(category => category.slug === wanted.slug) && nonEmptySlugs.has(wanted.slug)) add(wanted.slug, wanted.title)
  }
  for (const category of categories) {
    if (category.slug !== HOME_CATEGORY_SLUG && nonEmptySlugs.has(category.slug)) add(category.slug, category.name)
  }
  return picked
}
