/**
 * Batas dan normalisasi pencarian `q`, dipakai bersama server (`/api/search`) dan klien (header, `/cari`).
 * Tanpa auto-import Nuxt agar bisa diuji dengan `node:test`.
 */

/** Panjang kata kunci setelah dinormalisasi: 2-100 karakter. */
export const SEARCH_MIN_LENGTH = 2
export const SEARCH_MAX_LENGTH = 100

/** Jumlah kartu per halaman hasil pencarian, sama dengan halaman kategori. */
export const SEARCH_PER_PAGE = 10

/** Pesan netral untuk kata kunci kosong atau tidak valid; tidak pernah memuat masukan pengguna. */
export const SEARCH_INVALID_MESSAGE = 'Masukkan kata kunci minimal 2 karakter.'

/** Keadaan kosong: kata kunci valid, tidak ada berita yang cocok. */
export const SEARCH_EMPTY_MESSAGE = 'Tidak ada berita yang cocok.'

/** Karakter kontrol Unicode (Cc): C0 (U+0000-001F), DEL, dan C1 (U+007F-009F). Termasuk tab dan baris baru. */
function isControlCode(code: number): boolean {
  return code <= 0x1F || (code >= 0x7F && code <= 0x9F)
}

function hasControlCharacter(text: string): boolean {
  for (let index = 0; index < text.length; index++) {
    if (isControlCode(text.charCodeAt(index))) return true
  }
  return false
}

/**
 * `q` harus string tunggal tanpa karakter kontrol; spasi dipadatkan dan dipangkas, hasil 2-100 karakter, selain itu `null`.
 * Murni dan tidak melempar; karakter lain (kutip, `<`) tidak diubah.
 */
export function normalizeSearchQuery(value: unknown): string | null {
  if (typeof value !== 'string' || hasControlCharacter(value)) return null
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length >= SEARCH_MIN_LENGTH && normalized.length <= SEARCH_MAX_LENGTH ? normalized : null
}

/**
 * Nilai kolom cari header di `/cari`: `q` string biasa tetap diisikan (dipadatkan, dipotong 100 karakter) agar bisa diperbaiki;
 * berisi karakter kontrol, ganda, atau bukan string = kosong. Hanya dirender sebagai nilai input.
 */
export function searchInputValue(value: unknown): string {
  if (typeof value !== 'string' || hasControlCharacter(value)) return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, SEARCH_MAX_LENGTH)
}
