/**
 * Pemetaan data artikel. Murni (tanpa auto-import Nuxt, impor berekstensi `.ts`) agar bisa diuji dengan `node:test`. `normalizeWpPost`/`normalizeWpTerms`: respons REST WordPress (tak tepercaya) -> `WpPost`/`WpTerm`
 * (data tak berbentuk benar dibuang, bukan dilempar); `mapPost`: `WpPost` -> `Article` (dipakai fixture dan WordPress; satu-satunya tempat aturan tampilan data).
 */
import type { Article, ArticleCategory } from '../../app/types/article'
import { VISUAL_PARENT_SLUG, WP_DEFAULT_CATEGORY_SLUG } from '../../app/config/category.ts'
import type { WpPost, WpTerm } from '../fixtures/posts.ts'
import { isValidArticleSlug, stripTags } from './article-detail.ts'
import { isValidCategorySlug } from './category-page.ts'
import { safeImageUrl } from './image-url.ts'
import { IMAGE_ALLOWED_HOSTS } from './sanitize-config.ts'

const DEFAULT_AUTHOR = 'IniSumedang'

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“'
}

/** Dekode entitas HTML pada teks (satu lintasan, tanpa dekode ganda). */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10)
      return Number.isFinite(code) && code > 0 && code <= 0x10FFFF ? String.fromCodePoint(code) : match
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match
  })
}

/** Teks polos dari HTML ringkasan/keterangan: tag dibuang, entitas didekode. Hasilnya hanya dirender sebagai teks (di-escape). */
export function excerptText(html: string): string {
  return decodeEntities(stripTags(html))
}

/** `date_gmt` WordPress tanpa zona waktu (UTC) diberi akhiran `Z`. */
export function publishedAtOf(post: Pick<WpPost, 'date_gmt'>): string {
  return post.date_gmt.endsWith('Z') ? post.date_gmt : `${post.date_gmt}Z`
}

/**
 * `WpPost` -> `Article`. `imageHosts` = host https tambahan untuk gambar hero (host media WordPress dari base URL; kosong untuk fixture).
 * URL gambar tak aman (skema berbahaya, host di luar daftar) = artikel tanpa gambar, bukan galat.
 */
export function mapPost(post: WpPost, imageHosts: readonly string[] = []): Article {
  const media = post._embedded['wp:featuredmedia']?.[0]
  const heroUrl = media ? safeImageUrl(media.source_url, [...IMAGE_ALLOWED_HOSTS, ...imageHosts]) : null
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

/** Host gambar yang diizinkan dari base URL WordPress: hanya https tanpa port (aturan `safeImageUrl`); selain itu kosong. */
export function wpImageHosts(baseUrl: string): readonly string[] {
  try {
    const url = new URL(baseUrl)
    return url.protocol === 'https:' && !url.port ? [url.hostname] : []
  } catch {
    return []
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function renderedOf(value: unknown): string {
  return isRecord(value) && typeof value.rendered === 'string' ? value.rendered : ''
}

function positiveInt(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null
}

/** Format tanggal WordPress: `2026-11-05T03:04:05` (UTC, tanpa zona) atau dengan `Z`. */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/

function embeddedTerms(embedded: Record<string, unknown>): WpTerm[][] {
  const groups = Array.isArray(embedded['wp:term']) ? embedded['wp:term'] : []
  const terms: Record<string, unknown>[] = groups.flatMap(group => (Array.isArray(group) ? group.filter(isRecord) : []))
  const pick = (taxonomy: string): WpTerm[] => terms.flatMap((term) => {
    const id = positiveInt(term.id)
    const name = typeof term.name === 'string' ? stripTags(term.name) : ''
    return term.taxonomy === taxonomy && id !== null && typeof term.slug === 'string' && term.slug !== '' && name !== ''
      ? [{ id, slug: term.slug, name }]
      : []
  })
  // Grup 0 = kategori, grup 1 = tag (bentuk `WpPost`); dipilih lewat `taxonomy`, bukan urutan, agar taksonomi lain tidak menggeser.
  return [pick('category'), pick('post_tag')]
}

function embeddedMedia(embedded: Record<string, unknown>, title: string): NonNullable<WpPost['_embedded']['wp:featuredmedia']> {
  const list = embedded['wp:featuredmedia']
  const media = Array.isArray(list) ? list[0] : undefined
  if (!isRecord(media) || typeof media.source_url !== 'string' || media.source_url === '') return []
  const details = isRecord(media.media_details) ? media.media_details : {}
  const width = positiveInt(details.width)
  const height = positiveInt(details.height)
  // Tanpa ukuran, gambar tidak bisa dicadangkan ruangnya (layout shift): dianggap tanpa gambar.
  if (width === null || height === null) return []
  const alt = typeof media.alt_text === 'string' ? media.alt_text.trim() : ''
  return [{
    source_url: media.source_url,
    // alt kosong -> judul artikel.
    alt_text: alt === '' ? title : alt,
    caption: { rendered: renderedOf(media.caption) },
    media_details: { width, height }
  }]
}

/**
 * Satu item `posts?_embed` WordPress -> `WpPost`, atau `null` bila bukan post yang layak tampil (bentuk salah, id/slug/tanggal/judul tak valid). Judul dan nama kategori/tag tanpa tag HTML; `content`/`excerpt` selalu terisi (agar tidak jatuh ke isi bawaan fixture);
 * kredit foto = `caption`; nama pengguna WordPress TIDAK dibawa (penulis tetap `IniSumedang`).
 */
export function normalizeWpPost(raw: unknown): WpPost | null {
  if (!isRecord(raw)) return null
  const id = positiveInt(raw.id)
  if (id === null || typeof raw.slug !== 'string' || !isValidArticleSlug(raw.slug) || typeof raw.status !== 'string') return null
  if (typeof raw.date_gmt !== 'string' || !DATE_PATTERN.test(raw.date_gmt)) return null
  if (!Number.isFinite(Date.parse(raw.date_gmt.endsWith('Z') ? raw.date_gmt : `${raw.date_gmt}Z`))) return null
  const title = stripTags(renderedOf(raw.title))
  if (title === '') return null
  const embedded = isRecord(raw._embedded) ? raw._embedded : {}
  const media = embeddedMedia(embedded, title)
  return {
    id,
    slug: raw.slug,
    status: raw.status,
    date_gmt: raw.date_gmt,
    title: { rendered: title },
    content: { rendered: renderedOf(raw.content) },
    excerpt: { rendered: renderedOf(raw.excerpt) },
    _embedded: {
      'wp:term': embeddedTerms(embedded),
      ...(media.length > 0 ? { 'wp:featuredmedia': media } : {})
    }
  }
}

/** Daftar post WordPress (hasil gabungan halaman) -> `WpPost[]`; item tak layak dibuang. Bukan array = daftar kosong. */
export function normalizeWpPosts(raw: unknown): WpPost[] {
  return Array.isArray(raw) ? raw.flatMap((item) => {
    const post = normalizeWpPost(item)
    return post ? [post] : []
  }) : []
}

/** `categories?_fields=id,slug,name,parent,count` -> `WpTerm[]` (`parent` hanya bila > 0, seperti fixture). Item tak valid dibuang. */
export function normalizeWpTerms(raw: unknown): WpTerm[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item): WpTerm[] => {
    if (!isRecord(item)) return []
    const id = positiveInt(item.id)
    const name = typeof item.name === 'string' ? stripTags(item.name) : ''
    if (id === null || typeof item.slug !== 'string' || item.slug === '' || name === '') return []
    const parent = positiveInt(item.parent)
    return [{ id, slug: item.slug, name, ...(parent === null ? {} : { parent }) }]
  })
}

/**
 * Daftar kategori situs dari kategori WordPress: SEMUA kategori kecuali `uncategorized`, `ruang-visual`, dan semua keturunan `ruang-visual` (anak langsung = topik Ruang Visual), urutan id naik. Kategori kosong tetap masuk; nama didekode.
 * Kategori yang slug-nya tidak punya halaman (`isValidCategorySlug`: mis. non-ASCII atau lebih dari 60 karakter) dilewati, supaya menu tidak menaut ke 404.
 */
export function pickWordPressCategories(terms: readonly WpTerm[]): ArticleCategory[] {
  const hidden = new Set<number>(terms.filter(term => term.slug === VISUAL_PARENT_SLUG).map(term => term.id))
  // Keturunan ruang-visual: ulangi sampai tidak ada anak baru (aman terhadap siklus data, tiap id masuk satu kali).
  for (let grown = true; grown;) {
    grown = false
    for (const term of terms) {
      if (term.parent !== undefined && hidden.has(term.parent) && !hidden.has(term.id)) {
        hidden.add(term.id)
        grown = true
      }
    }
  }
  return terms
    .filter(term => term.slug !== WP_DEFAULT_CATEGORY_SLUG && !hidden.has(term.id) && isValidCategorySlug(term.slug))
    .sort((a, b) => a.id - b.id)
    .map(term => ({ id: term.id, slug: term.slug, name: decodeEntities(term.name) }))
}
