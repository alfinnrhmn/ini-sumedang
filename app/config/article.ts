/**
 * Berita Terkait berperingkat dihitung sekali per artikel: sidebar desktop = `RELATED_SIDEBAR_COUNT` teratas, blok bawah = `RELATED_BOTTOM_COUNT` berikutnya (tanpa duplikat).
 * Di bawah 1024 px sidebar tidak ada: blok bawah memakai `RELATED_BOTTOM_MOBILE_COUNT` teratas dan blok bawah desktop disembunyikan CSS (SSR tidak tahu lebar viewport).
 */
export const RELATED_SIDEBAR_COUNT = 4
export const RELATED_BOTTOM_COUNT = 3
export const RELATED_BOTTOM_MOBILE_COUNT = 3

/** Kecepatan baca rata-rata (kata per menit) untuk waktu baca. */
export const READING_WORDS_PER_MINUTE = 200

/** Slug artikel: huruf kecil/angka dipisah tanda hubung, maksimum 120 karakter. */
export const ARTICLE_SLUG_MAX_LENGTH = 120
