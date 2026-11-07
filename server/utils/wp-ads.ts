// Iklan dari ACF WordPress (respons tak tepercaya) -> satu iklan tervalidasi per slot. Murni, diuji dengan `node:test`.
// Layak: `aktif`, `slot` dikenal, gambar `https://` host WordPress, tautan `https://` valid, jadwal (WIB) terpenuhi.
import type { AdItem, AdsBySlot } from '../../app/types/ad'
import type { AdSlotName } from '../../app/utils/ad-slots.ts'
import { AD_SLOTS } from '../../app/utils/ad-slots.ts'
import { stripTags } from './article-detail.ts'
import { safeImageUrl } from './image-url.ts'
import { decodeEntities } from './wp-map.ts'

const MAX_URL_LENGTH = 2048
const MAX_ALT_LENGTH = 200
/** Teks alt bila `teks_alt` dan judul kosong (tautan bergambar tanpa nama tidak boleh ada). */
export const AD_FALLBACK_ALT = 'Iklan'
/** Hari kalender iklan mengikuti WIB (UTC+7). */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

const SLOT_NAMES: ReadonlySet<string> = new Set(Object.keys(AD_SLOTS))
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/
/** `date_gmt` WordPress: `2026-11-05T03:04:05` (UTC, tanpa zona) atau dengan `Z`. */
const GMT_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/
/** Karakter kontrol, spasi, DEL, dan `\`: URL yang memuatnya ditolak (peramban menormalkan/membuangnya diam-diam). */
// eslint-disable-next-line no-control-regex
const UNSAFE_URL_CHARS = /[\u0000- \u007F\\]/
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isAdSlotName(value: unknown): value is AdSlotName {
  return typeof value === 'string' && SLOT_NAMES.has(value)
}

/** Field True/False ACF: `true`, `1`, atau `"1"` = aktif; selain itu tidak aktif. */
export function acfFlag(value: unknown): boolean {
  return value === true || value === 1 || value === '1'
}

/** Date Picker ACF (`Y-m-d`): valid -> string itu; kosong -> `null` (tanpa batas); lainnya -> `undefined`. */
export function parseAcfDate(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === false || value === '') return null
  if (typeof value !== 'string') return undefined
  const match = DATE_ONLY.exec(value)
  if (!match) return undefined
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? value : undefined
}

/** Tanggal hari ini di WIB (UTC+7) sebagai `YYYY-MM-DD`. */
export function todayWib(now: Date): string {
  return new Date(now.getTime() + WIB_OFFSET_MS).toISOString().slice(0, 10)
}

/** Jadwal terpenuhi bila hari ini (WIB) di antara `mulai` dan `selesai` inklusif; kosong = tanpa batas. */
export function isScheduleOpen(mulai: unknown, selesai: unknown, now: Date): boolean {
  const from = parseAcfDate(mulai)
  const to = parseAcfDate(selesai)
  if (from === undefined || to === undefined) return false
  const today = todayWib(now)
  // `YYYY-MM-DD` berurutan secara leksikografis sama dengan urutan kalender.
  return (from === null || from <= today) && (to === null || today <= to)
}

/** Tautan iklan: hanya `https://host...` (tanpa userinfo/spasi/kontrol/`\`, <= 2048) -> `URL.href`, atau `null`. */
export function safeAdLink(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > MAX_URL_LENGTH || UNSAFE_URL_CHARS.test(value)) return null
  if (!/^https:\/\/[^/]/i.test(value)) return null
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:' || parsed.username !== '' || parsed.password !== '' || parsed.hostname === '') return null
  return parsed.href
}

/** Gambar iklan (`gambar` ACF: Image Array atau URL) -> URL `https://` host WordPress (`imageHosts`), atau `null`. */
export function safeAdImage(gambar: unknown, imageHosts: readonly string[]): string | null {
  const url = typeof gambar === 'string' ? gambar : isRecord(gambar) ? gambar.url : undefined
  if (typeof url !== 'string' || url.length > MAX_URL_LENGTH || !/^https:\/\//i.test(url)) return null
  return safeImageUrl(url, imageHosts)
}

function cleanText(value: string): string {
  return value.replace(CONTROL_CHARS, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_ALT_LENGTH)
}

/** Alt = `teks_alt` apa adanya, lalu judul post (tag dibuang, entitas didekode), lalu `AD_FALLBACK_ALT`. */
function altOf(teksAlt: unknown, title: unknown): string {
  const fromField = typeof teksAlt === 'string' ? cleanText(teksAlt) : ''
  if (fromField !== '') return fromField
  const rendered = isRecord(title) && typeof title.rendered === 'string' ? title.rendered : ''
  const fromTitle = cleanText(decodeEntities(stripTags(rendered)))
  return fromTitle !== '' ? fromTitle : AD_FALLBACK_ALT
}

export interface NormalizedAd {
  slot: AdSlotName
  ad: AdItem
  /** `date_gmt` dalam ms epoch (dasar pemilihan "terbaru"). */
  publishedMs: number
}

/** Satu item `iklan` WordPress -> iklan layak, atau `null` (tak layak: lihat daftar syarat di kepala berkas). */
export function normalizeAd(raw: unknown, imageHosts: readonly string[], now: Date): NormalizedAd | null {
  if (!isRecord(raw)) return null
  const id = raw.id
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0) return null
  if (typeof raw.date_gmt !== 'string' || !GMT_DATE.test(raw.date_gmt)) return null
  const publishedMs = Date.parse(raw.date_gmt.endsWith('Z') ? raw.date_gmt : `${raw.date_gmt}Z`)
  if (!Number.isFinite(publishedMs)) return null

  const acf = raw.acf
  if (!isRecord(acf) || !acfFlag(acf.aktif) || !isAdSlotName(acf.slot)) return null
  if (!isScheduleOpen(acf.mulai, acf.selesai, now)) return null
  const imageUrl = safeAdImage(acf.gambar, imageHosts)
  const href = safeAdLink(acf.tautan)
  if (imageUrl === null || href === null) return null

  return { slot: acf.slot, publishedMs, ad: { id, image: { url: imageUrl }, alt: altOf(acf.teks_alt, raw.title), href } }
}

/** `a` lebih baru dari `b`: `date_gmt` lebih besar; sama -> id lebih besar. */
function isNewer(a: NormalizedAd, b: NormalizedAd): boolean {
  return a.publishedMs > b.publishedMs || (a.publishedMs === b.publishedMs && a.ad.id > b.ad.id)
}

/** Daftar mentah `iklan` -> satu iklan terbaru per slot (date_gmt, lalu id terbesar). Bukan array = `{}`. */
export function selectAds(raw: unknown, imageHosts: readonly string[], now: Date): AdsBySlot {
  if (!Array.isArray(raw)) return {}
  const best = new Map<AdSlotName, NormalizedAd>()
  for (const item of raw) {
    const candidate = normalizeAd(item, imageHosts, now)
    const current = candidate ? best.get(candidate.slot) : undefined
    if (candidate && (!current || isNewer(candidate, current))) best.set(candidate.slot, candidate)
  }
  const ads: AdsBySlot = {}
  for (const [slot, { ad }] of best) ads[slot] = ad
  return ads
}

/** Tunggu `promise` paling lama `ms`; terlambat atau gagal = `fallback`. Iklan opsional tak menahan render. */
export function withDeadline<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      () => {
        clearTimeout(timer)
        resolve(fallback)
      }
    )
  })
}
