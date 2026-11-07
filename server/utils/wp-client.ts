// Klien baca WordPress REST: HANYA `GET`, tanpa kredensial, tanpa menulis; server saja. Murni agar bisa diuji.
// Berhalaman (maks. `WP_MAX_PAGES`), cache `WP_CACHE_TTL_MS`, single-flight. Galat tanpa URL/path/env/isi respons.
import { WP_CACHE_TTL_MS, WP_FAILURE_BACKOFF_MS, WP_MAX_PAGES, WP_MAX_RESPONSE_BYTES, WP_PER_PAGE, WP_RETRIES, WP_TIMEOUT_MS } from '../../app/config/wp.ts'
import type { WpPost, WpTerm } from '../fixtures/posts.ts'
import { normalizeWpPosts, normalizeWpTerms } from './wp-map.ts'

/** Pesan tetap yang boleh sampai ke klien (tanpa stack, path, URL, env). */
export const WP_UNAVAILABLE_MESSAGE = 'Sumber data tidak tersedia.'

/** WordPress tidak bisa dipakai. `reason` = kode singkat untuk log; `detail` = kode galat jaringan (log, 502 dev). */
export class WpUnavailableError extends Error {
  readonly reason: string
  readonly retryable: boolean
  readonly detail?: string
  constructor(reason: string, retryable: boolean, detail?: string) {
    super(WP_UNAVAILABLE_MESSAGE)
    this.name = 'WpUnavailableError'
    this.reason = reason
    this.retryable = retryable
    if (detail !== undefined) this.detail = detail
  }
}

// Kode galat Node/undici/OpenSSL: huruf besar, angka, garis bawah (ECONNREFUSED, UNABLE_TO_VERIFY_LEAF_SIGNATURE, ...).
const ERROR_CODE = /^[A-Z][A-Z0-9_]{2,40}$/

/** Kode galat jaringan (`error.cause.code`, lalu `error.code`) HANYA bila berbentuk kode, else `'unknown'`. */
export function networkErrorDetail(error: unknown): string {
  const codeOf = (value: unknown): unknown => (typeof value === 'object' && value !== null ? (value as { code?: unknown }).code : undefined)
  const cause = typeof error === 'object' && error !== null ? (error as { cause?: unknown }).cause : undefined
  for (const candidate of [codeOf(cause), codeOf(error)]) {
    if (typeof candidate === 'string' && ERROR_CODE.test(candidate)) return candidate
  }
  return 'unknown'
}

// Origin `https://host[:port]` (garis miring akhir opsional); host = label huruf/angka/strip dipisah titik.
const HTTPS_ORIGIN = /^https:\/\/(?:[A-Za-z0-9-]+\.)*[A-Za-z0-9-]+(?::(\d{1,5}))?\/?$/i
// Pengembangan lokal: http hanya untuk localhost / 127.0.0.1.
const LOCAL_HTTP_ORIGIN = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::(\d{1,5}))?\/?$/i

/** Base URL WordPress valid: origin huruf kecil tanpa `/` akhir, atau `null`. Hanya https atau http localhost. */
export function validWpBaseUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length > 255) return null
  const match = HTTPS_ORIGIN.exec(trimmed) ?? LOCAL_HTTP_ORIGIN.exec(trimmed)
  if (!match) return null
  const port = match[1]
  if (port !== undefined && (Number(port) < 1 || Number(port) > 65535)) return null
  return trimmed.replace(/\/$/, '').toLowerCase()
}

export interface WpPage {
  items: unknown[]
  totalPages: number
}

/** `X-WP-TotalPages` -> bilangan bulat >= 1 (header hilang/rusak/0 = 1 halaman). */
export function parseTotalPages(header: string | null): number {
  const value = Number(header)
  return Number.isInteger(value) && value >= 1 ? value : 1
}

/** Gabungkan semua halaman: halaman 1 dulu (memberi `totalPages`), sisanya sampai `maxPages`; satu gagal = gagal. */
export async function collectPages(fetchPage: (page: number) => Promise<WpPage>, maxPages: number): Promise<unknown[]> {
  const first = await fetchPage(1)
  const total = Math.max(1, Math.min(Number.isInteger(first.totalPages) ? first.totalPages : 1, maxPages))
  const rest = await Promise.all(Array.from({ length: total - 1 }, (_, index) => fetchPage(index + 2)))
  return [first, ...rest].flatMap(page => page.items)
}

/** Jalankan `run`; `WpUnavailableError` yang `retryable` diulang sampai `retries` kali. Galat lain tidak diulang. */
export async function withRetry<T>(run: () => Promise<T>, retries: number): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await run()
    } catch (error) {
      if (!(error instanceof WpUnavailableError) || !error.retryable || attempt >= retries) throw error
    }
  }
}

export interface CachedLoaderOptions {
  ttlMs: number
  /** Setelah gagal, pemuatan ulang paling cepat sekian ms kemudian. */
  backoffMs: number
  clock?: () => number
}

// Pemuat ber-cache: nilai segar (< `ttlMs`) dipakai langsung; pemuatan bersamaan digabung (single-flight).
// Gagal: nilai basi dipakai bila ada, jika tidak galat dilempar; pemuatan ulang menunggu `backoffMs`.
export function createCachedLoader<T>(load: () => Promise<T>, options: CachedLoaderOptions): () => Promise<T> {
  const clock = options.clock ?? Date.now
  let value: T | undefined
  let hasValue = false
  let expiresAt = 0
  let retryAt = 0
  let lastError: unknown
  let inflight: Promise<T> | undefined

  async function refresh(): Promise<T> {
    try {
      value = await load()
      hasValue = true
      expiresAt = clock() + options.ttlMs
      retryAt = 0
      return value
    } catch (error) {
      retryAt = clock() + options.backoffMs
      lastError = error
      if (hasValue) return value as T
      throw error
    }
  }

  return () => {
    const now = clock()
    if (hasValue && now < expiresAt) return Promise.resolve(value as T)
    if (inflight) return inflight
    if (now < retryAt) return hasValue ? Promise.resolve(value as T) : Promise.reject(lastError)
    const promise = refresh()
    inflight = promise
    const clear = () => {
      if (inflight === promise) inflight = undefined
    }
    promise.then(clear, clear)
    return promise
  }
}

async function readLimitedText(response: Response): Promise<string> {
  const declared = Number(response.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > WP_MAX_RESPONSE_BYTES) {
    void response.body?.cancel()
    throw new WpUnavailableError('too-large', false)
  }
  if (!response.body) return ''
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > WP_MAX_RESPONSE_BYTES) {
      void reader.cancel()
      throw new WpUnavailableError('too-large', false)
    }
    text += decoder.decode(value, { stream: true })
  }
  return text + decoder.decode()
}

/** Satu permintaan `GET` (tanpa kredensial, tanpa mengikuti pengalihan); hasil = satu halaman daftar JSON. */
async function requestPage(url: string): Promise<WpPage> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(WP_TIMEOUT_MS)
    })
    if (!response.ok) {
      void response.body?.cancel()
      throw new WpUnavailableError(`http-${response.status}`, response.status >= 500)
    }
    const totalPages = parseTotalPages(response.headers.get('x-wp-totalpages'))
    const text = await readLimitedText(response)
    let items: unknown
    try {
      items = JSON.parse(text)
    } catch {
      throw new WpUnavailableError('json', false)
    }
    if (!Array.isArray(items)) throw new WpUnavailableError('shape', false)
    return { items, totalPages }
  } catch (error) {
    if (error instanceof WpUnavailableError) throw error
    const name = (error as { name?: string } | null)?.name
    if (name === 'TimeoutError' || name === 'AbortError') throw new WpUnavailableError('timeout', true)
    throw new WpUnavailableError('network', true, networkErrorDetail(error))
  }
}

/** Semua halaman satu sumber (`path` memuat query, tanpa `page`). Gagal: log satu baris (kode alasan) lalu lempar. */
async function fetchAll(baseUrl: string, path: string): Promise<unknown[]> {
  try {
    return await collectPages(page => withRetry(() => requestPage(`${baseUrl}/wp-json/wp/v2/${path}&page=${page}`), WP_RETRIES), WP_MAX_PAGES)
  } catch (error) {
    const detail = error instanceof WpUnavailableError && error.detail ? ` (${error.detail})` : ''
    console.warn(`[wp] gagal memuat data: ${error instanceof WpUnavailableError ? error.reason : 'unknown'}${detail}`)
    throw error instanceof WpUnavailableError ? error : new WpUnavailableError('unknown', false)
  }
}

const loaders = new Map<string, () => Promise<unknown>>()

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  let loader = loaders.get(key) as (() => Promise<T>) | undefined
  if (!loader) {
    loader = createCachedLoader(load, { ttlMs: WP_CACHE_TTL_MS, backoffMs: WP_FAILURE_BACKOFF_MS })
    loaders.set(key, loader)
  }
  return loader()
}

/** Semua post `publish` (`status=publish` + `_embed`), dinormalisasi ke `WpPost`. Ber-cache. */
export function loadWpPosts(baseUrl: string): Promise<WpPost[]> {
  return cached(`${baseUrl}|posts`, async () =>
    normalizeWpPosts(await fetchAll(baseUrl, `posts?_embed=1&status=publish&per_page=${WP_PER_PAGE}`)))
}

/** Semua kategori (`id,slug,name,parent,count`), sudah dinormalisasi ke `WpTerm`. Ber-cache. */
export function loadWpCategories(baseUrl: string): Promise<WpTerm[]> {
  return cached(`${baseUrl}|categories`, async () =>
    normalizeWpTerms(await fetchAll(baseUrl, `categories?per_page=${WP_PER_PAGE}&_fields=id,slug,name,parent,count`)))
}

// Iklan mentah, belum dinormalisasi: jadwal (hari ini WIB) dinilai per permintaan oleh `selectAds`, bukan di cache.
// Ber-cache. Post type `iklan` belum ada = 404 = `WpUnavailableError` (pemanggil menganggapnya "tanpa iklan").
export function loadWpAds(baseUrl: string): Promise<unknown[]> {
  return cached(`${baseUrl}|ads`, () => fetchAll(baseUrl, `iklan?status=publish&per_page=${WP_PER_PAGE}&_fields=id,date_gmt,title,acf&acf_format=standard`))
}
