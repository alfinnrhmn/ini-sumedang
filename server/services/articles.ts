import type { Article } from '../../app/types/article'
import { buildEdgePosts, buildFigmaPosts } from '../fixtures/posts'
import type { WpPost } from '../fixtures/posts'

const RECOMMENDED_COUNT = 8
const DEFAULT_AUTHOR = 'IniSumedang'

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

function mapPost(post: WpPost): Article {
  const media = post._embedded['wp:featuredmedia']?.[0]
  return {
    id: post.id,
    slug: post.slug,
    title: decodeEntities(post.title.rendered),
    publishedAt: post.date_gmt.endsWith('Z') ? post.date_gmt : `${post.date_gmt}Z`,
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

/** Semua artikel terbit (hanya status `publish`), terbaru dulu, tanpa duplikat id. */
function getPublishedArticles(now: Date): Article[] {
  const seen = new Set<number>()
  // `process` tidak bertipe di proyek ini (tanpa @types/node); baca env lewat globalThis.
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  const posts = env?.FIXTURE_SET === 'edge' ? buildEdgePosts(now) : buildFigmaPosts(now)
  return posts
    .filter(post => post.status === 'publish')
    .map(mapPost)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter((article) => {
      if (seen.has(article.id)) return false
      seen.add(article.id)
      return true
    })
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
