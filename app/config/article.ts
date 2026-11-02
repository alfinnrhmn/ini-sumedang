/**
 * Konfigurasi Detail Berita (PAGE-002). Satu daftar Berita Terkait berperingkat dihitung sekali per artikel (PRD §3.8):
 * sidebar desktop = `RELATED_SIDEBAR_COUNT` teratas [V 130:2226: 4 item], blok bawah = `RELATED_BOTTOM_COUNT`
 * berikutnya [V 130:2944 dan 130:3568: 3 kartu], tanpa duplikat antar blok.
 * Di bawah 1024 px (mobile dan tablet) sidebar tidak ada, sehingga blok bawah menampilkan `RELATED_BOTTOM_MOBILE_COUNT`
 * teratas (peringkat 1-3; Keputusan PM M-1) dan blok bawah desktop disembunyikan CSS (SSR tidak tahu lebar viewport).
 */
export const RELATED_SIDEBAR_COUNT = 4
export const RELATED_BOTTOM_COUNT = 3
export const RELATED_BOTTOM_MOBILE_COUNT = 3

/** Kecepatan baca rata-rata (kata per menit) untuk waktu baca [I; Keputusan PM 11]. */
export const READING_WORDS_PER_MINUTE = 200

/** Slug artikel: huruf kecil/angka dipisah tanda hubung, maksimum 120 karakter (Keputusan PM 3). */
export const ARTICLE_SLUG_MAX_LENGTH = 120
