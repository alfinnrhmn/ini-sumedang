import type { Article, ArticleCategory, ArticleDetail, ArticleTag, CategoryPageResponse, HomeSection, SearchResponse, VisualTopic } from '../../app/types/article'
import { VISUAL_PARENT_SLUG } from '../../app/config/category'
import { RELATED_BOTTOM_COUNT, RELATED_BOTTOM_MOBILE_COUNT, RELATED_SIDEBAR_COUNT } from '../../app/config/article'
import { HERO_SLIDE_COUNT, HOME_SECTION_ARTICLE_COUNT, POPULAR_TAG_SLUG, POPULAR_WINDOW_DAYS, SIDEBAR_COUNT } from '../../app/config/home'
import { buildDefaultBody, buildDefaultExcerpt } from '../fixtures/article-content'
import { buildEdgePosts, buildEdgeVisualCategories, buildFigmaPosts, buildFigmaVisualCategories, buildMenuCategories } from '../fixtures/posts'
import type { WpPost } from '../fixtures/posts'
import { hasVisibleContent, readingMinutes, stripTags } from '../utils/article-detail'
import { buildPagination, isPageInRange, sliceForPage } from '../utils/category-page'
import type { RelatedCandidate } from '../utils/related-ranking'
import { rankRelated, relatedBlocks } from '../utils/related-ranking'
import { createArticleSanitizer, sanitizeArticleHtml } from '../utils/sanitize-article-html'
import { IMAGE_ALLOWED_HOSTS } from '../utils/sanitize-config'
import { pickHomeSections } from '../utils/section-query'
import { searchPage } from '../utils/search-query'
import { WP_UNAVAILABLE_MESSAGE, WpUnavailableError, loadWpCategories, loadWpPosts, validWpBaseUrl } from '../utils/wp-client'
import { decodeEntities, excerptText, mapPost, pickWordPressCategories, publishedAtOf, wpImageHosts } from '../utils/wp-map'

const RECOMMENDED_COUNT = 8
// Ruang Visual: jumlah topik dan item berthumbnail per topik (1 kartu besar + 3 item). Induk: `VISUAL_PARENT_SLUG`.
const VISUAL_TOPIC_COUNT = 4
const VISUAL_ITEM_COUNT = 3
const DAY_MS = 24 * 60 * 60 * 1000

/** Tag ada di grup `wp:term` ke-2 (grup 0 = kategori), seperti `_embed` WordPress. */
function hasTag(post: WpPost, slug: string): boolean {
  return (post._embedded['wp:term'][1] ?? []).some(tag => tag.slug === slug)
}

/** Set fixture `edge` (kasus buruk) dipilih lewat env FIXTURE_SET. */
function isEdgeSet(): boolean {
  // `process` tidak bertipe di proyek ini (tanpa @types/node); baca env lewat globalThis.
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  return env?.FIXTURE_SET === 'edge'
}

/** Base URL WordPress dari `NUXT_WP_BASE_URL` (privat); kosong/tidak valid = `null` = fixture. Dibaca per panggilan. */
function wpBase(): string | null {
  return validWpBaseUrl(useRuntimeConfig().wpBaseUrl)
}

/** Host gambar tambahan = host WordPress dari base URL (satu-satunya host https di luar `IMAGE_ALLOWED_HOSTS`). */
function imageHosts(): readonly string[] {
  const base = wpBase()
  return base ? wpImageHosts(base) : []
}

/** Gagal memuat dari WordPress = 502 pesan tetap tanpa stack/path/URL/env; `reason`/`detail` hanya di mode dev. */
async function fromWordPress<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load()
  } catch (error) {
    if (error instanceof WpUnavailableError) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Bad Gateway',
        message: WP_UNAVAILABLE_MESSAGE,
        ...(import.meta.dev ? { data: { reason: error.reason, detail: error.detail } } : {})
      })
    }
    throw error
  }
}

/** Semua post `publish`, terbaru dulu, tanpa duplikat id. Sumber: WordPress bila base URL valid, jika tidak fixture. */
async function getPublishedPosts(now: Date): Promise<WpPost[]> {
  const seen = new Set<number>()
  const base = wpBase()
  const posts = base ? await fromWordPress(() => loadWpPosts(base)) : (isEdgeSet() ? buildEdgePosts(now) : buildFigmaPosts(now))
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
async function getPublishedArticles(now: Date): Promise<Article[]> {
  const hosts = imageHosts()
  return (await getPublishedPosts(now)).map(post => mapPost(post, hosts))
}

/** 8 artikel terbit terbaru, tanpa duplikat. Hanya status `publish`. */
export async function getRecommendedArticles(now: Date = new Date()): Promise<Article[]> {
  return (await getPublishedArticles(now)).slice(0, RECOMMENDED_COUNT)
}

/** `limit` artikel terbit terbaru untuk slide hero Beranda; sama dengan 4 kartu Rekomendasi pertama. */
export async function getHeroArticles(limit: number = HERO_SLIDE_COUNT, now: Date = new Date()): Promise<Article[]> {
  return (await getPublishedArticles(now)).slice(0, limit)
}

/** `limit` artikel terbit terbaru di kategori `slug` (kategori kosong atau tak dikenal: array kosong). */
export async function getArticlesByCategory(slug: string, limit: number, now: Date = new Date()): Promise<Article[]> {
  return (await getPublishedArticles(now))
    .filter(article => article.categories.some(category => category.slug === slug))
    .slice(0, limit)
}

/** `limit` artikel terbit terbaru (kolom samping, tab Terbaru). Hanya status `publish`. */
export async function getLatestArticles(limit: number = SIDEBAR_COUNT, now: Date = new Date()): Promise<Article[]> {
  return (await getPublishedArticles(now)).slice(0, limit)
}

// `limit` artikel `publish` bertag `POPULAR_TAG_SLUG` dalam `POPULAR_WINDOW_DAYS` hari terakhir (tab Terpopuler).
// Kosong = array kosong (pemanggil menyembunyikan tab; jangan diisi "terbaru").
export async function getPopularArticles(limit: number = SIDEBAR_COUNT, now: Date = new Date()): Promise<Article[]> {
  const earliest = now.getTime() - POPULAR_WINDOW_DAYS * DAY_MS
  const hosts = imageHosts()
  return (await getPublishedPosts(now))
    .filter(post => hasTag(post, POPULAR_TAG_SLUG) && Date.parse(publishedAtOf(post)) >= earliest)
    .slice(0, limit)
    .map(post => mapPost(post, hosts))
}

/** `VISUAL_TOPIC_COUNT` kategori anak `ruang-visual` non-kosong terbaru dibuat (id terbesar); kartu besar + 3 item. */
export async function getVisualTopics(now: Date = new Date()): Promise<VisualTopic[]> {
  const base = wpBase()
  const categories = base ? await fromWordPress(() => loadWpCategories(base)) : (isEdgeSet() ? buildEdgeVisualCategories() : buildFigmaVisualCategories())
  const parent = categories.find(category => category.slug === VISUAL_PARENT_SLUG && !category.parent)
  if (!parent) return []

  const published = await getPublishedArticles(now)
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

/** Kategori situs (nama terdekode): semua kategori WordPress kecuali `uncategorized`, `ruang-visual`, turunannya. */
export async function getCategories(): Promise<ArticleCategory[]> {
  const base = wpBase()
  if (base) return pickWordPressCategories(await fromWordPress(() => loadWpCategories(base)))
  return buildMenuCategories().map(term => ({ id: term.id, slug: term.slug, name: decodeEntities(term.name) }))
}

/** Section kategori Beranda: sampai `HOME_SECTION_MAX` kategori berartikel (`pickHomeSections`), tiap N artikel. */
export async function getHomeSections(now: Date = new Date()): Promise<HomeSection[]> {
  const [categories, published] = await Promise.all([getCategories(), getPublishedArticles(now)])
  const nonEmpty = new Set(published.flatMap(article => article.categories.map(category => category.slug)))
  return pickHomeSections(categories, nonEmpty).map(pick => ({
    slug: pick.slug,
    title: pick.title,
    articles: published.filter(article => article.categories.some(category => category.slug === pick.slug)).slice(0, HOME_SECTION_ARTICLE_COUNT)
  }))
}

// Halaman kategori: hanya kategori dari `getCategories()`, status `publish`, terbaru dulu. `page` lewat batas = null;
// halaman 1 kategori kosong tetap dikembalikan (artikel kosong, `totalPages` 0). Tanpa HTML mentah.
export async function getCategoryPage(slug: string, page: number, perPage: number, now: Date = new Date()): Promise<Omit<CategoryPageResponse, 'now'> | null> {
  const category = (await getCategories()).find(item => item.slug === slug)
  if (!category) return null
  const all = (await getPublishedArticles(now)).filter(article => article.categories.some(item => item.slug === slug))
  if (!isPageInRange(page, all.length, perPage)) return null
  return { category, articles: sliceForPage(all, page, perPage), pagination: buildPagination(page, all.length, perPage) }
}

/** Ringkasan teks polos sebuah post (tanpa HTML, entitas didekode); dasar pencarian dan `ArticleDetail.excerpt`. */
function excerptTextOf(post: WpPost): string {
  return excerptText(post.excerpt?.rendered ?? buildDefaultExcerpt(post.id, post.title.rendered))
}

// Pencarian `publish`: semua kata `query` (dinormalisasi; tak valid = tanpa hasil) ada di judul/ringkasan.
// Urut kata di judul lalu terbaru. `page` lewat batas = null; halaman 1 tanpa hasil tetap dikembalikan. Tanpa HTML.
export async function searchArticles(query: string, page: number, perPage: number, now: Date = new Date()): Promise<Omit<SearchResponse, 'now'> | null> {
  const candidates = (await getPublishedPosts(now)).map(post => ({
    post,
    id: post.id,
    publishedAt: publishedAtOf(post),
    title: decodeEntities(post.title.rendered),
    excerpt: excerptTextOf(post)
  }))
  const result = searchPage(candidates, query, page, perPage)
  if (!result) return null
  const hosts = imageHosts()
  return { query: result.query, articles: result.items.map(item => mapPost(item.post, hosts)), pagination: result.pagination }
}

function mapTags(post: WpPost): ArticleTag[] {
  return (post._embedded['wp:term'][1] ?? []).map(tag => ({ id: tag.id, slug: tag.slug, name: decodeEntities(tag.name) }))
}

/** Detail artikel: `bodyHtml` = HTML CMS yang SUDAH disanitasi (`sanitizeBodyHtml`); HTML mentah tak pernah keluar. */
function mapDetail(post: WpPost): ArticleDetail {
  const hosts = imageHosts()
  // Isi tanpa teks, gambar, atau embed dianggap kosong: '' agar halaman menampilkan pesan netral.
  const sanitized = sanitizeBodyHtml(post.content?.rendered ?? buildDefaultBody(post.id, post.title.rendered), hosts)
  const bodyHtml = hasVisibleContent(sanitized) ? sanitized : ''
  return {
    ...mapPost(post, hosts),
    excerpt: excerptTextOf(post),
    bodyHtml,
    tags: mapTags(post),
    photoCredit: decodeEntities(stripTags(post._embedded['wp:featuredmedia']?.[0]?.caption?.rendered ?? '')),
    readingMinutes: readingMinutes(bodyHtml)
  }
}

/** Artikel terbit dengan `slug` persis (pemanggil sudah memvalidasi bentuk slug); draft/private/tak ada: null. */
export async function getArticleBySlug(slug: string, now: Date = new Date()): Promise<ArticleDetail | null> {
  const post = (await getPublishedPosts(now)).find(item => item.slug === slug)
  return post ? mapDetail(post) : null
}

function toCandidate(post: WpPost): RelatedCandidate {
  const [categories = [], tags = []] = post._embedded['wp:term']
  return { id: post.id, publishedAt: publishedAtOf(post), categoryIds: categories.map(term => term.id), tagIds: tags.map(term => term.id) }
}

// Berita Terkait: satu daftar berperingkat selain `articleId`; sidebar + blok bawah (>= 1024), `bottomMobile` (< 1024).
// Hanya satu pasangan tampil per viewport (CSS). Artikel tak ada atau tak terbit: semua kosong.
export async function getRelatedArticles(articleId: number, now: Date = new Date()): Promise<{ sidebar: Article[], bottom: Article[], bottomMobile: Article[] }> {
  const posts = await getPublishedPosts(now)
  const current = posts.find(post => post.id === articleId)
  if (!current) return { sidebar: [], bottom: [], bottomMobile: [] }
  const byId = new Map(posts.map(post => [post.id, post]))
  const ranked = rankRelated(toCandidate(current), posts.map(toCandidate))
  const { sidebar, bottom, bottomMobile } = relatedBlocks(ranked, RELATED_SIDEBAR_COUNT, RELATED_BOTTOM_COUNT, RELATED_BOTTOM_MOBILE_COUNT)
  const hosts = imageHosts()
  const toArticle = (id: number): Article => mapPost(byId.get(id) as WpPost, hosts)
  return { sidebar: sidebar.map(toArticle), bottom: bottom.map(toArticle), bottomMobile: bottomMobile.map(toArticle) }
}

/** Penyanitasi per daftar host gambar tambahan (host WordPress): dibuat sekali, dipakai ulang. */
const sanitizers = new Map<string, (html: unknown) => string>()

// Satu-satunya jalur HTML CMS: `body` WAJIB lewat fungsi ini sebelum dirender. Allowlist: sanitize-config.ts.
// `extraImageHosts` = host media WordPress tambahan. Tidak pernah melempar; masukan tak valid atau terlalu besar: ''.
export function sanitizeBodyHtml(html: unknown, extraImageHosts: readonly string[] = []): string {
  if (extraImageHosts.length === 0) return sanitizeArticleHtml(html)
  const key = extraImageHosts.join(',')
  let sanitize = sanitizers.get(key)
  if (!sanitize) {
    sanitize = createArticleSanitizer({ imageHosts: [...IMAGE_ALLOWED_HOSTS, ...extraImageHosts] })
    sanitizers.set(key, sanitize)
  }
  return sanitize(html)
}

