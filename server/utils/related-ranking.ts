/**
 * Peringkat Berita Terkait (PAGE-002, PRD §3.8, FR-07). Murni (tanpa auto-import Nuxt) agar bisa diuji dengan `node:test`.
 * Aturan: (1) berbagi tag, urut jumlah tag sama lalu terbaru; (2) lengkapi kategori sama, terbaru dulu;
 * (3) lengkapi terbaru. Tanpa artikel yang sedang dibaca dan tanpa duplikat. Pemanggil hanya memberi artikel `publish`.
 */
export interface RelatedCandidate {
  id: number
  /** ISO 8601 UTC */
  publishedAt: string
  categoryIds: number[]
  tagIds: number[]
}

function countShared(a: number[], b: number[]): number {
  const set = new Set(b)
  return a.filter(item => set.has(item)).length
}

/** Urutan id Berita Terkait (terbaik dulu). Seri diurut id terbesar dulu agar deterministik. */
export function rankRelated(current: RelatedCandidate, candidates: RelatedCandidate[]): number[] {
  const seen = new Set<number>([current.id])
  const pool = candidates.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
  const newest = (a: RelatedCandidate, b: RelatedCandidate) =>
    Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || b.id - a.id

  const byTag = pool
    .map(item => ({ item, shared: countShared(current.tagIds, item.tagIds) }))
    .filter(entry => entry.shared > 0)
    .sort((a, b) => b.shared - a.shared || newest(a.item, b.item))
    .map(entry => entry.item)
  const taken = new Set(byTag.map(item => item.id))

  const byCategory = pool
    .filter(item => !taken.has(item.id) && countShared(current.categoryIds, item.categoryIds) > 0)
    .sort(newest)
  for (const item of byCategory) taken.add(item.id)

  const rest = pool.filter(item => !taken.has(item.id)).sort(newest)
  return [...byTag, ...byCategory, ...rest].map(item => item.id)
}

/** Bagi daftar berperingkat: `sidebarCount` teratas, lalu `bottomCount` berikutnya (tanpa duplikat antar blok). */
export function splitRelated<T>(ranked: T[], sidebarCount: number, bottomCount: number): { sidebar: T[], bottom: T[] } {
  return {
    sidebar: ranked.slice(0, sidebarCount),
    bottom: ranked.slice(sidebarCount, sidebarCount + bottomCount)
  }
}

/**
 * Tiga irisan dari satu daftar berperingkat (Keputusan PM M-1). >= 1024 px: `sidebar` (peringkat 1..sidebarCount) dan
 * `bottom` (berikutnya); tidak ada duplikat antar keduanya. < 1024 px (sidebar tidak tampil): `bottomMobile` =
 * `bottomMobileCount` teratas. Hanya satu pasangan yang terlihat per viewport (CSS), jadi tidak ada duplikat yang terlihat.
 */
export function relatedBlocks<T>(ranked: T[], sidebarCount: number, bottomCount: number, bottomMobileCount: number): { sidebar: T[], bottom: T[], bottomMobile: T[] } {
  return { ...splitRelated(ranked, sidebarCount, bottomCount), bottomMobile: ranked.slice(0, bottomMobileCount) }
}
