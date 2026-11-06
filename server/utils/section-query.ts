/**
 * Pembantu section kategori Beranda (HOME-02, WP-002). Impor berekstensi `.ts` (tanpa auto-import Nuxt pada tingkat modul) agar bagian murninya
 * bisa diuji dengan `node:test`; `createError` hanya dipanggil di dalam `parseSectionQuery` (auto-import Nitro).
 */
import type { ArticleCategory } from '../../app/types/article'
import { HOME_SECTIONS, HOME_SECTION_MAX, SECTION_LIMIT_MAX, SECTION_LIMIT_MIN } from '../../app/config/home.ts'
import type { HomeSectionPreference } from '../../app/config/home.ts'
import { HOME_CATEGORY_SLUG } from '../../app/utils/routes.ts'

export interface SectionQuery {
  category: string
  limit: number
}

function badRequest() {
  // Pesan tetap dan tanpa detail internal. Catatan: respons error 400 bawaan Nitro tetap memuat `url`
  // permintaan (termasuk query mentah dari pengguna); kita tidak menambah input pengguna ke pesan, tetapi
  // `url` itu bukan hasil kendali kita.
  return createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Parameter tidak valid.' })
}

/**
 * Validasi `category` (hanya slug yang ada di daftar kategori `knownSlugs` = `getCategories()`, pencocokan persis; WP-002) dan `limit`
 * (bilangan bulat 1-12, hanya digit). Nilai lain ditolak dengan 400.
 */
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

/**
 * Pilih section kategori Beranda (WP-002, Keputusan PM 3). `categories` = daftar kategori situs (urutan menu), `nonEmptySlugs` = slug kategori
 * yang punya >= 1 artikel terbit. Isi dulu menurut urutan `preference` (slug yang ada di daftar dan tak kosong; judul konfigurasi), lalu kategori
 * lain yang tak kosong menurut urutan daftar (judul = nama WordPress; kategori Berita = Beranda dilewati), maksimum `max` section. Murni.
 */
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
