/**
 * Konfigurasi dan validasi pencarian (PAGE-004). Satu tempat untuk batas kata kunci, jumlah hasil per halaman, dan fungsi normalisasi `q`
 * yang dipakai bersama oleh server (API `/api/search`) dan klien (formulir header, halaman `/cari`). Tanpa auto-import Nuxt agar bisa diuji
 * dengan `node:test`.
 */

/** Panjang kata kunci setelah dinormalisasi (Keputusan PM 2): 2-100 karakter. */
export const SEARCH_MIN_LENGTH = 2
export const SEARCH_MAX_LENGTH = 100

/** Jumlah kartu per halaman hasil pencarian (Keputusan PM 3), sama dengan halaman kategori. */
export const SEARCH_PER_PAGE = 10

/** Pesan netral untuk kata kunci kosong atau tidak valid (Keputusan PM 2); tidak pernah memuat masukan pengguna. */
export const SEARCH_INVALID_MESSAGE = 'Masukkan kata kunci minimal 2 karakter.'

/** Keadaan kosong: kata kunci valid, tidak ada berita yang cocok (Keputusan PM 2). */
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
 * Normalisasi `q` (Keputusan PM 2): harus STRING TUNGGAL (parameter ganda/array, angka, objek, null = tidak valid); karakter kontrol
 * (termasuk tab dan baris baru) menolak seluruh masukan; lalu spasi di tepi dibuang dan spasi berurutan dipadatkan menjadi satu;
 * hasil harus 2-100 karakter. Mengembalikan teks ternormalisasi, atau `null` bila kosong atau tidak valid.
 * Murni dan tidak pernah melempar; tidak menghapus atau mengubah karakter selain spasi (tanda kutip, `<`, dan sebagainya tetap apa adanya,
 * tampil hanya sebagai teks).
 */
export function normalizeSearchQuery(value: unknown): string | null {
  if (typeof value !== 'string' || hasControlCharacter(value)) return null
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length >= SEARCH_MIN_LENGTH && normalized.length <= SEARCH_MAX_LENGTH ? normalized : null
}

/**
 * Nilai untuk kolom cari di header saat halaman `/cari` terbuka: `q` yang valid tampil apa adanya (ternormalisasi); `q` yang tidak valid
 * tetapi berupa string biasa (mis. 1 karakter) tetap diisikan agar bisa diperbaiki, dipadatkan dan dipotong 100 karakter; yang berisi
 * karakter kontrol, ganda, atau bukan string = kosong. Hanya dirender sebagai nilai input (tidak pernah HTML).
 */
export function searchInputValue(value: unknown): string {
  if (typeof value !== 'string' || hasControlCharacter(value)) return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, SEARCH_MAX_LENGTH)
}
