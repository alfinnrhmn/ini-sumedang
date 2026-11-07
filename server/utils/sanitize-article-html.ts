// Penyanitasi HTML artikel CMS: HANYA di server, jangan diimpor dari `app/`. Satu-satunya jalur HTML CMS ke keluaran.
// Masukan bukan string/kosong/melebihi batas ukuran atau jumlah '<' (parser kuadratik), atau galat pustaka -> ''.
import sanitizeHtml from 'sanitize-html'
import type { Frame, IOptions, Transformed } from 'sanitize-html'
import {
  EMBED_ALLOWED_HOSTS,
  EMBED_ALLOW_FEATURES,
  EMBED_PATH_PATTERN,
  EMBED_QUERY_PARAMS,
  EMBED_REFERRER_POLICY,
  EMBED_SANDBOX,
  IMAGE_ALLOWED_HOSTS,
  SANITIZE_ALLOWED_ATTRIBUTES,
  SANITIZE_ALLOWED_SCHEMES,
  SANITIZE_ALLOWED_TAGS,
  SANITIZE_ALLOWED_TARGETS,
  SANITIZE_MAX_INPUT_LENGTH,
  SANITIZE_MAX_TAG_OPENINGS,
  SANITIZE_NESTING_LIMIT,
  SANITIZE_NON_TEXT_TAGS
} from './sanitize-config.ts'

/** Pengganti daftar host bawaan (dipakai tes dan pemanggil yang ingin memperluas tanpa mengubah konfigurasi global). */
export interface SanitizeOverrides {
  embedHosts?: readonly string[]
  imageHosts?: readonly string[]
}

type Attribs = Record<string, string>

const SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/
const DIGITS = /^\d{1,5}$/
const HOSTNAME = /^[a-z0-9.-]+$/i

/** Normalisasi seperti peramban: tab/baris-baru dibuang, tepi dipangkas; kontrol di dalam atau `\` di awal = null. */
function cleanUrl(value: string): string | null {
  const cleaned = trimControl(value.replace(/[\t\n\r]/g, ''))
  for (let index = 0; index < cleaned.length; index++) {
    const code = cleaned.charCodeAt(index)
    if (code < 0x20 || code === 0x7F) return null
  }
  return /^[/\\]?\\/.test(cleaned) ? null : cleaned
}

/** Pangkas karakter kontrol dan spasi (<= U+0020) di kedua tepi, seperti peramban. */
function trimControl(value: string): string {
  let start = 0
  let end = value.length
  while (start < end && value.charCodeAt(start) <= 0x20) start++
  while (end > start && value.charCodeAt(end - 1) <= 0x20) end--
  return value.slice(start, end)
}

/** Lebar/tinggi hanya angka (1-5 digit); selain itu atribut dibuang. */
function keepNumericSizes(attribs: Attribs): Attribs {
  const next = { ...attribs }
  if (next.width !== undefined && !DIGITS.test(next.width)) delete next.width
  if (next.height !== undefined && !DIGITS.test(next.height)) delete next.height
  return next
}

/** Gambar: relatif (tanpa skema, bukan `//`) atau https dari host allowlist (tanpa userinfo/port). Selain itu null. */
function safeImageSrc(raw: string, hosts: ReadonlySet<string>): string | null {
  const value = cleanUrl(raw)
  if (value === null || value === '') return null
  if (!SCHEME.test(value)) return value.startsWith('//') ? null : value
  if (!/^https:\/\//i.test(value)) return null
  const rest = value.slice(8)
  const end = rest.search(/[/?#]/)
  const authority = (end === -1 ? rest : rest.slice(0, end)).toLowerCase()
  return HOSTNAME.test(authority) && hosts.has(authority) ? value : null
}

/** Embed: `src` https, host persis di allowlist (tanpa userinfo/port), path `EMBED_PATH_PATTERN`; DIBANGUN ULANG. */
function safeEmbedSrc(raw: string, hosts: ReadonlySet<string>): string | null {
  const value = cleanUrl(raw)
  if (value === null || !/^https:\/\//i.test(value) || value.includes('\\')) return null
  const rest = value.slice(8)
  const end = rest.search(/[/?#]/)
  const authority = (end === -1 ? rest : rest.slice(0, end)).toLowerCase()
  if (!HOSTNAME.test(authority) || !hosts.has(authority)) return null
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (url.hostname !== authority || url.username || url.password || url.port) return null
  if (!EMBED_PATH_PATTERN.test(url.pathname)) return null
  const query = new URLSearchParams()
  for (const [key, val] of url.searchParams) {
    const pattern = Object.hasOwn(EMBED_QUERY_PARAMS, key) ? EMBED_QUERY_PARAMS[key] : undefined
    if (pattern && pattern.test(val) && !query.has(key)) query.set(key, val)
  }
  const search = query.toString()
  return `https://${authority}${url.pathname}${search ? `?${search}` : ''}`
}

function transformLink(attribs: Attribs): Attribs {
  const next = { ...attribs }
  if (next.href !== undefined) {
    const href = cleanUrl(next.href)
    if (href === null) delete next.href
    else next.href = href
  }
  if (next.target !== undefined && !SANITIZE_ALLOWED_TARGETS.includes(next.target)) delete next.target
  const external = next.href !== undefined && /^https?:/i.test(next.href)
  if (external || next.target === '_blank') next.rel = 'noopener noreferrer'
  return next
}

function transformImage(attribs: Attribs, hosts: ReadonlySet<string>): Attribs {
  const next = keepNumericSizes(attribs)
  const src = next.src === undefined ? null : safeImageSrc(next.src, hosts)
  if (src === null) delete next.src
  else next.src = src
  if (next.loading !== undefined && next.loading !== 'lazy' && next.loading !== 'eager') delete next.loading
  return next
}

function transformIframe(attribs: Attribs, hosts: ReadonlySet<string>): Attribs {
  const next = keepNumericSizes(attribs)
  const src = next.src === undefined ? null : safeEmbedSrc(next.src, hosts)
  if (src === null) delete next.src
  else next.src = src
  if (next.loading !== 'eager') next.loading = 'lazy'
  if (next.allow !== undefined) {
    const features = next.allow.split(';').map(item => item.trim().toLowerCase()).filter(item => EMBED_ALLOW_FEATURES.includes(item))
    if (features.length) next.allow = features.join('; ')
    else delete next.allow
  }
  next.sandbox = EMBED_SANDBOX
  next.referrerpolicy = EMBED_REFERRER_POLICY
  return next
}

function buildOptions(overrides: SanitizeOverrides): IOptions {
  const embedHosts = new Set((overrides.embedHosts ?? EMBED_ALLOWED_HOSTS).map(host => host.toLowerCase()))
  const imageHosts = new Set((overrides.imageHosts ?? IMAGE_ALLOWED_HOSTS).map(host => host.toLowerCase()))
  const transform = (change: (attribs: Attribs) => Attribs) => (tagName: string, attribs: Attribs): Transformed => ({ tagName, attribs: change(attribs) })
  return {
    allowedTags: SANITIZE_ALLOWED_TAGS,
    allowedAttributes: SANITIZE_ALLOWED_ATTRIBUTES,
    allowedSchemes: SANITIZE_ALLOWED_SCHEMES,
    allowedSchemesByTag: { img: ['https'] },
    allowedIframeHostnames: [...embedHosts],
    allowIframeRelativeUrls: false,
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    nonTextTags: SANITIZE_NON_TEXT_TAGS,
    nestingLimit: SANITIZE_NESTING_LIMIT,
    parseStyleAttributes: false,
    transformTags: {
      a: transform(transformLink),
      img: transform(attribs => transformImage(attribs, imageHosts)),
      iframe: transform(attribs => transformIframe(attribs, embedHosts))
    },
    // Gambar tanpa src sah dan iframe tanpa src sah dibuang seluruhnya.
    exclusiveFilter: (frame: Frame) => (frame.tag === 'img' || frame.tag === 'iframe') && !frame.attribs.src,
    // Isi iframe (teks mentah) tidak pernah dikeluarkan.
    textFilter: (text: string, tagName: string) => (tagName === 'iframe' ? '' : text)
  }
}

/** Lebih dari `SANITIZE_MAX_TAG_OPENINGS` karakter '<'? Berhenti menghitung begitu batas terlewati. */
function tooManyTags(html: string): boolean {
  let count = 0
  for (let index = html.indexOf('<'); index !== -1; index = html.indexOf('<', index + 1)) {
    if (++count > SANITIZE_MAX_TAG_OPENINGS) return true
  }
  return false
}

/** Membuat penyanitasi dengan daftar host pengganti (tes/perluasan). Bawaan: `sanitizeArticleHtml`. */
export function createArticleSanitizer(overrides: SanitizeOverrides = {}): (html: unknown) => string {
  const options = buildOptions(overrides)
  return (html: unknown): string => {
    if (typeof html !== 'string' || html === '' || html.length > SANITIZE_MAX_INPUT_LENGTH || tooManyTags(html)) return ''
    try {
      return sanitizeHtml(html, options)
    } catch {
      return ''
    }
  }
}

/** Sanitasi HTML isi artikel CMS dengan konfigurasi bawaan (`sanitize-config.ts`). Tidak pernah melempar. */
export const sanitizeArticleHtml: (html: unknown) => string = createArticleSanitizer()
