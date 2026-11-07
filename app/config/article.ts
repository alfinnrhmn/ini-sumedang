// Berita Terkait dihitung sekali per artikel: sidebar desktop = `RELATED_SIDEBAR_COUNT` teratas, blok bawah = sisanya.
// < 1024 px tanpa sidebar: blok bawah = `RELATED_BOTTOM_MOBILE_COUNT` teratas; blok desktop disembunyikan CSS (SSR).
export const RELATED_SIDEBAR_COUNT = 4
export const RELATED_BOTTOM_COUNT = 3
export const RELATED_BOTTOM_MOBILE_COUNT = 3

/** Kecepatan baca rata-rata (kata per menit) untuk waktu baca. */
export const READING_WORDS_PER_MINUTE = 200

/** Slug artikel: huruf kecil/angka dipisah tanda hubung, maksimum 120 karakter. */
export const ARTICLE_SLUG_MAX_LENGTH = 120
