import type { Article } from '../../app/types/article'
import { POPULAR_TAG_SLUG, POPULAR_WINDOW_DAYS, SIDEBAR_COUNT } from '../../app/config/home'
import { buildEdgePosts, buildFigmaPosts } from '../fixtures/posts'
import type { WpPost } from '../fixtures/posts'

const RECOMMENDED_COUNT = 8
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
    heroImage: media
      ? {
          url: media.source_url,
          alt: decodeEntities(media.alt_text ?? ''),
          width: media.media_details.width,
          height: media.media_details.height
        }
      : null,
    authorLabel: post._embedded.author?.[0]?.name ?? DEFAULT_AUTHOR
  }
}

/** Semua post terbit (hanya status `publish`), terbaru dulu, tanpa duplikat id. */
function getPublishedPosts(now: Date): WpPost[] {
  const seen = new Set<number>()
  // `process` tidak bertipe di proyek ini (tanpa @types/node); baca env lewat globalThis.
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  const posts = env?.FIXTURE_SET === 'edge' ? buildEdgePosts(now) : buildFigmaPosts(now)
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
