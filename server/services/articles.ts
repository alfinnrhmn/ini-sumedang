import type { Article, ArticleCategory, ArticleDetail, ArticleTag, CategoryPageResponse, SearchResponse, VisualTopic } from '../../app/types/article'
import { RELATED_BOTTOM_COUNT, RELATED_BOTTOM_MOBILE_COUNT, RELATED_SIDEBAR_COUNT } from '../../app/config/article'
import { HERO_SLIDE_COUNT, POPULAR_TAG_SLUG, POPULAR_WINDOW_DAYS, SIDEBAR_COUNT } from '../../app/config/home'
import { buildDefaultBody, buildDefaultExcerpt } from '../fixtures/article-content'
import { buildEdgePosts, buildEdgeVisualCategories, buildFigmaPosts, buildFigmaVisualCategories, buildMenuCategories } from '../fixtures/posts'
import type { WpPost } from '../fixtures/posts'
import { hasVisibleContent, readingMinutes, stripTags } from '../utils/article-detail'
import { buildPagination, isPageInRange, sliceForPage } from '../utils/category-page'
import { safeImageUrl } from '../utils/image-url'
import type { RelatedCandidate } from '../utils/related-ranking'
import { rankRelated, relatedBlocks } from '../utils/related-ranking'
import { sanitizeArticleHtml } from '../utils/sanitize-article-html'
import { searchPage } from '../utils/search-query'

const RECOMMENDED_COUNT = 8
// Ruang Visual (HOME-04): induk, jumlah topik, dan jumlah item berthumbnail per topik (1 kartu besar + 3 item = 4 artikel).
const VISUAL_PARENT_SLUG = 'ruang-visual'
const VISUAL_TOPIC_COUNT = 4
const VISUAL_ITEM_COUNT = 3
const DEFAULT_AUTHOR = 'IniSumedang'
const DAY_MS = 24 * 60 * 60 * 1000

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“'
}

/** Dekode entitas HTML pada teks (satu lintasan, tanpa dekode ganda). */
function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10)
      return Number.isFinite(code) && code > 0 && code <= 0x10FFFF ? String.fromCodePoint(code) : match
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match
  })
}

function publishedAtOf(post: WpPost): string {
  return post.date_gmt.endsWith('Z') ? post.date_gmt : `${post.date_gmt}Z`
}

/** Tag ada di grup `wp:term` ke-2 (grup 0 = kategori), seperti `_embed` WordPress. */
function hasTag(post: WpPost, slug: string): boolean {
  return (post._embedded['wp:term'][1] ?? []).some(tag => tag.slug === slug)
}

function mapPost(post: WpPost): Article {
  const media = post._embedded['wp:featuredmedia']?.[0]
  // URL gambar tak aman (HARD-001: skema berbahaya, host di luar daftar) = artikel tanpa gambar, bukan galat.
  const heroUrl = media ? safeImageUrl(media.source_url) : null
  return {
    id: post.id,
    slug: post.slug,
    title: decodeEntities(post.title.rendered),
    publishedAt: publishedAtOf(post),
    categories: (post._embedded['wp:term'][0] ?? []).map(term => ({
      id: term.id,
      slug: term.slug,
      name: decodeEntities(term.name)
    })),
    heroImage: media && heroUrl
      ? {
          url: heroUrl,
          alt: decodeEntities(media.alt_text ?? ''),
          width: media.media_details.width,
          height: media.media_details.height
        }
      : null,
    authorLabel: post._embedded.author?.[0]?.name ?? DEFAULT_AUTHOR
  }
}

/** Set fixture `edge` (kasus buruk) dipilih lewat env FIXTURE_SET. */
function isEdgeSet(): boolean {
  // `process` tidak bertipe di proyek ini (tanpa @types/node); baca env lewat globalThis.
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  return env?.FIXTURE_SET === 'edge'
}

/** Semua post terbit (hanya status `publish`), terbaru dulu, tanpa duplikat id. */
function getPublishedPosts(now: Date): WpPost[] {
  const seen = new Set<number>()
  const posts = isEdgeSet() ? buildEdgePosts(now) : buildFigmaPosts(now)
  return posts
    .filter(post => post.status === 'publish')
    .sort((a, b) => Date.parse(publishedAtOf(b)) - Date.parse(publishedAtOf(a)))
    .filter((post) => {
      if (seen.has(post.id)) return false
      seen.add(post.id)
      return true
    })
}

/** Semua artikel terbit (hanya status `publish`), terbaru dulu, tanpa duplikat id. */
function getPublishedArticles(now: Date): Article[] {
  return getPublishedPosts(now).map(mapPost)
}

/** 8 artikel terbit terbaru, tanpa duplikat. Hanya status `publish`. */
export function getRecommendedArticles(now: Date = new Date()): Article[] {
  return getPublishedArticles(now).slice(0, RECOMMENDED_COUNT)
}

/** `limit` artikel terbit terbaru untuk slide hero Beranda (HOME-07). Hanya status `publish`; sama dengan 4 kartu Rekomendasi pertama (diterima PM). */
export function getHeroArticles(limit: number = HERO_SLIDE_COUNT, now: Date = new Date()): Article[] {
  return getPublishedArticles(now).slice(0, limit)
}

/** `limit` artikel terbit terbaru di kategori `slug` (kategori kosong atau tak dikenal: array kosong). */
export function getArticlesByCategory(slug: string, limit: number, now: Date = new Date()): Article[] {
  return getPublishedArticles(now)
    .filter(article => article.categories.some(category => category.slug === slug))
    .slice(0, limit)
}

/** `limit` artikel terbit terbaru (kolom samping, tab Terbaru). Hanya status `publish`. */
export function getLatestArticles(limit: number = SIDEBAR_COUNT, now: Date = new Date()): Article[] {
  return getPublishedArticles(now).slice(0, limit)
}

/**
 * `limit` artikel terbit bertag `POPULAR_TAG_SLUG` yang terbit dalam `POPULAR_WINDOW_DAYS` hari terakhir
 * (umur tepat sama dengan jendela masuk, lebih tua tidak), terbaru dulu (kolom samping, tab Terpopuler).
 * Tidak ada hasil: array kosong (pemanggil menyembunyikan tab; jangan diisi "terbaru"). Hanya status `publish`.
 */
export function getPopularArticles(limit: number = SIDEBAR_COUNT, now: Date = new Date()): Article[] {
  const earliest = now.getTime() - POPULAR_WINDOW_DAYS * DAY_MS
  return getPublishedPosts(now)
    .filter(post => hasTag(post, POPULAR_TAG_SLUG) && Date.parse(publishedAtOf(post)) >= earliest)
    .slice(0, limit)
    .map(mapPost)
}

/**
 * Ruang Visual (HOME-04): topik = kategori anak dari kategori induk `ruang-visual`; ambil `VISUAL_TOPIC_COUNT` anak
 * non-kosong yang paling baru dibuat (id terbesar dulu, bukan tanggal artikel). Anak tanpa artikel terbit dilewati
 * (draft/private tidak dihitung, setara `hide_empty=true`). Tiap topik: kartu besar = artikel terbaru topik,
 * `items` = sampai 3 artikel berikutnya (lebih sedikit bila artikel kurang). Induk tak ada: array kosong.
 */
export function getVisualTopics(now: Date = new Date()): VisualTopic[] {
  const categories = isEdgeSet() ? buildEdgeVisualCategories() : buildFigmaVisualCategories()
  const parent = categories.find(category => category.slug === VISUAL_PARENT_SLUG && !category.parent)
  if (!parent) return []

  const published = getPublishedArticles(now)
  const topics: VisualTopic[] = []
  const children = categories.filter(category => category.parent === parent.id).sort((a, b) => b.id - a.id)
  for (const child of children) {
    const [lead, ...rest] = published.filter(article => article.categories.some(category => category.id === child.id))
    if (!lead) continue
    topics.push({
      topic: { id: child.id, slug: child.slug, name: decodeEntities(child.name) },
      lead,
      items: rest.slice(0, VISUAL_ITEM_COUNT)
    })
    if (topics.length === VISUAL_TOPIC_COUNT) break
  }
  return topics
}

/**
 * Kategori menu header dan laci (HOME-06): 9 kategori resmi sesuai urutan menu, dengan nama terdekode
 * ("Bisnis & Teknologi"). Tidak bergantung pada artikel; kategori anak Ruang Visual tidak termasuk.
 */
export function getCategories(): ArticleCategory[] {
  return buildMenuCategories().map(term => ({ id: term.id, slug: term.slug, name: decodeEntities(term.name) }))
}

/**
 * Halaman kategori (PAGE-003): hanya 9 kategori resmi dari `getCategories()` (anak Ruang Visual dan slug lain = null),
 * hanya status `publish`, terbaru dulu. `page` melewati halaman terakhir = null; halaman 1 kategori kosong tetap
 * dikembalikan (artikel kosong, `totalPages` 0). Tidak ada `body`/HTML mentah di hasilnya.
 */
export function getCategoryPage(slug: string, page: number, perPage: number, now: Date = new Date()): Omit<CategoryPageResponse, 'now'> | null {
  const category = getCategories().find(item => item.slug === slug)
  if (!category) return null
  const all = getPublishedArticles(now).filter(article => article.categories.some(item => item.slug === slug))
  if (!isPageInRange(page, all.length, perPage)) return null
  return { category, articles: sliceForPage(all, page, perPage), pagination: buildPagination(page, all.length, perPage) }
}

/** Ringkasan teks polos sebuah post (tanpa HTML, entitas didekode); dasar pencarian dan `ArticleDetail.excerpt`. */
function excerptTextOf(post: WpPost): string {
  return decodeEntities(stripTags(post.excerpt?.rendered ?? buildDefaultExcerpt(post.id, post.title.rendered)))
}

/**
 * Pencarian (PAGE-004, Keputusan PM 3): hanya status `publish`. `query` dinormalisasi (`normalizeSearchQuery`); tidak valid = tanpa hasil.
 * Semua kata harus muncul di judul atau ringkasan (tanpa membedakan huruf besar/kecil); urutan = jumlah kata di judul terbanyak dulu,
 * lalu terbaru. `page` melewati halaman terakhir = null; halaman 1 tanpa hasil tetap dikembalikan (artikel kosong, `totalPages` 0).
 * `query` pada hasil = kata kunci ternormalisasi (kosong bila tidak valid). Tidak ada `body`/HTML mentah di hasilnya.
 */
export function searchArticles(query: string, page: number, perPage: number, now: Date = new Date()): Omit<SearchResponse, 'now'> | null {
  const candidates = getPublishedPosts(now).map(post => ({
    post,
    id: post.id,
    publishedAt: publishedAtOf(post),
    title: decodeEntities(post.title.rendered),
    excerpt: excerptTextOf(post)
  }))
  const result = searchPage(candidates, query, page, perPage)
  if (!result) return null
  return { query: result.query, articles: result.items.map(item => mapPost(item.post)), pagination: result.pagination }
}

function mapTags(post: WpPost): ArticleTag[] {
  return (post._embedded['wp:term'][1] ?? []).map(tag => ({ id: tag.id, slug: tag.slug, name: decodeEntities(tag.name) }))
}

/**
 * Detail artikel (PAGE-002): `Article` + isi. `bodyHtml` = HTML CMS yang SUDAH disanitasi (`sanitizeBodyHtml`); HTML mentah
 * (`content.rendered`) tidak pernah keluar dari fungsi ini. Ringkasan dan kredit foto dikeluarkan sebagai teks polos.
 */
function mapDetail(post: WpPost): ArticleDetail {
  // Isi tanpa teks, gambar, atau embed (hanya spasi/tag kosong) dianggap kosong: '' agar halaman menampilkan pesan netral.
  const sanitized = sanitizeBodyHtml(post.content?.rendered ?? buildDefaultBody(post.id, post.title.rendered))
  const bodyHtml = hasVisibleContent(sanitized) ? sanitized : ''
  return {
    ...mapPost(post),
    excerpt: excerptTextOf(post),
    bodyHtml,
    tags: mapTags(post),
    photoCredit: decodeEntities(stripTags(post._embedded['wp:featuredmedia']?.[0]?.caption?.rendered ?? '')),
    readingMinutes: readingMinutes(bodyHtml)
  }
}

/** Artikel terbit dengan `slug` persis (pemanggil sudah memvalidasi bentuk slug); draft/private/tak ada: null. */
export function getArticleBySlug(slug: string, now: Date = new Date()): ArticleDetail | null {
  const post = getPublishedPosts(now).find(item => item.slug === slug)
  return post ? mapDetail(post) : null
}

function toCandidate(post: WpPost): RelatedCandidate {
  const [categories = [], tags = []] = post._embedded['wp:term']
  return { id: post.id, publishedAt: publishedAtOf(post), categoryIds: categories.map(term => term.id), tagIds: tags.map(term => term.id) }
}

/**
 * Berita Terkait (PRD §3.8, FR-07): satu daftar berperingkat (tag sama, lalu kategori sama, lalu terbaru) dari artikel
 * terbit selain `articleId`; sidebar = `RELATED_SIDEBAR_COUNT` teratas, blok bawah = `RELATED_BOTTOM_COUNT` berikutnya (>= 1024 px),
 * `bottomMobile` = `RELATED_BOTTOM_MOBILE_COUNT` teratas (< 1024 px, tanpa sidebar; CSS memilih satu). Artikel tak ada atau tak terbit: semua kosong.
 */
export function getRelatedArticles(articleId: number, now: Date = new Date()): { sidebar: Article[], bottom: Article[], bottomMobile: Article[] } {
  const posts = getPublishedPosts(now)
  const current = posts.find(post => post.id === articleId)
  if (!current) return { sidebar: [], bottom: [], bottomMobile: [] }
  const byId = new Map(posts.map(post => [post.id, post]))
  const ranked = rankRelated(toCandidate(current), posts.map(toCandidate))
  const { sidebar, bottom, bottomMobile } = relatedBlocks(ranked, RELATED_SIDEBAR_COUNT, RELATED_BOTTOM_COUNT, RELATED_BOTTOM_MOBILE_COUNT)
  const toArticle = (id: number): Article => mapPost(byId.get(id) as WpPost)
  return { sidebar: sidebar.map(toArticle), bottom: bottom.map(toArticle), bottomMobile: bottomMobile.map(toArticle) }
}

/**
 * Titik pemanggilan sanitasi isi artikel (SANITIZE-001). `body` HTML dari CMS/fixture WAJIB lewat fungsi ini sebelum
 * keluar sebagai tipe domain atau dirender (PAGE-002 memanggilnya saat menambah `body`). Satu-satunya jalur HTML CMS.
 * Allowlist: server/utils/sanitize-config.ts. Tidak pernah melempar; masukan tak valid atau terlalu besar: ''.
 */
export function sanitizeBodyHtml(html: unknown): string {
  return sanitizeArticleHtml(html)
}
