// Pembantu murni pencarian; tanpa auto-import Nuxt (impor berekstensi `.ts`) agar bisa diuji dengan `node:test`.
// Normalisasi `q` ada di `app/config/search.ts` (juga dipakai klien); di sini: pemecahan kata dan penilaian kecocokan.
import { normalizeSearchQuery } from '../../app/config/search.ts'
import type { Pagination } from './category-page.ts'
import { buildPagination, isPageInRange, sliceForPage } from './category-page.ts'

export { normalizeSearchQuery }

/** Kata dari `q` ternormalisasi: dipecah pada spasi, huruf kecil, tanpa duplikat. `q` tak valid = tanpa kata. */
export function searchTerms(query: string): string[] {
  const normalized = normalizeSearchQuery(query)
  if (normalized === null) return []
  return [...new Set(normalized.toLowerCase().split(' '))]
}

// Nilai kecocokan: semua kata harus muncul (tanpa beda huruf) di judul ATAU ringkasan; `null` = tidak cocok, selain itu
// jumlah kata di JUDUL (pemanggil mengurutkan turun, lalu terbaru). Tanpa kata = `null`.
export function searchScore(terms: readonly string[], title: string, excerpt: string): number | null {
  if (terms.length === 0) return null
  const titleText = title.toLowerCase()
  const bodyText = `${titleText} ${excerpt.toLowerCase()}`
  let titleHits = 0
  for (const term of terms) {
    if (!bodyText.includes(term)) return null
    if (titleText.includes(term)) titleHits++
  }
  return titleHits
}

/** Urutan hasil: kata di judul terbanyak, lalu terbaru (`publishedAt`), lalu `id` terbesar. Negatif: `a` lebih dulu. */
export function compareSearchHits(
  a: { score: number, publishedAt: string, id: number },
  b: { score: number, publishedAt: string, id: number }
): number {
  return b.score - a.score || Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || b.id - a.id
}

/** Kandidat pencarian: teks polos judul dan ringkasan (entitas sudah didekode, tanpa HTML) beserta penanda urutan. */
export interface SearchCandidate {
  id: number
  /** ISO 8601 UTC */
  publishedAt: string
  title: string
  excerpt: string
}

// Inti `searchArticles` (murni): hasil yang cocok untuk `query` dalam urutan akhir, dipotong ke halaman `page`.
// `query` tak valid = tanpa hasil; `page` lewat batas = null; halaman 1 tanpa hasil tetap dikembalikan.
export function searchPage<T extends SearchCandidate>(
  candidates: readonly T[], query: string, page: number, perPage: number
): { query: string, items: T[], pagination: Pagination } | null {
  const terms = searchTerms(query)
  const hits = candidates
    .flatMap((candidate) => {
      const score = searchScore(terms, candidate.title, candidate.excerpt)
      return score === null ? [] : [{ candidate, score, publishedAt: candidate.publishedAt, id: candidate.id }]
    })
    .sort(compareSearchHits)
  if (!isPageInRange(page, hits.length, perPage)) return null
  return {
    query: normalizeSearchQuery(query) ?? '',
    items: sliceForPage(hits, page, perPage).map(hit => hit.candidate),
    pagination: buildPagination(page, hits.length, perPage)
  }
}
